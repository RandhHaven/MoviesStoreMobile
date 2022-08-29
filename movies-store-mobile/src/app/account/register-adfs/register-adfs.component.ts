import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/_services/account.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { BaseModel } from '@app/_models/base-model';
import { AreaDeTrabajo } from '@app/_models/listas/area-de-trabajo';
import { ListasService } from '@app/_services/listas.service';
import { Yacimiento } from '../../_models/listas/yacimiento';
import { MenuController } from '@ionic/angular';
import { AlertService } from '@app/_services/alert.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CallbackAdfs } from '@app/_models/callback-adfs';
import { NetworkService } from '../../_services/network.service';

@Component({
  selector: 'app-register-adfs',
  templateUrl: './register-adfs.component.html',
  styleUrls: ['./register-adfs.component.scss'],
})
export class RegisterAdfsComponent implements OnInit {
  campoRequerido = 'Campo requerido';
  areaTrabajoControl: FormControl;
  yacimientoControl: FormControl;
  form: FormGroup;
  loading = false;
  submitted = false;
  tempUser: CallbackAdfs;
  unidadesNegocio: BaseModel[] = [];
  areasTrabajo: AreaDeTrabajo[] = [];
  areasTrabajoByUnidad: AreaDeTrabajo[] = [];
  yacimientos: Yacimiento[] = [];
  yacimientosByAreaTrabajo: Yacimiento[] = [];
  gerencias: BaseModel[] = [];
  constructor(private accountService: AccountService, private formBuilder: FormBuilder, private listasService: ListasService, private menuCtrl: MenuController, private alertService: AlertService, private router: Router, private networkService: NetworkService) { }

  ngOnInit() {
    this.tempUser = this.accountService.tempUser;
    this.areaTrabajoControl = this.formBuilder.control(null, [Validators.required]);
    this.yacimientoControl = this.formBuilder.control(null, [this.requiredIfValidator(() => this.yacimientosByAreaTrabajo.length > 0)]);

    this.form = this.formBuilder.group({
      unidadNegocio: [null, [Validators.required]],
      areaTrabajo: this.areaTrabajoControl,
      yacimiento: this.yacimientoControl,
      gerencia: [null, [Validators.required]]
    });

    this.areaTrabajoControl.disable();
    this.yacimientoControl.disable();
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
    this.tempUser = this.accountService.tempUser;

    this.alertService.presentLoading('Obteniendo datos').then(loader => {
      try {
        this.listasService.getListas().then(_ => {
          this.listasService.getListasRegistracionAdfs()
            .then(listas => {
              this.unidadesNegocio = listas.unidadesNegocio;
              this.areasTrabajo = listas.areasTrabajo;
              this.yacimientos = listas.yacimientos;
              this.gerencias = listas.gerencias;
              loader.dismiss();
            })
            .catch(error => {
              this.alertService.presentToast(error, 'danger');
              loader.dismiss();
            });
        });
      } catch (error) {
        this.alertService.presentToast(error, 'danger');
        loader.dismiss();
      }
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  requiredIfValidator(predicate) {
    return (formControl => {
      if (!formControl.parent) {
        return null;
      }
      if (predicate()) {
        return Validators.required(formControl);
      }
      return null;
    });
  }

  unidadChange(evento: CustomEvent) {
    const unidadId = evento.detail.value;
    this.areaTrabajoControl.reset();
    if (evento.detail.value) {
      this.areasTrabajoByUnidad = this.areasTrabajo.filter(area => area.UnidadNegocioID === unidadId);
      this.areaTrabajoControl.enable();
    } else {
      this.areaTrabajoControl.disable();
    }
  }

  areaTrabajoChange(evento: CustomEvent) {
    const areaId = evento.detail.value;
    this.yacimientoControl.reset();
    if (evento.detail.value) {
      this.yacimientosByAreaTrabajo = this.yacimientos.filter(yacimiento => yacimiento.AreaDeTrabajoID === areaId);
      this.yacimientoControl.enable();
    } else {
      this.yacimientoControl.disable();
    }
    this.form.get('yacimiento').updateValueAndValidity();
  }
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    if (this.networkService.isOnline()) {
      this.loading = true;
      const user = Object.assign(this.tempUser, this.form.value);
      this.accountService.registerWithAdfs(user)
        .pipe(first())
        .subscribe(
          data => {
            this.loading = false;
            this.accountService.loginAD(data, this.tempUser.username).then(user => {
              this.router.navigate(['/home'], { replaceUrl: true });
              this.menuCtrl.enable(true);
            }).catch(error => {
              console.log(error);
            });
          },
          error => {
            this.alertService.presentToast(error, 'danger');
            this.loading = false;
          });
    } else {
      this.alertService.presentToastSinConexion();
    }
  }

}
