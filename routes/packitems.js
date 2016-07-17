var models  = require('../models');
//var express = require('express');
var router  = require('express').Router();
router.get('/', function(req, res) {
  console.log("get packitem");
  console.log(req.query);
  var pack_id=req.query.pack_id;
  var start=req.query.start;
  var limit=req.query.limit;
  if(pack_id!=undefined && pack_id!="")
   {
        w={
            pack_id:pack_id
          };
  }
  else{  
      w={};
    }
    console.log(w);
models.PackItem.findAll({
    attributes: [ [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'], ],
    where: w
  }).then(function(datas){//dataValues
      var total=datas[0].dataValues.total;
      console.log("total="+total);          
      models.PackItem.findAll({
        where: w,limit: limit,offset:start,
         include: [{
                  model: models.Item,
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
  });//query
router.post('/', function(req, res) {
  models.PackItem.create( req.body).then(function(packitem) {
      packitem.getItem().then( function(item){
            console.log(item);
            packitem.dataValues["Item"]=item;
            res.json({data:packitem,message:"create packitem ok"}); 
            }
        );
  });
});//create

router.put('/:packitem_id', function(req, res) {
  //console.log(req.body);
  models.PackItem.findById(req.body.id,{
     include: [{
                  model: models.Item,
             }] ,
  }
    ).then(function(packitem) {
    console.log("==============================");
    console.log(packitem);
    packitem.update(req.body);
    packitem.Item.save();
    packitem.save();
    console.log(packitem);
    res.json({data:packitem,message:"update packitem ok"}); 
  });
});//update

router.delete('/:packitem_id', function (req, res) {
    console.log("=====:");
    console.log(req);
    console.log(req.body);
    models.PackItem.findById(req.params.packitem_id
        ).then(function(packitem) {
          console.log(packitem);
        packitem.destroy();
        res.json({data:[],message:"delete packitem ok"}); 
      });
});//delete

module.exports = router;

