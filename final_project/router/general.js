const express = require('express');
const public_users = express.Router();
const books = require('../booksdb.js');
const jwt = require('jsonwebtoken');
const axios = require('axios');  // Add this for Tasks 10-13

let users = [];

// ── Task 6: Register ──────────────────────────────────────────
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: 'User already exists' });
  }
  users.push({ username, password });
  return res.status(200).json({ message: 'User registered successfully' });
});

// ── Task 7: Login ─────────────────────────────────────────────
public_users.post('/customer/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ data: username }, 'access', { expiresIn: '1h' });
  req.session.authorization = { accessToken: token, username };
  return res.status(200).json({ message: 'Login successful', token });
});

// ── Task 1: Get all books (Synchronous) ───────────────────────
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});

// ── Task 2: Get by ISBN (Synchronous) ─────────────────────────
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  return res.status(200).json(book);
});

// ── Task 3: Get by Author (Synchronous) ───────────────────────
public_users.get('/author/:author', (req, res) => {
  const result = Object.values(books).filter(
    b => b.author.toLowerCase() === req.params.author.toLowerCase()
  );
  if (!result.length) {
    return res.status(404).json({ message: 'No books found for this author' });
  }
  return res.status(200).json(result);
});

// ── Task 4: Get by Title (Synchronous) ────────────────────────
public_users.get('/title/:title', (req, res) => {
  const result = Object.values(books).filter(
    b => b.title.toLowerCase().includes(req.params.title.toLowerCase())
  );
  if (!result.length) {
    return res.status(404).json({ message: 'No books found for this title' });
  }
  return res.status(200).json(result);
});

// ── Task 5: Get reviews by ISBN ───────────────────────────────
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  return res.status(200).json(book.reviews);
});

// ========== TASKS 10-13: Async/Await with Axios ==========

// ── Task 10: Get all books using Async/Await with Axios ───────
public_users.get('/async/books', async (req, res) => {
  try {
    // Simulating API call to get books (using local data with Promise)
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        if (books) {
          resolve(books);
        } else {
          reject(new Error('Books not found'));
        }
      });
    };
    
    const allBooks = await getBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Alternative: Using Axios to call own endpoint
public_users.get('/async/books-axios', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ── Task 11: Get book by ISBN using Async/Await ───────────────
public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    
    const getBookByISBN = (isbn) => {
      return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject(new Error('Book not found'));
        }
      });
    };
    
    const book = await getBookByISBN(isbn);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// ── Task 12: Get books by Author using Async/Await ─────────────
public_users.get('/async/author/:author', async (req, res) => {
  try {
    const authorName = req.params.author;
    
    const getBooksByAuthor = (author) => {
      return new Promise((resolve, reject) => {
        const result = Object.values(books).filter(
          b => b.author.toLowerCase() === author.toLowerCase()
        );
        if (result.length) {
          resolve(result);
        } else {
          reject(new Error('No books found for this author'));
        }
      });
    };
    
    const booksByAuthor = await getBooksByAuthor(authorName);
    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// ── Task 13: Get books by Title using Async/Await ──────────────
public_users.get('/async/title/:title', async (req, res) => {
  try {
    const titleName = req.params.title;
    
    const getBooksByTitle = (title) => {
      return new Promise((resolve, reject) => {
        const result = Object.values(books).filter(
          b => b.title.toLowerCase().includes(title.toLowerCase())
        );
        if (result.length) {
          resolve(result);
        } else {
          reject(new Error('No books found for this title'));
        }
      });
    };
    
    const booksByTitle = await getBooksByTitle(titleName);
    return res.status(200).json(booksByTitle);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

module.exports.general = public_users;
module.exports.users = users;