const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT || "http://localhost:3000",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const PORT = process.env.PORT || 3001;
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

async function initializeIndexes() {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    await usersCollection.dropIndexes();
    await usersCollection.createIndex({ googleId: 1 }, { unique: true });
    
    console.log('Database indexes initialized successfully');
  } catch (error) {
    console.error('Error initializing database indexes:', error);
  }
}

// Initialize database
initializeIndexes();

const apiRoutes = require('./routes/api');

// Connect to database and set up routes
connectToDatabase().then(db => {
  app.use('/api', apiRoutes(db));
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});

module.exports = app;