var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;
var Barangay         =   require('./barangay');

var evacuationCenter = sequelize.define('EvacuationCenter', {
    ID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    BARANGAY: {type: DataTypes.INTEGER, allowNull: false, references:{model: Barangay, key:'ID'}},
    NAME: {type: DataTypes.STRING, allowNull: false, field: 'EVACNAME'},
    DEFINED_ADDRESS: {type: DataTypes.STRING, allowNull: false, field: 'EVACADDRESS1'},
    GOOGLE_MAP_ADDRESS: {type: DataTypes.STRING, allowNull: false, field: 'EVACADDRESS2'},
    LAT: {type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    LNG: {type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    CAPACITY: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}
},{
    freezeTableName: true,
    tableName: 'evacuation_list'
});
module.exports = evacuationCenter;