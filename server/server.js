const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

app.use(cors({
  origin: ['https://smart-listapp.vercel.app', 'http://localhost:3000'],
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

// Add error logging middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

app.post('/api/users', async (req, res) => {
  try {
    const { googleId, email, name, picture, xp, level } = req.body;
    const authToken = req.headers.authorization?.split(' ')[1]; // Extract token properly
    
    if (!authToken) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    if (!googleId) {
      return res.status(400).json({ error: 'Google ID is required' });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    // Use googleId for finding existing user
    const existingUser = await usersCollection.findOne({ googleId });
    
    if (existingUser) {
      // Update existing user's data
      await usersCollection.updateOne(
        { googleId },
        {
          $set: {
            email,
            name,
            picture,
            xp: xp || existingUser.xp,
            level: level || existingUser.level,
            updatedAt: new Date()
          }
        }
      );

      return res.json({
        userId: existingUser._id,
        exists: true,
        xp: xp || existingUser.xp,
        level: level || existingUser.level,
        tasksCompleted: existingUser.tasksCompleted || 0
      });
    }

    // Create new user
    const newUser = {
      googleId,
      email,
      name,
      picture,
      xp: xp || 0,
      level: level || 1,
      tasksCompleted: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);

    res.json({
      userId: result.insertedId,
      exists: false,
      xp: newUser.xp,
      level: newUser.level,
      tasksCompleted: newUser.tasksCompleted
    });

  } catch (error) {
    console.error('Error in user creation/lookup:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const authToken = req.headers.authorization?.split(' ')[1];
    
    if (!authToken) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { xp, tasksCompleted, level } = req.body;
    
    // Allow zero values but check if they're numbers
    if (xp === undefined || tasksCompleted === undefined || level === undefined ||
        typeof xp !== 'number' || typeof tasksCompleted !== 'number' || typeof level !== 'number') {
      return res.status(400).json({ error: 'Invalid xp, tasksCompleted, or level value' });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    // Validate ObjectId
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

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

    res.json({ 
      message: 'User updated successfully',
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

module.exports = app;