'use strict';

describe('Controller: ImportCtrl', function () {

  // load the controller's module
  beforeEach(module('wcagReporterApp'));

  var ImportCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ImportCtrl = $controller('ImportCtrl', {
      $scope: scope
    });
  }));
});
