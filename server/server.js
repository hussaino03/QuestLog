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
  const { sessionId, xp, level, googleId } = req.body;
  
  if (!sessionId && !googleId) {
    return res.status(400).json({ error: 'Either Session ID or Google ID is required' });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    let user;
    
    // If googleId is provided, try to find user by googleId first
    if (googleId) {
      user = await usersCollection.findOne({ googleId });
    }
    
    // If no authenticated user found, try finding by sessionId
    if (!user && sessionId) {
      user = await usersCollection.findOne({ deviceFingerprint: sessionId });
    }
    
    if (user) {
      // If user exists and we have a googleId, update the user with googleId
      if (googleId && !user.googleId) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { googleId } }
        );
      }
      
      return res.json({
        userId: user._id,
        exists: true,
        xp: user.xp,
        level: user.level,
        tasksCompleted: user.tasksCompleted
      });
    }

    // Create new user
    user = {
      _id: new ObjectId(),
      deviceFingerprint: sessionId,
      googleId: googleId || null,
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

// Add endpoint to fetch user data by googleId
app.get('/api/users/sync/:googleId', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ googleId: req.params.googleId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      userId: user._id,
      xp: user.xp,
      level: user.level,
      tasksCompleted: user.tasksCompleted
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
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