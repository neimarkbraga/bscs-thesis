angular.module('placeService', [])
    .factory('PlaceSv', function ($http) {
        return {
            searchNamesWithInfo: function (keyword, page, callback) {
                var query = undefined;
                if(keyword && page) query = '?q=' + keyword + '&p=' + page;
                else if(keyword) query = '?q=' + keyword;
                else if(page) query = '?p=' + page;
                $http.get('api/places/names-with-info' + ((query)? query:'')).then(function (response) {
                    if(response.data.success) callback(null, response.data.data);
                    else callback(response.data);
                }).catch(function (err) {
                    callback(err);
                });
            },
            getDistricts: function (callback) {
                $http.get('api/places/districts').then(function (response) {
                    if(response.data.success) callback(null, response.data.data);
                    else callback(response.data);
                }).catch(function (err) {
                    callback(err);
                });
            },
            getPath: function (id, callback) {
                $http.get('api/places/path/' + id)
                    .then(function (response) {
                        if(response.data.success) callback(null, response.data.data);
                        else callback(response.data);
                    }).catch(function (err) {
                        callback(err);
                    });
            }
        };
    });