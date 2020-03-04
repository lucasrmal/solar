'use strict';
module.exports = function(app) {
  var query_controller = require('../controllers/query-controller');
  var update_controller = require('../controllers/update-controller');

  app.route('/query')
    .get(query_controller.query);

  app.route('/update')
    .get(update_controller.update);
};