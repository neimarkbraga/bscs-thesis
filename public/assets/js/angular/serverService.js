angular.module('serverService', [])
    .factory('serverSv', function ($http, $location) {
        var host = $location.protocol() + '://' + location.host;
        var service = {
            getHost: function () {
                return host;
            },
            request: function (path, config) {
                path = path || '/';
                config = config || {};
                config.url = host + path;
                config.method = config.method || 'get';
                config.responseType = config.responseType || 'json';
                //config.headers = config.headers || {'Content-Type': 'application/json'};
                return $http(config);
            },
            auth: {
                login: function (data) {
                    return service.request('/api/user/login', {
                        method: 'post',
                        data: data
                    });
                }
            }
        };
        return service;
    });