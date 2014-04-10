/*--- Rate Model ---*/

var RateModel = Backbone.Model.extend({
  defaults : function (){
    return {
      userId : null, movieId : null, rate : null
    }
  },
  idAttribute: "_id",
  urlRoot : "rates"
});

