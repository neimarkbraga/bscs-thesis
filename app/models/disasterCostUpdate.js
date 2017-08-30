var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;

var DisasterDeclare     =   require('./disasterDeclare');
var User                =   require('./user');

var disasterCostUpdate = sequelize.define('DisasterCostUpdate', {
    ID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    DECLAREID: {type: DataTypes.INTEGER, allowNull: false, references:{model: DisasterDeclare, key:'ID'}},
    POSTBY: {type: DataTypes.STRING, allowNull: false, references:{model: User, key:'USERNAME'}},
    DATETIME: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
    DSWD: {type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    LGU: {type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    NGO: {type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    isVERIFIED: {type: DataTypes.INTEGER(1), allowNull: false, defaultValue: 0}
},{
    freezeTableName: true,
    tableName: 'disaster_cost_update'
});
module.exports = disasterCostUpdate;