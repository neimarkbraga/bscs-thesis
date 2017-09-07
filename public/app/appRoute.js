angular.module('appRoute', ['ngRoute'])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.hashPrefix('');
        $routeProvider
            //public
            .when('/', {
                templateUrl: 'app/pages/public/home.html',
                controller: 'homeCtrl',
                controllerAs: 'home'
            })

            //MIX
            .when('/settings', {
                templateUrl: 'app/pages/accounts/accountSettings.html',
                controller: 'accountSettingsCtrl',
                controllerAs: 'settings',
                allowedUsers: ['ADMIN', 'CDRRMO', 'BRGY', 'CSWD']
            })

            //ADMIN
            .when('/ADMIN/dashboard', {
                templateUrl: 'app/pages/admin/adminDashboard.html',
                controller: 'adminDashboardCtrl',
                controllerAs: 'dashboard',
                allowedUsers: ['ADMIN']
            })
            .when('/ADMIN/admin-manage-users', {
                templateUrl: 'app/pages/admin/adminManageUsers.html',
                controller: 'adminManageUsersCtrl',
                controllerAs: 'manager',
                allowedUsers: ['ADMIN']
            })
            .when('/ADMIN/admin-manage-places', {
                templateUrl: 'app/pages/admin/adminManagePlaces.html',
                controller: 'adminManagePlacesCtrl',
                controllerAs: 'manager',
                allowedUsers: ['ADMIN']
            })


            .otherwise({redirectTo: '/'});
    });