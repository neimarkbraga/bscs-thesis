var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;

var DisasterType    =   require('./disasterType');
var Barangay        =   require('./barangay');
var User            =   require('./user');

var disasterDeclare = sequelize.define('DisasterDeclare', {
    id: {field: 'ID', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    disasterType: {field: 'DISASTER', type: DataTypes.INTEGER, allowNull: false, references:{model: DisasterType, key:'ID'}},
    barangay: {field: 'BRGY', type: DataTypes.INTEGER, allowNull: false, references:{model: Barangay, key:'ID'}},
    postby: {field: 'POSTBY', type: DataTypes.STRING, allowNull: false, references:{model: User, key:'USERNAME'}},
    name: {field: 'NICKNAME', type: DataTypes.STRING, allowNull: false},
    comment: {field: 'COMMENT', type: DataTypes.STRING, allowNull: false},
    lat: {field: 'LAT', type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    lng: {field: 'LNG', type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    started: {field: 'STARTED', type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
    ended: {field: 'ENDED', type: DataTypes.DATE, allowNull: true},
    radius: {field: 'RADIUS', type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    isVerified: {field: 'isVERIFIED', type: DataTypes.INTEGER(1), allowNull: false, defaultValue: 0}
},{
    freezeTableName: true,
    tableName: 'disaster_declare'
});
module.exports = disasterDeclare;