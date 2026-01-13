const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../../db');

async function updateUser(req, res) {
  if (!req.params.id || !ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  const { xp, tasksCompleted, level, tasks, completedTasks, unlockedBadges } =
    req.body;

  const numXP = Number(xp) || 0;
  const numTasksCompleted = Number(tasksCompleted) || 0;
  const numLevel = Number(level) || 1;

  const sanitizedTasks = Array.isArray(tasks)
    ? tasks.map((task) => ({
        ...task,
        deadline: task.deadline || null
      }))
    : [];

  const sanitizedCompletedTasks = Array.isArray(completedTasks)
    ? completedTasks.map((task) => ({
        ...task,
        deadline: task.deadline || null
      }))
    : [];

  if (isNaN(numXP) || isNaN(numTasksCompleted) || isNaN(numLevel)) {
    return res
      .status(400)
      .json({ error: 'Invalid xp, tasksCompleted, or level value' });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const userId = ObjectId.isValid(req.params.id)
      ? new ObjectId(req.params.id)
      : null;
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get existing user data
    const existingUser = await usersCollection.findOne({ _id: userId });
    const existingBadges = existingUser?.unlockedBadges || [];

    // Only merge badges if they're not being explicitly cleared
    const mergedBadges =
      req.body.unlockedBadges === undefined
        ? [...new Set([...existingBadges, ...(req.body.unlockedBadges || [])])]
        : req.body.unlockedBadges;

    const result = await usersCollection.updateOne(
      { _id: userId },
      {
        $set: {
          xp: numXP,
          tasksCompleted: numTasksCompleted,
          level: numLevel,
          tasks: sanitizedTasks,
          completedTasks: sanitizedCompletedTasks,
          unlockedBadges: mergedBadges,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUser(req, res) {
  try {
    // Validate user ID first
    if (!req.params.id || !ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
      { _id: new ObjectId(req.params.id) },
      {
        projection: {
          name: 1,
          xp: 1,
          level: 1,
          isOptIn: 1,
          unlockedBadges: 1,
          _id: 1
        }
      }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateOptInStatus(req, res) {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newStatus = !user.isOptIn;

    await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { isOptIn: newStatus } }
    );

    res.json({
      message: `Opt-in status updated successfully`,
      isOptIn: newStatus
    });
  } catch (error) {
    console.error('Error updating opt-in status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  updateUser,
  getUser,
  updateOptInStatus
};
