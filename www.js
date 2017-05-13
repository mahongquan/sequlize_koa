#!/usr/bin/env node
var app = require('./app1');
var models = require("./models");
console.log("start");
models.sequelize.sync().then(function () {
	console.log("listen");
    var server = app.listen(8000);
});
