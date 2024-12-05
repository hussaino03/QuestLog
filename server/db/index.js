const { MongoClient } = require('mongodb');

let cachedDb = null;
let client = null;

async function connectToDatabase() {
  if (cachedDb) {
    try {
      // Verify connection is still alive
      await cachedDb.command({ ping: 1 });
      return cachedDb;
    } catch (error) {
      console.log('Cached connection lost, reconnecting...');
      cachedDb = null;
      if (client) await client.close();
    }
  }

  try {
    client = await MongoClient.connect(process.env.MONGODB_URI, {
      connectTimeoutMS: 10000, // Reduce from default 30000ms
      socketTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      retryReads: true,
    });

    // Add keepAlive to handle serverless cold starts better
    client.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    client.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      cachedDb = null;
    });

    const db = client.db("usersDB");
    cachedDb = db;
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // If connection fails, clear cached connection
    cachedDb = null;
    if (client) await client.close();
    throw error;
  }
}

async function initializeIndexes() {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    // Check if index already exists
    const indexes = await usersCollection.indexes();
    const hasGoogleIdIndex = indexes.some(index => 
      index.key && index.key.googleId === 1
    );
    
    if (!hasGoogleIdIndex) {
      await usersCollection.createIndex({ googleId: 1 }, { unique: true });
      console.log('Created googleId index');
    }
  } catch (error) {
    console.error('Error initializing database indexes:', error);
  }
}

initializeIndexes();

process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    cachedDb = null;
    process.exit(0);
  }
});

module.exports = {
  connectToDatabase
};