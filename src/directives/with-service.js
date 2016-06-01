module.directive('withService', function($injector) {
    /**
     * @ngdoc directive
     * @name ng-a11y.directive:withService
     * @param {String} withService The name of the service to inject. May be
     * an expression "X as Y" in which case the X service will be exposed by
     * the name Y.
     * @description Injects a service into a new scope the DOM element.
     * @scope
     * @restrict A
     * @example
     * <example module="withServiceExample">
     *   <file name="example.js">
     *     angular.module('withServiceExample', ['ng-a11y'])
     *       .service('ExampleService', function() {
     *         this.foo = 'foo';
     *       }).service('ExampleServiceTwo', function() {
     *         this.bar = 'bar';
     *         this.baz = 'baz';
     *       });
     *   </file>
     *   <file name="example.html">
     *     <div>
     *       <div with-service="ExampleService">
     *         ExampleService.foo: {{ExampleService.foo}}
     *       </div>
     *       <div with-service="ExampleServiceTwo as es">
     *         Now ExampleServiceTwo is aliased to es. es.bar: {{es.bar}}.
     *       </div>
     *       <div with-service="{es: 'ExampleService', es2: 'ExampleServiceTwo'}">
     *         You can name multiple services too. es.foo: {{es.foo}}, es2.bar: {{es2.bar}}, es2.baz: {{es2.baz}}.
     *       </div>
     *     </div>
     * 	 </file>
     * </example>
     */
    return {
        restrict: 'A',
        scope: true,
        link: function($scope, iEle, iAttrs) {
            // Quick lodash/underscore polyfill
            var forEach = (typeof _ !== 'undefined') ? _.forEach : function(obj, cb) {
                Object.keys(obj).forEach(function(k) {
                    cb(obj[k], k);
                });
            };

            if (!iAttrs.withService) {
                return;
            }

            if (iAttrs.withService.trim()[0] === '{') {
                var kvPairs = $scope.$eval(iAttrs.withService);

                forEach(kvPairs, function(v, k) {
                    $scope[k] = $injector.get(v);
                });
                return;
            } else if (iAttrs.withService.trim()[0] === '[') {
                forEach($scope.$eval(iAttrs.withService), function(srv) {
                    $scope[srv] = $injector.get(srv);
                });
                return;
            }

            var names = iAttrs.withService.split(' as ');

            var srv = $injector.get(names[0]);
            if (srv) {
                $scope[names[1] || names[0]] = srv;
            }
        }
    };
});
