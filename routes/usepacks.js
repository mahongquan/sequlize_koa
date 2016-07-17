var models  = require('../models');
var express = require('express');
var router  = express.Router();
router.get('/', function(req, res) {
  console.log(req.query);
  var contact_id=req.query.contact;
  var  w={
            contact_id:contact_id
          };
models.UsePack.findAll({
    attributes: [ [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'], ],
    where: w
  }).then(function(datas){//dataValues
      var total=datas[0].dataValues.total;
      console.log("total="+total);          
      models.UsePack.findAll({
        where: w,
        include: [{
                  model: models.Pack,
             }] ,
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
  models.UsePack.create( req.body).then(function(packitem) {
      packitem.getPack().then( function(item){
            console.log(item);
            packitem.dataValues["Pack"]=item;
            res.json({data:packitem,message:"create UsePack ok"}); 
            }
        );
  });
});//create

router.get('/:contact_id/destroy', function(req, res) {
  models.Contact.destroy({
    where: {
      id: req.params.contact_id
    }
  }).then(function() {
    res.redirect('/parts');
  });
});

router.post('/:contact_id/tasks/create', function (req, res) {
  models.Task.create({
    title: req.body.title,
    ContactId: req.params.contact_id
  }).then(function() {
    res.redirect('/parts');
  });
});

router.delete('/:packitem_id', function (req, res) {
    console.log("=====:");
    console.log(req);
    console.log(req.body);
    models.UsePack.findById(req.params.packitem_id
        ).then(function(packitem) {
          console.log(packitem);
        packitem.destroy();
        res.json({data:[],message:"delete packitem ok"}); 
      });
});//delete


module.exports = router;
