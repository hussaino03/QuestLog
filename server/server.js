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
  const { xp, tasksCompleted, level, tasks, completedTasks, cleared } = req.body;
  
  if (typeof xp !== 'number' || typeof tasksCompleted !== 'number' || typeof level !== 'number') {
    return res.status(400).json({ error: 'Invalid xp, tasksCompleted, or level value' });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    const updateData = {
      xp,
      tasksCompleted,
      level
    };

    // If this is a clear operation, include tasks and completedTasks arrays
    if (cleared) {
      updateData.tasks = [];
      updateData.completedTasks = [];
      updateData.cleared = true;
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
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
    return res.status(400).json({ 
      error: 'Missing required data',
      details: `GoogleId: ${!!googleId}, LocalData: ${!!localData}`
    });
  }

  try {
    const db = await connectToDatabase();
    if (!db) {
      throw new Error('Failed to connect to database');
    }

    const usersCollection = db.collection('users');
    
    // Find existing user data
    let userData = await usersCollection.findOne({ googleId });
    
    // Validate the data structure before processing
    const validatedLocalData = {
      tasks: Array.isArray(localData.tasks) ? localData.tasks : [],
      completedTasks: Array.isArray(localData.completedTasks) ? localData.completedTasks : [],
      xp: Number(localData.xp) || 0,
      level: Number(localData.level) || 1
    };
    
    if (!userData) {
      // First time sync - save validated local data
      userData = {
        googleId,
        ...validatedLocalData,
        lastSync: new Date(),
        cleared: false
      };
      
      const insertResult = await usersCollection.insertOne(userData);
      if (!insertResult.acknowledged) {
        throw new Error('Failed to insert new user data');
      }
      
      return res.json(validatedLocalData);
    }

    // If the data was previously cleared and local storage is empty,
    // return empty data to maintain cleared state
    if (userData.cleared && 
        (!validatedLocalData.tasks.length && !validatedLocalData.completedTasks.length)) {
      const emptyData = {
        tasks: [],
        completedTasks: [],
        xp: 0,
        level: 1,
        cleared: true
      };
      return res.json(emptyData);
    }

    // If we have new local data and it's not empty, treat it as fresh data
    if (validatedLocalData.tasks.length || validatedLocalData.completedTasks.length) {
      const newData = {
        ...validatedLocalData,
        cleared: false,
        lastSync: new Date()
      };

      const updateResult = await usersCollection.updateOne(
        { googleId },
        { $set: newData }
      );

      if (!updateResult.acknowledged) {
        throw new Error('Failed to update user data');
      }

      return res.json(newData);
    }

    // Normal merge logic for non-cleared data
    const mergedData = {
      tasks: [...new Set([...userData.tasks || [], ...validatedLocalData.tasks])],
      completedTasks: [...new Set([...userData.completedTasks || [], ...validatedLocalData.completedTasks])],
      xp: Math.max(userData.xp || 0, validatedLocalData.xp),
      level: Math.max(userData.level || 1, validatedLocalData.level),
      lastSync: new Date(),
      cleared: false
    };

    const updateResult = await usersCollection.updateOne(
      { googleId },
      { $set: mergedData }
    );

    if (!updateResult.acknowledged) {
      throw new Error('Failed to update user data');
    }

    res.json(mergedData);
  } catch (error) {
    console.error('Error in sync endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

module.exports = app;