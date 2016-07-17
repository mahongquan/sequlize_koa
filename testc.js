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
    models.Contact.findById(119).then(function(contact) {
        // project will be an instance of Project and stores the content of the table entry
        // with id 123. if such an entry is not defined you will get null
        //console.dir(project);
        contact.getUsepacks(
           { 
            include: [{
                  model: models.Pack,
             }]
           }
          ).then(
          function(usepacks){
            for(var i in usepacks){
              console.log(usepacks[i].pack_id,usepacks[i].Pack.name);
              // var up=usepacks[i];
              // up.getPack().then(function(packs){
              //   console.log(packs);
              //   console.dir(packs);
              //    for(var j in packs){
              //       console.log(packs[j]);
              //    }
              // });
            }
          });
    });
});
