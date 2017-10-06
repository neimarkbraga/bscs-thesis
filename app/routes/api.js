var async               =   require('async');
var express             =   require('express');
var router              =   express.Router();
var db                  =   require('../modules/dbSequelize');
var acctTypes           =   require('../variables/accountTypes.json');


//  Author:     Neimark Junsay Braga
//  Date:       9/20/17
//  Details:    Converting my thesis into api
//===============================================
//      TABLE OF CONTENTS
//===============================================
/*
    1. User
    2. District
    3. Barangay
*/

//===============================================
//  1. User
//===============================================

router.post('/user', function (req, res) {
    async.waterfall([

        //check session & fields
        function (callback) {
            if(!res.locals.user || (res.locals.user.UserType.code != acctTypes.admin.code)) callback(['api:1x1', 'Unauthorized Access.']);
            else if(!req.body.username) callback(['api:1x2', 'username is required.']);
            else if(!req.body.type) callback(['api:1x3', 'type is required.']);
            else if(!req.body.firstname) callback(['api:1x4', 'firstname is required.']);
            else if(!req.body.middlename) callback(['api:1x5', 'middlename is required.']);
            else if(!req.body.lastname) callback(['api:1x6', 'lastname is required.']);
            else if((req.body.type == 'BRGY') && !req.body.barangay) callback(['api:1x7', 'barangay is required.']);
            else callback();
        },

        //check if username exists
        function (callback) {
            db.models.User.findById(req.body.username)
                .then(function (user) {
                    if(user) callback(['api:1x8', 'Username already exist']);
                    else callback();
                }).catch(function (err) {
                callback(['api:1x9', err.message || 'Cannot retrieve data.']);
            });
        },

        //save details
        function (callback) {
            var user = new db.models.User();
            user.username = req.body.username;
            user.password = req.body.username;
            user.type = req.body.type;
            user.firstname = req.body.firstname;
            user.middlename = req.body.middlename;
            user.lastname = req.body.lastname;
            if(req.body.barangay) user.barangay = req.body.barangay;
            user.save()
                .then(function () {
                    callback();
                }).catch(function (err) {
                callback(['api:1x10', err.message || 'Error saving user details']);
            });
        }
    ], function (err) {
        if(err) res.json({error: err});
        else res.send({success: true});
    });
});
router.post('/user/login', function (req, res) {
    async.waterfall([

        //check fields
        function (callback) {
            if(!req.body.username) callback(['api:1x11', 'username is required.']);
            else if(!req.body.password) callback(['api:1x12', 'password is required.']);
            else callback();
        },

        //get data
        function (callback) {
            db.models.User.findOne({where: {username: req.body.username}})
                .then(function (user) {
                    callback(null, user);
                })
                .catch(function (err) {
                    callback(['api:1x13', err.message || 'Cannot retrieve data.']);
                });
        },

        //check
        function (user, callback) {
            if(!user) callback(['api:1x14', 'Username does not exist.']);
            else if(!user.enabled) callback(['api:1x15', 'Username was disabled.']);
            else if(!user.comparePassword(req.body.password)) callback(['api:1x16', 'Wrong password.']);
            else callback(null, user);
        }

    ], function (err, user) {
        if(err) res.json({error: err});
        else {
            req.session.username = user.username;
            res.json({success: true, userType: user.type});
        }
    });
});
router.get('/user/me', function (req, res) {
    if(!res.locals.user) res.json({error: ['api:1x17', 'Not logged in.']});
    else res.json(res.locals.user);
});
router.get('/user/logout', function (req, res) {
    req.session.destroy(function (err) {
        if(err) res.json({error: ['api:1x18', err.message || 'Logout failed.']});
        else res.json({success: true});
    });
});
router.get('/user/types', function (req, res) {
    db.models.UserType.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt']}
    }).then(function (userTypes) {
        res.json(userTypes);
    }).catch(function () {
        res.json({error: ['api:1x19', 'Cannot retrieve data.']});
    });
});
router.get('/user', function (req, res) {

    async.waterfall([
        //validate session
        function (callback) {
            if(!res.locals.user) callback(['api:1x20', 'You are not logged in.']);
            else if(res.locals.user.UserType.code != acctTypes.admin.code) callback(['api:1x21?', 'Unauthorized Access.']);
            else callback();
        },

        //retrieve data
        function (callback) {
            var query = {
                attributes: { exclude: ['password', 'type', 'barangay', 'enabled', 'createdAt', 'updatedAt']},
                include: [
                    { model: db.models.UserType, attributes: { exclude: ['createdAt', 'updatedAt']} },
                    {
                        model: db.models.Barangay,
                        attributes: { exclude: ['district', 'createdAt', 'updatedAt']},
                        include: [
                            {
                                model: db.models.District,
                                attributes: { exclude: ['city', 'createdAt', 'updatedAt']},
                                include: [
                                    {
                                        model: db.models.City,
                                        attributes: { exclude: ['createdAt', 'updatedAt']}
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            var keyword = req.query.keyword;
            var page = req.query.page;
            var count = req.query.count || 10;

            //search keyword
            if(keyword) {
                keyword = '%' + keyword.replace(/ /g, '%') + '%';
                query.where = {
                    $or: [
                        {username: {$like: keyword}},
                        {firstname: {$like: keyword}},
                        {middlename: {$like: keyword}},
                        {lastname: {$like: keyword}}
                    ]
                };
            }

            //page
            if(page){
                page = parseInt(page);
                count = parseInt(count);
                query.offset = (page - 1) * count;
                query.limit = count;
            }

            //query
            db.models.User.findAll(query)
                .then(function (users) {
                    callback(null, users);
                }).catch(function (err) {
                    callback(['api:1x22', err.message || 'Error retrieving data']);
                });
        }
    ], function (err, users) {
        if(err) res.send({error: err});
        else res.send(users);
    })
});
router.put('/user/password', function (req, res) {
    async.waterfall([

        //check fields
        function (callback) {
            if(!res.locals.user) callback(['api:1x23', 'You are not logged in.']);
            else if(!req.body.old_password) callback(['api:1x24', 'old_password is required.']);
            else if(!req.body.new_password) callback(['api:1x25', 'new_password is required.']);
            else if(req.body.new_password.length < 6) callback(['api:1x26', 'new_password password must be at least 6 characters.']);
            else callback();
        },

        //get account
        function (callback) {
            db.models.User.findById(req.session.username)
                .then(function (user) {
                    if(!user) callback(['api:1x27', 'Cannot find user account.']);
                    else if(!user.comparePassword(req.body.old_password)) callback (['api:1x28', 'Old password doesn\'t match.']);
                    else callback(null, user);
                }).catch(function (err) {
                callback(['api:1x29', err.message || 'Unable to retrieve data.']);
            });
        },

        //save password
        function (user, callback) {
            user.password = user.bcryptPassword(req.body.new_password);
            user.save()
                .then(function () {
                    callback();
                }).catch(function (err) {
                callback(['api:1x30', err.message || 'Unable to save new password.']);
            });
        }
    ], function (err) {
        if(err) res.json({error: err});
        else res.json({success: true});
    });
});
router.put('/user/password/reset/:username', function (req, res) {
    async.waterfall([

        //validate account
        function (callback) {
            if(!res.locals.user) callback(['api:1x31', 'You are not logged in.']);
            else if(res.locals.user.UserType.code != acctTypes.admin.code) callback(['api:1x32', 'Unauthorized Access.']);
            else callback();
        },

        //retrieve user
        function (callback) {
            db.models.User.findById(req.params.username)
                .then(function (user) {
                    if(!user) callback(['api:1x33', 'Username doesn\'t exist.']);
                    else callback(null, user);
                }).catch(function (err) {
                    callback(['api:1x34', err.message || 'Cannot retrieve data.']);
                });
        },

        //reset password
        function (user, callback) {
            user.password = user.bcryptPassword(user.username);
            user.save()
                .then(function () {
                    callback();
                }).catch(function (err) {
                    callback(['api:1x35', err.message || 'Cannot reset password.']);
                });
        }

    ], function (err) {
        if(err) res.send({error: err});
        else res.send({success: true});
    });
});
router.delete('/user/:username', function (req, res) {
    async.waterfall([

        //validate account
        function (callback) {
            if(!res.locals.user) callback(['api:1x36', 'You are not logged in.']);
            else if(res.locals.user.UserType.code != acctTypes.admin.code) callback(['api:1x37', 'Unauthorized Access.']);
            else callback();
        },

        //retrieve user
        function (callback) {
            db.models.User.findById(req.params.username)
                .then(function (user) {
                    if(!user) callback(['api:1x38', 'Username doesn\'t exist.']);
                    else callback(null, user);
                }).catch(function (err) {
                callback(['api:1x39', err.message || 'Cannot retrieve data.']);
            });
        },

        //delete user
        function (user, callback) {

            user.destroy()
                .then(function () {
                    callback();
                }).catch(function (err) {
                callback(['api:1x40', err.message || 'Unable to delete user.']);
            });
        }

    ], function (err) {
        if(err) res.send({error: err});
        else res.send({success: true});
    });
});

//===============================================
//  2. District
//===============================================

router.post('/district', function (req, res) {
    async.waterfall([

        //validate user and fields
        function (callback) {
            if(!res.locals.user) callback(['api:2x1', 'You are not logged in.']);
            else if(res.locals.user.UserType.code != acctTypes.admin.code) callback(['api:2x2', 'Unauthorized Access.']);
            else if(!req.body.name) callback(['api:2x3', 'name is required.']);
            else callback();
        },

        //create district
        function (callback) {
            var district = new db.models.District();
            district.name = req.body.name;
            district.city = 1;
            district.save()
                .then(function () {
                    callback();
                }).catch(function (err) {
                    callback(['api:2x4', err.message || 'Error saving district name.']);
                });
        }

    ], function (err) {
        if(err) res.send({error: err});
        else res.send({success: true});
    });
});
router.get('/district', function (req, res) {
    async.waterfall([

        //retrieve list
        function (callback) {
            var query = {
                attributes: { exclude: ['city', 'createdAt', 'updatedAt']},
                include: [
                    {
                        model: db.models.City,
                        attributes: { exclude: ['createdAt', 'updatedAt']}
                    }
                ]
            };
            var keyword = req.query.keyword;
            var page = req.query.page;
            var count = req.query.count || 10;

            //search keyword
            if(keyword) {
                keyword = '%' + keyword.replace(/ /g, '%') + '%';
                query.where = {name: {$like: keyword}};
            }

            //page
            if(page){
                page = parseInt(page);
                count = parseInt(count);
                query.offset = (page - 1) * count;
                query.limit = count;
            }

            //query
            db.models.District.findAll(query)
                .then(function (districts) {
                    callback(null, districts);
                }).catch(function (err) {
                callback(['api:2x5', err.message || 'Error retrieving data']);
            });
        }

    ], function (err, districts) {
        if(err) res.send({error: err});
        else res.send(districts);
    });
});
router.put('/district/:id', function (req, res) {
    async.waterfall([

        //validate user and fields
        function (callback) {
            if(!res.locals.user) callback(['api:2x6', 'You are not logged in.']);
            else if(res.locals.user.UserType.code != acctTypes.admin.code) callback(['api:2x7', 'Unauthorized Access.']);
            else if(!req.body.name) callback(['api:2x8', 'name is required.']);
            else callback();
        },

        //get district
        function (callback) {
            db.models.District.findById(req.params.id)
                .then(function (district) {
                     if(!district) callback(['api:2x9', 'District ID doesn\'t exist.']);
                     else callback(null, district);
                }).catch(function (err) {
                    callback(['api:2x10', err.message || 'Cannot retrieve data.']);
                });
        },

        //update district
        function (district, callback) {
            district.name = req.body.name;
            district.save()
                .then(function () {
                    callback();
                }).catch(function (err) {
                callback(['api:2x11', err.message || 'Error updating district name.']);
            });
        }

    ], function (err) {
        if(err) res.send({error: err});
        else res.send({success: true});
    });
});
router.delete('/district/:id', function (req, res) {
    async.waterfall([

        //validate user and fields
        function (callback) {
            if(!res.locals.user) callback(['api:2x12', 'You are not logged in.']);
            else if(res.locals.user.UserType.code != acctTypes.admin.code) callback(['api:2x13', 'Unauthorized Access.']);
            else callback();
        },

        //get district
        function (callback) {
            db.models.District.findById(req.params.id)
                .then(function (district) {
                    if(!district) callback(['api:2x14', 'District ID doesn\'t exist.']);
                    else callback(null, district);
                }).catch(function (err) {
                callback(['api:2x15', err.message || 'Cannot retrieve data.']);
            });
        },

        //update district
        function (district, callback) {
            district.destroy()
                .then(function () {
                    callback();
                }).catch(function (err) {
                callback(['api:2x16', err.message || 'Cannot delete district.']);
            });
        }

    ], function (err) {
        if(err) res.send({error: err});
        else res.send({success: true});
    });
});

//===============================================
//  3. Barangay
//===============================================

router.post('/barangay', function (req, res) {
    async.waterfall([

        function (callback) {
            if(!res.locals.user) callback(['api:3x1', 'You are not logged in.']);
            else if(res.locals.user.UserType.code != acctTypes.admin.code) callback(['api:3x2', 'Unauthorized Access.']);
            else if(!req.body.name) callback(['api:3x3', 'name is required.']);
            else if(!req.body.district) callback(['api:3x4', 'district is required.']);
            else if(!req.body.path) callback(['api:3x5', 'path is required.']);
            else if(req.body.coastal == undefined) callback(['api:3x6', 'coastal is required.']);
            else callback();
        },

        //create barangay
        function (callback) {
            var barangay = new db.models.Barangay();
            barangay.name = req.body.name;
            barangay.district = req.body.district;
            barangay.isCoastal = req.body.coastal;
            barangay.save()
                .then(function (barangay) {
                    callback(null, barangay);
                }).catch(function (err) {
                    callback(['api:3x7', err.message || 'Error saving barangay.']);
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
                    barangayPath.save()
                        .then(function () {
                            var nextIndex = index + 1;
                            if(nextIndex < req.body.path.length) saveLatLng(nextIndex);
                            else callback(null, barangay);
                        }).catch(function (err) {
                            callback(['api:3x8', err.message || 'Error saving barangay path.']);
                        });
                };
                saveLatLng(0);
            } else callback(null, barangay);
        }

    ], function (err) {
        if(err) res.send({error: err});
        else res.send({success: true});
    });
});
router.get('/barangay', function (req, res) {
    async.waterfall([

        //retrieve list
        function (callback) {
            var query = {
                attributes: { exclude: ['createdAt', 'updatedAt']},
                include: [
                    {
                        model: db.models.District,
                        attributes: { exclude: ['city', 'createdAt', 'updatedAt']},
                        include: [
                            {
                                model: db.models.City,
                                attributes: { exclude: ['createdAt', 'updatedAt']}
                            }
                        ]
                    },
                    {
                        model: db.models.BarangayLatestInfo,
                        attributes: { exclude: ['id', 'barangay', 'createdAt', 'updatedAt']}
                    }
                ]
            };
            var path = req.query.path;
            var keyword = req.query.keyword;
            var page = req.query.page;
            var count = req.query.count || 10;

            //path
            if(path) query.include.push({
                model: db.models.BarangayPath,
                attributes: { exclude: ['id', 'barangay', 'createdAt', 'updatedAt']}
            });

            //search keyword
            if(keyword) {
                keyword = '%' + keyword.replace(/ /g, '%') + '%';
                query.where = {name: {$like: keyword}};
            }

            //page
            if(page){
                page = parseInt(page);
                count = parseInt(count);
                query.offset = (page - 1) * count;
                query.limit = count;
            }


            //query
            db.models.Barangay.findAll(query)
                .then(function (barangays) {
                    callback(null, barangays);
                }).catch(function (err) {
                callback(['api:3x9', err.message || 'Error retrieving data']);
            });
        }
    ], function (err, barangays) {
        if(err) res.send({error: err});
        else res.send(barangays);
    });
});
router.put('/barangay/:id', function (req, res) {
    async.waterfall([

        function (callback) {
            if(!res.locals.user) callback(['api:3x10', 'You are not logged in.']);
            else if(res.locals.user.UserType.code != acctTypes.admin.code) callback(['api:3x11', 'Unauthorized Access.']);
            else if(!req.body.name) callback(['api:3x12', 'name is required.']);
            else if(!req.body.district) callback(['api:3x13', 'district is required.']);
            else if(req.body.coastal == undefined) callback(['api:3x14', 'coastal is required.']);
            else callback();
        },

        //get model
        function (callback) {
            db.models.Barangay.findById(req.params.id)
                .then(function (barangay) {
                    if(!barangay) callback(['api:3x15', 'Barangay ID doesn\'t exist.']);
                    else callback(null, barangay);
                }).catch(function (err) {
                    callback(['api:3x16', err.message || 'Cannot retrieve data.']);
                });
        },


        //update barangay
        function (barangay, callback) {
            barangay.name = req.body.name;
            barangay.district = req.body.district;
            barangay.isCoastal = req.body.coastal;
            barangay.save()
                .then(function (barangay) {
                    callback(null, barangay);
                }).catch(function (err) {
                callback(['api:3x17', err.message || 'Error saving new details.']);
            });
        },

        //delete old path
        function (barangay, callback) {
            if(req.body.path){
                db.models.BarangayPath.destroy({
                    where: {barangay: barangay.id}
                }).then(function () {
                    callback(null, barangay);
                }).catch(function (err) {
                    callback(['api:3x18', err.message || 'Error updating path.']);
                });
            } else callback(null, barangay);
        },

        //save path
        function (barangay, callback) {
            if(req.body.path && (req.body.path.length > 0)){
                var saveLatLng = function (index) {
                    var barangayPath = new db.models.BarangayPath();
                    barangayPath.barangay = barangay.id;
                    barangayPath.lat = req.body.path[index].lat;
                    barangayPath.lng = req.body.path[index].lng;
                    barangayPath.save()
                        .then(function () {
                            var nextIndex = index + 1;
                            if(nextIndex < req.body.path.length) saveLatLng(nextIndex);
                            else callback(null, barangay);
                        }).catch(function (err) {
                        callback(['api:3x19', err.message || 'Error updating path.']);
                    });
                };
                saveLatLng(0);
            } else callback(null, barangay);
        }

    ], function (err) {
        if(err) res.send({error: err});
        else res.send({success: true});
    });
});
router.delete('/barangay/:id', function (req, res) {
    async.waterfall([

        function (callback) {
            if(!res.locals.user) callback(['api:3x20', 'You are not logged in.']);
            else if(res.locals.user.UserType.code != acctTypes.admin.code) callback(['api:3x21', 'Unauthorized Access.']);
            else callback();
        },

        //get model
        function (callback) {
            db.models.Barangay.findById(req.params.id)
                .then(function (barangay) {
                    if(!barangay) callback(['api:3x22', 'Barangay ID doesn\'t exist.']);
                    else callback(null, barangay);
                }).catch(function () {
                callback(['api:3x23', 'Cannot retrieve data.']);
            });
        },

        //delete path
        function (barangay, callback) {
            db.models.BarangayPath.destroy({where: {barangay: barangay.id}})
                .then(function () {
                    callback(null, barangay);
                }).catch(function (err) {
                    callback(['api:3x24', err.message || 'Error deleting path.']);
                });
        },

        //delete barangay
        function (barangay, callback) {
            barangay.destroy()
                .then(function () {
                    callback();
                }).catch(function (err) {
                callback(['api:3x25', err.message || 'Error deleting barangay.']);
            });
        }
    ], function (err) {
        if(err) res.send({error: err});
        else res.send({success: true});
    });
});

module.exports = router;