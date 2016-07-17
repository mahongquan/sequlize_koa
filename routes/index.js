var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.get('/', function(req, res) {
  models.User.findAll({
    include: [ models.Task ]
  }).then(function(users) {
    res.render('index', {
      title: 'Express',
      users: users
    });
  });
});
router.get('/parts', function(req, res) {
  models.Contact.findAll().then(function(contacts) {
    res.render('index_contact', {
      title: 'Express',
      contacts: contacts
    });
  });
});
module.exports = router;
