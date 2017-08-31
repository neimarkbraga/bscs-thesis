var bcrypt          =   require('bcrypt-nodejs');
var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;
var Barangay        =   require('./barangay');
var UserType        =   require('./userType');

var User = sequelize.define('User', {
    username: {field: 'USERNAME', type: DataTypes.STRING, primaryKey: true, allowNull: false, defaultValue: ''},
    password: {field: 'PASSWORD', type: DataTypes.STRING, allowNull: false, defaultValue: ''},
    type: {field: 'TYPE', type: DataTypes.STRING, allowNull: false, references:{model: UserType, key:'CODE'}},
    firstname: {field: 'FIRSTNAME', type: DataTypes.STRING, allowNull: false, defaultValue: ''},
    middlename: {field: 'MIDDLENAME', type: DataTypes.STRING, allowNull: false, defaultValue: ''},
    lastname: {field: 'LASTNAME', type: DataTypes.STRING, allowNull: false, defaultValue: ''},
    barangay: {field: 'BARANGAY', type: DataTypes.INTEGER, allowNull: true, defaultValue: null, references:{model: Barangay, key:'ID'}},
    enabled: {field: 'ENABLED', type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true}
},{
    freezeTableName: true,
    tableName: 'user'
});

User.prototype.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

User.hook('beforeCreate', function (user) {
    user.password = bcrypt.hashSync(user.password);
});
module.exports = User;