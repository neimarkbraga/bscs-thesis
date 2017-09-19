angular.module('publicCtrls')
    .controller('placesCtrl', function (serverSv) {
        var places = this;
        places.chart = {
            options: {
                legend: {display: true, position: 'bottom'},
                title: {display: true, text: 'Number of Barangays per District'},
                onClick: function (e,items) {
                    if(items.length > 0) $('#collapse_' + items[0]._index).collapse('toggle');
                }
            },
            labels: [],
            data: []
        };
        places.district = {};
        places.init = function () {
            serverSv.places.searchNamesWithInfo(undefined, undefined, function (err, data) {
                if(err) throw err;
                for(var i = 0; i < data.length; i++){
                    if(!places.district[data[i].DISTRICT_NAME]) places.district[data[i].DISTRICT_NAME] = [];
                    places.district[data[i].DISTRICT_NAME].push({
                        id: data[i].BARANGAY_ID,
                        name: data[i].BARANGAY_NAME
                    });
                }
                for(var district in places.district){
                    places.chart.labels.push(district);
                    places.chart.data.push(places.district[district].length);
                }
            });
        };
        places.init();
    });