var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;
var Barangay         =   require('./barangay');

var evacuationCenter = sequelize.define('EvacuationCenter', {
    id: {field: 'ID', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    barangay: {field: 'BARANGAY', type: DataTypes.INTEGER, allowNull: false, references:{model: Barangay, key:'ID'}},
    name: {field: 'EVACNAME', type: DataTypes.STRING, allowNull: false},
    definedAddress: {field: 'EVACADDRESS1', type: DataTypes.STRING, allowNull: false},
    googleAddress: {field: 'EVACADDRESS2', type: DataTypes.STRING, allowNull: false},
    lat: {field: 'LAT', type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    lng: {field: 'LNG', type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    capacity: {field: 'CAPACITY', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}
},{
    freezeTableName: true,
    tableName: 'evacuation_list'
});
module.exports = evacuationCenter;