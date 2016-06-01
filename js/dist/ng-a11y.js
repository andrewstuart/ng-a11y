(function(module) {

module.directive('a11yModal', ["$window", "$document", "$compile", function($window, $document, $compile) {
    'use strict';
    /**
     * @ngdoc directive
     * @name ng-a11y.directive:a11yModal
     * @restrict EA
     * @scope
     * @param {Boolean} shown Whether or not the a11yModal dialog should be hidden
     * via the "hidden" class.  Implementation of this class is up to the
     * consumer.
     * @param {Function} [modalHide] An optional method to be called any time
     * the a11yModal dialog is hidden by the user interacting with dialog-specific
     * elements (e.g. clicking the backdrop, or "esc" key)
     * @param {Function} [modalShow] An optional method to be called any time
     * the a11yModal dialog is unhidden
     * @description Appends a global hider with class 'a11yModal-hider' (you must
     * style it yourself, or use some preexisting style library; see example)
     * and shows the content inside the `<a11yModal>` element.
     *
     * This a11yModal module will be A11Y-compliant *if* you properly implement an
     * expression in the `modalHide` attribute which will cause `shown` to
     * evaluate to `false`.
     * @example
     * <example module="ng-a11y">
     *   <file name="example.css">
     *     .a11yModal-hider {
     *       position: fixed;
     *       top: 0;
     *       bottom: 0;
     *       left: 0;
     *       right: 0;
     *       background-color: rgba(0, 0, 0, 0.5);
     *     }
     *
     *     .a11yModal-content {
     *       position: fixed;
     *       height: 10em;
     *       width: 20em;
     *       top: calc(50% - 5em);
     *       left: calc(50% - 10em);
     *       background-color: white;
     *       z-index: 1;
     *       text-align: center;
     *       vertical-align: center;
     *     }
     *   </file>
     *   <file name="example.html">
     *     <button ng-click="show = !show">Toggle</button>
     *     <a11y-modal modal-hide="show = !show" shown="show">
     *       <h1>Hello world!</h1>
     *     </a11y-modal>
     * 	 </file>
     * </example>
     */

    function setAria(ele, shown) {
        if (ele instanceof angular.element && ele[0]) {
            ele = ele[0];
        }
        if (!(ele.classList && ele.setAttribute && ele.removeAttribute)) {
            return;
        }
        if (shown) {
            ele.removeAttribute('aria-hidden');
        } else {
            ele.setAttribute('aria-hidden', 'hidden');
        }
    }

    function setVisibility(ele, shown) {
        if (ele instanceof angular.element && ele[0]) {
            ele = ele[0];
        }

        if (!(ele.classList && ele.setAttribute && ele.removeAttribute)) {
            return;
        }

        setAria(ele, shown);
        if (shown) {
            ele.removeAttribute('hidden');
            ele.classList.remove('hidden');
        } else {
            ele.setAttribute('hidden', 'hidden');
            ele.classList.add('hidden');
        }
    }

    return {
        transclude: true,
        restrict: 'EA',
        scope: {
            shown: '=',
            modalHide: '&?',
            modalShow: '&?',
            modalClass: '&?',
            modalId: '&?'
        },
        compile: function compile() {
            var modalHider = angular.element('<div hidden="hidden" class="a11yModal-hider"></div>');
            return {
                post: function link($scope, iEle, iAttrs, ctrl, transclude) {
                    iEle.remove();

                    var tmpl = angular.element(
                        '<div class="a11yModal-content" tab-index="-1" on-esc="modalHide()" up-capture-tab></div>'
                    );

                    if($scope.modalId) {
                        tmpl.attr('id', $scope.modalId);
                    }
                    if($scope.modalClass) {
                        tmpl.attr('class', 'a11yModal-content ' + $scope.modalClass());
                    }

                    modalHider.on('click', function(e) {
                        if (e.target !== modalHider) {
                            return;
                        }
                        if ($scope.modalHide) {
                            $scope.modalHide();
                        }
                    });

                    var childScope;

                    /**
                     * @ngdoc
                     * @methodOf ng-a11y.directive:a11yModal
                     * @name ng-a11y.directive:a11yModal#hide
                     * @description `hide` is a method to hide the a11yModal
                     */

                    $scope.hide = function() {
                        if (childScope) {
                            childScope.$destroy();
                        }

                        tmpl.empty();
                        modalHider.empty();
                        modalHider.detach();

                        // Show all elements at root again
                        $document.find('body').children().each(function(i, ele) {
                            setAria(ele, true);
                        });
                        setVisibility(modalHider, false);
                    };

                    $scope.show = function() {
                        childScope = $scope.$new();

                        // Hide all elements at root
                        $document.find('body').children().each(function(i, ele) {
                            setAria(ele, false);
                        });

                        $document.find('body').append(modalHider);
                        modalHider.append(tmpl);

                        // This must be done inside the transclusion callback
                        // for some reason. Otherwise in some cases it starts
                        // repeating elements.
                        transclude(function(e) {
                            tmpl.append(e);
                        });

                        setVisibility(modalHider, true);

                        $compile(tmpl)(childScope);

                        if ($scope.modalShow) {
                            $scope.modalShow();
                        }
                    };

                    $scope.$watch('shown', function(shown) {
                        if (shown) {
                            $scope.show();
                        } else {
                            $scope.hide();
                        }
                    });
                }
            };
        }
    };
}]);

module.directive('a11yEsc', ["$window", function($window) {
    /**
     * @ngdoc directive
     * @name ng-a11y.directive:onEsc
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
        controller: ["$scope", function($scope) {
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
        }]
    };
}]);

module.directive('a11yCaptureTab', function() {
    /**
    * @ngdoc directive
    * @name ng-a11y.directive:upCaptureTab
    * @description When present on the page, the tabbable elements between
    * the selectors will have tab input captured.
    */
    return {
        link: function($scope, iEle) {
            var inputs, firstInput, lastInput, returnFocus;

            returnFocus = angular.element(document.activeElement);

            getInputs();

            function captureTab(e) {
                if (e.which === 9 && !iEle[0].contains(e.target)) {
                    getInputs();
                    firstInput.focus();
                }
            }

            document.body.addEventListener('keydown', captureTab, true);
            $scope.$on('$destroy', function() {
                document.body.removeEventListener('keydown', captureTab);
                returnFocus.focus();
            });

            // set focus on first input
            firstInput.focus();

            iEle[0].addEventListener('keydown', function(e) {
                wrapIfNeeded(e);
            }, true);

            function getInputs() {
                inputs = iEle.find('select, input, textarea, button, a');

                if (inputs.filter) {
                    inputs = inputs.filter(':visible');
                }

                firstInput = inputs.first();
                lastInput = inputs.last();
            }

            // https://stackoverflow.com/questions/14572084/keep-tabbing-within-modal-pane-only
            function wrapIfNeeded(e) {
                getInputs();

                if (lastInput[0] === e.target && e.which === 9 && !e.shiftKey) {
                    e.preventDefault();
                    firstInput.focus();
                }
                if (firstInput[0] === e.target && e.which === 9 && e.shiftKey) {
                    e.preventDefault();
                    lastInput.focus();
                }
            }
        }
    };
});

module.directive('withService', ["$injector", function($injector) {
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
}]);

})(angular.module('ng-a11y', []));
