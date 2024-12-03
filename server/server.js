const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();

app.set('trust proxy', 1);
app.use(express.json());


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
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',  // For cross-origin requests
    path: '/'
  },
  proxy: true
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

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});