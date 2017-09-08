angular.module('mainController', [])
    .controller('mainCtrl', function ($scope, $location, $interval, Auth) {
        var main = this;
        //initialize variables
        main.user = undefined;
        main.loginDisabled = false;
        main.loginErrorMessage = undefined;
        main.loginForm = undefined;
        main.pageLoading = false;
        main.navItems = [
            {name: 'News', path: '/news'},
            {name: 'Disasters', path: '/disasters'},
            {name: 'Barangays', path: '/barangays'},
            {name: 'Map', path: '/map'}
        ];

        //page authorization
        $scope.$on('$routeChangeStart', function (event, next, prev) {
            var authorizedUser = function () {
                if(!next.allowedUsers) return true;
                else if(!main.user) return false;
                else return next.allowedUsers.indexOf(main.user.type) > -1;
            };
            if(!next.redirectTo){
                if(main.pageLoading == true) event.preventDefault();
                else {
                    main.pageLoading = true;
                    Auth.me()
                        .then(function (response) {
                            if(response.data.success) main.user = response.data.user;
                            else main.user = undefined;
                        }).catch(function (err) {
                        main.user = undefined;
                        throw err;
                    }).finally(function () {
                        main.pageLoading = false;
                        if(!authorizedUser()) $location.path('/');
                    });
                }
            }
        });

        //login
        main.loginSubmit = function (e) {
            e.preventDefault();
            main.loginDisabled = true;
            main.loginErrorMessage = undefined;
            Auth.authenticate(main.loginForm).then(function (response) {
                if(response.data.success) {
                    main.loginForm = {};
                    $('#loginModal').modal('hide');
                    main.user = response.data.user;
                    $location.path('/' + main.user.type + '/dashboard');
                } else main.loginErrorMessage = response.data.message;
            }).catch(function (err) {
                main.loginErrorMessage = 'Error: ' + err.statusText;
            }).finally(function () {
                main.loginDisabled = false;
            });
        };

        //logout
        main.logout = function () {
            Auth.logout()
                .then(function (response) {
                    if(response.data.success){
                        main.user = undefined;
                        $location.path('/');
                    } else Dialog.alert('Something went wrong', 'Cannot communicate to server.');
                }).catch(function (err) {
                    Dialog.alert('Something went wrong', 'Error: ' + err.statusText);
                });
        };
    });