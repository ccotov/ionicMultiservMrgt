angular.module('starter.services', [])

.service('AirtableService', function(AIRTABLE_KEY) {
  var Airtable = require('airtable');
  Airtable.configure({
      endpointUrl: 'https://api.airtable.com',
      apiKey: AIRTABLE_KEY
  });
    
    this.getBase = function() {
    return Airtable.base('appNGQ13vgGhLtMNq')
    };
})

.factory('ClienteID', function() {
  return {
    get: function() {
      return window.localStorage['clienteID'];
    },
    set: function(id) {
      window.localStorage['clienteID'] = id;
    },
    isSet: function(id) {
      return window.localStorage['clienteID'] ? true : false;
    }
  }
})

.service('VehiculosService', ['AirtableService', function(AirtableService) {

    this.getAll = function(cliente) {
        
        var base = AirtableService.getBase();
        
        return base('Vehiculos').select({
            view: 'Grid view',
            filterByFormula: '({Clientes} = "'+cliente+'")'
        }).all();
    };

    this.add = function(vehiculo) {

        var base = AirtableService.getBase();

        return base('Vehiculos').create({
            "Clientes": [vehiculo.clienteid],
            "Modelo": vehiculo.Modelo,
            "Marca": vehiculo.Marca,
            "Anno": vehiculo.Anno,
            "FrecuenciaCambioAceite": vehiculo.FrecuenciaCambioAceite,
            "Placa": vehiculo.Placa
        });
    }
}])

.service('ClientesService', ['AirtableService', function(AirtableService) {

    this.getAll = function() {
    
    var base = AirtableService.getBase();
    
    return base('Clientes').select({
      view: 'Grid view'
    }).all();
    };


    this.getById = function (id) {
        
        var base = AirtableService.getBase();
        
        return base('Clientes').find(id);
    }


    this.delete = function(cliente) {

        var base = AirtableService.getBase();
        
        return base('Clientes').destroy(cliente, function (err, deletedCliente) {
            if (err) { console.error(err); return; }
                console.log('Deleted cliente', deletedCliente.id);
        });
    };


    this.add = function(cliente) {

        var base = AirtableService.getBase();

        return base('Clientes').create({
            "Nombre": cliente.fields.Nombre,
            "Email": cliente.fields.Email,
            "FechaNacimiento": cliente.fields.FechaNacimiento,
            "Telefono": cliente.fields.Telefono
        });
    }

}]) // fin de Clientes Service

.service('CitasService', ['AirtableService', function(AirtableService) {
    
    this.getAll = function(cliente) {
    
        var base = AirtableService.getBase();
        
        return base('Citas').select({
          view: 'Grid view',
          filterByFormula: '({Cliente} = "'+cliente+'")'
        }).all();
    };

    this.getByDate = function (fecha) {

        var base = AirtableService.getBase();

        var date = (new Date(fecha)).toISOString().split('T')[0];

        return base('Citas').select({
            view: 'Grid view',
            filterByFormula: '({Fecha} > "'+date+'T00:00:00.000Z" & {Fecha} < "'+date+'T23:59:00.000Z" )'
        }).all();
    }

    this.getById = function (id) {
        
        var base = AirtableService.getBase();
        
        return base('Citas').find(id);
    }

    this.borrar = function(cita) {

        var base = AirtableService.getBase();
        
        return base('Citas').destroy(cita);
    };

    this.add = function(cita) {
        console.log(cita);

        var base = AirtableService.getBase();

        return base('Citas').create({
            "Fecha": cita.Fecha,
            "Comentarios": cita.Comentarios,
            "Cliente": [cita.Cliente.id],
            "Vehiculo": [cita.Vehiculo.id],
            "TipoServicio": [cita.TipoServicio.id]
        });
    };

}]) // fin de Citas Service

.service('ServiciosService', ['AirtableService', function(AirtableService) {
    this.getAll = function() {
        
        if ( window.localStorage['servicios'] ) {
            return ( new Promise ( function( resolve, reject ) {
                resolve ( JSON.parse(window.localStorage['servicios']) );
            }));
        
        } else {
                console.log("airtable");
            var base = AirtableService.getBase();
            var prom = base('Servicios').select({
            }).all();
            prom.then( function(value) {
                window.localStorage['servicios'] = JSON.stringify(value);
            });
            return prom;
        }
    };

    

}]); // fin de Servicios Service



