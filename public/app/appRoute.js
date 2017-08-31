angular.module('appRoute', ['ngRoute'])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.hashPrefix('');
        $routeProvider
            //public
            .when('/', {
                templateUrl: 'app/views/public/home.html',
                controller: 'homeCtrl',
                controllerAs: 'home'
            })

            //MIX
            .when('/settings', {
                templateUrl: 'app/views/accounts/accountSettings.html',
                controller: 'accountSettingsCtrl',
                controllerAs: 'settings',
                allowedUsers: ['ADMIN', 'CDRRMO', 'BRGY', 'CSWD']
            })

            //ADMIN
            .when('/ADMIN/dashboard', {
                templateUrl: 'app/views/admin/adminDashboard.html',
                controller: 'adminDashboardCtrl',
                controllerAs: 'dashboard',
                allowedUsers: ['ADMIN']
            })
            .when('/ADMIN/admin-manage-users', {
                templateUrl: 'app/views/admin/adminManageUsers.html',
                controller: 'adminManageUsersCtrl',
                controllerAs: 'manager',
                allowedUsers: ['ADMIN']
            })
            .when('/ADMIN/admin-manage-places', {
                templateUrl: 'app/views/admin/adminManagePlaces.html',
                controller: 'adminManagePlacesCtrl',
                controllerAs: 'manager',
                allowedUsers: ['ADMIN']
            })


            .otherwise({redirectTo: '/'});
    });