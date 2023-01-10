const express = require("express");
const expressHandlebars = require("express-handlebars");
const sqlite3 = require("sqlite3");

const db = new sqlite3.Database("joeyworld-database.db");
db.run(`
	CREATE TABLE IF NOT EXISTS movies (
		id INTEGER PRIMARY KEY,
		title TEXT,
		grade INTEGER
	)
`);
const app = express();
const bodyParser = require("body-parser");
const { request, response } = require("express");

app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "main.hbs",
  })
);

app.use(express.static("public"));

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.get("/", function (request, response) {
  response.render("start.hbs");
});

app.get("/movies", function (request, response) {
  const query = `SELECT * FROM movies`;

  db.all(query, function (error, movies) {
    const model = {
      movies,
    };
    response.render("movies.hbs", model);
  });
});

app.get("/create-movie", function (request, response) {
  response.render("create-movie.hbs");
});

app.post("/create-movie", function (request, response) {
  const title = request.body.title;
  const grade = request.body.grade;

  const query = `INSERT INTO movies(title,grade) VALUES (?, ?)`;
  const values = [title, grade];

  db.run(query, values, function (error) {
    if (error) {
      console.log(error);
      //Display error message
    } else {
      response.redirect("/movies" + this.lastID);
    }
  });
});

app.get("/update-movie/:id", function (request, response) {
  const id = request.params.id;
  const query = `SELECT * FROM movies WHERE id=?`;
  const values = [id];
  db.get(query, values, function (error, movie) {
    if (error) {
      console.log(error);
      //should show the error massage
    } else {
      const model = { movie };
      response.render("update-movie.hbs", model);
    }
  });
});

app.post("/update-movie/:id", function (request, response) {
  const id = request.params.id;
  const newName = request.params.name;
  const newGrade = request.params.grade;

  const query = `UPDATE movies SET name=?,grade=? WHERE id=?`;
  const values = [newName, newGrade, id];
  db.run(query, values, function (error) {
    if (error) {
      console.log(error);
      //show the error massage
    } else {
      response.redirect("/movies/" + id);
    }
  });
});

app.post("/delete-movie/:id", function (request, response) {
  const id = request.params.id;
  const movieIndex = movies.findIndex((h) => h.id == id);
  movies.splice(movieIndex, 1);
  response.redirect("/movies");
});

app.get("/movies/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM movies WHERE id=?`;
  const values = [id];

  db.get(query, values, function (error, movie) {
    if (error) {
      console.log(error);
      //send back the error page
    } else {
      const model = {
        movie,
      };
      response.render("movie.hbs", model);
    }
  });
});
app.listen(8080);
