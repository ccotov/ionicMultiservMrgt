// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.constant('AIRTABLE_KEY', 'keycS5NvHoRLPCVdl')

.run(function($ionicPlatform, $rootScope, ServiciosService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    ServiciosService.getAll().then(function(value) {
      $rootScope.LISTA_SERVICIOS = value;
    });

  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.cita-crear', {
  url: '/cita/crear',
    views: {
      'tab-cita-crear': {
        templateUrl: 'templates/tab-cita.html',
        controller: 'CitaCtrl'
      }
    }
  })

  .state('tab.cita-editar', {
    url: '/cita/editar',
    views: {
      'tab-cita-editar': {
        templateUrl: 'templates/tab-cita.html',
        controller: 'CitaCtrl'
      }
    },
    params: {'cita':''}
  })

  .state('tab.inicio', {
      url: '/inicio',
      views: {
        'tab-inicio': {
          templateUrl: 'templates/tab-inicio.html',
          controller: 'InicioCtrl'
        }
      }
    })

  .state('tab.chat-detail', {
    url: '/chats/:chatId',
    views: {
      'tab-chats': {
        templateUrl: 'templates/chat-detail.html',
        controller: 'ChatDetailCtrl'
      }
    }
  })

  .state('tab.configuracion', {
    url: '/configuracion',
    views: {
      'tab-configuracion': {
        templateUrl: 'templates/tab-configuracion.html',
        controller: 'ConfiguracionCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/nosirve');

  $ionicConfigProvider.views.maxCache(0);
});
