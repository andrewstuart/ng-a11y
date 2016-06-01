module.directive('a11yModal', function($window, $document, $compile) {
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
     *     <button ng-click="x.show = !x.show">Toggle</button>
     *     <a11y-modal modal-hide="x.show = !x.show" shown="x.show">
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
                        '<div class="a11yModal-content" tab-index="-1" a11y-esc="modalHide()" a11y-capture-tab></div>'
                    );

                    if($scope.modalId) {
                        tmpl.attr('id', $scope.modalId);
                    }
                    if($scope.modalClass) {
                        tmpl.attr('class', 'a11yModal-content ' + $scope.modalClass());
                    }


                    function handleClickEvents(e) {
                        if (e.target !== modalHider[0]) {
                            return;
                        }
                        e.preventDefault();
                        e.stopPropagation();

                        if ($scope.modalHide) {
                            $scope.modalHide();
                        }
                        modalHider[0].removeEventListener('click', handleClickEvents);
                        $scope.$apply();
                    }

                    $scope.$on('$destroy', function() {
                        modalHider[0].removeEventListener('click', handleClickEvents);
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
                        angular.forEach($document.find('body').children(), function(ele) {
                            setAria(ele, true);
                        });
                        setVisibility(modalHider, false);
                    };

                    $scope.show = function() {
                        childScope = $scope.$new();

                        // Hide all elements at root
                        angular.forEach($document.find('body').children(), function(ele) {
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

                        modalHider[0].addEventListener('click', handleClickEvents);
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
});
