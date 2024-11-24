const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const authenticateToken = require('../middleware/auth');

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

async function initializeIndexes() {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    await usersCollection.dropIndexes();
    await usersCollection.createIndex({ googleId: 1 }, { unique: true });
  } catch (error) {
    console.error('Error initializing database indexes:', error);
  }
}

initializeIndexes();

// User routes
router.post('/users', async (req, res) => {
  const { googleId, email, name, picture, xp, level } = req.body;
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token || !googleId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    const existingUser = await usersCollection.findOne({ googleId });
    
    if (existingUser) {
      console.log(`Found existing user: ${existingUser._id}`);
      return res.json({
        userId: existingUser._id.toString(),
        exists: true,
        xp: existingUser.xp,
        level: existingUser.level,
        tasksCompleted: existingUser.tasksCompleted,
        tasks: existingUser.tasks || [],
        completedTasks: existingUser.completedTasks || []
      });
    }

    const newUser = {
      googleId,
      email,
      name,
      picture,
      xp: xp || 0,
      level: level || 1,
      tasksCompleted: 0,
      tasks: [],
      completedTasks: [],
      isOptIn: false,
      createdAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);
    console.log(`Created new user: ${result.insertedId}`);
    
    res.json({
      userId: result.insertedId.toString(),
      exists: false,
      xp: newUser.xp,
      level: newUser.level,
      tasksCompleted: newUser.tasksCompleted,
      tasks: [],
      completedTasks: []
    });
  } catch (error) {
    console.error('Error in user creation/lookup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id', authenticateToken, async (req, res) => {
  const { xp, tasksCompleted, level, tasks, completedTasks } = req.body;
  
  const numXP = Number(xp) || 0;
  const numTasksCompleted = Number(tasksCompleted) || 0;
  const numLevel = Number(level) || 1;
  
  if (isNaN(numXP) || isNaN(numTasksCompleted) || isNaN(numLevel)) {
    return res.status(400).json({ error: 'Invalid xp, tasksCompleted, or level value' });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          xp: numXP,
          tasksCompleted: numTasksCompleted,
          level: numLevel,
          tasks: tasks || [],
          completedTasks: completedTasks || [],
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

router.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne(
      { _id: new ObjectId(req.params.id) }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`Retrieved user: ${req.params.id}`);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rest of the routes remain unchanged...
router.get('/leaderboard', authenticateToken, async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    const leaderboard = await usersCollection.find({ isOptIn: true })
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

router.put('/users/:id/opt-in', authenticateToken, async (req, res) => {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newStatus = !user.isOptIn;
    
    await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { isOptIn: newStatus } }
    );
    
    res.json({ 
      message: `Opt-in status updated successfully`,
      isOptIn: newStatus 
    });
  } catch (error) {
    console.error('Error updating opt-in status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/feedback', async (req, res) => {
  const { ratings, feedback } = req.body;
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    await transporter.verify();

    const ratingsSummary = Object.entries(ratings)
      .filter(([_, value]) => value > 0)
      .map(([category, value]) => `${category}: ${value}/5`)
      .join('\n');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'h3114952@gmail.com',
      subject: 'QuestLog Feedback',
      text: `Ratings:\n${ratingsSummary}\n\nFeedback:\n${feedback}`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Feedback sent successfully' });
  } catch (error) {
    console.error('Error sending feedback:', error);
    res.status(500).json({ error: `Failed to send feedback: ${error.message}` });
  }
});

module.exports = router;