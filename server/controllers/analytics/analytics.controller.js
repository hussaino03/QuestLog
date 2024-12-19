const { MongoClient } = require('mongodb');
require('dotenv').config();

const getCommunityXP = async (req, res) => {
  let client;
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db("usersDB");
    const xpResult = await db.collection('users').aggregate([
      { $group: { _id: null, communityXP: { $sum: "$xp" } } }
    ]).toArray();

    const communityXP = xpResult[0]?.communityXP || 0;

    res.json({ communityXP });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch community XP' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = {
  getCommunityXP
};