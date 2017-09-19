var promiseToCallback   =   require('promise-to-callback');
var async               =   require('async');
var express             =   require('express');
var router              =   express.Router();
var userPassport        =   require('../modules/userPassport');
var db                  =   require('../models');

//===============================================
//      TABLE OF CONTENTS
//===============================================
/*

    1. User
        -me
        -register
        -authenticate
    2. Places
*/





//===============================================
//  1. User
//===============================================

router.post('/user/register', function (req, res) {
    async.waterfall([

        //check session & fields
        function (callback) {
            if(!req.session.username) callback('Unauthorized Access.');
            else if(!req.body.username) callback('username is required.');
            else if(!req.body.type) callback('type is required.');
            else if(!req.body.firstname) callback('firstname is required.');
            else if(!req.body.middlename) callback('middlename is required.');
            else if(!req.body.lastname) callback('lastname is required.');
            else if((req.body.type == 'BRGY') && !req.body.barangay) callback('barangay is required.');
            else callback();
        },

        //validate account
        function (callback) {
            userPassport.validateByUsername(req.session.username, function (err, user) {
                if(err) callback(err);
                else if(user.type != 'ADMIN') callback('You are unauthorized Access to execute this action.');
                else callback();
            });
        },

        //check if username exists
        function (callback) {
            promiseToCallback(db.models.User.findOne({
                where: {username: req.body.username}
            }))(function (err, user) {
                if(err) callback(err.message || 'Error connection with database.');
                else if(user) callback('Username already exist');
                else callback();
            });
        },


        function (callback) {
            //save details
            var user = new db.models.User();
             user.username = req.body.username;
             user.password = req.body.username;
             user.type = req.body.type;
             user.firstname = req.body.firstname;
             user.middlename = req.body.middlename;
             user.lastname = req.body.lastname;
             if(req.body.barangay) user.barangay = req.body.barangay;
             promiseToCallback(user.save())(function (err, user) {
                 if(err) callback(err.message || 'Error saving user details');
                 else callback(null, user);
             });
        }
    ], function (err) {
        if(err) res.json({error: [err]});
        else res.send({success: true, message: 'User registered.'});
    });
});
router.post('/user/authenticate', function (req, res) {
    async.waterfall([
        
        //check fields
        function (callback) {
            if(!req.body.username) callback('username is required.');
            else if(!req.body.password) callback('password is required.');
            else callback();
        },
        
        //get data
        function (callback) {
            promiseToCallback(db.models.User.findOne({
                where: {username: req.body.username}
            }))(function (err, user) {
                if(err) callback(err.message || 'Error retrieving data.');
                else callback(null, user);
            });
        },

        //check
        function (user, callback) {
            if(!user) callback('Username does not exist.');
            else if(!user.enabled) callback('Username was disabled.');
            else if(user.comparePassword(req.body.password)) callback(null, user);
            else callback('Wrong password.');
        }
        
    ], function (err, result) {
        if(err) res.send({success: false, message: err});
        else {
            var user = result.get({raw: true});
            delete user.password;
            delete user.enabled;
            delete user.createdAt;
            delete user.updatedAt;
            req.session.username = user.username;
            res.send({success: true, message: 'authenticated', user: user});
        }
    });
});
router.get('/user/me', function (req, res) {
    db.models.User.findAll({
        attributes: { exclude: ['password', 'enabled', 'type', 'barangay', 'createdAt', 'updatedAt']},
        where: {
            username: req.session.username,
            enabled: true
        },
        include: [
            { model: db.models.UserType, attributes: { exclude: ['createdAt', 'updatedAt']} },
            { model: db.models.Barangay, attributes: { exclude: ['createdAt', 'updatedAt']} }
        ]
    }).then(function (users) {
        if(users.length > 0) res.send(users[0]);
        else res.send({error: ['You are not logged in.']});
    }).catch(function (error) {
        res.send({error: ['An unknown error occurred']});
    });
});
router.get('/user/logout', function (req, res) {
    req.session.destroy();
    res.json({success: true});
});
router.get('/user/types', function (req, res) {
    db.models.UserType.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt']}
    }).then(function (userTypes) {
        res.json(userTypes);
    }).catch(function () {
        res.json({error: ['Cannot retrieve data.']});
    });
});
router.get('/user/list', function (req, res) {

    async.waterfall([
        //validate session
        function (callback) {
            if(!req.session.username) callback('Unauthorized Access.');
            else callback();
        },

        //validate account
        function (callback) {
            userPassport.validateByUsername(req.session.username, function (err, user) {
                if(err) callback(err);
                else if(user.type != 'ADMIN') callback('You are unauthorized Access to execute this action.');
                else callback();
            });
        },

        //retrieve data
        function (callback) {
            var query = {
                attributes: { exclude: ['password', 'enabled', 'createdAt', 'updatedAt', 'type', 'barangay']},
                include: [
                    { model: db.models.UserType, attributes: { exclude: ['createdAt', 'updatedAt']} },
                    {
                        model: db.models.Barangay,
                        attributes: { exclude: ['createdAt', 'updatedAt']},
                        include: [
                            {
                                model: db.models.District,
                                attributes: { exclude: ['createdAt', 'updatedAt']}
                            }
                        ]
                    }
                ]
            };
            if(req.query.q) {
                var value = req.query.q.replace(/ /g, '%');
                value = '%'+value+'%';
                query.where = {
                    $or: [
                        {username: {$like: value}},
                        {firstname: {$like: value}},
                        {middlename: {$like: value}},
                        {lastname: {$like: value}}
                    ]
                }
            }

            if(req.query.p){
                var count = 10;
                query.offset = (parseInt(req.query.p) - 1) * count;
                query.limit = count;
            }

            promiseToCallback(db.models.User.findAll(query))(function (err, results) {
                if(err) callback(err.message || 'Error retrieving data');
                else callback(null, results);
            });
        }
    ], function (err, data) {
        if(err) res.send({error: [err]});
        else res.send(data);
    })
});
router.put('/user/change-password', function (req, res) {
    async.waterfall([

        //check fields
        function (callback) {
            if(!req.session.username) callback('Unauthorized Access.');
            else if(!req.body.old_password) callback('old_password is required.');
            else if(!req.body.new_password) callback('new_password is required.');
            else if(req.body.new_password.length < 6) callback('new_password password must be at least 6 characters.');
            else callback();
        },

        //validate account
        function (callback) {
            userPassport.validateByUsername(req.session.username, function (err, user) {
                if(err) callback(err);
                else if(!user.comparePassword(req.body.old_password)) callback ('Wrong old password.');
                else callback(null, user);
            });
        },

        //save password
        function (user, callback) {
            user.password = user.bcryptPassword(req.body.new_password);
            promiseToCallback(user.save())(function (err, user) {
                if(err) callback(err.message || 'Error updating password');
                else callback();
            });
        }
    ], function (err) {
        if(err) res.send({success: false, message: err});
        else res.send({success: true, message: 'Password updated.'});
    });
});

