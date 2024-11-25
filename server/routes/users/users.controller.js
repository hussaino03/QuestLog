const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../../db');

async function createOrGetUser(req, res) {
  const { googleId, email, name, picture, xp, level } = req.body;
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token || !googleId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    const existingUser = await usersCollection.findOne({ googleId });
    
    if (existingUser) {
      console.log(`Found existing user: ${existingUser._id}`);
      return res.json({
        userId: existingUser._id.toString(),
        exists: true,
        xp: existingUser.xp,
        level: existingUser.level,
        tasksCompleted: existingUser.tasksCompleted,
        tasks: existingUser.tasks || [],
        completedTasks: existingUser.completedTasks || []
      });
    }

    const newUser = {
      googleId,
      email,
      name,
      picture,
      xp: xp || 0,
      level: level || 1,
      tasksCompleted: 0,
      tasks: [],
      completedTasks: [],
      isOptIn: false,
      createdAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);
    console.log(`Created new user: ${result.insertedId}`);
    
    res.json({
      userId: result.insertedId.toString(),
      exists: false,
      xp: newUser.xp,
      level: newUser.level,
      tasksCompleted: newUser.tasksCompleted,
      tasks: [],
      completedTasks: []
    });
  } catch (error) {
    console.error('Error in user creation/lookup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateUser(req, res) {
  const { xp, tasksCompleted, level, tasks, completedTasks } = req.body;
  
  const numXP = Number(xp) || 0;
  const numTasksCompleted = Number(tasksCompleted) || 0;
  const numLevel = Number(level) || 1;

  const sanitizedTasks = Array.isArray(tasks) ? tasks.map(task => ({
    ...task,
    deadline: task.deadline || null
  })) : [];

  const sanitizedCompletedTasks = Array.isArray(completedTasks) ? completedTasks.map(task => ({
    ...task,
    deadline: task.deadline || null
  })) : [];
  
  if (isNaN(numXP) || isNaN(numTasksCompleted) || isNaN(numLevel)) {
    return res.status(400).json({ error: 'Invalid xp, tasksCompleted, or level value' });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          xp: numXP,
          tasksCompleted: numTasksCompleted,
          level: numLevel,
          tasks: sanitizedTasks,
          completedTasks: sanitizedCompletedTasks,
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
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne(
      { _id: new ObjectId(req.params.id) }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`Retrieved user: ${req.params.id}`);
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
    
    const user = await usersCollection.findOne({ _id: new ObjectId(req.params.id) });
    
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
  createOrGetUser,
  updateUser,
  getUser,
  updateOptInStatus
};