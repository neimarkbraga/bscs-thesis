var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;

var DisasterType = require('./disasterType');
var disasterGroupProfile = sequelize.define('DisasterGroupProfile', {
    id: {field: 'ID', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    disaster: {field: 'DISASTER', type: DataTypes.INTEGER, allowNull: false, references:{model: DisasterType, key:'ID'}},
    name: {field: 'NAME', type: DataTypes.STRING, allowNull: false},
    dateStart: {field: 'DATE_START', type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW}
},{
    freezeTableName: true,
    tableName: 'disaster_group_profile'
});
module.exports = disasterGroupProfile;