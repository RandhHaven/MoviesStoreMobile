import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '@app/_services/account.service';
import { MenuController, Platform } from '@ionic/angular';
import { AlertService } from '@app/_services/alert.service';
import { ListasService } from '@app/_services/listas.service';
import { NetworkService } from '@app/_services/network.service';
import { environment } from '@environments/environment';
import jwt_decode from 'jwt-decode';
import { AzureADToken } from '@app/_models/azure-ad-token';
@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  showLogin = false;
  public logoPressedTimer: any;
  public logoPressed = 0;
  linkForgotPassword = `${environment.baseWeb}Account/Login?ReturnUrl=%2F#reminder`;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private menuCtrl: MenuController,
    private alertService: AlertService,
    private listasService: ListasService,
    private networkService: NetworkService,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    if (!this.platform.is('cordova')) {
      // está volviendo del AD
      if (this.route.snapshot.fragment) {
        this.alertService.presentLoading('Verificando').then((loader) => {
          const token = this.route.snapshot.fragment.substring(
            this.route.snapshot.fragment.indexOf('id_token=') +
              'id_token='.length,
            this.route.snapshot.fragment.indexOf('&client_info=')
          );
          if (token.length > 50) {
            this.loginOrRegisterUser(token, loader);
          } else {
            loader.dismiss();
            alert('No se pudo verificar su identidad');
          }
        });
      }
    }
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  async onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    if (this.networkService.isOnline()) {
      this.loading = true;
      const loading = await this.alertService.presentLoading(
        'Iniciando Sesión'
      );
      try {
        const user = await this.accountService.login(
          this.f.username.value,
          this.f.password.value
        );
        await this.getListas();
        this.goToHome(loading);
      } catch (error) {
        loading.dismiss();
        this.alertService.presentToast(error, 'danger');
        this.loading = false;
      }
    } else {
      this.alertService.presentToastSinConexion();
    }
  }

  private goToHome(loading: HTMLIonLoadingElement) {
    loading.dismiss();
    this.router.navigate([this.returnUrl], { replaceUrl: true });
    this.menuCtrl.enable(true);
  }

  async loginAzureAD() {
    if (this.networkService.isOnline()) {
      const tokenId = await this.accountService.getAzureADTokenId();
      if (tokenId) {
        const loader = await this.alertService.presentLoading('Verificando');
        try {
          await this.loginOrRegisterUser(tokenId, loader);
        } catch (error) {
          loader.dismiss();
          this.alertService.presentToast(error, 'danger');
          this.loading = false;
        }
      } else {
        this.alertService.presentToast(
          'No se pudo obtener la información del AD',
          'warning'
        );
      }
    } else {
      this.alertService.presentToastSinConexion();
    }
  }

  private async loginOrRegisterUser(tokenId: string, loader: HTMLIonLoadingElement) {
    const data = await this.accountService
      .getUserFromAzureAD(tokenId)
      .toPromise();
    if (data.jwt) {
      const user = await this.accountService.loginAD(data.jwt, data.username);
      await this.getListas();
      this.goToHome(loader);
    }
    else {
      const decodedToken = jwt_decode<AzureADToken>(tokenId);
      this.accountService.tempUser = {
        apellido: decodedToken.family_name,
        nombre: decodedToken.given_name,
        cargo: decodedToken.jobTitle,
        email: decodedToken.email,
        username: decodedToken.upn,
      };
      loader.dismiss();
      this.router.navigate(['/account/register-adfs']);
    }
  }

  async getListas() {
    try {
      await this.listasService.getListas();
    } catch (error) {
      this.alertService.presentToast(
        'Hubo un problema al obtener las listas. Se utilizaran las almacenadas en el dispositivo',
        'warning'
      );
    }
  }
}
