angular.module('adminDashboardController', [])
    .controller('adminDashboardCtrl', function () {
        var dashboard = this;
        dashboard.items = [
            {name: 'Manage Declared Disasters', link: '#/'},
            {name: 'Manage Disaster Types', link: '#/'},
            {name: 'Manage Disaster Grouping', link: '#/'},
            {name: 'Manage Evacuation Centers', link: '#/'},
            {name: 'Manage Users', link: '#/ADMIN/admin-manage-users'},
            {name: 'Manage Places', link: '#/ADMIN/admin-manage-places'},
            {name: 'Manage News Feed', link: '#/'}
        ]
    });