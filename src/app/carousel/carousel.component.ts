import { Component, Input } from '@angular/core';
import { MarsPhotosService } from '../mars-photos.service';


@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  providers: [ MarsPhotosService]
})
export class CarouselComponent {
  @Input() childPhotos;
  constructor(private marsPhotos: MarsPhotosService) { }

  ngOnInit() {
  }

}
