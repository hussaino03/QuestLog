const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

app.use(cors({
  origin: 'https://smart-listapp.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db("usersDB");
  cachedDb = db;
  return db;
}

app.post('/api/users', async (req, res) => {
  const { sessionId, xp, level } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    let user = await usersCollection.findOne({ deviceFingerprint: sessionId });
    
    if (user) {
      return res.json({
        userId: user._id,
        exists: true,
        xp: user.xp,
        level: user.level,
        tasksCompleted: user.tasksCompleted
      });
    }

    user = {
      _id: new ObjectId(),
      deviceFingerprint: sessionId,
      xp: xp || 0,
      level: level || 1,
      tasksCompleted: 0
    };

    await usersCollection.insertOne(user);

    res.json({
      userId: user._id,
      exists: false,
      xp: user.xp,
      level: user.level,
      tasksCompleted: user.tasksCompleted
    });
  } catch (error) {
    console.error('Error in user creation/lookup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { xp, tasksCompleted, level } = req.body;
  
  if (typeof xp !== 'number' || typeof tasksCompleted !== 'number' || typeof level !== 'number') {
    return res.status(400).json({ error: 'Invalid xp, tasksCompleted, or level value' });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { xp, tasksCompleted, level } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    const leaderboard = await usersCollection.find()
      .sort({ xp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sync', async (req, res) => {
  const { googleId, localData } = req.body;
  
  if (!googleId || !localData) {
    return res.status(400).json({ error: 'Missing required data' });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    // Find existing user data
    let userData = await usersCollection.findOne({ googleId });
    
    if (!userData) {
      // First time sync - save local data as is
      userData = {
        googleId,
        ...localData,
        lastSync: new Date()
      };
      await usersCollection.insertOne(userData);
      return res.json(localData);
    }

    // Merge logic - prefer the most recent data
    const mergedData = {
      tasks: [...new Set([...userData.tasks, ...localData.tasks])],
      completedTasks: [...new Set([...userData.completedTasks, ...localData.completedTasks])],
      xp: Math.max(userData.xp, localData.xp),
      level: Math.max(userData.level, localData.level),
      lastSync: new Date()
    };

    // Update server data
    await usersCollection.updateOne(
      { googleId },
      { $set: mergedData }
    );

    res.json(mergedData);
  } catch (error) {
    console.error('Error syncing data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = app;