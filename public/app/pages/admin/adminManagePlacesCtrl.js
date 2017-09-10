angular.module('adminCtrls')
    .controller('adminManagePlacesCtrl', function ($rootScope, $routeParams, $location, $http, PlaceSv, MapSv) {
        var manager = this;
        manager.resetSeacrh = function () {
            manager.currentPage = 0;
            manager.searchMax = false;
            manager.searchBusy = false;
            manager.places = [];
        };
        manager.initMap = function () {
            manager.mapPolygonOptions = {
                editable: true,
                draggable: true
            };

            manager.map = new google.maps.Map(document.getElementById('map'), MapSv.defaultMapOptions);
            manager.drawingManager = new google.maps.drawing.DrawingManager({
                map: manager.map,
                drawingControl: true,
                drawingControlOptions: {
                    drawingModes: ['polygon'],
                    position: google.maps.ControlPosition.TOP_CENTER
                },
                polygonOptions: manager.mapPolygonOptions
            });
            manager.drawingManager.addListener('polygoncomplete', function (polygon) {
                if(manager.mapPolygon) manager.mapPolygon.setMap(null);
                manager.mapPolygon = polygon;
            });
            $('#placeFormModal')
                .on('shown.bs.modal', function () {
                    google.maps.event.trigger(map, "resize");
                    if(manager.mapBounds) manager.map.fitBounds(manager.mapBounds);
                    else manager.map.setOptions(MapSv.defaultMapOptions);
                }).on('hidden.bs.modal', function () {
                if(manager.mapPolygon) manager.mapPolygon.setMap(null);
                manager.mapBounds = undefined;
            });
        };
        manager.onMapOverlayCompleted = function (e) {
            if(manager.mapPolygon) manager.mapPolygon.setMap(null);
            manager.mapPolygon = e.overlay;
        };
        manager.setPlaceFormMode = function (mode, index) {
            manager.placeFormSuccessMessage = undefined;
            manager.placeFormErrorMessage = undefined;
            manager.placeFormMode = mode;
            var placeClone = angular.copy(manager.places[index]);
            var formModal = $('#placeFormModal');
            if(mode == 'new') {
                manager.drawingManager.setDrawingMode('polygon');
                manager.placeForm = {district_id: -1};
                $(formModal).modal('show');
            }
            else {
                PlaceSv.getPath(placeClone.BARANGAY_ID, function (err, data) {
                    if(err) Dialog.alert('Error Loading Places', err.message || 'Error retrieving data from server');
                    else {
                        manager.placeForm = {
                            index: index,
                            barangay_id: placeClone.BARANGAY_ID,
                            district_id: placeClone.DISTRICT_ID,
                            barangay_name: placeClone.BARANGAY_NAME,
                            is_coastal: (placeClone.isCOASTAL == 1)
                        };
                        var polygonOptions = angular.copy(manager.mapPolygonOptions);
                        polygonOptions.path = data;
                        manager.mapPolygon = new google.maps.Polygon(polygonOptions);
                        manager.mapPolygon.setMap(manager.map);
                        manager.drawingManager.setDrawingMode(null);
                        manager.mapBounds = MapSv.getPolygonBounds(manager.mapPolygon);
                        manager.currentPolygonPath = angular.copy(manager.mapPolygon.getPath().getArray());
                        $(formModal).modal('show');
                    }
                });
            }
        };
        manager.resetPlaceForm = function () {
            manager.mapPolygon.setMap(null);
            manager.mapPolygon = undefined;
            manager.loadDistricts();
        };
        manager.submitPlaceForm = function (e) {
            e.preventDefault();
            manager.placeFormSuccessMessage = undefined;
            manager.placeFormErrorMessage = undefined;
            if(!manager.mapPolygon) manager.placeFormErrorMessage = 'You have to draw the area of the place.';
            else {
                var path = manager.mapPolygon.getPath().getArray();
                manager.placeForm.path = [];
                for(var i = 0; i < path.length; i++) manager.placeForm.path.push(path[i].toJSON());
                if(manager.placeFormMode == 'new'){
                    //ADD NEW
                    var preloader = new Dialog.preloader('Adding new place...');
                    $http.post('api/places/new', manager.placeForm, {
                        responseType: 'json'
                    }).then(function (response) {
                        if(response.data.success) manager.placeFormSuccessMessage = 'Place added successfully.';
                        else manager.placeFormErrorMessage = 'Error: ' + response.data.message;
                    }).catch(function (err) {
                        manager.placeFormErrorMessage = 'Error: ' + err.statusText;
                    }).finally(function () {
                        manager.resetPlaceForm();
                        preloader.destroy();
                    });
                } else {
                    //UPDATE
                    var preloader = new Dialog.preloader('Updating place...');
                    if(angular.equals(manager.currentPolygonPath, path)) delete manager.placeForm.path;
                    $http.put('api/places/update/' + manager.placeForm.barangay_id, manager.placeForm, {
                        responseType: 'json'
                    }).then(function (response) {
                        if(response.data.success) manager.placeFormSuccessMessage = 'Place updated successfully.';
                        else manager.placeFormErrorMessage = 'Error: ' + response.data.message;
                    }).catch(function (err) {
                        manager.placeFormErrorMessage = 'Error: ' + err.statusText;
                    }).finally(function () {
                        manager.resetPlaceForm();
                        preloader.destroy();
                    });
                }
            }
        };
        manager.deletePlace = function () {
            Dialog.confirm('Delete Place?', 'Do you want to delete <b>' + manager.placeForm.barangay_name +'</b>?', function (result) {
                if(result){
                    var preloader = new Dialog.preloader('Deleting place...');
                    manager.placeFormSuccessMessage = undefined;
                    manager.placeFormErrorMessage = undefined;
                    $http.delete('api/places/delete/' + manager.placeForm.barangay_id, {}, {
                        responseType: 'json'
                    }).then(function (response) {
                        if(response.data.success) {
                            manager.placeFormSuccessMessage = 'Place deleted successfully.';
                            manager.places.splice(manager.placeForm.index, 1);
                        }
                        else manager.placeFormErrorMessage = 'Error: ' + response.data.message;
                    }).catch(function (err) {
                        manager.placeFormErrorMessage = 'Error: ' + err.statusText;
                    }).finally(function () {
                        manager.resetPlaceForm();
                        preloader.destroy();
                    });
                }
            })
        };
        manager.loadMorePlaces = function (callback) {
            if(!manager.searchBusy && !manager.searchMax){
                manager.searchBusy = true;
                PlaceSv.searchNamesWithInfo(manager.searchKeyword, (manager.currentPage + 1), function (err, data) {
                    if(err) Dialog.alert('Error Loading Places', err.message || 'Error retrieving data from server');
                    else {
                        manager.currentPage++;
                        if(data.length == 0) manager.searchMax = true;
                        else data.forEach(function (item) {
                            manager.places.push(item);
                        });
                    }
                    manager.searchBusy = false;
                    if(callback) callback();
                });
            }
        };
        manager.searchPlace = function (e) {
            var preloader = new Dialog.preloader('Searching places...');
            e.preventDefault();
            manager.resetSeacrh();
            manager.loadMorePlaces(function () {
                preloader.destroy();
            });
        };
        manager.loadDistricts = function () {
            PlaceSv.getDistricts(function (err, data) {
                if(err) Dialog.alert('Error Loading Places', err.message || 'Error retrieving data from server');
                else manager.districts = data;
            });
        };
        manager.addNewDistrict = function () {
            $('#manageDistrictModal').modal('hide');
            Dialog.prompt('Add New District', 'Please enter new name of district', function (result) {
                if(result){
                    var preloader = new Dialog.preloader('Adding new district...');
                    $http.post('api/places/new-district', {
                        district_name: result
                    }, {
                        responseType: 'json'
                    }).then(function (response) {
                        if(response.data.success) {
                            Dialog.alert('Success', 'District added successfully.', function () {
                                $('#manageDistrictModal').modal('show');
                            });
                            manager.loadDistricts();
                        }
                        else Dialog.alert('Error', 'Error: ' + response.data.message);
                    }).catch(function (err) {
                        Dialog.alert('Error', 'Error: ' + err.statusText, function () {
                            $('#manageDistrictModal').modal('show');
                        });
                    }).finally(function () {
                        preloader.destroy();
                    })
                }
            }, {
                label: 'District Name',
                placeholder: 'District Name',
                required: false
            });
        };
        manager.renameDistrict = function (index) {
            $('#manageDistrictModal').modal('hide');
            Dialog.prompt('Rename District', 'Please enter new name of district', function (result) {
                if(result){
                    var preloader = new Dialog.preloader('Renaming district...');
                    $http.put('api/places/update-district/' + manager.districts[index].id, {
                        district_name: result
                    }, {
                        responseType: 'json'
                    }).then(function (response) {
                        if(response.data.success) {
                            Dialog.alert('Success', 'District renamed successfully.', function () {
                                $('#manageDistrictModal').modal('show');
                            });
                            manager.loadDistricts();
                        }
                        else Dialog.alert('Error', 'Error: ' + response.data.message);
                    }).catch(function (err) {
                        Dialog.alert('Error', 'Error: ' + err.statusText, function () {
                            $('#manageDistrictModal').modal('show');
                        });
                    }).finally(function () {
                        preloader.destroy();
                    });
                }
            }, {
                label: 'District Name',
                placeholder: 'District Name',
                required: false,
                value: manager.districts[index].name
            });
        };
        manager.deleteDistrict = function (index) {
            $('#manageDistrictModal').modal('hide');
            Dialog.confirm('Delete District', 'Do you want to delete <b>' + manager.districts[index].name + '</b> district?', function (result) {
                if(result){
                    var preloader = new Dialog.preloader('Deleting district...');
                    $http.delete('api/places/delete-district/' + manager.districts[index].id, {}, {
                        responseType: 'json'
                    }).then(function (response) {
                        if(response.data.success) {
                            Dialog.alert('Success', 'District deleted successfully.', function () {
                                $('#manageDistrictModal').modal('show');
                            });
                            manager.loadDistricts();
                        }
                        else Dialog.alert('Error', 'Error: ' + response.data.message);
                    }).catch(function (err) {
                        Dialog.alert('Error', 'Error: ' + err.statusText, function () {
                            $('#manageDistrictModal').modal('show');
                        });
                    }).finally(function () {
                        preloader.destroy();
                    });
                }
            });
        };
        manager.resetSeacrh();
        manager.loadMorePlaces();
        manager.loadDistricts();
        manager.initMap();
    });