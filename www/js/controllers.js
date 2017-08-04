angular.module('starter.controllers', [])

.controller('CitaCtrl', function($scope, $state, $stateParams, ClientesService, VehiculosService, ServiciosService, CitasService, ClienteID) {
  
  $scope.isContenidoCargado = false;
  
  $scope.cliente = {};
  $scope.nameCliente = "";
  $scope.servicios = {};
  $scope.listaVehiculos = [];
  $scope.citaNueva = {};
  $scope.cita = {};
  $scope.horaNueva;
  $scope.serviceSelected = "";
  $scope.editandoCita = false;
  var clienteIDstored;

  setTimeout(function() {
    if ( ClienteID.isSet() ) {
      clienteIDstored = ClienteID.get();
      $scope.cargarCliente();
      $scope.$apply();
      $scope.cargarServicios();
      if ( $stateParams.cita ) {
        $scope.cargarCita();
      } 
    } else {
      alert('Se deben ingresar datos de cliente!');
      $state.go('tab.configuracion');
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
    var fechaFormat = new Date();
    fechaFormat = new Date($scope.citaEditar.Fecha);
    $scope.citaEditar.Fecha = new Date($scope.citaEditar.Fecha);
    $scope.cambioFecha($scope.citaEditar.Fecha);
    $scope.HoraActual = fechaFormat.getHours() +':'+ ('0'+fechaFormat.getMinutes()).slice(-2);
    $scope.setDisponible( $scope.HoraActual, "1", true);
    $scope.$apply();
    $scope.horaNueva = $scope.getObjetoHora($scope.HoraActual);
    $scope.$apply();
    $scope.isContenidoCargado = true;
  }

  $scope.cargarObjetoCita = function() {
    CitasService.getById($scope.citaEditar.id).then(function(value) {
      $scope.cita = value;
    })
  }

  $scope.cargarVehiculos = function() {
    VehiculosService.getAll($scope.cliente.fields.Cliente).then(function(value){
      if ( value.length == 0 ) {
        alert('Aún no se han ingresado vehículos!\n\nIngrese su vehículo a continuación...');
        $state.go('tab.configuracion');
      }
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
              $scope.setDisponible( hora, timeReq, false );
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

  $scope.setDisponible = function(hora, timeReq, esta_disponible) {
      for (var i=0; i < $scope.horas.length; i++) {
          if ( $scope.horas[i].hora === hora && $scope.HoraActual != hora) {
              $scope.horas[i].disponible = esta_disponible;
              if ( timeReq > 1) {
                  $scope.horas[i+1].disponible = esta_disponible;
                  $scope.horas[i+2].disponible = esta_disponible;
              }
          }
      }
  }

  $scope.filtrarHoras = function(value) {
      return true;
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
    var fechaHoy = new Date();
    fechaHoy.setHours(0,0,0,0);
    var horas = $scope.horaNueva.hora.split(':')[0];
    var minutos = $scope.horaNueva.hora.split(':')[1];
    if ( $scope.citaEditar ) {
      if ( $scope.citaEditar.Fecha < fechaHoy ) {
        alert('No es posible solicitar una cita para una fecha anterior a la actual');
        return; 
      }
      
      delete $scope.cita.fields.NombreCliente;
      delete $scope.cita.fields.DetalleVehiculo;
      delete $scope.cita.fields.Tipo;
      delete $scope.cita.fields.placa;
      $scope.citaEditar.Fecha.setHours(horas,minutos,0,0);
      if ($scope.serviceSelected) {
        $scope.cita.fields.TipoServicio[0] = $scope.serviceSelected.id;
      } else {
        $scope.cita.fields.TipoServicio[0] = $scope.citaEditar.TipoServicio[0];
      }
      $scope.cita.fields.Comentarios = $scope.citaEditar.Comentarios;
      $scope.cita.fields.Fecha = $scope.citaEditar.Fecha;
      $scope.cita.save().then(function(value){
        if (value) {
          alert('Cita guardada!');  
        } else {
          console.log(value);
        }
      })
    } else {
      if ( $scope.citaNueva.Fecha < fechaHoy ) {
        alert('No es posible crear una cita para una fecha anterior a la actual');
        return;
      }
      $scope.citaNueva.Fecha.setHours(horas,minutos,0,0);
      $scope.citaNueva.TipoServicio = $scope.serviceSelected;
      CitasService.add($scope.citaNueva).then(function(value){
        if (value.id) {
            alert("Nueva cita guardada con éxito!");
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
      alert('Se deben ingresar datos de cliente!');
      $state.go('tab.configuracion');
    }
  }

  $scope.cargarCitas = function() {
    CitasService.getTodayByCliente($scope.cliente.fields.Cliente)
    .then(function(value){
      if ( value.length == 0 ) {
        alert('Aún no se han agendado citas!\n\nIngrese su cita a continuación...');
        $state.go('tab.cita-crear');
      }
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


.controller('ConfiguracionCtrl', function($scope, $state, ClientesService, VehiculosService, ClienteID) {
  $scope.cliente = {};
  $scope.vehiculos = [];
  $scope.nuevoVehiculo = {};
  $scope.mostrarListaVehiculos = false;
  $scope.agregandoVehiculo = false;
  $scope.agregandoCliente = true;
  var clienteIDstored;
  $scope.nameRegex = '[A-ZÑÁÉÍÓÚ][a-zA-ZñÑáéíóúÁÉÍÓÚ\\s\'.-]{2,}';
  $scope.telRegex = '\\+*[\\d-\\s]{8,}';

  $scope.init = function() {
    if ( ClienteID.isSet() ) {
      $scope.agregandoCliente = false;
      clienteIDstored = ClienteID.get();
      $scope.cargarCliente();
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
    delete $scope.cliente.fields.Cliente;
    $scope.cliente.save().then(function(value){
      if (value) {
        alert('Cliente actualizado!');
      } else {
        console.log(value);
      }
    })
  }

  $scope.iniciarAgregarVehiculo = function() {
    $scope.agregandoVehiculo = true;
    $scope.mostrarListaVehiculos = false;
  }

  $scope.init();

}); // fin de ConfiguracionCtrl