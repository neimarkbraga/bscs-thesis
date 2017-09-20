var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;
var Barangay        =   require('./barangay');

var BarangayLatestInfo = sequelize.define('BarangayLatestInfo', {
    id: {field: 'ID', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    barangay: {field: 'BARANGAY', type: DataTypes.INTEGER, allowNull: false, references:{model: Barangay, key:'ID'}},
    men: {field: 'MEN', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    women: {field: 'WOMEN', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    pwd: {field: 'PWD', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    minors: {field: 'MINORS', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}, //below 18
    children: {field: 'CHILDREN', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}, //0–12
    teenagers: {field: 'TEENAGERS', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}, //13-18
    youngAdults: {field: 'YOUNG_ADULTS', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}, //18-25
    adults: {field: 'ADULTS', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}, //25-40
    middleAge: {field: 'MIDDLE_AGE', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}, //40-60
    oldAge: {field: 'OLD_AGE', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}, //60+
    concreteHouses: {field: 'CONCRETE_HOUSES', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    lightMaterialHouses: {field: 'LIGHT_MATERIAL_HOUSES', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    combinedMaterialHouses: {field: 'LIGHT_AND_CONCRETE_MATERIAL_HOUSES', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    area: {field: 'AREA', type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    isFloodProne: {field: 'isFLOOD_PRONE', type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
},{
    freezeTableName: true,
    tableName: 'v_latest_barangay_info'
});
module.exports = BarangayLatestInfo;