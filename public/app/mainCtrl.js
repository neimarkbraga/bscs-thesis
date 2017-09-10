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
            {name: 'Places', path: '/places'},
            {name: 'Map', items: [
                {name: 'On-Going Disaster', path: '/map/on-going-disasters'},
                {name: 'Evacuation Centers', path: '/map/evacuation-centers'},
                {name: 'Top Disasters in Places', path: '/map/top-disasters-in-places'},
                {name: 'Place Population', path: '/map/place-population'}
            ]}
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
            var preloader = new Dialog.preloader('Logging in...');
            Auth.authenticate(main.loginForm).then(function (response) {
                if(response.data.success) {
                    main.loginForm = {};
                    $('#loginModal').modal('hide');
                    main.user = response.data.user;
                    $location.path('/' + main.user.type + '/dashboard');
                } else main.loginErrorMessage = response.data.message;
            }).catch(function (err) {
                main.loginErrorMessage = 'Cannot communicate to the server';
            }).finally(function () {
                main.loginDisabled = false;
                preloader.destroy();
            });
        };

        //logout
        main.logout = function () {
            var preloader = new Dialog.preloader('Logging out...');
            Auth.logout()
                .then(function (response) {
                    if(response.data.success){
                        main.user = undefined;
                        $location.path('/');
                    } else Dialog.alert('Something went wrong', 'Cannot communicate to server.');
                }).catch(function (err) {
                    Dialog.alert('Something went wrong', 'Error: ' + err.statusText);
                }).finally(function () {
                    preloader.destroy();
                });
        };
    });