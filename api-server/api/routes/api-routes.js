'use strict';
module.exports = function(app) {
  var api_controller = require('../controllers/api-controller');

  // Query the database
  app.route('/query')
    .get(api_controller.query);
};