/** @jsx React.DOM */

$(function() {

  Backbone.history.start();

  window.userRates = {
    currentUser : null,
    rates : []
  };


  React.renderComponent(
    <ApplicationTab id={"apptab"} userRates={userRates}/>,
    document.querySelector('ApplicationTab')
  );

});

