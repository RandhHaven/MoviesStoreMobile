import { Component, OnInit, OnDestroy } from '@angular/core';

import { Platform, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AccountService } from './_services/account.service';
import { DatabaseService } from './_services/database.service';
import { AlertService } from './_services/alert.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ConfigService } from './_services/config.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public backButtonPressedTimer: any;
  public backButtonPressed = false;
  public backButtonSubscription: any = null;
  public appPages = [
    {
      title: 'Home',
      url: '/',
      icon: 'home'
    },
    {
      title: 'Mi perfil',
      url: '/account/my-profile',
      icon: 'person'
    },
    {
      title: 'Nueva TOP',
      url: '/top/nueva',
      icon: 'add-circle'
    },
    {
      title: 'Historial de TOP',
      url: '/top/historial',
      icon: 'calendar'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private accountService: AccountService,
    private databaseService: DatabaseService,
    private alertService: AlertService,
    private location: Location,
    private router: Router,
    private configService: ConfigService,
    private alertController: AlertController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.databaseService.initDatabase()
        .then(() => {
          this.configService.checkAppVersion().then(appVersionValid => {
            if (!appVersionValid) {
              this.accountService.logout();
              const isAndroid = this.platform.is('android');
              this.alertController.create({
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
              }).then(alert => {
                alert.present();
              });
            }
          });
          this.statusBar.styleDefault();
          this.handleBackButton();
          this.splashScreen.hide();
          this.accountService.isAuthenticated().toPromise().then(isAuthenticated => {
            console.log(isAuthenticated, 'app');
            if (isAuthenticated) {
              this.router.navigate(['/home'], { replaceUrl: true });
            } else {
              this.router.navigate(['/account/login'], { replaceUrl: true });
            }
            this.splashScreen.hide();
          });
        }).
        catch(() => {
          console.log('error iniciando db');
          this.alertController.create({
            header: 'ERROR',
            message: 'Hubo un error al abrir la base de datos',
            buttons: [
              {
                text: 'Cerrar',
                role: 'cancel',
                handler: () => {
                  // tslint:disable-next-line: no-string-literal
                  navigator['app'].exitApp();
                }
              }
            ]
          }).then(alertErrorDb => {
            alertErrorDb.present();
          });
        });
    });
  }

  handleBackButton() {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(-1, () => {
      console.log('Back press handler!');
      if ((this.location.path().includes('/home') || this.location.path().includes('/account/login')) && this.platform.is('android')) {
        if (this.backButtonPressed) {
          // tslint:disable-next-line: no-string-literal
          navigator['app'].exitApp();
        } else {
          this.alertService.presentToast('Presione de nuevo para salir', 'dark');
          this.backButtonPressed = true;
          if (this.backButtonPressedTimer) {
            clearTimeout(this.backButtonPressedTimer);
          }
          this.backButtonPressedTimer = setTimeout(() => {
            this.backButtonPressed = false;
          }, 2000);
        }
      } else {
        this.location.back();
      }
    });
  }

  logout() {
    this.accountService.logout();
  }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
  }
}
