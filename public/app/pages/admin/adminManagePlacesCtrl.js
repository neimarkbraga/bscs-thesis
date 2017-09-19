angular.module('adminCtrls')
    .controller('adminManagePlacesCtrl', function ($rootScope, $routeParams, $location, serverSv, mapSv) {
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

            manager.map = new google.maps.Map(document.getElementById('map'), mapSv.defaultMapOptions);
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
                    else manager.map.setOptions(mapSv.defaultMapOptions);
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
                serverSv.places.getPath(placeClone.BARANGAY_ID, function (err, data) {
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
                        manager.mapBounds = mapSv.getPolygonBounds(manager.mapPolygon);
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
                var preloader = undefined;
                var path = manager.mapPolygon.getPath().getArray();
                manager.placeForm.path = [];
                for(var i = 0; i < path.length; i++) manager.placeForm.path.push(path[i].toJSON());
                if(manager.placeFormMode == 'new'){
                    //ADD NEW
                    preloader = new Dialog.preloader('Adding new place...');
                    serverSv.request('/api/places/new', {
                        method: 'post',
                        data: manager.placeForm
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
                    preloader = new Dialog.preloader('Updating place...');
                    if(angular.equals(manager.currentPolygonPath, path)) delete manager.placeForm.path;
                    serverSv.request('/api/places/update/' + manager.placeForm.barangay_id, {
                        method: 'put',
                        data: manager.placeForm
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
                    serverSv.request('/api/places/delete/' + manager.placeForm.barangay_id, {
                        method: 'delete'
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
                serverSv.places.searchNamesWithInfo(manager.searchKeyword, (manager.currentPage + 1), function (err, data) {
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
            serverSv.places.getDistricts(function (err, data) {
                if(err) Dialog.alert('Error Loading Places', err.message || 'Error retrieving data from server');
                else manager.districts = data;
            });
        };
        manager.addNewDistrict = function () {
            $('#manageDistrictModal').modal('hide');
            Dialog.prompt('Add New District', 'Please enter new name of district', function (result) {
                if(result){
                    var preloader = new Dialog.preloader('Adding new district...');

                    serverSv.request('/api/places/new-district', {
                        method: 'post',
                        data: {
                            district_name: result
                        }
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
                    serverSv.request('/api/places/update-district/' + manager.districts[index].id, {
                        method: 'put',
                        data: {
                            district_name: result
                        }
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
                    serverSv.request('/api/places/delete-district/' + manager.districts[index].id, {
                        method: 'delete'
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