import { Component } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { FormControl,  } from '@angular/forms';

declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public map:any; //representa el mapa
  public arregloMarkers:any[]; //almacena los markers de esta practica
  public marker:any;
  public id:number; //representa un id autoincrementable para cada marker
  public pos:any;//representa la this.posición actual
  public arregloPuntos:any[];
  public inputDestino: FormControl;
  public selectTransporte:FormControl;
  constructor(public geolocalizacion:Geolocation){
    this.inputDestino=new FormControl("");   //Nos permite habilitar o deshabilitar el botón dependiendo del estado de los FormControls
    this.selectTransporte=new FormControl("DRIVING");
  }


//SCRIPTS DINAMICOS, INSERTA SCRIPTS EN TIEMPO DE LA CREACION DE LA APP
  public loadScript(url: string) {
     /*crearemos un script,en la constante script inicializamos sus propiedades
     y con la constante body la plasmamos en el dom*/
    const body = <HTMLDivElement> document.body;
    const script = document.createElement('script');
    script.innerHTML = ''; //establecemos sintaxis del html
    script.src = url; //direccion donde cargaremos la fuente del script
    script.async = true; //sin asincronia en la descarga con el html
    script.defer = true; //sin descarga en paralelo con el html
    body.appendChild(script); //añadimos el nodo
  }

  //INICIO - FUNCION PARA INICIALIZAR EL MAPA
  public initMap() {
    console.log("maps3");
    /*declaramos letibales globales ya que por el tiempo en que se ejecuta la app en angular si añadimos letiables globales,
    estas pasan indefinidas por tal motivo las pongo en las funciones para asegurarnos de que los elementos ligados a las letiables existen*/
    let directionsService = new google.maps.DirectionsService();
    let directionsRenderer = new google.maps.DirectionsRenderer();
    let inputDestino = document.getElementById('idDestino');//representa la ruta y
    let selectTransporte = document.getElementById('mode'); //representa el medio de transaporte

    //obtenemos mi ubicacion mediante geolocalizacion
    let miUbicacion = this.activarGeolocalizacion();
    //manipulacion del DOM para mostrar el mapa
    let map = new google.maps.Map(document.getElementById('map'), {
      zoom: 15, //nivel de zoom
      center: miUbicacion
    });

    //autocompletando inputs (invocando funcion)
    this.autocompletarInputs();
    //en su momento permite que se muestre la ruta entre el punto a y el punto b
    directionsRenderer.setMap(this.map);

    //FUNCION PARA DETECTAR Y MANIPULAR LOS CAMBIOS HECHOS POR LA FUNCION INVOCADA EN LOS INPUTS
    let onChangeHandler = ()=> {
      this.calculateAndDisplayRoute(directionsService, directionsRenderer);
    }


    directionsRenderer.setMap(this.map);
    directionsRenderer.setPanel(document.getElementById('right-panel'));

    let control = document.getElementById('floating-panel');
    control.style.display = 'block';
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);

    //invocamos la funcion onChangeHandler al momento de detectar un cambio en los inputs
    inputDestino.addEventListener('change', onChangeHandler);
    selectTransporte.addEventListener('change', onChangeHandler);


    }//FIN - FUNCION PARA INICIALIZAR EL MAPA


    //FUNCION PARA AGREGAR MARCADORES AL MAPA
    public addMarker(location:any, map:any) {
      this.id++;
      let icono ='../assets/icon/carIcon.svg';
      this.marker = new google.maps.Marker({
        id: this.id,
        position: location, //this.posicion del marker
        map: this.map, //en el mapa en uso
        //animation: google.maps.Animation.DROP,
        draggable: true,
        icon:icono
      });
      this.arregloMarkers.push(this.marker); //agregamos los markers a un arreglo para poder manipularlos this.posteriormente
      console.log("longitud del arreglo contenedor de markers: ", this.arregloMarkers.length);
    }


    //FUNCION PARA AUTOCOMPLETAR LOS INPUTS
    public autocompletarInputs(){
      //destino
      let autocompleteDestino = new google.maps.places.Autocomplete(document.getElementById('idDestino'));
      autocompleteDestino.bindTo('bounds', this.map);//restringe los resultados, los hace mas locales
      autocompleteDestino.setFields(['address_components', 'geometry', 'icon', 'name']);//establece los camthis.pos que se van a ver en los detalles del lugar
    }


    //FUNCION PARA TRAZAR UNA RUTA SEGUN UN PUNTO x Y UN PUNTO y DONDE PUNTO x ES MI UBICACION
    public calculateAndDisplayRoute(directionsService:any, directionsRenderer:any) {
      /*declaramos letibales locales ya que por el tiempo en que se ejecuta la app en angular si añadimos letiables globales,
      estas pasan indefinidas por tal motivo las pongo en las funciones para asegurarnos de que los elementos ligados a las letiables existen*/
      let origen = "";//almacenara mi ubicacion

      //esta api nos ayudará a trasformar coordenadas a una ubicacion geografica aceptada por el directions service de google, this.pos es nuestra ubicacion, se asigna su valor al iniciar el mapa y darnos nuestra geolocalizacion
      fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + this.pos.lat + ',' + this.pos.lng + '&key=AIzaSyB1a8Rh3D5TonkRFxL3JHmwImWnLdtPKzk&libraries=places&callback=initMap&&sensor=true')
      .then((response)=> {
        return response.json();
      })
      .then((myJson)=> {
         origen = myJson.results[0].formatted_address;
         console.log("contenido de input origen: ", origen);
         let inputDestino = document.getElementById('idDestino'); //representa la ruta y, proviene de un elemento html
         console.log("contenido de input destino: ", this.inputDestino.value);
         let selectTransporte = document.getElementById('mode'); //representa el medio de transaporte

         /*con este condicional evitaremos que cuando se ejecute esta funcion mande
         un input sin valor y mande un error en la consola por localizacion no especificada */
         if (origen == "" || this.inputDestino.value == "") {
           console.log("No todos los inputs estan llenos");
           return;
         }

         directionsService.route({
             //recibimos las propiedades necesarias para que pueda trazar la ruta
             origin: {
               query: origen
             },
             destination: {
               query: this.inputDestino.value
             },
             travelMode: this.selectTransporte.value
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
      public activarGeolocalizacion(){
        this.geolocalizacion.getCurrentPosition().then((position)=>{
          console.log("activando geolocalizacion: ",position);
          this.pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.map.setCenter(this.pos);//centramos el mapa en la actual this.posicion
          return this.pos;
        },
        (error)=>{
        console.log("este es tu error: ",error)
        });
      }




  ngOnInit() {
    this.loadScript('../assets/js/geolocalizacion.js');
    this.loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyB1a8Rh3D5TonkRFxL3JHmwImWnLdtPKzk&libraries=places&callback=initMap&&sensor=true');
  }

}
