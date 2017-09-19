angular.module('adminCtrls')
    .controller('adminManageUsersCtrl', function (serverSv) {
        var manager = this;

        //properties
        manager.userList = [];
        manager.userTypes = [];
        manager.barangays = [];
        manager.addFormMode = true;
        manager.searchValues = {keyword: undefined, page: 1, busy: false, end: false};

        //methods
        manager.loadMoreItems = function () {
            if(!(manager.searchValues.busy || manager.searchValues.end)){
                manager.searchValues.busy = true;
                serverSv.request('/api/user/list?p=' + manager.searchValues.page +
                    ((manager.searchValues.keyword)? '&q=' + encodeURIComponent(manager.searchValues.keyword):''))
                    .then(function (response) {
                        var data = response.data;
                        if(data.error) Dialog.alert('Cannot get list', data.error[0]);
                        else {
                            manager.searchValues.page++;
                            data.forEach(function (item) {
                                manager.userList.push(item);
                            });
                            if(data.length < 1) manager.searchValues.end = true;
                        }
                    }).catch(function (err) {
                        Dialog.alert('Cannot get list', 'An unknown error occurred');
                        throw err;
                    }).finally(function () {
                        manager.searchValues.busy = false;
                    });
            }
        };
        manager.search = function (keyword) {
            manager.searchValues.keyword = keyword;
            manager.searchValues.end = false;
            manager.searchValues.page = 1;
            manager.userList = [];
            manager.loadMoreItems();
        };
        manager.getUserTypes = function () {
            var preloader = new Dialog.preloader('Loading User Types');
            serverSv.request('/api/user/types')
                .then(function (response) {
                    var data = response.data;
                    if(data.error) preloader.changeLabel('Failed to get user types. Try reloading the page. [' + data.error[0] + ']');
                    else {
                        manager.userTypes = data;
                        preloader.destroy();
                    }
                }).catch(function (err) {
                    preloader.changeLabel('Failed to get user types. An unknown error occurred. [' + data.error[0] + ']');
                });
        };
        manager.getBarangays = function () {
            var preloader = new Dialog.preloader('Getting Barangay List');
            serverSv.places.getBarangays()
                .then(function (response) {
                    var data = response.data;
                    if(data.error) preloader.changeLabel('Cannot get barangay list. ' + data.error[0]);
                    else {
                        manager.barangays = data;
                        preloader.destroy();
                    }
                }).catch(function () {
                    preloader.changeLabel('Cannot get barangay list. An unknown error occurred');
                });
        };
        manager.getDistrictsFromBarangays = function () {
            var ids = [];
            var districts = [];
            for(var i = 0; i < manager.barangays.length; i++){
                var brgy = manager.barangays[i];
                if(ids.indexOf(brgy.District.id) < 0){
                    ids.push(brgy.District.id);
                    districts.push(brgy.District);
                }
            }
            return districts;
        };
        manager.getBrangaysByDistrictId = function (id) {
            return manager.barangays.filter(function (brgy) {
                return id == brgy.District.id;
            });
        };
        manager.submitFormAsUpdate = function () {

        };
        manager.submitFormAsNew = function () {
            var preloader = new Dialog.preloader('Adding new user.');
            serverSv.request('/api/user/register', {
                method: 'post',
                data: manager.userForm
            }).then(function (response) {
                var data = response.data;
                if(data.error) Dialog.alert('Cannot Add User', data.error[0]);
                else {
                    Dialog.alert('User Added', 'User successfully registered.');
                    $('#userFormModal').modal('hide');
                }
            }).catch(function (err) {
                Dialog.alert('Cannot Add User', 'An unknown error occurred.');
            }).finally(function () {
                preloader.destroy();
            });
        };
        manager.addNewUser = function () {
            manager.addFormMode = true;
            manager.userForm = {
                username : '',
                type: 'ADMIN',
                firstname: '',
                middlename: '',
                lastname : '',
                district: manager.getDistrictsFromBarangays()[0].id,
                barangay: '',
                enabled: true
            };
            $('#userFormModal').modal('show');
        };
        manager.updateUser = function (index) {
            var user = manager.userList[index];
            manager.addFormMode = false;
            manager.userForm = angular.copy(user);
            manager.userForm.type = user.UserType.code;
            try{
                manager.userForm.district = user.Barangay.district;
                manager.userForm.barangay = user.Barangay.id;
            }
            catch (e){

            }
            $('#userFormModal').modal('show');
        };


        //initialization
        manager.loadMoreItems();
        manager.getUserTypes();
        manager.getBarangays();
    });