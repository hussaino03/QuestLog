const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { connectToDatabase } = require('../db');
const { ObjectId } = require('mongodb');

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = await connectToDatabase();
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK,
  proxy: true 
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const db = await connectToDatabase();
      const usersCollection = db.collection('users');
      
      const existingUser = await usersCollection.findOne({ googleId: profile.id });
      
      if (existingUser) {
        const userData = {
          ...existingUser,
          lastLogin: new Date()
        };
        
        // Update last login time
        await usersCollection.updateOne(
          { _id: existingUser._id },
          { $set: { lastLogin: new Date() }}
        );
        
        console.log('User logged in with ID:', existingUser._id.toString());
        return done(null, userData);
      }
      
      const newUser = {
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        picture: profile.photos[0].value,
        xp: 0,
        level: 1,
        tasksCompleted: 0,
        tasks: [],
        completedTasks: [],
        isOptIn: false,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      const result = await usersCollection.insertOne(newUser);
      newUser._id = result.insertedId;
      
      console.log('New user created with ID:', newUser._id.toString());
      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }
));

module.exports = passport;