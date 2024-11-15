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
      // Return all user data including xp and level
      return res.json({
        userId: user._id,
        exists: true,
        xp: user.xp || 0,
        level: user.level || 1,
        tasksCompleted: user.tasksCompleted || 0
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
  
  try {
    // Allow null/undefined values for reset functionality
    const updateData = {};
    if (xp !== undefined) updateData.xp = xp;
    if (tasksCompleted !== undefined) updateData.tasksCompleted = tasksCompleted;
    if (level !== undefined) updateData.level = level;

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    // Use $set to only update provided fields
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

    res.json({ 
      message: 'User updated successfully',
      updated: updateData
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new endpoint for resetting user data
app.post('/api/users/:id/reset', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: {
          xp: 0,
          level: 1,
          tasksCompleted: 0
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({ message: 'User data reset successfully' });
  } catch (error) {
    console.error('Error resetting user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = app;