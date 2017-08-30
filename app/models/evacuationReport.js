var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;

var DisasterDeclare     =   require('./disasterDeclare');
var EvacuationCenter    =   require('./evacuationCenter');
var User                =   require('./user');

var evacuationReport = sequelize.define('EvacuationReport', {
    ID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    EVACID: {type: DataTypes.INTEGER, allowNull: false, references:{model: EvacuationCenter, key:'ID'}},
    DECLAREID: {type: DataTypes.INTEGER, allowNull: false, references:{model: DisasterDeclare, key:'ID'}},
    POSTBY: {type: DataTypes.STRING, allowNull: false, references:{model: User, key:'USERNAME'}},
    SRV_FAMILIES: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'SRVFAMILIES'},
    SRV_PERSONS: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'SRVPERSONS'},
    DATETIME: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'DATEADDED'},
    isVERIFIED: {type: DataTypes.INTEGER(1), allowNull: false, defaultValue: 0}
},{
    freezeTableName: true,
    tableName: 'evacuation_report'
});
module.exports = evacuationReport;