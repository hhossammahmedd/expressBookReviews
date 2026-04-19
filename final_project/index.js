const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Session setup
app.use(session({
  secret: 'fingerprint_customer',
  resave: true,
  saveUninitialized: true
}));

// Import routers
const public_users  = require('./router/general.js').general;
const authenticated = require('./router/auth_users.js').authenticated;

// JWT auth middleware — protects /customer/auth/* routes
app.use('/customer/auth/*', (req, res, next) => {
  if (req.session.authorization) {
    const token = req.session.authorization['accessToken'];
    jwt.verify(token, 'access', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'User not authenticated' });
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(403).json({ message: 'User not logged in' });
  }
});

// Routes
app.use('/customer', authenticated);  // protected routes
app.use('/', public_users);           // public routes

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});