const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/movies/", async (request, response) => {
  const listOfMovies = `SELECT movie_name as movieName FROM movie `;
  const moviesArray = await db.all(listOfMovies);
  response.send(moviesArray);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES (
        ${directorId}, 
        '${movieName}',
        '${leadActor}'
        );`;

  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `SELECT * FROM movie WHERE movieId = ${movieId};`;
  const movie = await db.get(movieQuery);
  response.send(movie);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `UPDATE movie SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const removeMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(removeMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const directorDetails = `SELECT director_id as directorId, director_name as 
  directorName FROM director`;
  const directorsArray = await db.all(directorDetails);
  response.send(directorsArray);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorQuery = `
    SELECT movie_name as movieName FROM movie WHERE director_id = ${directorId};`;
  const director = await db.get(directorQuery);
  response.send(director);
});

module.exports = app;
