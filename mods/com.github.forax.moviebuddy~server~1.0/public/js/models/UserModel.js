/*--- User Model ---*/

var UserModel = Backbone.Model.extend({
  defaults : function (){
    return {
      name : "John Doe"
    }
  },
  idAttribute: "_id",
  urlRoot : "users"
});

