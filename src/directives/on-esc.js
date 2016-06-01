module.directive('a11yEsc', function($window) {
    /**
     * @ngdoc directive
     * @name ng-a11y.directive:a11yEsc
     * @param {Expression} a11yEsc An expression to execute once (and only
     * once) when the escape button is pressed.
     * @description Runs an expression on escape keyup.
     * @restrict CA
     */
    return {
        restrict: 'CA',
        scope: {
            a11yEsc: '&'
        },
        controller: function($scope) {
            function handleEsc(e) {
                if (e.keyCode === 27) {
                    $scope.$apply(function() {
                        // Call Handler
                        $scope.a11yEsc({$event: e});

                        // Remove self
                        $window.removeEventListener('keyup', handleEsc, true);
                    });
                }
            }

            $window.addEventListener('keyup', handleEsc, true);

            $scope.$on('$destroy', function() {
                $window.removeEventListener('keyup', handleEsc, true);
            });
        }
    };
});
