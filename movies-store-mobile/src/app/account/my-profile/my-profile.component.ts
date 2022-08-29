import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from '@app/_services/alert.service';
import { User } from '@app/_models/user';
import { MustMatch } from '@app/_helpers/validators/must-match.validator';
import { DifferentUsernamePassword } from '@app/_helpers/validators/different-username-password.validator';
import { AccountService } from '@app/_services/account.service';
import { first } from 'rxjs/operators';
import { CameraService } from '@app/_services/camera.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({ selector: 'app-my-profile', templateUrl: 'my-profile.component.html', styleUrls: ['./my-profile.component.scss'] })
export class MyProfileComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;
  user: User;
  userUnidades: string;
  userAreas: string;
  usrImg: string | SafeUrl = '../../../assets/avatar.svg';
  constructor(private formBuilder: FormBuilder, private alertService: AlertService, private accountService: AccountService, private cameraService: CameraService, private sanitizer: DomSanitizer) {
    this.user = this.accountService.userValue;
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: [this.user.username],
      oldPassword: [null, [Validators.required]],
      password: [null, [Validators.required, Validators.minLength(8), Validators.pattern(/^.*\d.*\d.*$/)]],
      password2: [null, [Validators.required]]
    }, { validators: [MustMatch('password', 'password2'), DifferentUsernamePassword('username', 'password')] });
  }

  ionViewWillEnter() {
    this.user = this.accountService.userValue;
    this.userUnidades = this.user.unidadNegocio?.map(un => un.Descripcion).join(', ');
    this.userAreas = this.user.areaTrabajo?.map(ar => ar.Descripcion).join(', ');
    this.accountService.getUserImage()
      .pipe(first())
      .subscribe(
        data => {
          if (data) {
            this.usrImg = this.sanitizer.bypassSecurityTrustUrl(data);
          }
        },
        error => {
          this.alertService.presentToast('No se pudo obtener la imagen de perfil', 'warning');
          this.loading = false;
        });
  }

  async takeProfilePicture() {
    let loader: HTMLIonLoadingElement;
    try {
      const image = await this.cameraService.selectImage();
      loader = await this.alertService.presentLoading('Actualizando imagen de perfil');
      await this.accountService.updateUserImage(image);
      loader.dismiss();
      this.usrImg = image.base64;
    } catch (error) {
      loader.dismiss();
      this.alertService.presentToast(error, 'warning');
    }
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    // if (this.networkService.isOnline()) {
    //   this.loading = true;
    //   this.alertService.presentToast('Cambio de contraseña completo', 'success');
    //   // this.router.navigate(['/account/login'], { replaceUrl: true });
    // } else {
    //   this.alertService.presentToastSinConexion();

    // }
  }
}
