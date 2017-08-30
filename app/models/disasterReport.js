var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;

var DisasterDeclare    =   require('./disasterDeclare');
var Barangay        =   require('./barangay');
var User            =   require('./user');

var disasterReport = sequelize.define('DisasterReport', {
    ID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    DECLAREID: {type: DataTypes.INTEGER, allowNull: false, references:{model: DisasterDeclare, key:'ID'}},
    POSTBY: {type: DataTypes.STRING, allowNull: false, references:{model: User, key:'USERNAME'}},
    DATETIME: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
    DMG_TOTALLY: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    DMG_PARTIALLY: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    CSLT_DEAD: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    CSLT_INJURED: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    CSLT_MISSING: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    isVERIFIED: {type: DataTypes.INTEGER(1), allowNull: false, defaultValue: 0}
},{
    freezeTableName: true,
    tableName: 'disaster_report'
});
module.exports = disasterReport;