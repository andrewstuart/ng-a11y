module.directive('a11yCaptureTab', function() {
    /**
    * @ngdoc directive
    * @name ng-a11y.directive:a11yCaptureTab
    * @param {Expression} captureImmediate If the expression value is truthy,
    * then upon the directive loading, focus will be triggered.
    * @param {Expression} forceCapture If the expression value is truthy, then 
    * each tab anywhere within the document will trigger a focus to the first
    * element.
    * @description When present on the page, the tabbable elements between
    * the selectors will have tab input captured.
    * @example
    * <example module="captureTab">
    *   <file name="example.html">
    *     <section>
    *       <header>Non-captured</header>
    *       <input id="one" type="text"></input>
    *     </section>
    *     <section a11y-capture-tab capture-immediate="true">
    *       <header>Captured</header>
    *       <input id="two" type="text"></input>
    *       <input id="three" type="number"></input>
    *       <button id="four" type="button">OK</button>
    *     </section>
    *   </file>
    *   <file name="example.js">
    *     angular.module('captureTab', ['ng-a11y']);
    *   </file>
    * </example>
    */
    return {
        link: function($scope, iEle, iAttrs) {
            var inputs, firstInput, lastInput, returnFocus;

            returnFocus = document.activeElement;

            getInputs();

            if ($scope.$eval(iAttrs.forceCapture)) {
                function captureTab(e) {
                    if (e.which === 9 && !iEle[0].contains(e.target)) {
                        e.preventDefault();
                        getInputs();
                        firstInput.focus();
                    }
                }

                document.body.addEventListener('keydown', captureTab, true);
                $scope.$on('$destroy', function() {
                    document.body.removeEventListener('keydown', captureTab);
                    returnFocus.focus();
                });
            }

            if ($scope.$eval(iAttrs.captureImmediate)) {
                // set focus on first input
                firstInput.focus();
            }

            iEle[0].addEventListener('keydown', function(e) {
                wrapIfNeeded(e);
            }, true);

            function getInputs() {
                inputs = iEle[0].querySelectorAll('select, input, textarea, button, a');

                if (inputs.filter) {
                    inputs = inputs.filter(':visible');
                }

                firstInput = inputs[0];
                lastInput = inputs[inputs.length - 1];
            }

            // https://stackoverflow.com/questions/14572084/keep-tabbing-within-modal-pane-only
            function wrapIfNeeded(e) {
                getInputs();

                if (lastInput === e.target && e.which === 9 && !e.shiftKey) {
                    e.preventDefault();
                    firstInput.focus();
                }
                if (firstInput === e.target && e.which === 9 && e.shiftKey) {
                    e.preventDefault();
                    lastInput.focus();
                }
            }
        }
    };
});
