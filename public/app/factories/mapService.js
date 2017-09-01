angular.module('mapService', [])
    .factory('MapSv', function () {
        return {
            getPolygonPathCenter: function (path) {
                try {
                    var x1 = path[0].lat;
                    var y1 = path[0].lng;
                    var x2 = path[0].lat;
                    var y2 = path[0].lng;
                    for(var i = 0; i < path.length; i++){
                        if(path[i].lat < x1) path[i] = x1;
                        if(path[i].lng < y1) path[i].lng = y1;
                        if(path[i].lat > x2) path[i] = x2;
                        if(path[i].lng > y2) path[i].lng = y2;
                    }
                    return {lat: (x1 + ((x2 - x1) / 2)), lng: (y1 + ((y2 - y1) / 2))};
                } catch (e) {
                    return {lat: 0, lng: 0};
                }

            },
            getPolygonBounds: function (polygon) {
                var bounds = new google.maps.LatLngBounds();
                var paths = polygon.getPaths();
                for (var i = 0; i < paths.getLength(); i++) {
                    var path = paths.getAt(i);
                    for (var j = 0; j < path.getLength(); j++) bounds.extend(path.getAt(j));
                }
                return bounds;
            }
        };
    });