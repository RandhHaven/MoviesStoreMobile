import { AppVersion } from '@ionic-native/app-version/ngx';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppVersionMock extends AppVersion {
  getAppName(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('TOP Digital PLUSPETROL');
    });
  }
  getPackageName(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('com.cetap.pluspetrol.top');
    });
  }
  getVersionCode(): Promise<string | number> {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }
  getVersionNumber(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('1.3.0');
    });
  }
}
