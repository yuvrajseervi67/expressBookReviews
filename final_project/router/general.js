const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

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

// Task 10: Get all books using Async/Await
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => new Promise((resolve) => resolve(books));
    const allBooks = await getBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getBook = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "Book not found" });
    }
  });

  getBook
    .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch((err) => res.status(err.status).json({ message: err.message }));
});

// Task 12: Get book details based on author using Promises
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const getBooksByAuthor = new Promise((resolve) => {
    let matchingBooks = [];
    const keys = Object.keys(books);
    keys.forEach((key) => {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        matchingBooks.push({ isbn: key, ...books[key] });
      }
    });
    resolve(matchingBooks);
  });

  getBooksByAuthor.then((result) => {
    return res.status(200).json({ booksbyauthor: result });
  });
});

// Task 13: Get all books based on title using Promises
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const getBooksByTitle = new Promise((resolve) => {
    let matchingBooks = [];
    const keys = Object.keys(books);
    keys.forEach((key) => {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        matchingBooks.push({ isbn: key, ...books[key] });
      }
    });
    resolve(matchingBooks);
  });

  getBooksByTitle.then((result) => {
    return res.status(200).json({ booksbytitle: result });
  });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
