const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();

app.set('trust proxy', 1);
app.use(express.json());

const { connectToDatabase } = require('./db');

// MongoDB connection for session store
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGO_URI not found in environment variables');
  process.exit(1);
}

// Session middleware with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: mongoUri,
    collectionName: 'sessions',
    autoRemove: 'native',
    touchAfter: 24 * 3600
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Update CORS configuration
app.use(cors({
  origin: process.env.CLIENT || 'http://localhost:3000',  
  credentials: true,  // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization']  // Allowed headers
}));

// Require passport setup
require('./config/passport-setup');

const apiRoutes = require('./routes');
const authRoutes = require('./routes/auth/auth.routes');
const analyticsRoutes = require('./routes/analytics/analytics.routes');
const todoistRoutes = require('./routes/todoist/todoist.routes');
const googleTasksRoutes = require('./routes/googletasks/googletasks.routes');

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', todoistRoutes);
app.use('/api', googleTasksRoutes);

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();