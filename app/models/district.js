var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;
var City            =   require('./city');

var District = sequelize.define('District', {
    ID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    NAME: {type: DataTypes.STRING, allowNull: false},
    CITY: {type: DataTypes.INTEGER, allowNull: false, references:{model: City, key:'ID'}}
},{
    freezeTableName: true,
    tableName: 'district'
});
module.exports = District;