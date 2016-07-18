#!/usr/bin/env node
var app = require('./app1');
var models = require("./models");

models.sequelize.sync().then(function () {
  var server = app.listen(8000);
});
