/*--- Movie Model ---*/

var MovieModel = Backbone.Model.extend({
  defaults : function (){
    return {
      Title : "?", Genre : "?", Actors : "?"
    }
  },
  idAttribute: "_id",
  urlRoot : "movies"
});

