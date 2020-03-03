exports.getIntParam = function(param, req) {
  var integer = -1;
  if (req.query.hasOwnProperty(param)) {
    integer = parseInt(req.query[param], 10);
    if (integer == NaN) { integer = -1; }
  }
  return integer;
};

exports.getStringParam = function(param, req) {
  if (req.query.hasOwnProperty(param)) {
    return req.query[param];
  }
  return "";
};

exports.internalError = function(err_msg, res) {
  console.error(err);
  res.status(500).end();
}

exports.malformedQuery = function(err_msg, res) {
  res.json({"status": "MALFORMED_QUERY", "description" : err_msg});
}
