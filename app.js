var swig = require('swig');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// view engine setup
app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'html');

//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/index'));
//app.use('/parts/items', require('./routes/items'));
app.use('/rest/Item', require('./routes/items2'));
app.use('/rest/Contact', require('./routes/contacts'));
app.use('/rest/UsePack', require('./routes/usepacks'));
app.use('/rest/Backbone', require('./routes/backbone'));
app.use('/rest/Pack', require('./routes/packs'));
app.use('/rest/PackItem', require('./routes/packitems'));
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// no stacktraces leaked to user unless in development environment
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: (app.get('env') === 'development') ? err : {}
  });
});


module.exports = app;
