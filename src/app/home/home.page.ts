import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

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
  ngOnInit() {
    this.loadScript('../assets/js/geolocalizacion.js');
    this.loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyB1a8Rh3D5TonkRFxL3JHmwImWnLdtPKzk&libraries=places&callback=initMap&&sensor=true');
  }

}
