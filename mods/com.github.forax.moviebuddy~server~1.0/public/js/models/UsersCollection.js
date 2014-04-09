/*--- Users Collection ---*/

var UsersCollection = Backbone.Collection.extend({
  urlRoot : "users/search/",
  searchName : "john doe",
  limit : 10,
  model: UserModel,

  url : function() {
    return _.result(this, "urlRoot") + this.searchName + "/" + this.limit;
  },

  load : function(like_name, limit) {
    this.limit = limit;
    this.searchName = like_name;
    return this.fetch()
  }

});

/*
 users = new UsersCollection()
 users.load("bob").done(function(data){ console.log(data);})
 */


