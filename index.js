const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json()); // it is used to recognize that request object as a JSON Object and parses it.

const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1); //this will force to node js to exit process
  }
};

initializeDBAndServer();
//Get Books
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});
//Get Book
app.get("/books/:bookId/", async (req, res) => {
  const { bookId } = req.params;
  const getBookQuery = `SELECT * FROM book WHERE book_id=${bookId}`;

  const book = await db.get(getBookQuery);
  res.send(book);
});
//Add book
app.post("/books/", async (req, res) => {
  const bookDetails = req.body;

  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;

  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;

  const dbResponse = await db.run(addBookQuery);
  const bookId = dbResponse.lastID;
  res.send({ bookId: bookId });
});

//Update book
app.put("/books/:bookId", async (req, res) => {
  const { bookId } = req.params;
  const bookDetails = req.body;

  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price=${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;
  await db.run(updateBookQuery);
  res.send("Book Updated Successfully");
});

// Delete book
app.delete("/books/:bookId", async (req, res) => {
  const { bookId } = req.params;
  const deleteQuery = `DELETE FROM book WHERE book_id=${bookId}`;
  await db.run(deleteQuery);
  res.send("book has been deleted successfully");
});

//Get Author
app.get("/authors/:authorId/books/", async (request, response) => {
  const { authorId } = request.params;
  const getAuthorBooksQuery = `
    SELECT
     *
    FROM
     book
    WHERE
      author_id = ${authorId};`;
  const booksArray = await db.all(getAuthorBooksQuery);
  response.send(booksArray);
});

// Filtering GET Books API
app.get("/books/", async (request, response) => {
  const {
    offset = 2,
    limit = 5,
    order = "ASC",
    order_by = "book_id",
    search_q = "",
  } = request.query;
  const getBooksQuery = `
    SELECT
      *
    FROM
     book
    WHERE
     title LIKE '%${search_q}%'
    ORDER BY ${order_by} ${order}
    LIMIT ${limit} OFFSET ${offset};`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});
