const { MongoClient } = require('mongodb');

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

module.exports = {
  connectToDatabase
};