angular.module('serverService', [])
    .factory('serverSv', function ($http) {
        var host = 'http://127.0.0.1';
        var service = {
            getHost: function () {
                return host;
            },
            request: function (path, config) {
                config = config || {};
                config.url = host + path;
                config.method = config.method || 'GET';
                config.responseType = config.responseType || 'json';
                //config.headers = config.headers || {'Content-Type': 'application/json'};
                return $http(config);
            },
            auth: {
                login: function (data) {
                    return service.request('/api/user/authenticate', {
                        method: 'post',
                        data: data
                    });
                },
                logout: function () {
                    return service.request('/api/user/logout');
                },
                me: function () {
                    return service.request('/api/user/me');
                }
            },
            places: {
                searchNamesWithInfo: function (keyword, page, callback) {
                    var query = undefined;
                    if(keyword && page) query = '?q=' + keyword + '&p=' + page;
                    else if(keyword) query = '?q=' + keyword;
                    else if(page) query = '?p=' + page;
                    service.request('/api/places/names-with-info' + ((query)? query:''))
                        .then(function (response) {
                            if(response.data.success) callback(null, response.data.data);
                            else callback(response.data);
                        }).catch(function (err) {
                            callback(err);
                        });
                },
                getDistricts: function (callback) {
                    service.request('/api/places/districts')
                        .then(function (response) {
                            if(response.data.success) callback(null, response.data.data);
                            else callback(response.data);
                        }).catch(function (err) {
                            callback(err);
                        });
                },
                getPath: function (id, callback) {
                    service.request('/api/places/path/' + id)
                        .then(function (response) {
                            if(response.data.success) callback(null, response.data.data);
                            else callback(response.data);
                        }).catch(function (err) {
                        callback(err);
                    });
                }
            }
        };
        return service;
    });