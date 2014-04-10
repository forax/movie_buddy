/** @jsx React.DOM */

var UsersTable = React.createClass({

	getInitialState: function() {
		return {
		    data : []
		  , message : ""
      , messageStyle : "alert alert-info"
    }
	},

	render: function() {

	  var userRow = function(user) {

      var selectLink = "#select_user/" + user._id;

      return (
        <tr>
          <td>{user._id}</td>
          <td>{user.name}</td>
          <td><a className="btn btn-primary" href={selectLink}>select</a></td>
        </tr>
        );

	  }

		var usersRows = this.state.data.map(function(user){
      return userRow(user);
		});

		return (
			<div className="table-responsive">
        <div className={this.state.messageStyle}>{this.state.message}</div>

        <div className="panel panel-default">
          <div className="panel-heading">Search users by name</div>
          <div className="panel-body">
            <div role="form" className="form-inline">
              <div className="form-group">
                <input className="form-control" type="search" placeholder="name" ref="name" onKeyPress={ this.handleKeyPressed }/>
              </div>
              <div className="form-group">
                <input className="btn btn-primary" type="submit" value="Search" onClick={ this.handleClick } />
              </div>
            </div>
          </div>
        </div>

				<table className="table table-striped table-bordered table-hover" >
					<thead>
						<tr>
              <th>id</th>
							<th>name</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{usersRows}
					</tbody>
				</table>
			</div>
		);
	},

  handleKeyPressed : function(event) {
    if (event.keyCode == 13) {
      this.handleClick();
    }

  },

  handleClick : function() {
    var name = this.refs.name.getDOMNode().value.trim();

    if (!name) {
      return false;
    }
    this.refs.name.getDOMNode().value = "";
    this.getUsers(name);
  },

	getUsers : function(search_name) {

    console.log("search_name : ", search_name)

		var users = new UsersCollection();

		users.load(search_name, 10)
			.done(function(data){
        console.log("data : ", data)
				this.setState({data : users.toJSON(), message : Date()});
			}.bind(this))
			.fail(function(err){
				this.setState({
					message  : err.responseText + " " + err.statusText
				});
			}.bind(this))
	},

	componentWillMount: function() {
		this.getUsers("John Doe");
  },

	componentDidMount: function() {
    var thatComponent = this;
		var Router = Backbone.Router.extend({
			routes : {
				"select_user/:id" : "selectUser"
			},
			initialize : function() {
				console.log("Initialize router of UsersTable component");
			},
      selectUser : function(id){
				console.log("=== select user ===", id);
        var selectedUserName = thatComponent.state.data.filter(function (user) { return user._id == id; })[0].name;
        thatComponent.props.userRates.currentUser = { id: id, name : selectedUserName };
        thatComponent.props.userRates.rates = [];

        thatComponent.setState({ message : selectedUserName + " is selected" });

				this.navigate('/');
			}

		});
		this.router = new Router()
	}

});
