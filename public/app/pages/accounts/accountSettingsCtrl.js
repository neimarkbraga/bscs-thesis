angular.module('accountsCtrls')
    .controller('accountSettingsCtrl', function ($http) {
        var settings = this;
        settings.changePassword = function (e) {
            settings.loginSuccessMessage = undefined;
            settings.loginErrorMessage = undefined;
            e.preventDefault();
            if(settings.form.newPassword !== settings.form.retypePassword) {
                settings.loginErrorMessage = 'Your new password and retype password doesn\'t match';
            }
            else {
                var preloader = new Dialog.preloader('Updating password...');
                $http.put('api/user/change-password', {
                    new_password: settings.form.newPassword,
                    old_password: settings.form.oldPassword
                }).then(function (response) {
                    if(response.data.success){
                        settings.form = undefined;
                        settings.loginSuccessMessage = response.data.message;
                    }
                    else settings.loginErrorMessage = response.data.message;
                }).catch(function (err) {
                    settings.loginErrorMessage = 'Error: ' + err.statusText;
                }).finally(function () {
                    preloader.destroy();
                });
            }
        };
    });