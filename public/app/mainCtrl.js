angular.module('mainController', [])
    .controller('mainCtrl', function ($scope, $location, $rootScope, $interval, Auth) {
        var main = this;
        //get current user
        if(sessionStorage.currentUser) main.user = angular.copy(JSON.parse(sessionStorage.currentUser));

        //page authorization
        $scope.$on('$routeChangeStart', function (event, next, prev) {
            if((next.allowedUsers) && (!main.user || ((next.allowedUsers).indexOf(main.user.type) < 0)))
                $location.path('/');

            Auth.me()
                .then(function (response) {
                    if(response.data.success)main.user = response.data.user;
                    else main.user = undefined;
                }).catch(function () {
                    main.user = undefined;
                }).finally(function () {
                    if(main.user) sessionStorage.currentUser = JSON.stringify(main.user);
                    else sessionStorage.removeItem('currentUser');
                    if((next.allowedUsers) && (!main.user || ((next.allowedUsers).indexOf(main.user.type) < 0))){
                        Dialog.alert('Unauthorized Access', 'You are not allowed to access the page.');
                        $location.path('/');
                    }
                });
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
                    sessionStorage.currentUser = JSON.stringify(main.user);
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