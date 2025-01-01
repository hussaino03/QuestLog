db = db.getSiblingDB('questlog_test');

// Minimal test user for development
db.users.insertMany([
  {
    googleId: 'test_123',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://via.placeholder.com/150',
    createdAt: new Date()
  }
]);