//to be coded
router.put('/user/reset-password/:username', function (req, res) {
    async.waterfall([

        //check fields
        function (callback) {
            if(!req.session.username) callback('Unauthorized Access.');
            else if(!req.body.old_password) callback('old_password is required.');
            else if(!req.body.new_password) callback('new_password is required.');
            else if(req.body.new_password.length < 6) callback('new_password password must be at least 6 characters.');
            else callback();
        },

        //validate account
        function (callback) {
            userPassport.validateByUsername(req.session.username, function (err, user) {
                if(err) callback(err);
                else if(!user.comparePassword(req.body.old_password)) callback ('Wrong old password.');
                else callback(null, user);
            });
        },

        //save password
        function (user, callback) {
            user.password = user.bcryptPassword(req.body.new_password);
            promiseToCallback(user.save())(function (err, user) {
                if(err) callback(err.message || 'Error updating password');
                else callback();
            });
        }
    ], function (err) {
        if(err) res.send({success: false, message: err});
        else res.send({success: true, message: 'Password updated.'});
    });
});
router.delete('/user/delete/:username', function () {

});


//===============================================
//  2. Places
//===============================================


router.post('/places/new', function (req, res) {
    async.waterfall([
        function (callback) {
            if(!req.session.username) callback('Unauthorized Access.');
            else if(!req.body.barangay_name) callback('barangay_name is required.');
            else if(!req.body.district_id) callback('district_id is required.');
            else if(!req.body.path) callback('path is required.');
            else if(req.body.is_coastal == undefined) callback('is_coastal is required.');
            else if(!req.body.district_name && (req.body.district_id < 0)) callback('district_name is required.');
            else callback();
        },

        //validate account
        function (callback) {
            userPassport.validateByUsername(req.session.username, function (err, user) {
                if(err) callback(err);
                else if(user.type != 'ADMIN') callback('You are unauthorized Access to execute this action.');
                else callback();
            });
        },

        //create district
        function (callback) {
            if(req.body.district_id < 0){
                var district = new db.models.District();
                district.name = req.body.district_name;
                district.city = 1;
                promiseToCallback(district.save())(function (err, district) {
                    if(err) callback(err.message || 'Error saving district name.');
                    else callback(null, district);
                });
            } else callback(null, null);
        },

        //create barangay
        function (district, callback) {
            var barangay = new db.models.Barangay();
            barangay.name = req.body.barangay_name;
            barangay.district = (district)? district.id:req.body.district_id;
            barangay.isCoastal = req.body.is_coastal;
            promiseToCallback(barangay.save())(function (err, barangay) {
                if(err) callback(err.message || 'Error saving barangay.');
                else callback(null, barangay);
            });
        },

        //save path
        function (barangay, callback) {
            if(req.body.path.length > 0){
                var saveLatLng = function (index) {
                    var barangayPath = new db.models.BarangayPath();
                    barangayPath.barangay = barangay.id;
                    barangayPath.lat = req.body.path[index].lat;
                    barangayPath.lng = req.body.path[index].lng;
                    promiseToCallback(barangayPath.save())(function (err) {
                        if(err) callback(err.message || 'Error saving barangay path.');
                        else if((index+1) < req.body.path.length) saveLatLng((index+1));
                        else callback(null, barangay);
                    });
                };
                saveLatLng(0);
            } else callback(null, barangay);
        }

    ], function (err) {
        if(err) res.send({success: false, message: err});
        else res.send({success: true, message: 'Place added.'});
    });
});
router.post('/places/new-district', function (req, res) {
    async.waterfall([
        function (callback) {
            if(!req.session.username) callback('Unauthorized Access.');
            else if(!req.body.district_name) callback('district_name is required.');
            else callback();
        },

        //validate account
        function (callback) {
            userPassport.validateByUsername(req.session.username, function (err, user) {
                if(err) callback(err);
                else if(user.type != 'ADMIN') callback('You are unauthorized Access to execute this action.');
                else callback();
            });
        },

        //create district
        function (callback) {
            var district = new db.models.District();
            district.name = req.body.district_name;
            district.city = 1;
            promiseToCallback(district.save())(function (err, district) {
                if(err) callback(err.message || 'Error saving district name.');
                else callback(null, district);
            });
        }

    ], function (err) {
        if(err) res.send({success: false, message: err});
        else res.send({success: true, message: 'District name added.'});
    });
});
router.get('/places/names-with-info', function (req, res) {
    var query = 'SELECT * ' +
        'FROM v_place_names ' +
        'LEFT JOIN v_latest_barangay_info ' +
        'ON v_place_names.BARANGAY_ID = v_latest_barangay_info.BARANGAY';
    var limit = undefined;
    var keyword = undefined;
    if(req.query.p){
        var count = 10;
        var page = parseInt(req.query.p) - 1;
        limit = ' LIMIT ' + (count * page) + ', ' + count;
    }
    if(req.query.q) {
        var value = req.query.q.replace(/ /g, '%');
        keyword = ' WHERE v_place_names.DISTRICT_NAME LIKE "%' + value + '%"' +
            'OR v_place_names.CITY_NAME LIKE "%' + value + '%"' +
            'OR v_place_names.BARANGAY_NAME LIKE "%' + value + '%"';
    }
    if(keyword) query += keyword;
    if(limit) query += limit;
    db.sequelize.query(query).then(function (result) {
        res.send({success: true, data: result[0]});
    }).catch(function (err) {
        res.send({success: false, message: err.message || 'Cannot retrieve data from database'});
    });
});
router.get('/places/barangays', function (req, res) {
    db.models.Barangay.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt', 'district']},
        include: [
            {
                model: db.models.District,
                attributes: { exclude: ['createdAt', 'updatedAt', 'city']},
                include: [
                    {
                        model: db.models.City,
                        attributes: { exclude: ['createdAt', 'updatedAt']}
                    }
                ]
            }
        ]
    }).then(function (barangays) {
        res.json(barangays);
    }).catch(function (error) {
        console.log(error);
        res.json({error: ['Cannot retrieve barangays']});
    });
});
router.get('/places/districts', function (req, res) {
    db.models.District.findAll()
        .then(function (result) {
            res.json({success: true, data: result});
        }).catch(function (err) {
        res.json({success: false, message: err.message || 'Unable to retrieve data.'});
    })
});
router.get('/places/path/:id', function (req, res) {
    db.models.BarangayPath.findAll({
        where: {barangay: req.params.id}
    })
        .then(function (result) {
            res.json({success: true, data: result});
        }).catch(function (err) {
        res.json({success: false, message: err.message || 'Unable to retrieve data.'});
    })
});
router.put('/places/update/:id', function (req, res) {
    async.waterfall([
        function (callback) {
            if(!req.session.username) callback('Unauthorized Access.');
            else if(!(req.body.barangay_name || req.body.district_id || req.body.path || (req.body.is_coastal != undefined))) callback('barangay_name or district_id or path or is_coastal are required.');
            else if(req.body.district_id && !req.body.district_name && (req.body.district_id < 0)) callback('district_name is required.');
            else callback();
        },

        //validate account
        function (callback) {
            userPassport.validateByUsername(req.session.username, function (err, user) {
                if(err) callback(err);
                else if(user.type != 'ADMIN') callback('You are unauthorized Access to execute this action.');
                else callback();
            });
        },

        //create district
        function (callback) {
            if(req.body.district_id && (req.body.district_id < 0)){
                var district = new db.models.District();
                district.name = req.body.district_name;
                district.city = 1;
                promiseToCallback(district.save())(function (err, district) {
                    if(err) callback(err.message || 'Error saving district name.');
                    else callback(null, district);
                });
            } else callback(null, null);
        },

        //retrieve barangay
        function (district, callback) {
            promiseToCallback(db.models.Barangay.findById(req.params.id))(function (err, barangay) {
                if(err) callback(err.message || 'Error retrieving data.');
                else if(!barangay) callback('ID doesn\'t exist.');
                else callback(null, district, barangay);
            });
        },

        //update barangay
        function (district, barangay, callback) {
            barangay.name = req.body.barangay_name || barangay.name;
            barangay.district = (district)? district.id:(req.body.district_id || barangay.district);
            barangay.isCoastal = (req.body.is_coastal == undefined)? barangay.isCoastal:req.body.is_coastal;
            promiseToCallback(barangay.save())(function (err, barangay) {
                if(err) callback(err.message || 'Error updating barangay.');
                else callback(null, barangay);
            });
        },

        //delete old path
        function (barangay, callback) {
            if(req.body.path){
                promiseToCallback(db.models.BarangayPath.destroy({
                    where: {barangay: barangay.id}
                }))(function (err) {
                    if(err) callback(err.message || 'Error updating path.');
                    else callback(null, barangay);
                });
            } else callback(null, barangay);
        },

        //save new path
        function (barangay, callback) {
            if(req.body.path && (req.body.path.length > 0)){
                var saveLatLng = function (index) {
                    var barangayPath = new db.models.BarangayPath();
                    barangayPath.barangay = barangay.id;
                    barangayPath.lat = req.body.path[index].lat;
                    barangayPath.lng = req.body.path[index].lng;
                    promiseToCallback(barangayPath.save())(function (err) {
                        if(err) callback(err.message || 'Error saving barangay path.');
                        else if((index+1) < req.body.path.length) saveLatLng((index+1));
                        else callback(null, barangay);
                    });
                };
                saveLatLng(0);
            } else callback(null, barangay);
        }
    ], function (err) {
        if(err) res.send({success: false, message: err});
        else res.send({success: true, message: 'Place added.'});
    });
});
router.put('/places/update-district/:id', function (req, res) {
    async.waterfall([
        function (callback) {
            if(!req.session.username) callback('Unauthorized Access.');
            else if(!req.body.district_name) callback('district_name is required.');
            else callback();
        },

        //validate account
        function (callback) {
            userPassport.validateByUsername(req.session.username, function (err, user) {
                if(err) callback(err);
                else if(user.type != 'ADMIN') callback('You are unauthorized Access to execute this action.');
                else callback();
            });
        },

        //get district
        function (callback) {
            promiseToCallback(db.models.District.findById(req.params.id))(function (err, district) {
                if(err) callback(err.message || 'Error retrieving');
                else if (!district) callback('District doesn\'t exist');
                else callback(null, district);
            });
        },

        //save district
        function (district, callback) {
            district.name = req.body.district_name;
            promiseToCallback(district.save())(function (err, district) {
                if(err) callback(err.message || 'Error saving district name.');
                else callback(null, district);
            });
        }
    ], function (err) {
        if(err) res.send({success: false, message: err});
        else res.send({success: true, message: 'District name updated.'});
    });
});
router.delete('/places/delete/:id', function (req, res) {
    async.waterfall([

        //validate session
        function (callback) {
            if(!req.session.username) callback('Unauthorized Access.');
            else callback();
        },

        //validate account
        function (callback) {
            userPassport.validateByUsername(req.session.username, function (err, user) {
                if(err) callback(err);
                else if(user.type != 'ADMIN') callback('You are unauthorized Access to execute this action.');
                else callback();
            });
        },

        //delete path
        function (callback) {
            promiseToCallback(db.models.BarangayPath.destroy({
                where: {barangay: req.params.id}
            }))(function (err) {
                if(err) callback(err.message || 'Error deleting paths path.');
                else callback();
            });
        },

        //delete barangay
        function (callback) {
            promiseToCallback(db.models.Barangay.destroy({
                where: {id: req.params.id}
            }))(function (err) {
                if(err) callback(err.message || 'Error deleting barangay.');
                else callback();
            });
        }

    ], function (err) {
        if(err) res.send({success: false, message: err});
        else res.send({success: true, message: 'Place deleted.'});
    });
});
router.delete('/places/delete-district/:id', function (req, res) {
    async.waterfall([

        //validate session
        function (callback) {
            if(!req.session.username) callback('Unauthorized Access.');
            else callback();
        },

        //validate account
        function (callback) {
            userPassport.validateByUsername(req.session.username, function (err, user) {
                if(err) callback(err);
                else if(user.type != 'ADMIN') callback('You are unauthorized Access to execute this action.');
                else callback();
            });
        },

        //delete district
        function (callback) {
            promiseToCallback(db.models.District.destroy({
                where: {id: req.params.id}
            }))(function (err) {
                if(err) callback(err.message || 'Error deleting district');
                else callback();
            });
        }

    ], function (err) {
        if(err) res.send({success: false, message: err});
        else res.send({success: true, message: 'District deleted.'});
    });
});





module.exports = router;