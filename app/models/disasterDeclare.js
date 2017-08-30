var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;

var DisasterType    =   require('./disasterType');
var Barangay        =   require('./barangay');
var User            =   require('./user');

var disasterDeclare = sequelize.define('DisasterDeclare', {
    ID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    DISASTER: {type: DataTypes.INTEGER, allowNull: false, references:{model: DisasterType, key:'ID'}},
    BARANGAY: {type: DataTypes.INTEGER, allowNull: false, field: 'BRGY', references:{model: Barangay, key:'ID'}},
    POSTBY: {type: DataTypes.STRING, allowNull: false, references:{model: User, key:'USERNAME'}},
    NICKNAME: {type: DataTypes.STRING, allowNull: false},
    COMMENT: {type: DataTypes.STRING, allowNull: false},
    LAT: {type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    LNG: {type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    STARTED: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
    ENDED: {type: DataTypes.DATE, allowNull: true},
    RADIUS: {type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    isVERIFIED: {type: DataTypes.INTEGER(1), allowNull: false, defaultValue: 0}
},{
    freezeTableName: true,
    tableName: 'disaster_declare'
});
module.exports = disasterDeclare;