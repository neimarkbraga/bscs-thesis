angular.module('authService', [])
    .factory('Auth', function ($http) {
        return {
            authenticate: function (data) {
                return $http.post('api/user/authenticate', data, {
                    responseType: 'json'
                });
            },
            me: function () {
                return $http.get('api/user/me');
            },
            logout: function () {
                return $http.get('api/user/logout');
            }
        };
    });