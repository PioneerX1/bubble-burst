import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MarsPhotosService } from './mars-photos.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ MarsPhotosService ]
})
export class AppComponent {
  photos: any[]=null;
    noPhotos: boolean=false;
    constructor(private marsRoverPhotos: MarsPhotosService) { }

    getRoverImages() {
      this.noPhotos = false;
      this.marsRoverPhotos.getImages().subscribe(response => {
        if(response.json().photos.length > 0)
      {
        this.photos = response.json();
      }
      else {
        this.noPhotos = true;
      }
      });
    }

}
