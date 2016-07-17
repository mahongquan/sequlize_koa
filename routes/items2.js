var models  = require('../models');
var express = require('express');
var router  = express.Router();
router.get('/', function(req, res) {
  console.log(req.query);
  var start=req.query.start;
  var limit=req.query.limit;
  var search=req.query.search;
  var w=null;
  if (search && search!=""){
          w={
              name:{$like:"%"+search+"%"},
          };
  }
  else
  {
        w={};
  }
  console.log(w);
  //console.log(models.sequelize);
  models.Item.findAll({
    attributes: [ [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'], ],
    where: w
  }).then(function(datas){//dataValues
      var total=datas[0].dataValues.total;
      console.log("total="+total);
      models.Item.findAll({
        where: w,limit: limit,offset:start
      }
      ).then(function(contacts) {
        if(contacts.length>0){
          res.json({data:contacts,total:total});
        }
        else{
          res.json({data:contacts,total:0}); 
        }
      });//then
  });//then
});
router.post('/', function(req, res) {
  models.Item.create( req.body).then(function(data) {
    res.json({data:data,message:"create item ok"}); 
  });
});

router.put('/:contact_id', function(req, res) {
  //console.log(req.body);
  models.Item.findById(req.body.id).then(function(packitem) {
    packitem.update(req.body);
    packitem.save();
    res.json({data:packitem,message:"update item ok"}); 
  });
});//update

router.post('/:contact_id/tasks/create', function (req, res) {
  models.Task.create({
    title: req.body.title,
    ContactId: req.params.contact_id
  }).then(function() {
    res.redirect('/parts');
  });
});

router.get('/:contact_id/tasks/:task_id/destroy', function (req, res) {
  models.Task.destroy({
    where: {
      id: req.params.task_id
    }
  }).then(function() {
    res.redirect('/parts');
  });
});


module.exports = router;
