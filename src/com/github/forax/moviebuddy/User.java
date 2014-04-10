package com.github.forax.moviebuddy;

import static java.lang.Integer.compare;
import static java.util.Collections.binarySearch;
import static java.util.Optional.ofNullable;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import com.github.forax.moviebuddy.JsonStream.JsonItem;

class User implements Comparable<User> {
  final int _id;
  final String name;
  final String json;
  HashMap<Movie, Integer> rates;
  
  private User(int _id, String name, String json) {
    this._id = _id;
    this.name = name;
    this.json = json;
  }
  
  @Override
  public int compareTo(User user) {
    return compare(_id, user._id);
  }
  
  @Override
  public String toString() {
    return json;
  }
  
  static User parse(JsonItem item) {
    return new User(
        item.getInt("_id"),
        item.getString("name").toLowerCase(),
        item.toJson());
  }
  
  static Optional<User> findUserById(int id, List<User> users) {
    int index = binarySearch(users, new User(id, "", ""));
    return ofNullable((index < 0)? null: users.get(index));
  }
}