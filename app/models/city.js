var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;

var City = sequelize.define('City', {
    ID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    NAME: {type: DataTypes.STRING, allowNull: false}
},{
    freezeTableName: true,
    tableName: 'city'
});
module.exports = City;