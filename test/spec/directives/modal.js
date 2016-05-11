describe('modal dialog', function() {
    // Setup
    beforeEach(module('ngPortalApp'));

    var $rootScope, $compile, $window;

    beforeEach(inject(function($injector) {
        $rootScope = $injector.get('$rootScope');
        $compile = $injector.get('$compile');
        $window = $injector.get('$window');
    }));

    // Tests
});
