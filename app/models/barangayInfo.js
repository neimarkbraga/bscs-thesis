var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;
var Barangay        =   require('./barangay');

var barangayInfo = sequelize.define('BarangayInfo', {
    ID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    BARANGAY: {type: DataTypes.INTEGER, allowNull: false, references:{model: Barangay, key:'ID'}},
    MEN: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    WOMEN: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    MINORS: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    ADULTS: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    PWD: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    CONCRETE_HOUSES: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    LIGHT_MATERIAL_HOUSES: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    COMBINED_HOUSES: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    AREA: {type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    FLOOD_PRONE: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
},{
    freezeTableName: true,
    tableName: 'barangay_info'
});
module.exports = barangayInfo;