"use strict";

module.exports = function(sequelize, DataTypes) {
  var Pack = sequelize.define("Pack", {
     name:DataTypes.STRING,// models.CharField(max_length=30,verbose_name="用户单位")#用户单位
  }, {
    classMethods: {
      associate: function(models) {
        Pack.hasMany(models.UsePack,{
              foreignKey: 'pack_id',
        });
        Pack.hasMany(models.PackItem,{
              foreignKey: 'pack_id',
        });
      }
    },
    timestamps: false,
    tableName: 'parts_pack'
  });

  return Pack;
};
