function getScripts(){ return [
  
  "js/models/MovieModel.js",
  "js/models/MoviesCollection.js",
  "js/models/RateModel.js",
  "js/models/RatesCollection.js",
  "js/models/UserModel.js",
  "js/models/UsersCollection.js",
  
  
  "js/components/ApplicationTab.js",
  "js/components/MoviesTable.js",
  "js/components/UsersTable.js",
  "js/main.js"
];};

getScripts().forEach(function(s){
	var script = document.createElement('script');
	script.src = s;
	script.type = "text/jsx";
	document.querySelector('head').appendChild(script);
});


