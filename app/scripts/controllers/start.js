'use strict';

angular.module('wcagReporter')
.controller('StartCtrl', function ($scope, $location, appState) {
  	$scope.state = appState.moveToState('start');
  	

    $scope.nextStep = function () {
        $location.path('/audit/scope');
    };
    
    $scope.nextStepName = 'STEP_SCOPE';
    
});
