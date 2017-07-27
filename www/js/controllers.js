angular.module('starter.controllers', [])

/*import { AlertController } from 'ionic-angular';

export class MyPage {
  constructor(public alertCtrl: AlertController) {
  }

  showAlert() {
    let alert = this.alertCtrl.create({
      title: 'New Friend!',
      subTitle: 'Your friend, Obi wan Kenobi, just accepted your friend request!',
      buttons: ['OK']
    });
    alert.present();
  }
}*/

.controller('CitaCtrl', function($scope, $state, $stateParams, ClientesService, VehiculosService, ServiciosService, CitasService, ClienteID) {
  
    console.log("lkjjklj");
  $scope.isContenidoCargado = false;
  
  $scope.cliente = {};
  $scope.nameCliente = "";
  $scope.servicios = {};
  $scope.listaVehiculos = [];
  $scope.citaNueva = {};
  $scope.horaNueva = 0;
  $scope.serviceSelected = "";
  var param;
  var citaParam = $stateParams.citaID;
  
  
  $scope.init = function() {
    ServiciosService.getAll().then( function(value) {
      $scope.servicios = value;
    });
    console.log(citaParam);
  }

  setTimeout(function() {
    param = ClienteID.get();
    $scope.cargarCliente();
    $scope.$apply();
  }, 1500);
  
  $scope.cargarVehiculos = function() {
    VehiculosService.getAll($scope.cliente.fields.Cliente).then(function(value){
      $scope.listaVehiculos = value;
      $scope.isContenidoCargado = true;
      $scope.$apply();
    });
  }

  $scope.cargarCliente = function() {
    ClientesService.getById(param).then(function(value){
      $scope.cliente = value;
      $scope.citaNueva.Cliente = value;
      $scope.cargarVehiculos();
    });
  }

  $scope.cargarCitaNueva = function() {
      $scope.citaNueva = {};
  }

  $scope.crearHoras = function(){
      $scope.horas = [];
      for (var i = 7; i < 17; i++) {
          $scope.horas.push( {
            hora: i+':00',
            disponible: true
          });
          $scope.horas.push( {
            hora: i+':30',
            disponible: true
          });
      }
  }

  $scope.cargarHoras = function(pfecha) {
      CitasService.getByDate(pfecha).then(function(value){
          value.forEach(function(item, index){
              var fechaCompl = new Date(item.fields.Fecha);
              var hora = fechaCompl.getHours() +':'+ ('0'+fechaCompl.getMinutes()).slice(-2);
              var timeReq = $scope.getTiempoServicio(item.fields.Tipo[0]);
              $scope.setNoDisponible( hora, timeReq );
          });
          $scope.$apply();
      });
  }

  $scope.getTiempoServicio = function(tipo) {
      var tiempoRequerido = 0;
      
      $scope.servicios.forEach(function(item, index) {
          if(item.fields.Nombre === tipo) {
              tiempoRequerido = item.fields.EspaciosRequeridos;
              return;
          }
      });

      return tiempoRequerido;
  }

  $scope.setNoDisponible = function(hora, timeReq) {
      for (var i=0; i < $scope.horas.length; i++) {
          if ( $scope.horas[i].hora === hora ) {
              $scope.horas[i].disponible = false;
              if ( timeReq > 1) {
                  $scope.horas[i+1].disponible = false;
                  $scope.horas[i+2].disponible = false;
              }
          }
      }
  }

  $scope.cambioFecha = function(pfecha) {
      $scope.crearHoras();
      $scope.cargarHoras(pfecha);
  }

  $scope.agregarCita = function() {
    var horas = $scope.horaNueva.hora.split(':')[0];
    var minutos = $scope.horaNueva.hora.split(':')[1];
    /*if (param) {
        $scope.cita.fields.Fecha.setHours(horas,minutos,0,0);
        delete $scope.cita.fields.NombreCliente;
        delete $scope.cita.fields.DetalleVehiculo;
        delete $scope.cita.fields.Tipo;
        $scope.cita.fields.TipoServicio = [$scope.cita.fields.TipoServicio];
        $scope.cita.save();
        console.log('Cita guardada!');
    } else { */
        $scope.citaNueva.Fecha.setHours(horas,minutos,0,0);
        $scope.citaNueva.TipoServicio = $scope.serviceSelected;
        CitasService.add($scope.citaNueva).then(function(value){
          if (value.id) {
              console.log("Cita agregada con éxito");
          }
          console.log(value);
        });
    //}
    $state.go( '/tab-inicio' );
  }

  $scope.horaSelected = function(hora) {
    $scope.horaNueva = hora;
  }

  $scope.servicioSelected = function(service) {
    $scope.serviceSelected = service;
  }

  $scope.init();

}) // fin de CitaCtrl


