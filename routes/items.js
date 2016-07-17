var models  = require('../models');
//var express = require('express');
var router  = require('express').Router();
router.get('/', function(req, res) {
  models.Item.findAll().then(function(items) {
     var pageinfo={
      previous_page_number:1,
      number:2,
      num_pages:10,
      next_page_number:3,
      has_previous:true,
      has_next:true,
     };
     res.render('parts/items', {
      items: items,
      pageinfo:pageinfo
    });
  });
});//query
router.post('/', function(req, res) {
  models.Item.create({
    yonghu: req.body.yonghu
  }).then(function() {
    res.redirect('/parts');
  });
});//create

router.put('/:contact_id', function(req, res) {
  //console.log(req.body);
  models.Item.findById(req.body.id).then(function(packitem) {
    packitem.update(req.body);
    packitem.save();
  });
});//update

router.delete('/', function (req, res) {
  models.Task.create({
    title: req.body.title,
    ContactId: req.params.contact_id
  }).then(function() {
    res.redirect('/parts');
  });
});//delete

module.exports = router;

