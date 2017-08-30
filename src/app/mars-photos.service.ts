import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { marsRoverKey } from './api-keys';

@Injectable()
export class MarsPhotosService {

  photos: any[];
  constructor(private http: Http) { }


  getImages() {
    return this.http.get("https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=2017-01-01&camera=mast&api_key=" + marsRoverKey)
  }

  getPhotos() {
      return this.photos;
    }

}
