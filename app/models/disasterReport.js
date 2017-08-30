var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;

var DisasterDeclare    =   require('./disasterDeclare');
var User            =   require('./user');

var disasterReport = sequelize.define('DisasterReport', {
    id: {field: 'ID', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    declareId: {field: 'DECLAREID', type: DataTypes.INTEGER, allowNull: false, references:{model: DisasterDeclare, key:'ID'}},
    postBy: {field: 'POSTBY', type: DataTypes.STRING, allowNull: false, references:{model: User, key:'USERNAME'}},
    dateTime: {field: 'DATETIME', type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
    totallyDamaged: {field: 'DMG_TOTALLY', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    partiallyDamaged: {field: 'DMG_PARTIALLY', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    dead: {field: 'CSLT_DEAD', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    injured: {field: 'CSLT_INJURED', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    missing: {field: 'CSLT_MISSING', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    isVerified: {field: 'isVERIFIED', type: DataTypes.INTEGER(1), allowNull: false, defaultValue: 0}
},{
    freezeTableName: true,
    tableName: 'disaster_report'
});
module.exports = disasterReport;