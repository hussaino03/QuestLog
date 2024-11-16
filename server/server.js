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
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if it starts with 'Bearer '
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Add the token to the request object for use in routes
  req.token = token;
  next();
};

async function connectToDatabase() {
  try {
    if (dbClient && dbClient.topology.isConnected()) {
      return dbClient.db("usersDB");
    }
    
    dbClient = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    return dbClient.db("usersDB");
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

app.post('/api/users', async (req, res) => {
  const { googleId, email, name, picture, xp, level } = req.body;
  const authHeader = req.headers.authorization;

  console.log('Request data:', { googleId, email, name, xp, level });

  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authentication');
    }

    const token = authHeader.split(' ')[1];
    if (!token || !googleId) {
      throw new Error('Missing required fields');
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Create the user document first
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

    // Use findOneAndUpdate for atomic operation
    const result = await usersCollection.findOneAndUpdate(
      { googleId },
      { 
        $setOnInsert: newUser,
        $set: { lastLogin: new Date() }
      },
      { 
        upsert: true,
        returnDocument: 'after'
      }
    );

    const user = result.value;
    
    if (!user) {
      throw new Error('Failed to create/retrieve user');
    }

    res.json({
      userId: user._id.toString(),
      exists: !!result.lastErrorObject?.updatedExisting,
      xp: user.xp,
      level: user.level,
      tasksCompleted: user.tasksCompleted
    });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

process.on('SIGINT', async () => {
  if (dbClient) {
    await dbClient.close();
  }
  process.exit();
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