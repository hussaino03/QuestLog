const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

// Middleware to verify authentication
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  next();
};

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

app.post('/api/users', requireAuth, async (req, res) => {
  const { xp, level } = req.body;
  
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    // Extract token and get user info
    const token = req.headers.authorization.split(' ')[1];
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!userInfoResponse.ok) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    
    const userInfo = await userInfoResponse.json();
    
    // Check if user exists
    let user = await usersCollection.findOne({ googleId: userInfo.sub });
    
    if (user) {
      return res.json({
        userId: user._id,
        exists: true
      });
    }

    // Create new user
    user = {
      googleId: userInfo.sub,
      email: userInfo.email,
      xp: xp || 0,
      level: level || 1,
      tasksCompleted: 0,
      createdAt: new Date()
    };

    const result = await usersCollection.insertOne(user);
    res.json({
      userId: result.insertedId,
      exists: false
    });
  } catch (error) {
    console.error('Error in user creation/lookup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/users/:id', requireAuth, async (req, res) => {
  const { xp, tasksCompleted, level } = req.body;
  
  // Validate required fields
  if (xp === undefined || tasksCompleted === undefined || level === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate numeric values
  if (typeof xp !== 'number' || typeof tasksCompleted !== 'number' || typeof level !== 'number') {
    return res.status(400).json({ error: 'Invalid field types - xp, tasksCompleted, and level must be numbers' });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          xp, 
          tasksCompleted, 
          level,
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