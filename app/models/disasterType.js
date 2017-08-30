var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;


var disasterType = sequelize.define('DisasterType', {
    id: {field: 'ID', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    name: {field: 'NAME', type: DataTypes.STRING, allowNull: false},
    color: {field: 'COLOR', type: DataTypes.STRING, allowNull: false},
    enabled: {field: 'ENABLED', type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true}
},{
    freezeTableName: true,
    tableName: 'disaster_type'
});
module.exports = disasterType;