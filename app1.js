var koa = require('koa');
var app = koa();
var render = require('koa-swig');
var app = koa();
var path = require('path');
var route = require('koa-route');
var serve = require('koa-static');
var models  = require('./models');

app.context.render = render({
  root: path.join(__dirname, 'templates'),
  autoescape: true,
  cache: 'memory', // disable, set to false 
  ext: 'html',
  // locals: locals,
  // filters: filters,
  // tags: tags,
  // extensions: extensions
});
app.use(serve(__dirname + '/public'));
app.use(route.get('/rest/backbone', function * (){
    yield this.render('rest/backbone');
}));
//Contact//////////////////////////////////////////////////////////////////////
app.use(route.get('/rest/Contact', function * (){
   var start=this.request.query.start;
   var limit=this.request.query.limit;
   var search=this.request.query.search;
  var baoxiang='';
  if (this.request.query.baoxiang){
    baoxiang=this.request.query.baoxiang;
  }
  var w=null;
  if (search!=""){
      if(baoxiang!=""){
          w={
            $or:{
              yiqibh:{$like:"%"+search+"%"},
              hetongbh:{$like:"%"+search+"%"},
            },
            baoxiang:{$like:"%"+baoxiang+"%"}
          };
      }
      else{
          w={
            $or:{
              yiqibh:{$like:"%"+search+"%"},
              hetongbh:{$like:"%"+search+"%"},
            }
          };
      }
  }
  else
  {
      if(baoxiang!=""){
          w={
            baoxiang:{$like:"%"+baoxiang+"%"}
          };
      }
      else{
        w={};
      }
  }
  console.log(w);
   var datas=yield models.Contact.findAll({
    attributes: [ [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'], ],
    where: w
  })
   //this.body=datas;
    var total=datas[0].dataValues.total;
       console.log("total="+total);
      var contacts= yield models.Contact.findAll({
        where: w,limit: limit,offset:start,order:'yujifahuo_date DESC'
      }
      )
      this.body={data:contacts,total:total};
}));
module.exports = app;
