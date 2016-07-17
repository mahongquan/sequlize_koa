#!/usr/bin/env node

//var debug = require('debug')('express-example');
//var app = require('../app');
var models = require("./models");
//app.set('port', process.env.PORT || 8000);
models.sequelize.sync().then(function () {
    //console.dir(models.Item);
    // models.Item.findAll({
    // }).then(function(datas){
    //     console.log(datas.length);
    // });
    //models.Item.create({name:"test",ct:1,danwei:"个"});
    models.Item.findById(123).then(function(project) {
        // project will be an instance of Project and stores the content of the table entry
        // with id 123. if such an entry is not defined you will get null
        console.log(project.dataValues);
    })
    models.Item.findAndCountAll({
     where: {
        name: {
          $like: '1%'
        }
     },
     offset: 10,
     limit: 2
  })
  .then(function(result) {
    console.log(result.count);
    console.log(result.rows);
  });
});
