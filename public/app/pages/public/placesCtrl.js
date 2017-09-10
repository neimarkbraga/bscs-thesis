angular.module('publicCtrls')
    .controller('placesCtrl', function (PlaceSv) {
        var places = this;
        places.chart = {
            options: {
                legend: {display: true, position: 'bottom'},
                title: {display: true, text: 'Number of Barangays per District'}
            },
            labels: [],
            data: []
        };
        places.district = {};
        places.init = function () {
            PlaceSv.searchNamesWithInfo(undefined, undefined, function (err, data) {
                if(err) throw err;
                for(var i = 0; i < data.length; i++){
                    if(!places.district[data[i].DISTRICT_NAME]) places.district[data[i].DISTRICT_NAME] = [];
                    places.district[data[i].DISTRICT_NAME].push(data[i].BARANGAY_NAME)
                }
                for(var district in places.district){
                    places.chart.labels.push(district);
                    places.chart.data.push(places.district[district].length);
                }
            });
        };
        places.init();
    });