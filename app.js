const express = require("express");
const sqlite3 = require("sqlite3");
const path = require("path");
const { open } = require("sqlite");

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
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const convertDbObjectToResponseObject = (dbOject) => {
  return {
    movieId: dbOject.movie_id,
    directorId: dbOject.director_id,
    movieName: dbOject.movie_name,
    leadActor: dbOject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
      movie_name AS movieName
    FROM 
      movie;`;
  const movies = await db.all(getMoviesQuery);
  response.send(movies);
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addQuery = `
    INSERT INTO
     movie(director_id,movie_name,lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}');`;
  const movie = await db.run(addQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMoviesQuery = `
    SELECT 
      *
    FROM 
      movie
    WHERE movie_id=${movieId};`;
  const movie = await db.get(getMoviesQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateQuery = `
    UPDATE
      movie
    SET 
      director_id=${directorId},
      movie_name='${movieName}',
      lead_actor='${leadActor}'
    WHERE movie_id=${movieId};`;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE
    FROM 
     movie
    WHERE movie_id=${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const directorQuery = `
    SELECT
      director_id AS directorId,director_name AS directorName
    FROM
      director;`;
  const directorArray = await db.all(directorQuery);
  response.send(directorArray);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directQuery = `
    SELECT
     movie_name AS movieName
    FROM 
     movie
    WHERE movie.director_id=${directorId};`;
  const movieArray = await db.all(directQuery);
  response.send(movieArray);
});

module.exports = app;
