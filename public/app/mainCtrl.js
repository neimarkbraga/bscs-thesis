angular.module('mainController', [])
    .controller('mainCtrl', function ($scope, $location, $route, serverSv) {

        //private properties
        var main = this;
        var nextPath = undefined;

        //public properties
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

        //methods
        main.loginSubmit = function (e) {
            e.preventDefault();
            main.loginDisabled = true;
            main.loginErrorMessage = undefined;
            var preloader = new Dialog.preloader('Logging in...');
            serverSv.auth.login(main.loginForm).then(function (response) {
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
        main.logout = function () {
            var preloader = new Dialog.preloader('Logging out...');
            serverSv.auth.logout()
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

        //event handlers
        $scope.$on('$routeChangeStart', function (event, next, prev) {
            var authorizedUser = function () {
                if(!next.allowedUsers) return true;
                else if(!main.user) return false;
                else return next.allowedUsers.indexOf(main.user.UserType.code) > -1;
            };

            if(!next.redirectTo){
                if(main.pageLoading == true) event.preventDefault();
                else if(nextPath) nextPath = undefined;
                else {
                    event.preventDefault();
                    main.pageLoading = true;
                    serverSv.auth.me()
                        .then(function (response) {
                            var data = response.data;
                            if(data.error) throw data;
                            else main.user = data;
                        }).catch(function (err) {
                            main.user = undefined;
                            //throw err;
                        }).finally(function () {
                            main.pageLoading = false;
                            nextPath = (authorizedUser())? next.originalPath:'/';
                            if($location.path() == nextPath) $route.reload();
                            else $location.path(nextPath);
                        });
                }
            }
        });
    });