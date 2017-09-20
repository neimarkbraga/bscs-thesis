var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;
var District        =   require('./district');
var BarangayPath    =   require('./barangayPath');

var Barangay = sequelize.define('Barangay', {
    id: {field: 'ID', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    name: {field: 'NAME',type: DataTypes.STRING, allowNull: false},
    district: {field: 'DISTRICT',type: DataTypes.INTEGER, allowNull: false, references:{model: District, key:'ID'}},
    isCoastal: {field: 'isCOASTAL',type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
},{
    freezeTableName: true,
    tableName: 'barangay'
});

Barangay.belongsTo(District, {
    foreignKey: 'district'
});
Barangay.hasMany(BarangayPath, {
    foreignKey: 'barangay'
});


module.exports = Barangay;