var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;

var DisasterType    =   require('./disasterType');

var disasterForecastFactor = sequelize.define('DisasterForecastFactor', {
    id: {field: 'ID', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    disasterType: {field: 'DISASTER', type: DataTypes.INTEGER, allowNull: false, references:{model: DisasterType, key:'ID'}},
    name: {field: 'NAME', type: DataTypes.STRING, allowNull: false},
    unit: {field: 'UNIT', type: DataTypes.STRING, allowNull: false}
},{
    freezeTableName: true,
    tableName: 'disaster_forecast_factor'
});
module.exports = disasterForecastFactor;