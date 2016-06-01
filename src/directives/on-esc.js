module.directive('a11yEsc', function($window) {
    /**
     * @ngdoc directive
     * @name ngPortalApp.directive:onEsc
     * @param {Expression} onEsc An expression to execute once (and only
     * once) when the escape button is pressed.
     * @description Runs an expression on escape keyup.
     * @restrict CA
     */
    return {
        restrict: 'CA',
        scope: {
            onEsc: '&'
        },
        controller: function($scope) {
            function handleEsc(e) {
                if (e.keyCode === 27) {
                    $scope.$apply(function() {
                        // Call Handler
                        $scope.onEsc({$event: e});

                        // Remove self
                        $window.removeEventListener('keyup', handleEsc);
                    });
                }
            }

            $window.addEventListener('keyup', handleEsc, true);
        }
    };
});
