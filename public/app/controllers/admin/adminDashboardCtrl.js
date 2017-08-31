angular.module('adminDashboardController', [])
    .controller('adminDashboardCtrl', function () {
        var dashboard = this;
        dashboard.items = [
            {name: 'Manage Declared Disasters', link: '#/'},
            {name: 'Manage Disaster Types', link: '#/'},
            {name: 'Manage Disaster Grouping', link: '#/'},
            {name: 'Manage Evacuation Centers', link: '#/'},
            {name: 'Manage Users', link: '#/'},
            {name: 'Manage Places', link: '#/'},
            {name: 'Manage News Feed', link: '#/'}
        ]
    });