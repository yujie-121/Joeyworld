const express = require("express");
const expressHandlebars = require("express-handlebars");
const data = require("./data.js");
const app = express();
const bodyParser = require("body-parser");

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
  const model = {
    movies: data.movies,
  };
  response.render("movies.hbs", model);
});

app.get("/create-movie", function (request, response) {
  response.render("create-movie.hbs");
});

app.post("/create-movie", function (request, response) {
  const title = request.body.title;
  const grade = request.body.grade;

  data.movies.push({
    id: data.movies.length + 1,
    title: title,
    grade: grade,
  });

  response.redirect("/movies");
});

app.get("/movies/:id", function (request, response) {
  const id = request.params.id;
  const movie = data.movies.find((m) => m.id == id);

  const model = {
    movie: movie,
  };

  response.render("movie.hbs", model);
});
app.listen(8080);
