var koa = require('koa');
var app =new koa();
var swig = require('swig');
var path = require('path');
var Route = require('koa-router');
var route=new Route();
var serve = require('koa-static');
var models = require('./models');
var bodyParser = require('koa-bodyparser');
app.use(bodyParser());
//
route.get('/parts/zhuangxiangdan/', function(ctx) {
	ctx.body = {
		data: ["hi zhuangxiangdan"],
		message: "create Contact ok"
	};
});
route.get('/parts/tar', function(ctx) {
	ctx.body = {
		data: ["hi tar"],
		message: "create Contact ok"
	};
});
route.get('/parts/showcontact/', function(ctx) {
	ctx.body = {
		data: ["hi"],
		message: "create Contact ok"
	};
});
route.get('/', function(ctx) {
	ctx.redirect('/parts/tar');
});
route.post('/parts/copypack', function(ctx) {
	console.log(ctx.request.body);
	ctx.body="copy not ok";
});
var render=function(ctx,tn,dict){
	var p=path.join(__dirname, 'templates');
	p=path.join(p, tn+'.html');
	console.log(p);
	var template = swig.compileFile(p);
	var output = template(dict);
	ctx.body=output;
}
route.get('/parts/copypack', function(ctx,next) {
	render(ctx,"parts/copypack");
});
route.get('/rest/backbone', function(ctx,next) {
	render(ctx,"rest/backbone");
});
route.get('/parts/items', async function(ctx,next) {
	var page = "1" && ctx.request.query.page;
	page=parseInt(page);
	if(isNaN(page)) page=1;
	var limit=9;
	var w={};
	var datas = await models.Item.findAll({
			attributes: [
				[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
			],
			//where: w
		})
	var total = datas[0].dataValues.total;
	console.log(total);
	var pageinfo={};
	var start=(page-1)*limit;
	var items = await models.Item.findAll({
		where: w,
		limit: limit,
		offset: start,
	})
	//if (start<)	
	pageinfo.number=page;
	pageinfo.num_pages=Math.ceil(total / limit);//previous_page_number,next_page_number,has_previous,has_next
	console.log(pageinfo.num_pages);
	pageinfo.has_previous=true;
	pageinfo.has_next=true;
	if(pageinfo.number==pageinfo.num_pages)
		pageinfo.has_next=false;
    if(pageinfo.number==1)
		pageinfo.has_previous=false;
	pageinfo.previous_page_number=pageinfo.number-1;
	pageinfo.next_page_number=pageinfo.number+1;

	await render(ctx,'parts/items',{items:items,pageinfo:pageinfo});
});

//Contact//////////////////////////////////////////////////////////////////////
route.delete('/rest/Contact/:contact_id', async function(ctx,next) {
	var contact = await models.Contact.findById(ctx.params.contact_id); //.then(function(packitem) {
	contact.destroy();
	ctx.body = {
		data: [],
		message: "delete Contact ok"
	};
}); //delete
route.post('/rest/Contact', async function(ctx,next) {
	var contact =await models.Contact.create(ctx.request.body)
	ctx.body = {
		data: contact,
		message: "create Contact ok"
	};
});
route.put('/rest/Contact', async function(ctx,next) {
	var contact = await models.Contact.findById(ctx.request.body.id); //.then(function(packitem) {
	contact.update(ctx.request.body);
	contact.save();
	ctx.body = {
		data: contact,
		message: "update  Contact ok"
	};
});
route.get('/rest/Contact', async function(ctx,next) {
	var start = ctx.request.query.start;
	var limit = ctx.request.query.limit;
	var search = ctx.request.query.search;
	var baoxiang = '';
	if (ctx.request.query.baoxiang) {
		baoxiang = ctx.request.query.baoxiang;
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
	var datas = await models.Contact.findAll({
			attributes: [
				[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
			],
			where: w
		})
		//ctx.body=datas;
	var total = datas[0].dataValues.total;
	console.log("total=" + total);
	var contacts = await models.Contact.findAll({
		where: w,
		limit: limit,
		offset: start,
		order: 'yujifahuo_date DESC'
	})
	ctx.body = {
		data: contacts,
		total: total
	};
});
//UsePack//////////////////////////////////////////////////////////////////////
route.delete('/rest/UsePack/:contact_id', async function(ctx) {
	var contact = await models.UsePack.findById(ctx.params.contact_id); //.then(function(packitem) {
	contact.destroy();
	ctx.body = {
		data: [],
		message: "delete UsePack ok"
	};
}); //delete
route.post('/rest/UsePack', async function(ctx,next) {
	var contact = await models.UsePack.create(ctx.request.body)
	var pack = await contact.getPack();
	contact.dataValues["Pack"] = pack;
	ctx.body = {
		data: contact,
		message: "create UsePack ok"
	};
});
route.put('/rest/UsePack', async function(ctx,next) {
	var contact = await models.UsePack.findById(ctx.request.body.id); //.then(function(packitem) {
	contact.update(ctx.request.body);
	contact.save();
	ctx.body = {
		data: contact,
		message: "update  UsePack ok"
	};
});
route.get('/rest/UsePack', async function(ctx,next) {
	var start = ctx.request.query.start;
	var limit = ctx.request.query.limit;
	var search = ctx.request.query.search;
	var w = {
		contact_id: ctx.request.query.contact_id
	};
	var datas = await models.UsePack.findAll({
		attributes: [
			[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
		],
		where: w
	})
	var total = datas[0].dataValues.total;
	console.log("total=" + total);
	var contacts = await models.UsePack.findAll({
		where: w,
		limit: limit,
		offset: start,
		include: [{
			model: models.Pack,
		}],
	})
	ctx.body = {
		data: contacts,
		total: total
	};
});
//PackItem//////////////////////////////////////////////////////////////////////
route.delete('/rest/PackItem/:contact_id',  async function(ctx,contact_id) {
	var contact = await models.PackItem.findById(ctx.params.contact_id); //.then(function(packitem) {
	contact.destroy();
	ctx.body = {
		data: [],
		message: "delete PackItem ok"
	};
}); //delete
route.post('/rest/PackItem', async function(ctx,next) {
	var contact = await models.PackItem.create(ctx.request.body)
	var pack = await contact.getItem();
	contact.dataValues["Item"] = pack;
	ctx.body = {
		data: contact,
		message: "create UsePack ok"
	};
});
route.put('/rest/PackItem/:id',async  function(ctx,next) {
	console.log(ctx);
	console.log(next);
	console.log(ctx.params.id);
	var packitem = await models.PackItem.findById(ctx.params.id, {
		include: [{
			model: models.Item,
		}],
	}); //.then(function(packitem) {
	console.log("==============================");
	console.log(packitem);
	packitem.update(ctx.request.body);
	packitem.Item.save();
	packitem.save();
	console.log(packitem);
	ctx.body = {
		data: packitem,
		message: "update packitem ok"
	};
}); //update
// route.put('/rest/PackItem/:id', function*(id) {
// 	var contact = await models.PackItem.findById(id); //.then(function(packitem) {
// 	contact.update(ctx.request.body);
// 	contact.save();
// 	ctx.body = {
// 		data: contact,
// 		message: "update  PackItem ok"
// 	};
// }));
route.get('/rest/PackItem', async function(ctx,next) {
	var start = ctx.request.query.start;
	var limit = ctx.request.query.limit;
	var search = ctx.request.query.search;
	var w = {
		pack_id: ctx.request.query.pack_id
	};
	var datas = await models.PackItem.findAll({
		attributes: [
			[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
		],
		where: w
	})
	var total = datas[0].dataValues.total;
	console.log("total=" + total);
	var contacts = await models.PackItem.findAll({
		where: w,
		limit: limit,
		offset: start,
		include: [{
			model: models.Item,
		}],
	})
	ctx.body = {
		data: contacts,
		total: total
	};
});
//Pack
route.post('/rest/Pack', async function(ctx,next) {
	var data = await models.Pack.create(ctx.request.body);
	ctx.body = {
		data: data,
		message: "create pack ok"
	};
});
route.get('/rest/Pack', async function(ctx,next) {
	console.log(ctx.request.query);
	var start = ctx.request.query.start;
	var limit = ctx.request.query.limit;
	var search = ctx.request.query.search;
	var w = null;
	if (search && search != "") {
		w = {
			name: {
				$like: "%" + search + "%"
			},
		};
	} else {
		w = {};
	}
	console.log(w);
	var datas = await models.Pack.findAll({
		attributes: [
			[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
		],
		where: w
	});
	var total = datas[0].dataValues.total;
	console.log("total=" + total);
	var contacts = await models.Pack.findAll({
		where: w,
		limit: limit,
		offset: start
	});
	if (contacts.length > 0) {
		ctx.body = {
			data: contacts,
			total: total
		};
	} else {
		ctx.body = {
			data: contacts,
			total: 0
		};
	}
});
//Item
route.post('/rest/Item', async function(ctx,next) {
	var data = await models.Item.create(ctx.request.body);
	ctx.body = {
		data: data,
		message: "create item ok"
	};
});
route.get('/rest/Item', async function(ctx,next) {
	console.log(ctx.request.query);
	var start = ctx.request.query.start;
	var limit = ctx.request.query.limit;
	var search = ctx.request.query.search;
	var w = null;
	if (search && search != "") {
		w = {
			name: {
				$like: "%" + search + "%"
			},
		};
	} else {
		w = {};
	}
	console.log(w);
	var datas = await models.Item.findAll({
		attributes: [
			[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
		],
		where: w
	});
	var total = datas[0].dataValues.total;
	console.log("total=" + total);
	var contacts = await models.Item.findAll({
		where: w,
		limit: limit,
		offset: start
	});
	if (contacts.length > 0) {
		ctx.body = {
			data: contacts,
			total: total
		};
	} else {
		ctx.body = {
			data: contacts,
			total: 0
		};
	}
});
app
  .use(route.routes())
  .use(route.allowedMethods());
app.use(serve(__dirname + '/public'));  
module.exports = app;