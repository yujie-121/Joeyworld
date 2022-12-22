const express = require("express");
const expressHandlebars = require("express-handlebars");
const data = require("./data.js");
const app = express();

app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "main.hbs",
  })
);

app.use(express.static("public"));

app.get("/", function (request, response) {
  response.render("start.hbs");
});
app.get("/movies", function (request, response) {
  const model = {
    movies: data.movies,
  };
  response.render("movies.hbs", model);
});
app.listen(8080);
