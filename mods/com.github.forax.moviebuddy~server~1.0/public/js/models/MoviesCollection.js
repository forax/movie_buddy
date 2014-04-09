/*--- Movies Collection ---*/

var MoviesCollection = Backbone.Collection.extend({
  urlRoot : "movies/search/",
  searchValue : "k33g_org",
  searchField : "actors",
  limit : 10,
	model: MovieModel,

  url : function() {
    return _.result(this, "urlRoot") + this.searchField + "/" + this.searchValue + "/" + this.limit;
  },

  load : function(field, value, limit) {
    this.limit = limit;
    this.searchField = field;
    this.searchValue = value;
    return this.fetch()
  }

});

/*
 movies = new MoviesCollection()
 movies.load("genre","comedy",10).done(function(data) { console.log(data); })
 */