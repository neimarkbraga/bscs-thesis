var dbSequelize     =   require('../modules/dbSequelize');
var fse             =   require('fs-extra');
var lodash          =   require('lodash');
var path            =   require('path');

var models = {};
fse.readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf('.') !== 0) && (file !== 'index.js');
    })
    .forEach(function (file) {
        var model = require(path.join(__dirname, file));
        models[model.name] = model;
    });
module.exports = lodash.extend({models:models}, dbSequelize);