var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;

var DisasterDeclare     =   require('./disasterDeclare');
var EvacuationCenter    =   require('./evacuationCenter');
var User                =   require('./user');

var evacuationReport = sequelize.define('EvacuationReport', {
    id: {field: 'ID', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    evacId: {field: 'EVACID', type: DataTypes.INTEGER, allowNull: false, references:{model: EvacuationCenter, key:'ID'}},
    declareId: {field: 'DECLAREID', type: DataTypes.INTEGER, allowNull: false, references:{model: DisasterDeclare, key:'ID'}},
    postBy: {field: 'POSTBY', type: DataTypes.STRING, allowNull: false, references:{model: User, key:'USERNAME'}},
    dateTime: {field: 'DATEADDED', type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
    srvFamilies: {field: 'SRVFAMILIES', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    srvPersons: {field: 'SRVPERSONS', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    isVerified: {field: 'isVERIFIED', type: DataTypes.INTEGER(1), allowNull: false, defaultValue: 0}
},{
    freezeTableName: true,
    tableName: 'evacuation_report'
});
module.exports = evacuationReport;