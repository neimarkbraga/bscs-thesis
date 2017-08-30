var sensitive       =   require('../settings/sensitive-settings.json');
var lodash          =   require('lodash');
var Sequelize       =   require('sequelize');
var sequelize = new Sequelize(sensitive.mySQL.database, sensitive.mySQL.username, sensitive.mySQL.password, {
    host: sensitive.mySQL.host,
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 30,
        min: 0,
        idle: 10000
    }
});

module.exports = {
    sequelize:sequelize,
    Sequelize:Sequelize
};