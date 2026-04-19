const express = require('express');
const authenticated = express.Router();
const books = require('../booksdb.js');

// ── Task 8: Add / Modify review ───────────────────────────────
authenticated.put('/auth/review/:isbn', (req, res) => {
  const isbn   = req.params.isbn;
  const review = req.query.review;
  const user   = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }
  if (!review) {
    return res.status(400).json({ message: 'Review text is required' });
  }

  books[isbn].reviews[user] = review;
  return res.status(200).json({
    message: 'Review added/modified successfully',
    reviews: books[isbn].reviews
  });
});

// ── Task 9: Delete review ─────────────────────────────────────
authenticated.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const user = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }
  if (!books[isbn].reviews[user]) {
    return res.status(404).json({ message: 'No review found for this user' });
  }

  delete books[isbn].reviews[user];
  return res.status(200).json({ message: 'Review deleted successfully' });
});

module.exports.authenticated = authenticated;