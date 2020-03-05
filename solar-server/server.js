var express = require('express'),
  app = express(),
  port = process.env.SOLAR_METER_PORT || 3000,
  body_parser = require('body-parser');

app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use(express.static(__dirname + '/public'));

var routes = require('./server/routes/routes');
routes(app);

app.listen(port);
console.log('Solar Meter started on: ' + port);

var merge_controller = require('./server/controllers/merge-controller');
merge_controller.scheduleMergeProduction();

