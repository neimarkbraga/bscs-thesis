var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;


var disasterType = sequelize.define('DisasterType', {
    ID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    NAME: {type: DataTypes.STRING, allowNull: false},
    COLOR: {type: DataTypes.STRING, allowNull: false},
    ENABLED: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true}
},{
    freezeTableName: true,
    tableName: 'disaster_type'
});
module.exports = disasterType;