var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;
var Barangay        =   require('./barangay');

var barangayPath = sequelize.define('BarangayPath', {
    id: {field: 'ID', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    barangay: {field: 'BARANGAY', type: DataTypes.INTEGER, allowNull: false, references:{model: Barangay, key:'ID'}},
    lat: {field: 'LAT', type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0},
    lng: {field: 'LNG', type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0}
},{
    freezeTableName: true,
    tableName: 'barangay_path'
});
module.exports = barangayPath;