.controller('InicioCtrl', function($scope, $state, $location, $window, ClientesService, CitasService, ClienteID) {
  console.log('entro');
  $scope.cliente = {};
  $scope.citas = [];
  var param;

  $scope.init = function() {
    if ( ClienteID.isSet() ) {
      param = ClienteID.get();
      $scope.cargarCliente();
    } else {
      console.log('No hay cliente ID');
    }
  }

  $scope.cargarCitas = function() {
    console.log($scope.cliente.fields.Cliente);
    CitasService.getAll($scope.cliente.fields.Cliente).then(function(value){
      value.forEach(function(item, index){
              item.fields.id = item.id;
        $scope.citas.push(item.fields);
      });
      $scope.$apply();
    });
  }

  $scope.cargarCliente = function() {
    ClientesService.getById(param).then(function(value){
      $scope.cliente = value;
      $scope.$apply();
      $scope.cargarCitas();
    });
  }

  $scope.editarCita = function(citaID) {
    //$state.go('tab.cita-editar');
    $state.transitionTo('tab.cita-editar', null, {reload: true, notify:true});

  }

  $scope.init();

}) // fin de InicioCtrl

.controller('ChatDetailCtrl', function($scope, $stateParams, ChatDetail) {
  $scope.chatdetail = chatdetail.get($stateParams.chatId);
})

.controller('ConfiguracionCtrl', function($scope, ClientesService, VehiculosService, ClienteID) {
  $scope.cliente = {};
  $scope.vehiculos = [];
  $scope.nuevoVehiculo = {};
  $scope.mostrarListaVehiculos = false;
  $scope.agregandoVehiculo = false;
  $scope.agregandoCliente = true;
  var param;
 
  $scope.init = function() {
    if ( ClienteID.isSet() ) {
      $scope.agregandoCliente = false;
      param = ClienteID.get();
      $scope.cargarCliente();
    } else {
      console.log('no hay cliente ID');
    }
  }

  $scope.add = function() {
    $scope.cliente.fields.FechaNacimiento.setHours(0,0,0,0);
    ClientesService.add($scope.cliente).then(function(value){
        if (value.id) {
            ClienteID.set(value.id);
            $scope.agregandoVehiculo = true;
            $scope.$apply();
            $scope.init();
        }
    });
  }

  $scope.cargarCliente = function() {
    ClientesService.getById(param).then(function(value){
      value.fields.FechaNacimiento = new Date(value.fields.FechaNacimiento);
      $scope.cliente = value;
      $scope.$apply();
      $scope.cargarVehiculos();
    });
  }

  $scope.addVehiculo = function() {
    $scope.nuevoVehiculo.clienteid = ClienteID.get();
    VehiculosService.add($scope.nuevoVehiculo).then(function(value){
        if (value.id) {
            $scope.nuevoVehiculo = {};
            $scope.cargarVehiculos();
            $scope.agregandoVehiculo = false;
        }
       $scope.$apply();
    });
    $scope.agregandoVehiculo = false;
    $scope.mostrarListaVehiculos = true;
  }

  $scope.cargarVehiculos = function() {
    VehiculosService.getAll($scope.cliente.fields.Cliente).then(function(value){
        $scope.vehiculos = value;
        if ( value.length > 0 ) {
          $scope.mostrarListaVehiculos = true;
        } else {
          $scope.mostrarListaVehiculos = false;
          $scope.agregandoVehiculo = true;
        }
        $scope.$apply();
    });
  }

  $scope.editar = function() {
    //$scope.cliente.fields.Fecha.setHours(horas,minutos,0,0);
    delete $scope.cliente.fields.Cliente;
    $scope.cliente.save();
    //$scope.$apply();
    //console.log($scope.cliente);
  }

  $scope.iniciarAgregarVehiculo = function() {
    $scope.agregandoVehiculo = true;
    $scope.mostrarListaVehiculos = false;
  }

  $scope.init();

}); // fin de ConfiguracionCtrl