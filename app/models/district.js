var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;
var City            =   require('./city');

var District = sequelize.define('District', {
    id: {field: 'ID', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    name: {field: 'NAME', type: DataTypes.STRING, allowNull: false},
    city: {field: 'CITY', type: DataTypes.INTEGER, allowNull: false, references:{model: City, key:'ID'}}
},{
    freezeTableName: true,
    tableName: 'district'
});

District.belongsTo(City, {
   foreignKey: 'city'
});
module.exports = District;