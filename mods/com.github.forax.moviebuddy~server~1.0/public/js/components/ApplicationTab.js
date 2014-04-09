/** @jsx React.DOM */

var ApplicationTab = React.createClass({

	getInitialState: function() {
		return {data : [], message : ""};
	},
	render: function() {
		return (
      <div id={this.props.id}>
        <ul className="nav nav-tabs">
          <li><a href="#users" data-toggle="tab">Users</a></li>
          <li><a href="#movies" data-toggle="tab">Movies</a></li>
          <li><a href="#rating" data-toggle="tab">...</a></li>
        </ul>

        <div className="tab-content">
          <div className="tab-pane" id="users">
            <div className="container">
              <hr/>
              <div class="row">
                <UsersTable userRates={this.props.userRates}/>
              </div>
            </div>
          </div>

          <div className="tab-pane" id="movies">
            <div className="container">
              <hr/>
              <div class="row">
                <MoviesTable userRates={this.props.userRates}/>
              </div>
            </div>
          </div>

          <div className="tab-pane" id="rating">
            <div className="container">
              <hr/>
              <div class="row">
                <h1>WIP</h1>
              </div>
            </div>
          </div>

        </div>
      </div>
		);
	},
	componentDidMount: function() {

    console.log("ApplicationTab --> userRates : ", this.props.userRates);

    $('#'+this.props.id+' ul a').click(function (e) {
      e.preventDefault()
      $(this).tab('show')
    })
    $('#'+this.props.id+' ul a:first').tab('show')
  },

});
