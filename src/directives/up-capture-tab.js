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
