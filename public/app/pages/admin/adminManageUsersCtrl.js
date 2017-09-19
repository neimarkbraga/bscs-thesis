angular.module('adminCtrls')
    .controller('adminManageUsersCtrl', function (serverSv) {
        var manager = this;

        //properties
        manager.userList = [];
        manager.userTypes = [];
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
                        manager.userTypes = [];
                        preloader.destroy();
                    }
                }).catch(function (err) {
                    preloader.changeLabel('Failed to get user types. An unknown error occurred. [' + data.error[0] + ']');
                });
        };

        //initialization
        manager.loadMoreItems();
        manager.getUserTypes();
    });