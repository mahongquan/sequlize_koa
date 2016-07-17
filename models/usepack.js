"use strict";

module.exports = function(sequelize, DataTypes) {
  var UsePack = sequelize.define("UsePack", {
     //name:DataTypes.STRING,// models.CharField(max_length=30,verbose_name="用户单位")#用户单位
  }, {
    classMethods: {
      associate: function(models) {
        UsePack.belongsTo(models.Pack,{
          foreignKey:"pack_id"
        })
      }
    },
    timestamps: false,
    tableName: 'parts_usepack'
  });

  return UsePack;
};
