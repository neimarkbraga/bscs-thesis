angular.module('eventDirectives', [])
    .directive('onScrollToBottom', function ($document) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var doc = angular.element($document)[0].body;
                var footer = document.getElementsByTagName('footer')[0];
                $document.bind("scroll", function () {
                    if (doc.scrollTop + doc.offsetHeight >= (doc.scrollHeight - footer.clientHeight)) scope.$apply(attrs.onScrollToBottom);
                });
            }
        };
    });