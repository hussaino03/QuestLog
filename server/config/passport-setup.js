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
    callbackURL: "/api/auth/google/callback",
    proxy: true,
    accessType: 'offline',  // Requests refresh token
    prompt: 'consent select_account', // Forces consent AND account selection
    enablePersistentToken: true, // Ensures refresh token is always included
    hostedDomain: undefined, // Add this to ensure all domains are allowed
    includeGrantedScopes: true, // Add this to include all granted scopes
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/tasks.readonly'
    ]
  },
  async (accessToken, refreshToken, params, profile, done) => {
    try {
      // Calculate expiry time from expires_in
      const expiry_date = Date.now() + (params.expires_in * 1000);
      
      console.log('[OAuth Debug] Received tokens:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        expiryDate: new Date(expiry_date),
        timeUntilExpiry: params.expires_in,
        scope: params.scope
      });
      
      const db = await connectToDatabase();
      const usersCollection = db.collection('users');
      
      const existingUser = await usersCollection.findOne({ googleId: profile.id });
      
      if (existingUser) {
        // Only update last login, no token storage
        await usersCollection.updateOne(
          { _id: existingUser._id },
          { $set: { lastLogin: new Date() }}
        );
        
        return done(null, existingUser, {
          accessToken,
          refreshToken,
          expiry_date
        });
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
      
      return done(null, newUser, {
        accessToken,
        refreshToken,
        expiry_date
      });
    } catch (error) {
      // ...existing code...
      return done(error);
    }
  }
));

module.exports = passport;