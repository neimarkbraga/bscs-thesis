var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;

var userType = sequelize.define('UserType', {
    code: {field: 'CODE', type: DataTypes.STRING, primaryKey: true, allowNull: false},
    name: {field: 'NAME', type: DataTypes.STRING, allowNull: false}
},{
    freezeTableName: true,
    tableName: 'user_type'
});


module.exports = userType;