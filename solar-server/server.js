var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  body_parser = require('body-parser');

app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use(express.static('public'));

var routes = require('./api/routes/routes');
routes(app);

app.listen(port);

console.log('Solar Meter started on: ' + port);

var merge_controller = require('./api/controllers/merge-controller');
merge_controller.scheduleMergeProduction();

console.log('Scheduled MergeProduction');
