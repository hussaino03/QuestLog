const { connectToDatabase } = require('../../db');

const getLeaderboard = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const leaderboard = await usersCollection
      .find(
        { isOptIn: true },
        { 
          projection: {
            name: 1,
            picture: 1,
            xp: 1,
            level: 1,
            tasksCompleted: 1,
            _id: 1
          }
        }
      )
      .sort({ xp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getLeaderboard
};