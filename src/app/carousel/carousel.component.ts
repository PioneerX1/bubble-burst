import { Component, Input, OnInit } from '@angular/core';
import { MarsPhotosService } from '../mars-photos.service';


@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  providers: [ MarsPhotosService]
})
export class CarouselComponent implements OnInit {
  @Input() childPhotos;
  constructor(private marsRoverPhotos: MarsPhotosService) { }
  photos: any[]=null;
  noPhotos: boolean=false;

  ngOnInit(){
    // getRoverImages() {
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
  // }
  }

}
