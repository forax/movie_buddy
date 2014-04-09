package com.github.forax.moviebuddy;

import static java.lang.Integer.compare;
import static java.util.Collections.binarySearch;
import static java.util.Optional.ofNullable;

import java.util.List;
import java.util.Optional;

import com.github.forax.moviebuddy.JsonStream.JsonItem;

class Movie implements Comparable<Movie>{
  final int _id;
  final String title;
  final String actors;
  final String genre;
  final String json;
  
  private Movie(int _id, String title, String actors, String genre, String json) {
    this._id = _id;
    this.title = title;
    this.actors = actors;
    this.genre = genre;
    this.json = json;
  }
  
  @Override
  public int compareTo(Movie movie) {
    return compare(_id, movie._id);
  }
  
  @Override
  public String toString() {
    return json;
  }
  
  static Movie parse(JsonItem item) {
    return new Movie(
        item.getInt("_id"),
        item.getString("Title").toLowerCase(),
        item.getString("Actors").toLowerCase(),
        item.getString("Genre").toLowerCase(),
        item.toJson());
  }
  
  static Optional<Movie> findMovieById(int id, List<Movie> movies) {
    int index = binarySearch(movies, new Movie(id, "", "", "", ""));
    return ofNullable((index < 0)? null: movies.get(index));
  }
}