(function() {
  var app = angular.module('demo', ['ui.bootstrap', 'ngStorage']);

  app.controller('SettingsCtrl', function($scope, $timeout, $sessionStorage) {
    $scope.settings = $sessionStorage.$default({
      layout: 'fixed',
      contentAlignment: 'center',
      overlay: {
        url: '../fe-creative/demo/skin/overlay.html',
        compatible: true,
        height: '75%',
        width: '800px',
        closeOnBackdropClick: true
      }
    });

    $scope.openOverlay = function(e) {
      /*if ($scope.base) {
        $scope.base.openOverlay($scope.settings.overlay);
      }*/
    };

    // $timeout(function() {
    //   var base = window.base = $scope.base = new FE.Base(angular.extend({
    //     adCallResponseUrl: '../fe-creative/demo/audi-a4/manifest.js?autoload',
    //   }, $scope.settings));
    //
    //   base.init();
    // }, 250);

    $scope.$watch('settings', function(settings, oldSettings) {
      switch (settings.layout) {
        case 'fixed':
          $timeout(function() {
            $scope.settings.contentWidth = angular.element('#page').outerWidth();
          });
          break;

        case 'fluid':
          settings.contentWidth = 0;
          break;
      }

      switch (settings.contentAlignment) {
        case 'center':
          $scope.pageStyles = {
            'margin-left': 'auto',
            'margin-right': 'auto'
          };
          break;

        case 'left':
          $scope.pageStyles = {
            'margin-left': 0,
            'margin-right': 0
          };
          break;
      }

      if (window.base && window.base._ad) {
        window.base._ad.set(settings);
      }
    }, true);
  });
})();
