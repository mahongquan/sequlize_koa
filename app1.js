var koa = require('koa');
var app = koa();
var render = require('koa-swig');
var path = require('path');
var route = require('koa-route');
var serve = require('koa-static');
var models = require('./models');
var bodyParser = require('koa-bodyparser');

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
app.use(bodyParser());
app.use(serve(__dirname + '/public'));
app.use(route.post('/parts/copypack', function*() {
	this.body="copy not ok";
}));
app.use(route.get('/parts/copypack', function*() {
	yield this.render('parts/copypack');
}));
app.use(route.get('/parts/items', function*() {
	var page = "1" && this.request.query.page;
	page=parseInt(page);
	if(isNaN(page)) page=1;
	var limit=9;
	var w={};
	var datas = yield models.Item.findAll({
			attributes: [
				[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
			],
			//where: w
		})
	var total = datas[0].dataValues.total;
	console.log(total);
	var pageinfo={};
	var start=(page-1)*limit;
	var items = yield models.Item.findAll({
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

	yield this.render('parts/items',{items:items,pageinfo:pageinfo});
}));
app.use(route.get('/rest/backbone', function*() {
	yield this.render('rest/backbone');
}));
//Contact//////////////////////////////////////////////////////////////////////
app.use(route.delete('/rest/Contact/:contact_id', function*(contact_id) {
	var contact = yield models.Contact.findById(contact_id); //.then(function(packitem) {
	contact.destroy();
	this.body = {
		data: [],
		message: "delete Contact ok"
	};
})); //delete
app.use(route.post('/rest/Contact', function*() {
	var contact = yield models.Contact.create(this.request.body)
	this.body = {
		data: contact,
		message: "create Contact ok"
	};
}));
app.use(route.put('/rest/Contact', function*() {
	var contact = yield models.Contact.findById(this.request.body.id); //.then(function(packitem) {
	contact.update(this.request.body);
	contact.save();
	this.body = {
		data: contact,
		message: "update  Contact ok"
	};
}));
app.use(route.get('/rest/Contact', function*() {
	var start = this.request.query.start;
	var limit = this.request.query.limit;
	var search = this.request.query.search;
	var baoxiang = '';
	if (this.request.query.baoxiang) {
		baoxiang = this.request.query.baoxiang;
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
	var datas = yield models.Contact.findAll({
			attributes: [
				[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
			],
			where: w
		})
		//this.body=datas;
	var total = datas[0].dataValues.total;
	console.log("total=" + total);
	var contacts = yield models.Contact.findAll({
		where: w,
		limit: limit,
		offset: start,
		order: 'yujifahuo_date DESC'
	})
	this.body = {
		data: contacts,
		total: total
	};
}));
//UsePack//////////////////////////////////////////////////////////////////////
app.use(route.delete('/rest/UsePack/:contact_id', function*(contact_id) {
	var contact = yield models.UsePack.findById(contact_id); //.then(function(packitem) {
	contact.destroy();
	this.body = {
		data: [],
		message: "delete UsePack ok"
	};
})); //delete
app.use(route.post('/rest/UsePack', function*() {
	var contact = yield models.UsePack.create(this.request.body)
	var pack = yield contact.getPack();
	contact.dataValues["Pack"] = pack;
	this.body = {
		data: contact,
		message: "create UsePack ok"
	};
}));
app.use(route.put('/rest/UsePack', function*() {
	var contact = yield models.UsePack.findById(this.request.body.id); //.then(function(packitem) {
	contact.update(this.request.body);
	contact.save();
	this.body = {
		data: contact,
		message: "update  UsePack ok"
	};
}));
app.use(route.get('/rest/UsePack', function*() {
	var start = this.request.query.start;
	var limit = this.request.query.limit;
	var search = this.request.query.search;
	var w = {
		contact_id: this.request.query.contact_id
	};
	var datas = yield models.UsePack.findAll({
		attributes: [
			[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
		],
		where: w
	})
	var total = datas[0].dataValues.total;
	console.log("total=" + total);
	var contacts = yield models.UsePack.findAll({
		where: w,
		limit: limit,
		offset: start,
		include: [{
			model: models.Pack,
		}],
	})
	this.body = {
		data: contacts,
		total: total
	};
}));
//PackItem//////////////////////////////////////////////////////////////////////
app.use(route.delete('/rest/PackItem/:contact_id', function*(contact_id) {
	var contact = yield models.PackItem.findById(contact_id); //.then(function(packitem) {
	contact.destroy();
	this.body = {
		data: [],
		message: "delete PackItem ok"
	};
})); //delete
app.use(route.post('/rest/PackItem', function*() {
	var contact = yield models.PackItem.create(this.request.body)
	var pack = yield contact.getItem();
	contact.dataValues["Item"] = pack;
	this.body = {
		data: contact,
		message: "create UsePack ok"
	};
}));
app.use(route.put('/rest/PackItem/:id', function*(id) {
	//console.log(req.body);
	var packitem = yield models.PackItem.findById(id, {
		include: [{
			model: models.Item,
		}],
	}); //.then(function(packitem) {
	console.log("==============================");
	console.log(packitem);
	packitem.update(this.request.body);
	packitem.Item.save();
	packitem.save();
	console.log(packitem);
	this.body = {
		data: packitem,
		message: "update packitem ok"
	};
})); //update
// app.use(route.put('/rest/PackItem/:id', function*(id) {
// 	var contact = yield models.PackItem.findById(id); //.then(function(packitem) {
// 	contact.update(this.request.body);
// 	contact.save();
// 	this.body = {
// 		data: contact,
// 		message: "update  PackItem ok"
// 	};
// }));
app.use(route.get('/rest/PackItem', function*() {
	var start = this.request.query.start;
	var limit = this.request.query.limit;
	var search = this.request.query.search;
	var w = {
		pack_id: this.request.query.pack_id
	};
	var datas = yield models.PackItem.findAll({
		attributes: [
			[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
		],
		where: w
	})
	var total = datas[0].dataValues.total;
	console.log("total=" + total);
	var contacts = yield models.PackItem.findAll({
		where: w,
		limit: limit,
		offset: start,
		include: [{
			model: models.Item,
		}],
	})
	this.body = {
		data: contacts,
		total: total
	};
}));
//Pack
app.use(route.post('/rest/Pack', function*() {
	var data = yield models.Pack.create(this.request.body);
	this.body = {
		data: data,
		message: "create pack ok"
	};
}));
app.use(route.get('/rest/Pack', function*() {
	console.log(this.request.query);
	var start = this.request.query.start;
	var limit = this.request.query.limit;
	var search = this.request.query.search;
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
	var datas = yield models.Pack.findAll({
		attributes: [
			[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
		],
		where: w
	});
	var total = datas[0].dataValues.total;
	console.log("total=" + total);
	var contacts = yield models.Pack.findAll({
		where: w,
		limit: limit,
		offset: start
	});
	if (contacts.length > 0) {
		this.body = {
			data: contacts,
			total: total
		};
	} else {
		this.body = {
			data: contacts,
			total: 0
		};
	}
}));
//Item
app.use(route.post('/rest/Item', function*() {
	var data = yield models.Item.create(this.request.body);
	this.body = {
		data: data,
		message: "create item ok"
	};
}));
app.use(route.get('/rest/Item', function*() {
	console.log(this.request.query);
	var start = this.request.query.start;
	var limit = this.request.query.limit;
	var search = this.request.query.search;
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
	var datas = yield models.Item.findAll({
		attributes: [
			[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
		],
		where: w
	});
	var total = datas[0].dataValues.total;
	console.log("total=" + total);
	var contacts = yield models.Item.findAll({
		where: w,
		limit: limit,
		offset: start
	});
	if (contacts.length > 0) {
		this.body = {
			data: contacts,
			total: total
		};
	} else {
		this.body = {
			data: contacts,
			total: 0
		};
	}
}));
module.exports = app;