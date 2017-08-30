var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;
var Barangay        =   require('./barangay');

var barangayPath = sequelize.define('BarangayPath', {
    ID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    BARANGAY: {type: DataTypes.INTEGER, allowNull: false, references:{model: Barangay, key:'ID'}},
    LAT: {type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    LNG: {type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0}
},{
    freezeTableName: true,
    tableName: 'barangay_path'
});
module.exports = barangayPath;