var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;

var DisasterDeclare    =   require('./disasterDeclare');
var User            =   require('./user');

var newsFeed = sequelize.define('NewsFeed', {
    id: {field: 'ID', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    declareId: {field: 'DECLAREID', type: DataTypes.INTEGER, allowNull: false, references:{model: DisasterDeclare, key:'ID'}},
    postBy: {field: 'POSTBY', type: DataTypes.STRING, allowNull: false, references:{model: User, key:'USERNAME'}},
    dateTime: {field: 'DATETIME', type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
    content: {field: 'CONTENT', type: DataTypes.STRING, allowNull: false}

},{
    freezeTableName: true,
    tableName: 'news_feed'
});
module.exports = newsFeed;