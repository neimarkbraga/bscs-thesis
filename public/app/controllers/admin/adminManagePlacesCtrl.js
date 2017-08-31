angular.module('adminManagePlacesController', ['ngMap'])
    .controller('adminManagePlacesCtrl', function (NgMap) {
        var manager = this;
        manager.initMap = function () {
            NgMap.getMap().then(function (map) {
                manager.map = map;
                manager.drawingManager = new google.maps.drawing.DrawingManager({
                    map: map,
                    drawingControl: true,
                    drawingControlOptions: {
                        drawingModes: ['polygon'],
                        position: google.maps.ControlPosition.TOP_CENTER
                    },
                    drawingMode: 'polygon',
                    polygonOptions: {
                        editable: true,
                        draggable: true
                    }
                });
                manager.drawingManager.addListener('polygoncomplete', function (polygon) {
                    if(manager.mapPolygon) manager.mapPolygon.setMap(null);
                    manager.mapPolygon = polygon;
                });
                var center = map.getCenter();
                $('#newPlaceModal').on('shown.bs.modal', function () {
                    google.maps.event.trigger(map, "resize");
                    map.setCenter(center);
                });
            }).catch(function (err) {
                Dialog.alert('Map Error', err);
            });
        };
        manager.onMapOverlayCompleted = function (e) {
            if(manager.mapPolygon) manager.mapPolygon.setMap(null);
            manager.mapPolygon = e.overlay;
        };
        manager.newPlace = function (e) {
            e.preventDefault();
            manager.newPlaceFormSuccessMessage = undefined;
            manager.newPlaceFormErrorMessage = undefined;
            if(!manager.mapPolygon) manager.newPlaceFormErrorMessage = 'You have to draw the area of the place.';
            else {
                //before
                var path = manager.mapPolygon.getPath().getArray();
                manager.newPlaceForm.path = [];
                for(var i = 0; i < path.length; i++) manager.newPlaceForm.path.push(path[i].toJSON());

                //finally
                manager.mapPolygon.setMap(null);
                manager.mapPolygon = undefined;
                manager.newPlaceForm = undefined;
                manager.newPlaceFormSuccessMessage = 'Success!';
            }
        };
        manager.initMap();
    });