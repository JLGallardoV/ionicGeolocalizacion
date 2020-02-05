//VARIABLE GLOBALES
var map; //representa el mapa
var arregloMarkers = []; //almacena los markers de esta practica
var marker;
var id = 0; //representa un id autoincrementable para cada marker
var pos;//representa la posición actual
var arregloPuntos = [];

//INICIO - FUNCION PARA INICIALIZAR EL MAPA
function initMap() {
  console.log("maps3");
  /*declaramos varibales globales ya que por el tiempo en que se ejecuta la app en angular si añadimos variables globales,
  estas pasan indefinidas por tal motivo las pongo en las funciones para asegurarnos de que los elementos ligados a las variables existen*/
  var directionsService = new google.maps.DirectionsService();
  var directionsRenderer = new google.maps.DirectionsRenderer();
  var inputDestino = document.getElementById('idDestino');//representa la ruta y
  var selectTransporte = document.getElementById('mode'); //representa el medio de transaporte

  //obtenemos mi ubicacion mediante geolocalizacion
  let miUbicacion = activarGeolocalizacion();
  //manipulacion del DOM para mostrar el mapa
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15, //nivel de zoom
    center: miUbicacion
  });

  //autocompletando inputs (invocando funcion)
  autocompletarInputs();
  //en su momento permite que se muestre la ruta entre el punto a y el punto b
  directionsRenderer.setMap(map);

  //FUNCION PARA DETECTAR Y MANIPULAR LOS CAMBIOS HECHOS POR LA FUNCION INVOCADA EN LOS INPUTS
  var onChangeHandler = function() {
    calculateAndDisplayRoute(directionsService, directionsRenderer);
  }


  directionsRenderer.setMap(map);
  directionsRenderer.setPanel(document.getElementById('right-panel'));

  var control = document.getElementById('floating-panel');
  control.style.display = 'block';
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);

  //invocamos la funcion onChangeHandler al momento de detectar un cambio en los inputs
  inputDestino.addEventListener('change', onChangeHandler);
  selectTransporte.addEventListener('change', onChangeHandler);


  }//FIN - FUNCION PARA INICIALIZAR EL MAPA


  //FUNCION PARA AGREGAR MARCADORES AL MAPA
  function addMarker(location, map) {
    id++;
    var icono ='../assets/icon/carIcon.svg';
    marker = new google.maps.Marker({
      id: id,
      position: location, //posicion del marker
      map: map, //en el mapa en uso
      //animation: google.maps.Animation.DROP,
      draggable: true,
      icon:icono
    });
    arregloMarkers.push(marker); //agregamos los markers a un arreglo para poder manipularlos posteriormente
    console.log("longitud del arreglo contenedor de markers: ", arregloMarkers.length);
  }


  //FUNCION PARA AUTOCOMPLETAR LOS INPUTS
  function autocompletarInputs(){
    //destino
    var autocompleteDestino = new google.maps.places.Autocomplete(document.getElementById('idDestino'));
    autocompleteDestino.bindTo('bounds', map);//restringe los resultados, los hace mas locales
    autocompleteDestino.setFields(['address_components', 'geometry', 'icon', 'name']);//establece los campos que se van a ver en los detalles del lugar
  }


  //FUNCION PARA TRAZAR UNA RUTA SEGUN UN PUNTO x Y UN PUNTO y DONDE PUNTO x ES MI UBICACION
  function calculateAndDisplayRoute(directionsService, directionsRenderer) {
    /*declaramos varibales locales ya que por el tiempo en que se ejecuta la app en angular si añadimos variables globales,
    estas pasan indefinidas por tal motivo las pongo en las funciones para asegurarnos de que los elementos ligados a las variables existen*/
    let origen = "";//almacenara mi ubicacion

    //esta api nos ayudará a trasformar coordenadas a una ubicacion geografica aceptada por el directions service de google, pos es nuestra ubicacion, se asigna su valor al iniciar el mapa y darnos nuestra geolocalizacion
    fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + pos.lat + ',' + pos.lng + '&key=AIzaSyB1a8Rh3D5TonkRFxL3JHmwImWnLdtPKzk&libraries=places&callback=initMap&&sensor=true')
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
       origen = myJson.results[0].formatted_address;
       console.log("contenido de input origen: ", origen);
       var inputDestino = document.getElementById('idDestino'); //representa la ruta y, proviene de un elemento html
       console.log("contenido de input destino: ", inputDestino.value);
       var selectTransporte = document.getElementById('mode'); //representa el medio de transaporte

       /*con este condicional evitaremos que cuando se ejecute esta funcion mande
       un input sin valor y mande un error en la consola por localizacion no especificada */
       if (origen == "" || inputDestino.value == "") {
         console.log("No todos los inputs estan llenos");
         return;
       }

       directionsService.route({
           //recibimos las propiedades necesarias para que pueda trazar la ruta
           origin: {
             query: origen
           },
           destination: {
             query: inputDestino.value
           },
           travelMode: selectTransporte.value
         },
         (response, status) => {
           if (status === 'OK') {
             directionsRenderer.setDirections(response);
           } else {
             window.alert('No se pudo generar la ruta: ' + status);
           }
         });
    });
  }


    //FUNCION PARA ACTIVAMOS GEOLOCALIZACION EN EL NAVEGADOR
    function activarGeolocalizacion(){
      if (navigator.geolocation) {
        /*obtenemos nuestra ubicacion mediante la API de maps
        y almacenamos la actual posicion en el objeto pos*/
        navigator.geolocation.getCurrentPosition(function(position) {
          console.log("activando geolocalizacion: ",position);
          pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map.setCenter(pos);//centramos el mapa en la actual posicion
          return pos;
        });
      }else {
        alert("tu navegador no soporta geolocalizacion");
      }
    }
