const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Task 1 & Task 10: Get all books using async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books-list');
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(200).send(JSON.stringify(books, null, 4));
  }
});

// Helper endpoint for axios
public_users.get('/books-list', function (req, res) {
  return res.status(200).json(books);
});

// Task 2 & Task 11: Get book details based on ISBN using Promises with Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:5000/books-list`)
    .then((response) => {
      const allBooks = response.data || books;
      if (allBooks[isbn]) {
        return res.status(200).send(JSON.stringify(allBooks[isbn], null, 4));
      } else {
        return res.status(404).json({ message: "Book not found" });
      }
    })
    .catch(() => {
      if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn], null, 4));
      }
      return res.status(404).json({ message: "Book not found" });
    });
});

// Task 3 & Task 12: Get book details based on author using Promises with Axios
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  axios.get('http://localhost:5000/books-list')
    .then((response) => {
      const allBooks = response.data || books;
      let matchingBooks = [];
      Object.keys(allBooks).forEach((key) => {
        if (allBooks[key].author.toLowerCase() === author.toLowerCase()) {
          matchingBooks.push({ isbn: key, ...allBooks[key] });
        }
      });
      return res.status(200).json({ booksbyauthor: matchingBooks });
    })
    .catch(() => {
      return res.status(500).json({ message: "Error retrieving books by author" });
    });
});

// Task 4 & Task 13: Get all books based on title using Promises with Axios
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  axios.get('http://localhost:5000/books-list')
    .then((response) => {
      const allBooks = response.data || books;
      let matchingBooks = [];
      Object.keys(allBooks).forEach((key) => {
        if (allBooks[key].title.toLowerCase() === title.toLowerCase()) {
          matchingBooks.push({ isbn: key, ...allBooks[key] });
        }
      });
      return res.status(200).json({ booksbytitle: matchingBooks });
    })
    .catch(() => {
      return res.status(500).json({ message: "Error retrieving books by title" });
    });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
