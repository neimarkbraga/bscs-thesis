var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;

var DisasterGroupProfile = require('./disasterType');
var DisasterDeclare = require('./disasterDeclare');
var disasterGroupMember = sequelize.define('DisasterGroupMember', {
    id: {field: 'ID', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    profileId: {field: 'PROFILEID', type: DataTypes.INTEGER, allowNull: false, references:{model: DisasterGroupProfile, key:'ID'}},
    declareId: {field: 'DECLAREID', type: DataTypes.INTEGER, allowNull: false, references:{model: DisasterDeclare, key:'ID'}}
},{
    freezeTableName: true,
    tableName: 'disaster_group_member'
});
module.exports = disasterGroupMember;