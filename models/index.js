'use strict';
var fs = require('fs');
var path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
var db_path = path.join(__dirname, '..', 'data.sqlite');
config.storage = db_path;
var sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
class models {
  static sequelize = sequelize;
  static Sequelize = Sequelize;
  static get_Contact = async function(data, callback) {
    var start = data.start;
    var limit = data.limit;
    let search = '',
      filter_danwei = '';
    if (data.filter_danwei) {
      filter_danwei = data.filter_danwei;
    }
    if (data.search) search = data.search;
    var baoxiang = '';
    if (data.baoxiang) {
      baoxiang = data.baoxiang;
    }
    var w = {};
    if (data.yiqibh && data.yiqibh != '') {
      w.yiqibh = {
        [Sequelize.Op.like]: '%' + data.yiqibh + '%',
      };
    }
    if (search != '') {
      w.hetongbh = {
        [Sequelize.Op.like]: '%' + search + '%',
      };
    }
    if (filter_danwei != '') {
      w.yonghu = {
        [Sequelize.Op.like]: '%' + filter_danwei + '%',
      };
    }
    if (baoxiang != '') {
      w.baoxiang = {
        [Sequelize.Op.like]: '%' + baoxiang + '%',
      };
    }
    console.log(w);
    var result= await models.Contact.findAndCountAll({
      where: w,
      offset: start,
      limit: limit,
      order: [['yujifahuo_date', 'DESC']],
    });
    console.log(result);
    var total = result.count;
    var contacts = result.rows;
    callback({
      data: contacts,
      total: total,
    });
  };
}
const Contact = sequelize.define("Contact", {
     yonghu :DataTypes.STRING,// models.CharField(max_length=30,verbose_name="用户单位")#用户单位
     addr:DataTypes.STRING,// = models.CharField(max_length=30,verbose_name="客户地址",null=True,blank=True)#用户单位
     channels:DataTypes.STRING,// = models.CharField(max_length=30,verbose_name="通道配置",null=True,blank=True)#用户单位
     yiqixinghao:DataTypes.STRING,//=models.CharField(max_length=30,verbose_name="仪器型号",choices=ACHOICE)#仪器型号
     yiqibh:DataTypes.STRING,//=models.CharField(max_length=30,verbose_name="仪器编号")#仪器编号
     baoxiang:DataTypes.STRING,// =  models.CharField(max_length=30,verbose_name="包箱")#包箱
     shenhe:DataTypes.STRING,// =  models.CharField(max_length=30,verbose_name="审核")#审核
     yujifahuo_date:DataTypes.DATEONLY,// = models.DateTimeField(verbose_name="预计发货时间")#预计发货时间
     hetongbh:DataTypes.STRING,//=models.CharField(max_length=30,verbose_name="合同编号")#合同编号
     tiaoshi_date:DataTypes.DATEONLY,
    // email: DataTypes.STRING,
    // is_staff: DataTypes.BOOLEAN,
    // is_active: DataTypes.BOOLEAN,
    // date_joined: DataTypes.DATE
  }, {
    underscored: true,
    timestamps: false,
    tableName: 'parts_contact'
  });
models["Contact"] = Contact;
var Item = sequelize.define("Item", {
    // bh = models.CharField(max_length=30,null=True,blank=True,verbose_name="库存编号")#库存编号
    // name=models.CharField(max_length=30,verbose_name="备件名称")#备件名称
    // name_en=models.CharField(max_length=30,null=True,blank=True,verbose_name="备件英文名称")#备件名称
    // guige=models.CharField(max_length=30,null=True,blank=True,verbose_name="规格")#规格
    // ct=  models.IntegerField(default=1,verbose_name="数量")#数量
    // danwei =  models.CharField(max_length=30,verbose_name="单位",default="个")#数量单位
    // image=models.ImageField(null=True,blank=True,upload_to="item")
    // beizhu = models.CharField(max_length=30,verbose_name="备注",blank=True,null=True)
     bh:DataTypes.STRING,// models.CharField(max_length=30,verbose_name="用户单位")#用户单位
     name:DataTypes.STRING,// = models.CharField(max_length=30,verbose_name="客户地址",null=True,blank=True)#用户单位
     guige:DataTypes.STRING,// = models.CharField(max_length=30,verbose_name="通道配置",null=True,blank=True)#用户单位
     ct:DataTypes.INTEGER,//=models.CharField(max_length=30,verbose_name="仪器型号",choices=ACHOICE)#仪器型号
     danwei:DataTypes.STRING,//=models.CharField(max_length=30,verbose_name="仪器编号")#仪器编号
     beizhu:DataTypes.STRING,// =  models.CharField(max_length=30,verbose_name="包箱")#包箱
     image:DataTypes.STRING
  }, {
    timestamps: false,
    tableName: 'parts_item'
  });
models["Item"] = Item;
var Pack = sequelize.define("Pack", {
     name:DataTypes.STRING,// models.CharField(max_length=30,verbose_name="用户单位")#用户单位
  }, {
    timestamps: false,
    tableName: 'parts_pack'
  });
models["Pack"] = Pack;
var PackItem = sequelize.define("PackItem", {
     pack_id:DataTypes.INTEGER,// models.CharField(max_length=30,verbose_name="用户单位")#用户单位
     item_id:DataTypes.INTEGER,
     ct:DataTypes.INTEGER,
     quehuo:DataTypes.BOOLEAN,
  }, {
    timestamps: false,
    tableName: 'parts_packitem'
  });
      PackItem.associate=function(models) {
        PackItem.belongsTo(models.Item,{
          foreignKey:"item_id"
        })
        PackItem.belongsTo(models.Pack,{
          foreignKey:"item_id"
        })
      }
models["PackItem"] = PackItem;
var UsePack = sequelize.define("UsePack", {
     //name:DataTypes.STRING,// models.CharField(max_length=30,verbose_name="用户单位")#用户单位
     pack_id:DataTypes.INTEGER,// models.CharField(max_length=30,verbose_name="用户单位")#用户单位
     contact_id:DataTypes.INTEGER,
  }, {
    timestamps: false,
    tableName: 'parts_usepack'
  });
  UsePack.associate = function (models) {
      UsePack.belongsTo(models.Pack,{
            foreignKey:"pack_id"
      })
      UsePack.belongsTo(models.Contact,{
            foreignKey:"pack_id"
      })
  };
models["UsePack"] =UsePack;
Object.keys(models).forEach(function(modelName) {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models);
  }
});
module.exports=models;