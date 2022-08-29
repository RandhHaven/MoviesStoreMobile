import { Injectable } from '@angular/core';
import { Geoposition, Geolocation } from '@ionic-native/geolocation/ngx';
import { Platform } from '@ionic/angular';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private GPS_MAXIMUM_AGE = 30000; // 30 segundos
  private GPS_TIMEOUT = 10000; // 10 segundos
  private GPS_HIGH_ACCURACY = true;
  private MOCK_LOCATION = { latitude: -34.601, longitude: -58.383 };
  public lastKnownPosition = this.createEmptyPosition();

  constructor(private geolocation: Geolocation, private platform: Platform, private diagnostic: Diagnostic) { }

  async getGeolocalizacion() {
    let geoPosition = this.createEmptyPosition();
    try {
      if (!this.platform.is('desktop')) {
        const isPermissionLocationGranted = await this.checkPermissionLocation();
        if (isPermissionLocationGranted) {
          geoPosition = await this.getPosition();
          // await this.checkLocationIsOn();
        } else {
          const permissionStatus = await this.requestLocationPermission();
          if (permissionStatus === this.diagnostic.permissionStatus.GRANTED ||
            permissionStatus === this.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE) {
            geoPosition = await this.getPosition();
            // await this.checkLocationIsOn();
          } else {
            throw new Error('El permiso de ubicación es obligatorio, por favor vaya a ajustes y modifique los permisos de la aplicación');
          }
        }
      } else {
        this.fillMockPosition(geoPosition);
      }
      return geoPosition;
    } catch (error) {
      throw error;
    }
  }

  private createEmptyPosition(): Geoposition {
    return {
      coords:
        { latitude: null, longitude: null, accuracy: null, altitude: null, heading: null, speed: null, altitudeAccuracy: null },
      timestamp: null
    };
  }

  private fillMockPosition(geoPosition: Geoposition) {
    geoPosition.coords.latitude = this.MOCK_LOCATION.latitude;
    geoPosition.coords.longitude = this.MOCK_LOCATION.longitude;
    geoPosition.timestamp = new Date().getTime();
  }

  /**
   * Chequea si se le concedieron los permisos de ubicación a la app
   */
  private async checkPermissionLocation() {
    try {
      const authorized = await this.diagnostic.isLocationAuthorized();
      return authorized;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene la ubicacion del dispositivo
   */
  private getPosition(): Promise<Geoposition> {
    return new Promise((resolve, reject) => {
      this.geolocation.getCurrentPosition({
        maximumAge: this.GPS_MAXIMUM_AGE,
        timeout: this.GPS_TIMEOUT,
        enableHighAccuracy: this.GPS_HIGH_ACCURACY
      }).then(geoposition => {
        this.lastKnownPosition = geoposition;
        resolve(geoposition);
      }).catch(error => {
        if (error.message.startsWith('Only secure origins are allowed')) {
          // Secure Origin issue.
          const position = this.createEmptyPosition();
          this.fillMockPosition(position);
          resolve(position);
        } else if (error.code == 3) {
          // 3 = TIMEOUT
          if (this.lastKnownPosition.timestamp !== null) {
            resolve(this.lastKnownPosition);
          } else {
            resolve(null);
          }
        } else {
          reject(error);
        }
      });
    });
  }

  /**
   * Chequea si el dipositivo tiene habilitado/encendido la Ubicación y si no la tiene agrega una notificación para que la habilite
   */
  private async checkLocationIsOn() {
    const isLocationOn = await this.diagnostic.isLocationEnabled();
    if (!isLocationOn) {
      throw new Error('Habilite el GPS para una mejor ubicación');
    }
  }

  /**
   * Pide acceso al GPS del dispositivo y devuelve la respuesta del usuario
   */
  private async requestLocationPermission() {
    try {
      const status = await this.diagnostic.requestLocationAuthorization();
      return status;
    } catch (error) {
      throw error;
    }
  }

  private decimalToDegreesMinutesAndSeconds(coordinate: number) {
    const absolute = Math.abs(coordinate);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    return `${degrees}° ${minutes}' ${seconds}''`;
  }

  public convertToDMS(lat: number, lng: number) {
    const latitude = this.decimalToDegreesMinutesAndSeconds(lat);
    const latitudeCardinal = lat >= 0 ? 'N' : 'S';

    const longitude = this.decimalToDegreesMinutesAndSeconds(lng);
    const longitudeCardinal = lng >= 0 ? 'E' : 'O';

    return `${latitude} ${latitudeCardinal} ${longitude} ${longitudeCardinal}`;
  }
}
