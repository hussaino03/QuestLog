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

app.post('/api/users/sync', async (req, res) => {
  const { sessionId, xp, level, tasks, completedTasks, authToken } = req.body;
  
  if (!authToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    // Verify Google token and get user info
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    if (!googleResponse.ok) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    
    const googleUser = await googleResponse.json();
    
    // Find existing user by Google ID
    let user = await usersCollection.findOne({ googleId: googleUser.sub });
    
    if (user) {
      // Update existing user with local data if XP is higher
      if (xp > user.xp) {
        await usersCollection.updateOne(
          { googleId: googleUser.sub },
          { 
            $set: { 
              xp,
              level,
              tasks,
              completedTasks,
              lastSynced: new Date()
            }
          }
        );
      }
    } else {
      // Create new user with Google info and local data
      user = {
        googleId: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        xp,
        level,
        tasks,
        completedTasks,
        lastSynced: new Date()
      };
      await usersCollection.insertOne(user);
    }

    res.json({
      userId: user._id,
      googleId: user.googleId,
      xp: Math.max(user.xp, xp),
      level: Math.max(user.level, level),
      tasks: user.tasks || tasks,
      completedTasks: user.completedTasks || completedTasks
    });
  } catch (error) {
    console.error('Error in user sync:', error);
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

module.exports = app;