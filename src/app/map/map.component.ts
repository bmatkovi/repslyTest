import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {google} from 'google-maps';

declare var google: any;

class Place {
  formatted_address: any;
  geometry: any;
  html_attributions: any[];
  icon: any;
  id: any;
  name: any;
  opening_hours: any;
  photos: any;
  place_id: any;
  plus_code: any;
  rating: any;
  reference: any;
  types: any[];
  user_ratings_total: any;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  public latitude: number = 45.813;
  public longitude: number = 15.9779;
  public searchControl: FormControl;
  public zoom: number = 15;
  public map: any;
  public service: any;
  public myLocation: any;
  public request: any;
  public resultList: any[] = [];
  public filteredResultList: any[] = [];

  public listOfTypes: any[] = [
    'airport',
    'atm',
    'bakery',
    'bank',
    'bar',
    'beauty_salon',
    'bus_station',
    'cafe',
    'city_hall',
    'doctor',
    'florist',
    'furniture_store',
    'gas_station',
    'gym',
    'hair_care',
    'hospital',
    'jewelry_store',
    'library',
    'movie_theater',
    'museum',
    'night_club',
    'park',
    'parking',
    'pharmacy',
    'police',
    'post_office',
    'restaurant',
    'school',
    'shoe_store',
    'shopping_mall',
    'stadium',
    'store',
    'supermarket',
    'taxi_stand',
    'train_station',
    'zoo'
  ]
  public activeListOfTypes: any[] = [];
  filterForm: FormGroup;
  markers: any = [];

  constructor(
    private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    this.filterForm = this.fb.group({
      searchControl: new FormControl(''),
      filterControl: []
    });

    this.setCurrentPosition();
    this.getPlaces();

    this.filterForm.valueChanges.subscribe(key => {
      this.searchPlacesList(key.searchControl);
    });

  }

  /**
   * Gets location from API
   */
  getPlaces(): void {
    this.myLocation = new google.maps.LatLng(this.latitude, this.longitude);

    this.map = new google.maps.Map(document.getElementById('map'), {
      center: this.myLocation,
      zoom: 15
    });

    let marker = new google.maps.Marker({
      position: this.myLocation,
      map: this.map,
      title: 'This is your location'
    });

    this.request = {
      location: this.myLocation,
      radius: '500',
      type: this.activeListOfTypes
    };

    this.resultList = [];
    this.service = new google.maps.places.PlacesService(this.map);
    this.service.nearbySearch(this.request,
      (results, status, pagination) => {
        if (status == google.maps.places.PlacesServiceStatus.OK) {

          if (results) {
            Array.from(results).forEach((item, key) => {
              let place: Place = Object.assign(new Place(), item);
              this.resultList.push(place);
              this.createMarker(place);
            });

            if (pagination.hasNextPage) {
              pagination.nextPage();
            }
          }
        }
      });
  }

  /**
   * Check if a type is checked/unchecked to apply new parameters for getting places
   * @param event 
   * @param i 
   */
  checkValue(event: any, i: number) {
    if (event.target.checked) {
      this.activeListOfTypes.push(this.listOfTypes[i]);
    } else {
      this.activeListOfTypes.splice(this.listOfTypes[i], 1);
    }

    this.getPlaces();
  }

  /**
   * Search throw places by keyword and update markers
   * @param key
   */
  searchPlacesList(key: string) {
    this.filteredResultList = this.resultList.filter(place => {
      return place.name.toLowerCase().indexOf(key.toLowerCase()) > -1;
    });

    this.deleteMarker();
    this.filteredResultList.forEach(item => {
      this.createMarker(item);
    });

  }

  /**
   * Getting use current location
   */
  setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 15;
      });
    }
  }

  /**
   * Create markers for locations
   * @param place
   */
  createMarker(place: any) {
    if (this.map && place) {
      var marker = new google.maps.Marker({
        map: this.map,
        position: place.geometry.location,
        title: (place.name ? place.name : '') + (place.opening_hours ? (place.opening_hours.open_now === true ? ', Open' : ' Closed') : '')
      });
      this.markers.push(marker);
      marker.setMap(this.map)
    }
  }


  /**
   * Delete marker
   */
  deleteMarker() {
    this.markers.forEach(marker => {
      marker.setMap(null);
    })
  }

}


