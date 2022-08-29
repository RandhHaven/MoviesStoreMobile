import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountService } from '@app/_services/account.service';
import { Platform, AlertController } from '@ionic/angular';
import { ConfigService } from '../_services/config.service';
import { AlertService } from '../_services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private accountService: AccountService,
    private platform: Platform,
    private alertController: AlertController,
    private alertService: AlertService,
    private configService: ConfigService,
    private router: Router
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return new Promise((resolve, reject) => {
      this.accountService.isAuthenticated().subscribe(async isAuthenticated => {
        if (isAuthenticated) {
          const appVersionValid = await this.configService.checkAppVersion(false);
          if (appVersionValid) {
            const newVersionDetected = await this.configService.newVersionDetected();
            if (newVersionDetected) {
              await this.alertService.presentToast('Nueva versión detectada, por favor inicie sesión nuevamente', 'warning');
              this.accountService.logout();
              resolve(false);
            } else {
              resolve(true);
            }
          } else {
            this.accountService.logout();
            const isAndroid = this.platform.is('android');
            const alert = await this.alertController.create({
              header: 'Atención',
              message: 'Existe una nueva versión, por favor actualice la aplicación',
              buttons: [
                {
                  text: 'Cerrar',
                  role: 'cancel',
                  cssClass: 'secondary',
                  handler: () => {
                    // tslint:disable-next-line: no-string-literal
                    navigator['app'].exitApp();
                  }
                }, {
                  text: isAndroid ? 'Play Store' : 'App Store',
                  handler: () => {
                    const url = isAndroid ? 'market://details?id=com.cetap.pluspetrol.top' : '';
                    window.open(url, '_system');
                  }
                }
              ]
            });
            alert.present();
            resolve(false);
          }
        } else {
          this.router.navigate(['/account/login']);
          resolve(false);
        }
      });
    });
  }

}
