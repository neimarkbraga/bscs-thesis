angular.module('eventDirectives', [])
    .directive('onScrollToWindowBottom', function ($document) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var reachedBottomOfDiv = function () {
                    var elementHeight = $(element).offset().top + $(element).outerHeight();
                    var bodyScrollHeight = $(window).scrollTop() + $(window).outerHeight();
                    return bodyScrollHeight >= elementHeight;
                };
                $document.bind("scroll", function () {if(reachedBottomOfDiv()) scope.$apply(attrs.onScrollToWindowBottom);});
                setTimeout(function () {if(reachedBottomOfDiv()) scope.$apply(attrs.onScrollToWindowBottom);});
            }
        };
    })
    .directive('onScrollToBottom', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var childHeight = function (el) {
                    var total = 0;
                    var children = $(el).children();
                    for(var i = 0; i < children.length; i++) total += $(children[i]).outerHeight();
                    return total;
                };
                var reachedBottomOfDiv = function () {
                    var totalHeight = childHeight(element);
                    var bottomScroll = ($(element).scrollTop() + $(element).height()) + 5;
                    return bottomScroll >= totalHeight;
                };
                element.bind("scroll", function () {if(reachedBottomOfDiv()) scope.$apply(attrs.onScrollToBottom);});
                setTimeout(function () {if(reachedBottomOfDiv()) scope.$apply(attrs.onScrollToBottom);});
            }
        };
    });