var dbSequelize     =   require('../modules/dbSequelize');
var sequelize       =   dbSequelize.sequelize;
var Sequelize       =   dbSequelize.Sequelize;
var DataTypes       =   Sequelize.DataTypes;

var DisasterDeclare    =   require('./disasterDeclare');
var User            =   require('./user');

var newsFeed = sequelize.define('NewsFeed', {
    ID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    DECLAREID: {type: DataTypes.INTEGER, allowNull: false, references:{model: DisasterDeclare, key:'ID'}},
    POSTBY: {type: DataTypes.STRING, allowNull: false, references:{model: User, key:'USERNAME'}},
    CONTENT: {type: DataTypes.STRING, allowNull: false},
    DATETIME: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW}
},{
    freezeTableName: true,
    tableName: 'news_feed'
});
module.exports = newsFeed;