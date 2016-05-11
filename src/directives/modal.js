angular.module('uni', [])
.directive('modal', function($window, $document, $compile) {
    'use strict';
    /**
     * @ngdoc directive
     * @name uni.directive:modal
     * @restrict EA
     * @scope
     * @param {Boolean} shown Whether or not the modal dialog should be hidden
     * via the "hidden" class.  Implementation of this class is up to the
     * consumer.
     * @param {Function} [modalHide] An optional method to be called any time
     * the modal dialog is hidden by the user interacting with dialog-specific
     * elements (e.g. clicking the backdrop, or "esc" key)
     * @param {Function} [modalShow] An optional method to be called any time
     * the modal dialog is unhidden
     * @description Appends a global hider with class 'modal-hider' (you must
     * style it yourself, or use some preexisting style library; see example)
     * and shows the content inside the `<modal>` element.
     *
     * This modal module will be A11Y-compliant *if* you properly implement an
     * expression in the `modalHide` attribute which will cause `shown` to
     * evaluate to `false`.
     * @example
     * <example module="uni">
     *   <file name="example.css">
     *     .modal-hider {
     *       position: fixed;
     *       top: 0;
     *       bottom: 0;
     *       left: 0;
     *       right: 0;
     *       background-color: rgba(0, 0, 0, 0.5);
     *     }
     *
     *     .modal-content {
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
     *     <modal shown="show">
     *       <h1>Hello world!</h1>
     *     </modal>
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
        // transclude: 'element',
        transclude: true,
        restrict: 'EA',
        scope: {
            shown: '=',
            modalHide: '&?',
            modalShow: '&?'
        },
        compile: function compile() {
            var modalHider = angular.element('<div hidden="hidden" class="modal-hider"></div>');
            return {
                post: function link($scope, iEle, iAttrs, ctrl, transclude) {
                    iEle.remove();

                    var tmpl = angular.element(
                        '<div class="modal-content" tab-index="-1" on-esc="modalHide()" up-capture-tab></div>'
                    );

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
                     * @methodOf uni.directive:modal
                     * @name uni.directive:modal#hide
                     * @description `hide` is a method to hide the modal
                     */

                    $scope.hide = function() {
                        if (childScope) {
                            childScope.$destroy();
                        }

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
                        tmpl.append(transclude());

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
});
