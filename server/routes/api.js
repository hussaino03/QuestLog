const express = require('express');
const { ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

module.exports = (db) => {
  // POST /api/users
  router.post('/users', async (req, res) => {
    const { googleId, email, name, picture, xp, level } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token || !googleId) {
      console.error('Missing token or googleId:', { token, googleId });
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const usersCollection = db.collection('users');
      const existingUser = await usersCollection.findOne({ googleId });
      
      if (existingUser) {
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
      console.log('New user created with ID:', result.insertedId.toString());

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

  // PUT /api/users/:id
  router.put('/users/:id', authenticateToken, async (req, res) => {
    const { xp, tasksCompleted, level, tasks, completedTasks } = req.body;
    
    const numXP = Number(xp) || 0;
    const numTasksCompleted = Number(tasksCompleted) || 0;
    const numLevel = Number(level) || 1;
    
    if (isNaN(numXP) || isNaN(numTasksCompleted) || isNaN(numLevel)) {
      return res.status(400).json({ error: 'Invalid xp, tasksCompleted, or level value' });
    }

    try {
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

  // GET /api/leaderboard
  router.get('/leaderboard', authenticateToken, async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    try {
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

  // PUT /api/users/:id/opt-in
  router.put('/users/:id/opt-in', authenticateToken, async (req, res) => {
    try {
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

  // GET /api/users/:id
  router.get('/users/:id', authenticateToken, async (req, res) => {
    try {
      const usersCollection = db.collection('users');
      const user = await usersCollection.findOne(
        { _id: new ObjectId(req.params.id) }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/feedback
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
      console.log('Feedback email sent successfully');
      res.json({ message: 'Feedback sent successfully' });
    } catch (error) {
      console.error('Error sending feedback:', error);
      res.status(500).json({ error: `Failed to send feedback: ${error.message}` });
    }
  });

  return router;
};