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
            .otherwise({redirectTo: '/'});
    });