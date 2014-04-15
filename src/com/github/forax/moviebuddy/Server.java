package com.github.forax.moviebuddy;

import static com.github.forax.moviebuddy.JsonStream.asStream;
import static java.lang.Integer.parseInt;
import static java.lang.Math.sqrt;
import static java.lang.System.getProperty;
import static java.nio.file.Paths.get;
import static java.util.stream.Collectors.joining;
import static java.util.stream.Collectors.toList;
import static java.util.regex.Pattern.compile;
import static com.github.forax.moviebuddy.User.findUserById;
import static com.github.forax.moviebuddy.Movie.findMovieById;

import java.io.IOError;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.regex.Pattern;

import org.vertx.java.core.file.impl.PathResolver;
import org.vertx.java.core.http.HttpServer;
import org.vertx.java.core.http.RouteMatcher;
import org.vertx.java.core.impl.DefaultContext;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.platform.Verticle;

public class Server extends Verticle {
  private final static String FILES_PREFIX = ".";
  
  @Override
  public void start() {
    // I know this is wrong, but it seems there is no public API for that
    DefaultContext context = (DefaultContext)vertx.currentContext();
    PathResolver pathResolver = context.getPathResolver();
    
    List<Movie> movies;
    List<User> users;
    try {
      movies = asStream(pathResolver.resolve(get("db/movies.json"))).map(Movie::parse).collect(toList());
      users = asStream(pathResolver.resolve(get("db/users.json"))).map(User::parse).collect(toList());
    } catch (IOException e) {
      throw new IOError(e);
    }
    
    // sort for binary search
    movies.sort(null);
    users.sort(null);
    
    // pre-fill with some votes
    initPredefinedVotes(movies, users);
    
    HttpServer server = vertx.createHttpServer();
    RouteMatcher route = new RouteMatcher();
    
    route.noMatch(req -> {
      String path = req.path();
      if (path.equals("/") || path.contains("..")) {
        path = "/index.html";
      }
      
      req.response().sendFile(FILES_PREFIX + "/public/" + path);
    });
    
    route.get("/movies", req -> {
      req.response().sendFile(FILES_PREFIX + "/db/movies.json");
    });
    
    route.get("/movies/:id", req -> {
      int id = parseInt(req.params().get("id"));
      /* linear search
      req.response().end(
          movies.stream()
                .filter(movie -> movie._id == id)
                .findFirst()
                  .map(Movie::toString)
                  .orElse(""));
      */
      req.response().end(findMovieById(id, movies).map(Movie::toString).orElse(""));
    });
      
    
    route.get("/movies/search/title/:title/:limit", req -> {
      Pattern pattern = compile(req.params().get("title").toLowerCase());
      req.response().end(
          movies.stream()
                .filter(movie -> pattern.matcher(movie.title).find())
                .map(Movie::toString)
                .limit(parseInt(req.params().get("limit")))
                .collect(joining(",", "[", "]")));
    });

    route.get("/movies/search/actors/:actors/:limit", req -> {
      Pattern pattern = compile(req.params().get("actors").toLowerCase());
      req.response().end(
          movies.stream()
                .filter(movie -> pattern.matcher(movie.actors).find())
                .map(Movie::toString)
                .limit(parseInt(req.params().get("limit")))
                .collect(joining(",", "[", "]")));
    });
     
    route.get("/movies/search/genre/:genre/:limit", req -> {
      Pattern pattern = compile(req.params().get("genre").toLowerCase());
      req.response().end(
          movies.stream()
                .filter(movie -> pattern.matcher(movie.genre).find())
                .map(Movie::toString)
                .limit(parseInt(req.params().get("limit")))
                .collect(joining(",", "[", "]")));
    });
    
    route.get("/users", req -> {
      req.response().sendFile(FILES_PREFIX + "/db/users.json");
    });
    
    route.get("/users/:id", req -> {
      int id = parseInt(req.params().get("id"));
      req.response().end(User.findUserById(id, users).map(User::toString).orElse(""));
    });
    
    route.get("/users/search/:name/:limit", req -> {
      Pattern pattern = compile(req.params().get("name").toLowerCase());
      req.response().end(
          users.stream()
                .filter(user -> pattern.matcher(user.name).find())
                .map(User::toString)
                .limit(parseInt(req.params().get("limit")))
                .collect(joining(",", "[", "]")));
    });
    
    route.post("/rates", req -> {
      req.bodyHandler(buffer -> {
        String body = buffer.getString(0, buffer.length());
        JsonObject userRate = new JsonObject(body);
        User user = findUserById(userRate.getInteger("userId"), users).get();
        Movie movie = findMovieById(userRate.getInteger("movieId"), movies).get();
        if (user.rates == null) user.rates = new HashMap<>();
        user.rates.put(movie, userRate.getInteger("rate"));
        req.response().putHeader("location", "/rates/" + user._id).setStatusCode(301).end();
      });
    });
    
    route.get("/rates/:userid1", req -> {
      User user1 = findUserById(parseInt(req.params().get("userid1")), users).get();
      if (user1.rates == null) {
        req.response().end("{}");
        return;
      }
      JsonObject json = new JsonObject();
      user1.rates.forEach((user2, rate) -> json.putNumber(Integer.toString(user2._id), rate));
      req.response().end(json.encode());
    });
    
    route.get("/users/share/:userid1/:userid2", req -> {
      User user1 = findUserById(parseInt(req.params().get("userid1")), users).get();
      User user2 = findUserById(parseInt(req.params().get("userid2")), users).get();
      if (user1.rates == null || user2.rates == null) {
        req.response().end("[]");
        return;
      }
      HashSet<Movie> set = new HashSet<>();
      set.addAll(user1.rates.keySet());
      set.retainAll(user2.rates.keySet());
      req.response().end(set.stream().map(Movie::toString).collect(joining(",", "[", "]")));
    });
    
    route.get("/users/distance/:userid1/:userid2", req -> {
      User user1 = findUserById(parseInt(req.params().get("userid1")), users).get();
      User user2 = findUserById(parseInt(req.params().get("userid2")), users).get();
      if (user1 == user2 || user1.rates == null || user2.rates == null) {
        req.response().end("0");
        return;
      }
      double[] sum_of_squares = { 0.0 };
      user1.rates.forEach((movie, rate1) -> {
        Integer rate2 = user2.rates.get(movie);
        if (rate2 != null) {
          double diff = rate1 - rate2;
          sum_of_squares[0] += diff * diff;
        }
      });
      req.response().end(Double.toString(1.0 / (1.0 + sqrt(sum_of_squares[0]))));
    });
    
    int port = parseInt(getProperty("app.port", "3000"));
    server.requestHandler(route).listen(port);
    container.logger().info("Listening on " + port + " ...");
  }
  
  private static void initPredefinedVotes(List<Movie> movies, List<User> users) {
    Arrays.stream(new int[][] {
        /*userId      movieId       rate*/
        {3022,        772,          2 },
        {3022,        24 ,          10},
        {3022,        482,          4 },
        {3022,        302,          7 },
        {3022,        680,          6 },
        {9649,        772,          2 },
        {9649,        24 ,          8 },
        {9649,        482,          9 },
        {9649,        302,          3 },
        {9649,        556,          8 },
        {2349,        453,          7 },
        {2349,        461,          9 },
        {2349,        258,          10},
        {2349,        494,          9 },
        {2349,        158,          4 },
        { 496,        682,          4 },
        { 496,        559,          7 },
        { 496,        537,          4 },
        { 496,        352,          3 },
        { 496,        005,          9 },
    }).forEach(votes -> {
      int userId = votes[0];
      int movieId = votes[1];
      int rate = votes[2];
      User user = findUserById(userId, users).get();
      Movie movie = findMovieById(movieId, movies).get();
      if (user.rates == null) user.rates = new HashMap<>();
      user.rates.put(movie, rate);
    });
  }
}
