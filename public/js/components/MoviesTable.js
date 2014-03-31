/** @jsx React.DOM */

var MoviesTable = React.createClass({

	getInitialState: function() {
		return {
		    data : []
		  , message : ""
      , messageStyle : "alert alert-info"
		};
	},

	render: function() {

	  var movieRow = function(movie) {

      var rateLink0 = "#rate_movie/" + movie._id + "/0";
      var rateLink1 = "#rate_movie/" + movie._id + "/1";
      var rateLink2 = "#rate_movie/" + movie._id + "/2";
      var rateLink3 = "#rate_movie/" + movie._id + "/3";
      var rateLink4 = "#rate_movie/" + movie._id + "/4";
      var rateLink5 = "#rate_movie/" + movie._id + "/5";

      return (
        <tr>
          <td>{movie.Title}</td>
          <td>{movie.Genre}</td>
          <td>{movie.Actors}</td>

          <td>
            <div>
              <a className="label label-default" href={rateLink0}>0</a>
              <a className="label label-danger" href={rateLink1}>1</a>
              <a className="label label-warning" href={rateLink2}>2</a>
              <a className="label label-info" href={rateLink3}>3</a>
              <a className="label label-primary" href={rateLink4}>4</a>
              <a className="label label-success" href={rateLink5}>5</a>
            </div>
          </td>

        </tr>
        );
	  }

		var moviesRows = this.state.data.map(function(movie){
      return movieRow(movie);
		});

		return (
			<div className="table-responsive">
				<div className={this.state.messageStyle}>{this.state.message}</div>

        <div className="panel panel-default">
          <div className="panel-heading">Search movies </div>
          <div className="panel-body">

            <div role="form" className="form-inline">

              <div className="form-group">
                <input className="form-control" type="text" placeholder="title" ref="title" onKeyPress={ this.handleKeyPressed.bind(this, "title") }/>
              </div>

              <div className="form-group">
                <input className="btn btn-primary" type="submit" value="Search" ref="btn_title" onClick={ this.handleClick.bind(this, "title") }/>
              </div>

              <div className="form-group">
                <input className="form-control" type="text" placeholder="genre" ref="genre" onKeyPress={ this.handleKeyPressed.bind(this, "genre") }/>
              </div>

              <div className="form-group">
                <input className="btn btn-primary" type="submit" value="Search" ref="btn_genre" onClick={ this.handleClick.bind(this, "genre") }/>
              </div>


              <div className="form-group">
                <input className="form-control" type="text" placeholder="actors" ref="actors" onKeyPress={ this.handleKeyPressed.bind(this, "actors") }/>
              </div>

              <div className="form-group">
                <input className="btn btn-primary" type="submit" value="Search" ref="btn_actors" onClick={ this.handleClick.bind(this, "actors") }/>
              </div>

            </div>

          </div>
        </div>

				<table className="table table-striped table-bordered table-hover" >
					<thead>
						<tr>
							<th>Title</th><th>Genre</th><th>Actors</th>
							<th>Rating</th>

						</tr>
					</thead>
					<tbody>
						{moviesRows}
					</tbody>
				</table>
			</div>
		);
	},

  handleKeyPressed : function(field, event) {
    if (event.keyCode == 13) {
      this.handleClick(field, event);
    }
  },

  handleClick : function(field, event) {
    console.log("search by : ", field)

    var genre = this.refs.genre.getDOMNode().value.trim();
    var title = this.refs.title.getDOMNode().value.trim();
    var actors = this.refs.actors.getDOMNode().value.trim();

    if (field=="title" && title) this.getMovies("title", title);
    if (field=="genre" && genre) this.getMovies("genre", genre);
    if (field=="actors" && actors) this.getMovies("actors", actors);

    this.refs.title.getDOMNode().value = "";
    this.refs.genre.getDOMNode().value = "";
    this.refs.actors.getDOMNode().value = "";

  },

	getMovies : function(search_field, search_value) {

		var movies = new MoviesCollection();

    movies.load(search_field, search_value, 10)
			.done(function(data){
				this.setState({data : movies.toJSON(), message : Date()});
			}.bind(this))
			.fail(function(err){
				this.setState({
					message  : err.responseText + " " + err.statusText
				});
			}.bind(this))
	},

	componentWillMount: function() {
		this.getMovies("genre", "bollywood");
    console.log("MoviesTable --> userRates : ", this.props.userRates);

  },

	componentDidMount: function() {
    var thatComponent = this;

    var Router = Backbone.Router.extend({
			routes : {
        "rate_movie/:id/:rate" : "rateMovie"
			},
			initialize : function() {
				console.log("Initialize router of MoviesTable component");
			},
      rateMovie : function(id, rate){
        console.log("=== rate movie ===", id, rate);
        var message = "";
        var messageStyle = "";


        if (thatComponent.props.userRates.currentUser) {

          var rateExists = thatComponent.props.userRates.rates.filter(function(rate) { return rate.filmId == id; });
          var movie = thatComponent.state.data.filter(function(film) { return film._id == id })[0].Title;

          message = " has just rated " + movie + " : " + rate;
          messageStyle = "alert alert-success";


          if ( rateExists.length > 0 ) { // already rated -> change rate
            message = " has just rated again " + movie + " : " + rate;
            messageStyle = "alert alert-warning";
            thatComponent.props.userRates.rates.splice(thatComponent.props.userRates.rates.indexOf(rateExists[0]),1);
          }

          message = thatComponent.props.userRates.currentUser.name + message;
          thatComponent.props.userRates.rates.push({filmId : id, rate : rate });

          /*
          $.ajax({
            type : "POST",
            url : "rates",
            data : JSON.stringify ({
              userId : thatComponent.props.userRates.currentUser.id,
              movieId : id,
              rate : rate
            }),
            contentType: "application/json",
            dataType: 'json'
          })
          .done(function(data) {
            console.log("data", data);
            thatComponent.setState({ messageStyle : messageStyle, message : message });
          })
          .fail(function(err) {
            console.log("error", err);
            messageStyle = "alert alert-danger";
            message = err.responseText + " " + err.statusText;
            thatComponent.setState({ messageStyle : messageStyle, message : message });
          });
          */

          var rate = new RateModel({
            userId : thatComponent.props.userRates.currentUser.id,
            movieId : id,
            rate : rate
          });

          rate.save({})
            .done(function(data) {
              console.log("data", data);
              thatComponent.setState({ messageStyle : messageStyle, message : message });
            })
            .fail(function(err) {
              console.log("error", err);
              messageStyle = "alert alert-danger";
              message = err.responseText + " " + err.statusText;
              thatComponent.setState({ messageStyle : messageStyle, message : message });
            });

        } else {
          messageStyle = "alert alert-danger";
          message = "You have to select a user before!";
          thatComponent.setState({ messageStyle : messageStyle, message : message });
        }

        //this.navigate('/');
      }

		});
		this.router = new Router()
	}

});
