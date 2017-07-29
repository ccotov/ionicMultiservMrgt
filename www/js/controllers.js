angular.module('starter.controllers', [])

.controller('CitaCtrl', function($scope, $state, $stateParams, ClientesService, VehiculosService, ServiciosService, CitasService, ClienteID) {
  
  $scope.isContenidoCargado = false;
  
  $scope.cliente = {};
  $scope.nameCliente = "";
  $scope.servicios = {};
  $scope.listaVehiculos = [];
  $scope.citaNueva = {};
  $scope.cita = {};
  $scope.horaNueva = 0;
  $scope.serviceSelected = "";
  $scope.editandoCita = false;
  var clienteIDstored;

  setTimeout(function() {
    clienteIDstored = ClienteID.get();
    $scope.cargarCliente();
    $scope.$apply();
    $scope.cargarServicios();
    if ( $stateParams.cita ) {
      $scope.cargarCita();
      //$scope.servicioSelected($scope.editCitaServicio);
      console.log($scope.citaEditar);
    }
  }, 1500);
  
  $scope.cargarServicios = function() {
    ServiciosService.getAll().then( function(value) {
      $scope.servicios = value;
      if ( $scope.citaEditar ) {
        value.forEach(function(item, index){
          if ( item.fields.Nombre == $scope.citaEditar.Tipo[0] ) {
            $scope.editCitaServicio = item;
            $scope.servicioSelected(item);
          }
        })
      } 
    });
  }

  $scope.cargarCita = function() {
    $scope.citaEditar = $stateParams.cita;
    $scope.cargarObjetoCita();
    $scope.editandoCita = true;
    $scope.cargarServicios();
    $scope.editCitaComentarios = $scope.citaEditar.Comentarios;
    var fechaFormat = new Date($scope.citaEditar.Fecha);
    $scope.citaEditar.Fecha = new Date($scope.citaEditar.Fecha);
    $scope.cambioFecha($scope.citaEditar.Fecha);
    $scope.HoraActual = fechaFormat.getHours() +':'+ ('0'+fechaFormat.getMinutes()).slice(-2);
    $scope.horaNueva = $scope.getObjetoHora($scope.HoraActual);
    $scope.isContenidoCargado = true;
  }

  $scope.cargarObjetoCita = function() {
    CitasService.getById($scope.citaEditar.id).then(function(value) {
      $scope.cita = value;
    })
  }

  $scope.cargarVehiculos = function() {
    VehiculosService.getAll($scope.cliente.fields.Cliente).then(function(value){
      $scope.listaVehiculos = value;
      $scope.isContenidoCargado = true;
      $scope.$apply();
    });
  }

  $scope.cargarCliente = function() {
    ClientesService.getById(clienteIDstored).then(function(value){
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

  $scope.getObjetoHora = function(hora) {
      for (var i=0; i < $scope.horas.length; i++) {
          if ( $scope.horas[i].hora === hora ) {
              return $scope.horas[i];
          }
      }
  }

  $scope.cambioFecha = function(pfecha) {
      $scope.crearHoras();
      $scope.cargarHoras(pfecha);
  }

  $scope.guardarCita = function() {
    var horas = $scope.horaNueva.hora.split(':')[0];
    var minutos = $scope.horaNueva.hora.split(':')[1];
    $scope.citaEditar.Fecha.setHours(horas,minutos,0,0);
    if ( $scope.citaEditar ) {
        delete $scope.cita.fields.NombreCliente;
        delete $scope.cita.fields.DetalleVehiculo;
        delete $scope.cita.fields.Tipo;
        $scope.cita.fields.TipoServicio[0] = $scope.citaEditar.TipoServicio[0];
        $scope.cita.fields.Comentarios = $scope.citaEditar.Comentarios;
        $scope.cita.fields.Fecha = $scope.citaEditar.Fecha;
        console.log($scope.cita);
        $scope.cita.save().then(function(value){
          if (value) {
            alert('Cita guardada!');  
          } else {
            console.log(value);
          }
        })
        
    } else { 
        $scope.citaNueva.Fecha.setHours(horas,minutos,0,0);
        $scope.citaNueva.TipoServicio = $scope.serviceSelected;
        CitasService.add($scope.citaNueva).then(function(value){
          if (value.id) {
              console.log("Cita agregada con éxito");
          }
          console.log(value);
        });
    }
    $state.go( 'tab.inicio' );
  }

  $scope.horaSelected = function(hora) {
    $scope.horaNueva = hora;
  }

  $scope.servicioSelected = function(service) {
    $scope.serviceSelected = service;
  }

}) // fin de CitaCtrl


.controller('InicioCtrl', function($scope, $state, $location, $window, ClientesService, CitasService, ClienteID) {
  
  $scope.cliente = {};
  $scope.citas = [];
  var clienteIDstored;

  $scope.init = function() {
    if ( ClienteID.isSet() ) {
      clienteIDstored = ClienteID.get();
      $scope.cargarCliente();
    } else {
      console.log('No hay cliente ID');
    }
  }

  $scope.cargarCitas = function() {
    CitasService.getAll($scope.cliente.fields.Cliente).then(function(value){
      value.forEach(function(item, index){
              item.fields.id = item.id;
        $scope.citas.push(item.fields);
      });
      $scope.$apply();
    });
  }

  $scope.cargarCliente = function() {
    ClientesService.getById(clienteIDstored).then(function(value){
      $scope.cliente = value;
      $scope.$apply();
      $scope.cargarCitas();
    });
  }

  $scope.editarCita = function(cita) {
    $state.go('tab.cita-editar', { 'cita':cita });
  }

  $scope.init();

}) // fin de InicioCtrl

.controller('ChatDetailCtrl', function($scope, $stateParams, ChatDetail) {
  $scope.chatdetail = chatdetail.get($stateParams.chatId);
})

.controller('ConfiguracionCtrl', function($scope, $state, ClientesService, VehiculosService, ClienteID) {
  $scope.cliente = {};
  $scope.vehiculos = [];
  $scope.nuevoVehiculo = {};
  $scope.mostrarListaVehiculos = false;
  $scope.agregandoVehiculo = false;
  $scope.agregandoCliente = true;
  var clienteIDstored;

  $scope.init = function() {
    if ( ClienteID.isSet() ) {
      $scope.agregandoCliente = false;
      clienteIDstored = ClienteID.get();
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
    ClientesService.getById(clienteIDstored).then(function(value){
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