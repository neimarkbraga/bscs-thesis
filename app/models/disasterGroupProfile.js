var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;

var DisasterType = require('./disasterType');
var disasterGroupProfile = sequelize.define('DisasterGroupProfile', {
    ID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    DISASTER: {type: DataTypes.INTEGER, allowNull: false, references:{model: DisasterType, key:'ID'}},
    NAME: {type: DataTypes.STRING, allowNull: false},
    DATE_START: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW}
},{
    freezeTableName: true,
    tableName: 'disaster_group_profile'
});
module.exports = disasterGroupProfile;