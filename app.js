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
  const query = `SELECT * FROM movies ORDER BY id`;

  db.all(query, function (error, movies) {
    if (error) {
      console.log(error);
      const model = {
        dbErrorOccurred: true,
      };
      response.render("movies.hbs", model);
    } else {
      const model = {
        movies,
        dbErrorOccurred: false,
      };
      response.render("movies.hbs", model);
    }
  });
});

app.get("/create-movie", function (request, response) {
  response.render("create-movie.hbs");
});

function getValidationErrorsForMovie(title, grade) {
  const validationErrors = [];
  if (title == "") {
    validationErrors.push("Title can't be empty");
  } else if (grade < 0) {
    validationErrors.push("Grade can't be nagative.");
  } else if (grade == "") {
    validationErrors.push("Grade can't be empty.");
  } else if (grade > 10) {
    validationErrors.push("The maximun grade is 10.");
  } else if (isNaN(grade)) {
    validationErrors.push("You did not enter a number for the grade");
  }
  return validationErrors;
}

app.post("/create-movie", function (request, response) {
  const title = request.body.title;
  const grade = parseInt(request.body.grade);
  const validationErrors = getValidationErrorsForMovie(title, grade);

  if (validationErrors.length == 0) {
    const query = `INSERT INTO movies(title,grade) VALUES (?, ?)`;
    const values = [title, grade];

    db.run(query, values, function (error) {
      if (error) {
        console.log(error);
        //Display error message
      } else {
        response.redirect("/movies/" + this.lastID);
      }
    });
  } else {
    const model = {
      validationErrors,
      title,
      grade,
    };
    response.render("create-movie.hbs", model);
  }
});

app.get("/update-movie/:id", function (request, response) {
  const id = request.body.id;
  const query = "SELECT * FROM movies WHERE id=?";
  const values = [id];
  db.get(query, values, function (error, movie) {
    if (error) {
      console.log(error);
      //should show the error massage
    } else {
      const model = {
        movie,
      };
      response.render("update-movie.hbs", model);
    }
  });
});

app.post("/update-movie/:id", function (request, response) {
  const id = request.params.id;
  const newTitle = request.body.title;
  const newGrade = parseInt(request.body.grade);

  const validationErrors = getValidationErrorsForMovie(newTitle, newGrade);

  if (validationErrors.length == 0) {
    const query = `UPDATE movies SET title=?,grade=? WHERE id=?`;
    const values = [newTitle, newGrade, id];
    db.run(query, values, function (error) {
      if (error) {
        console.log(error);
        //show the error massage
      } else {
        response.redirect("/movies/" + id);
      }
    });
  } else {
    const model = {
      movie: {
        id,
        title: newTitle,
        grade: newGrade,
        validationErrors,
      },
    };
    response.render("update-movie.hbs", model);
  }
});

app.post("/delete-movie/:id", function (request, response) {
  const id = request.params.id;

  const query = `DELETE FROM movies WHERE id=?`;
  const values = [id];
  db.run(query, values, function (error) {
    if (error) {
      console.log(error);
      //Display the error message
    } else {
      response.redirect("/movies");
    }
  });
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
