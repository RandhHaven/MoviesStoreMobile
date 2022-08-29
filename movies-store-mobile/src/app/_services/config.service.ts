import { Injectable } from '@angular/core';
import { NetworkService } from './network.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { environment } from '@environments/environment';
import { AlertService } from './alert.service';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { StorageKeys } from '../_helpers/enums/storage-keys';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private networkService: NetworkService, private appVersion: AppVersion, private alertService: AlertService, private http: HttpClient, private storage: Storage) { }

  async checkAppVersion(showErrors = true) {
    if (this.networkService.isOnline()) {
      try {
        const appVersion = await this.appVersion.getVersionNumber();
        const appVersionValid = await this.http.get<boolean>(`${environment.baseApi}version/${appVersion}`).toPromise();

        return appVersionValid;
      } catch (error) {
        if (showErrors) {
          this.alertService.presentToast('No se pudo validar la versión de la aplicación', 'dark');
        }
        return true;
      }
    } else {
      if (showErrors) {
        this.alertService.presentToast('Sin conexión a internet. No se puede validar la versión de la aplicación', 'dark');
      }
      return true;
    }
  }

  async newVersionDetected() {
    let appVersion: string = await this.storage.get(StorageKeys.APP_VERSION);
    const newAppVersion = await this.appVersion.getVersionNumber();
    if (appVersion == null) {
      await this.storage.set(StorageKeys.APP_VERSION, newAppVersion);
      appVersion = newAppVersion;
    }
    const isVersionDifferent = newAppVersion !== appVersion;

    if (isVersionDifferent) {
      await this.storage.set(StorageKeys.APP_VERSION, newAppVersion);
    }

    return isVersionDifferent;
  }
}
