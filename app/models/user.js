var bcrypt          =   require('bcrypt-nodejs');
var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;
var Barangay        =   require('./barangay');

const SALT_WORK_FACTOR = 12;
var User = sequelize.define('User', {
    USERNAME: {type: DataTypes.STRING, primaryKey: true, allowNull: false, defaultValue: ''},
    PASSWORD: {type: DataTypes.STRING, allowNull: false, defaultValue: ''},
    TYPE: {type: DataTypes.STRING, allowNull: false, defaultValue: ''},
    FIRSTNAME: {type: DataTypes.STRING, allowNull: false, defaultValue: ''},
    MIDDLENAME: {type: DataTypes.STRING, allowNull: false, defaultValue: ''},
    LASTNAME: {type: DataTypes.STRING, allowNull: false, defaultValue: ''},
    BARANGAY: {type: DataTypes.INTEGER, allowNull: true, defaultValue: null, references:{model: Barangay, key:'ID'}},
    ENABLED: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true}
},{
    freezeTableName: true,
    tableName: 'user',
    classMethods: {
        validPassword: function (password, encryptedPassword, done, user) {
            bcrypt.compare(password, encryptedPassword, function (err, isMatch) {
                if(err) done(err);
                else if(isMatch) done(null, user);
                else done();
            });
        }
    }
});

User.hook('beforeCreate', function (user, fn) {
    var salt = bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        return salt;
    });
    bcrypt.hash(user.PASSWORD, salt, null, function (err, hash, next) {
        if(err) next(err);
        user.PASSWORD = hash;
        return fn(null, user);
    });
});

module.exports = User;