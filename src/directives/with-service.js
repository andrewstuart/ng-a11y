angular.module('ngPortalApp')
.directive('upWithService', function($injector) {
    /**
     * @ngdoc directive
     * @name ngPortalApp.directive:upWithService
     * @param {String} upWithService The name of the service to inject. May be
     * an expression "X as Y" in which case the X service will be exposed by
     * the name Y.
     * @description Injects a service into a new scope the DOM element.
     * @scope
     * @restrict A
     * @example
     * <example module="upWithServiceExample">
     *   <file name="example.js">
     *     angular.module('upWithServiceExample', ['ngPortalApp'])
     *       .service('ExampleService', function() {
     *         this.foo = 'bar';
     *       });
     *   </file>
     *   <file name="example.html">
     *     <div up-with-service="ExampleService">
     *       ExampleService value of foo is: {{ExampleService.foo}}
     *     </div>
     * 	 </file>
     * </example>
     */
    return {
        restrict: 'A',
        scope: true,
        link: function($scope, iEle, iAttrs) {
            if ( !iAttrs.upWithService ) { return; }

            if ( iAttrs.upWithService.trim()[0] === '{' ) {
                var kvPairs = $scope.$eval(iAttrs.upWithService);

                _.forEach(kvPairs, function(v, k) {
                    $scope[k] = $injector.get(v);
                });

                return;
            } else if ( iAttrs.upWithService.trim()[0] === '[' ) {
                _.forEach($scope.$eval(iAttrs.upWithService), function(srv) {
                    $scope[srv] = $injector.get(srv);
                });
                return;
            } else {
                var names = iAttrs.upWithService.split(' as ');

                var srv = $injector.get(names[0]);
                if (srv) {
                    $scope[names[1] || names[0]] = srv;
                }
            }
        }
    };
});
