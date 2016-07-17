var models = require('../models');
var express = require('express');
var router = express.Router();
router.get('/', function(req, res) {
  console.log(req.query);
  var start = req.query.start;
  var limit = req.query.limit;
  var search = req.query.search;
  var baoxiang = '';
  if (req.query.baoxiang) {
    baoxiang = req.query.baoxiang;
  }
  var w = null;
  if (search != "") {
    if (baoxiang != "") {
      w = {
        $or: {
          yiqibh: {
            $like: "%" + search + "%"
          },
          hetongbh: {
            $like: "%" + search + "%"
          },
        },
        baoxiang: {
          $like: "%" + baoxiang + "%"
        }
      };
    } else {
      w = {
        $or: {
          yiqibh: {
            $like: "%" + search + "%"
          },
          hetongbh: {
            $like: "%" + search + "%"
          },
        }
      };
    }
  } else {
    if (baoxiang != "") {
      w = {
        baoxiang: {
          $like: "%" + baoxiang + "%"
        }
      };
    } else {
      w = {};
    }
  }
  console.log(w);
  //console.log(models.sequelize);
  models.Contact.findAll({
    attributes: [
      [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
    ],
    where: w
  }).then(function(datas) { //dataValues
    var total = datas[0].dataValues.total;
    console.log("total=" + total);
    models.Contact.findAll({
      where: w,
      limit: limit,
      offset: start,
      order: 'yujifahuo_date DESC'
    }).then(function(contacts) {
      if (contacts.length > 0) {
        res.json({
          data: contacts,
          total: total
        });
      } else {
        res.json({
          data: contacts,
          total: 0
        });
      }
    }); //then
  }); //then
});
router.post('/create', function(req, res) {
  models.Contact.create({
    yonghu: req.body.yonghu
  }).then(function() {
    res.redirect('/parts');
  });
});

router.put('/:contact_id', function(req, res) {
  console.log(req.body);
  var data = req.body;
  console.log(data);
  // models.Contact.destroy({
  //   where: {
  //     id: req.params.contact_id
  //   }
  // }).then(function() {
  //   res.redirect('/parts');
  // });
}); //update

router.post('/:contact_id/tasks/create', function(req, res) {
  models.Task.create({
    title: req.body.title,
    ContactId: req.params.contact_id
  }).then(function() {
    res.redirect('/parts');
  });
});

router.get('/:contact_id/tasks/:task_id/destroy', function(req, res) {
  models.Task.destroy({
    where: {
      id: req.params.task_id
    }
  }).then(function() {
    res.redirect('/parts');
  });
});


module.exports = router;