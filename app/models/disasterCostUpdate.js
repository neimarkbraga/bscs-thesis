var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;

var DisasterDeclare     =   require('./disasterDeclare');
var User                =   require('./user');

var disasterCostUpdate = sequelize.define('DisasterCostUpdate', {
    id: {field: 'ID', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    declareId: {field: 'DECLAREID', type: DataTypes.INTEGER, allowNull: false, references:{model: DisasterDeclare, key:'ID'}},
    postBy: {field: 'POSTBY', type: DataTypes.STRING, allowNull: false, references:{model: User, key:'USERNAME'}},
    dateTime: {field: 'DATETIME', type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
    dswd: {field: 'DSWD', type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    lgu: {field: 'LGU', type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    ngo: {field: 'NGO', type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    isVerified: {field: 'isVERIFIED', type: DataTypes.INTEGER(1), allowNull: false, defaultValue: 0}
},{
    freezeTableName: true,
    tableName: 'disaster_cost_update'
});
module.exports = disasterCostUpdate;