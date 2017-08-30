var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;
var District        =   require('./district');

var Barangay = sequelize.define('Barangay', {
    ID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    NAME: {type: DataTypes.STRING, allowNull: false},
    DISTRICT: {type: DataTypes.INTEGER, allowNull: false, references:{model: District, key:'ID'}},
    isCOASTAL: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
},{
    freezeTableName: true,
    tableName: 'barangay'
});
module.exports = Barangay;