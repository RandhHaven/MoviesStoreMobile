import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { MenuController } from '@ionic/angular';
import { ListasService } from '@app/_services/listas.service';
import { MustMatch } from '@app/_helpers/validators/must-match.validator';
import { BaseModel } from '@app/_models/base-model';
import { AreaDeTrabajo } from '@app/_models/listas/area-de-trabajo';
import { Empresa } from '../../_models/listas/empresa';
import { IonicSelectableComponent } from 'ionic-selectable';
import { DifferentUsernamePassword } from '@app/_helpers/validators/different-username-password.validator';
import { NetworkService } from '@app/_services/network.service';


@Component({
  selector: 'app-register',
  templateUrl: 'register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  campoRequerido = 'Campo requerido';
  form: FormGroup;
  areaTrabajoControl: FormControl;
  cargos: BaseModel[] = [];
  unidadesNegocio: BaseModel[] = [];
  areasTrabajo: AreaDeTrabajo[] = [];
  areasTrabajoByUnidad: AreaDeTrabajo[] = [];
  empresas: Empresa[];
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private menuCtrl: MenuController,
    private listasService: ListasService,
    private networkService: NetworkService
  ) { }

  ngOnInit() {
    this.areaTrabajoControl = this.formBuilder.control(null, [Validators.required]);

    this.form = this.formBuilder.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      username: [null, [Validators.required, Validators.email]],
      documento: [null, [Validators.required, Validators.min(10000), Validators.max(999999999)]],
      cargo: [null],
      unidadNegocio: [null, [Validators.required]],
      areaTrabajo: this.areaTrabajoControl,
      empresa: [null, Validators.required],
      password: [null, [Validators.required, Validators.minLength(8), Validators.pattern(/^.*\d.*\d.*$/)]],
      password2: [null, [Validators.required]]
    }, { validators: [MustMatch('password', 'password2'), DifferentUsernamePassword('username', 'password')] });

    this.areaTrabajoControl.disable();
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
    let loader: HTMLIonLoadingElement;
    this.alertService.presentLoading('Obteniendo datos')
      .then(loaderElement => {
        try {
          loader = loaderElement;
          this.listasService.getListas()
            .then(_ => {
              this.listasService.getListasRegistracion()
                .then(listas => {
                  this.cargos = listas.cargos;
                  this.unidadesNegocio = listas.unidadesNegocio;
                  this.areasTrabajo = listas.areasTrabajo;
                  loader.dismiss();
                })
                .catch(error => {
                  this.alertService.presentToast(error, 'danger');
                  loader.dismiss();
                });
            })
            .catch(error => {
              loader.dismiss();
              this.alertService.presentToast(error, 'danger');
            });
        } catch (error) {
          loader.dismiss();
          this.alertService.presentToast(error, 'danger');
        }
      })
      .catch(error => {
        loader.dismiss();
        this.alertService.presentToast(error, 'danger');
      });
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

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

  searchEmpresa(
    event: { component: IonicSelectableComponent, text: string }
  ) {
    const text = event.text.trim().toLowerCase();
    event.component.startSearch();

    if (!text) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }

    this.listasService.getEmpresas(text).then(empresas => {
      event.component.items = empresas;
      event.component.endSearch();
    });
  }

  async onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }
    if (this.networkService.isOnline()) {
      this.loading = true;
      const loader = await this.alertService.presentLoading('Registrando');
      this.accountService.register(this.form.value)
        .pipe(first())
        .subscribe(
          data => {
            loader.dismiss();
            this.loading = false;
            this.alertService.presentToast('Registración exitosa. Por favor chequee su correo para completar la registración', 'success');
            this.router.navigate(['../login'], { relativeTo: this.route });
          },
          error => {
            loader.dismiss();
            this.alertService.presentToast(error, 'danger');
            this.loading = false;
          });
    } else {
      this.alertService.presentToastSinConexion();
    }
  }
}
