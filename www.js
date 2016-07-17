#!/usr/bin/env node

var debug = require('debug')('express-example');
var app = require('./app1');
var models = require("./models");
app.set('port', process.env.PORT || 8000);

models.sequelize.sync().then(function () {
  var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
  });
});
