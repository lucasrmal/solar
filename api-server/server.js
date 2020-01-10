var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  body_parser = require('body-parser');

app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());

var routes = require('./api/routes/api-routes');
routes(app);

app.listen(port);

console.log('Solar API server started on: ' + port);

