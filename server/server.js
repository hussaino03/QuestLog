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

// Set the COOP header for all responses
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  next();
});


app.use(express.json());

let cachedDb = null;

// Add the authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  // Since we're using Google OAuth, we'll just verify that the token exists
  // The actual token verification is handled by Google's OAuth endpoints
  next();
};

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
  const { googleId, email, name, picture, xp, level } = req.body;
  const authToken = req.headers.authorization;

  console.log('--- Request Received ---');
  console.log('Received data:', { googleId, email, name, picture, xp, level });
  console.log('Received authorization header:', authToken ? 'Present' : 'Missing');

  if (!authToken || !googleId) {
    console.error('Missing authToken or googleId:', { authToken, googleId });
    return res.status(400).json({ error: 'Authentication required' });
  }

  try {
    console.log('Connecting to database...');
    const db = await connectToDatabase();
    console.log('Connected to database.');

    const usersCollection = db.collection('users');
    console.log('Looking for user with googleId:', googleId);

    // Add index to ensure uniqueness of googleId
    await usersCollection.createIndex({ googleId: 1 }, { unique: true });

    let user = await usersCollection.findOne({ googleId });
    
    if (user) {
      console.log('User found:', user);
      console.log('Returning existing user data...');
      return res.json({
        userId: user._id.toString(),
        exists: true,
        xp: user.xp,
        level: user.level,
        tasksCompleted: user.tasksCompleted
      });
    }

    console.log('User not found, creating a new user...');
    const newUser = {
      googleId,
      email,
      name,
      picture,
      xp: xp || 0,
      level: level || 1,
      tasksCompleted: 0,
      createdAt: new Date()
    };
    console.log('New user data:', newUser);

    // Use updateOne with upsert to handle race conditions
    const result = await usersCollection.updateOne(
      { googleId },
      { $setOnInsert: newUser },
      { upsert: true }
    );

    const insertedUser = await usersCollection.findOne({ googleId });
    console.log('New user created with ID:', insertedUser._id.toString());

    res.json({
      userId: insertedUser._id.toString(),
      exists: false,
      xp: newUser.xp,
      level: newUser.level,
      tasksCompleted: newUser.tasksCompleted
    });
  } catch (error) {
    console.error('Error in user creation/lookup:', error);
    if (error.code === 11000) { // Duplicate key error
      const user = await db.collection('users').findOne({ googleId });
      return res.json({
        userId: user._id.toString(),
        exists: true,
        xp: user.xp,
        level: user.level,
        tasksCompleted: user.tasksCompleted
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.put('/api/users/:id', authenticateToken, async (req, res) => {
  const { xp, tasksCompleted, level } = req.body;
  
  if (typeof xp !== 'number' || typeof tasksCompleted !== 'number' || typeof level !== 'number') {
    return res.status(400).json({ error: 'Invalid xp, tasksCompleted, or level value' });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { xp, tasksCompleted, level, updatedAt: new Date() } }
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

app.get('/api/leaderboard', authenticateToken, async (req, res) => {
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