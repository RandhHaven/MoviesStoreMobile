import { Component, OnInit } from '@angular/core';
import { BaseModel } from '@app/_models/base-model';
import { AreaDeTrabajo } from '@app/_models/listas/area-de-trabajo';
import { Yacimiento } from '@app/_models/listas/yacimiento';
import { ListasService } from '@app/_services/listas.service';
import { NgForm } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { ChecklistQuestionsComponent } from './checklist-questions/checklist-questions.component';
import { Geoposition } from '@ionic-native/geolocation/ngx';
import { format as formatDate } from 'date-fns';
import { LugarEspecifico } from '@app/_models/listas/lugar-especifico';
import { ChecklistCabecera } from '@app/_models/listas/checklist-cabecera';
import { InspeccionCabecera } from '@app/_models/top/inspeccion-cabecera';
import { AlertService } from '@app/_services/alert.service';
import { GeolocationService } from '@app/_services/geolocation.service';
import { Photo } from '@app/_models/photo';
import { CameraService } from '@app/_services/camera.service';
import { TopService } from '@app/_services/top.service';
import { Router } from '@angular/router';
import { AccountService } from '@app/_services/account.service';

@Component({
  selector: 'app-nueva-top',
  templateUrl: './nueva-top.component.html',
  styleUrls: ['./nueva-top.component.scss'],
})
export class NuevaTopComponent implements OnInit {
  campoRequerido = 'Campo requerido';
  loading = false;
  unidadesNegocio: BaseModel[] = [];
  areasTrabajo: AreaDeTrabajo[] = [];
  areasTrabajoByUnidad: AreaDeTrabajo[] = [];
  yacimientos: Yacimiento[] = [];
  yacimientosByAreaTrabajo: Yacimiento[] = [];

  lugaresEspecificos: LugarEspecifico[] = [];
  lugaresEspecificosByYacimiento: LugarEspecifico[] = [];
  gerencias: BaseModel[] = [];
  checklist: ChecklistCabecera;
  inspeccion = new InspeccionCabecera();
  geoposition: Geoposition;
  geopositionString: string;
  fotos: Photo[] = [];
  datosCargados = false;
  esPrimeraVezUnidad = true;
  esPrimeraVezArea = true;
  constructor(private listasService: ListasService, private alertService: AlertService, private modalController: ModalController, private geolocationService: GeolocationService, private cameraService: CameraService, private topService: TopService, private router: Router, private alertController: AlertController, private accountService: AccountService) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.geolocationService.getGeolocalizacion()
      .then(geoposition => {
        this.geoposition = geoposition;
        if (geoposition.timestamp) {
          const positionString = this.geolocationService.convertToDMS(geoposition.coords.latitude, geoposition.coords.longitude);
          const now = new Date();
          this.geopositionString = `${formatDate(now, 'dd/MM/yyyy')} || ${formatDate(now, 'HH:mm')} || ${positionString}`;
        }
      })
      .catch(error => {
        this.alertService.presentToast('No se pudo obtener su ubicación', 'warning');
      });
    this.listasService.getListasTop()
      .then(listas => {
        this.unidadesNegocio = listas.unidadesNegocio;
        this.areasTrabajo = listas.areasTrabajo;
        this.yacimientos = listas.yacimientos;
        this.lugaresEspecificos = listas.lugaresEspecificos;
        this.gerencias = listas.gerencias;
        this.checklist = listas.checklist;

        if (this.accountService.userValue.unidadNegocio?.length === 1) {
          this.inspeccion.unidadNegocioId = this.accountService.userValue.unidadNegocio[0].Id;
        }
      })
      .catch(error => {
        this.alertService.presentAlert('Error', 'No se pudieron obtener las listas, intentelo de nuevo');
      });
  }

  private updateAreasTrabajo(unidadId: any) {
    this.areasTrabajoByUnidad = this.areasTrabajo.filter(area => area.UnidadNegocioID === unidadId);
  }

  unidadChange(evento: CustomEvent) {
    const unidadId = evento.detail.value;
    this.inspeccion.areaDeTrabajoId = undefined;
    this.areasTrabajoByUnidad = [];
    this.inspeccion.YacimientoID = undefined;
    this.yacimientosByAreaTrabajo = [];

    if (this.esPrimeraVezUnidad && this.accountService.userValue.areaTrabajo?.length === 1) {
      this.inspeccion.areaDeTrabajoId = this.accountService.userValue.areaTrabajo[0].Id;
      this.updateAreasTrabajo(this.inspeccion.unidadNegocioId);
    } else {
      if (unidadId) {
        this.updateAreasTrabajo(unidadId);
      }
    }
    this.esPrimeraVezUnidad = false;
  }

  private updateYacimientos(areaId: number) {
    this.yacimientosByAreaTrabajo = this.yacimientos.filter(yacimiento => yacimiento.AreaDeTrabajoID === areaId);
  }

  areaTrabajoChange(evento: CustomEvent) {
    const areaId = evento.detail.value;
    this.inspeccion.YacimientoID = undefined;
    this.yacimientosByAreaTrabajo = [];

    if (this.esPrimeraVezArea && this.accountService.userValue.yacimientoId) {
      this.inspeccion.YacimientoID = this.accountService.userValue.yacimientoId;
      this.updateYacimientos(this.inspeccion.areaDeTrabajoId);
    } else {
      if (areaId) {
        this.updateYacimientos(areaId);
      }
    }
    this.esPrimeraVezArea = false;
  }

  private updateLugaresEspecificos(yacimientoId: number) {
    this.lugaresEspecificosByYacimiento = this.lugaresEspecificos.filter(lugarEspecifico => lugarEspecifico.YacimientoID === yacimientoId);
  }

  yacimientoChange(evento: CustomEvent) {
    const yacimientoId = evento.detail.value;
    this.inspeccion.lugarEspecificoId = undefined;
    this.lugaresEspecificosByYacimiento = [];

    if (yacimientoId) {
      this.updateLugaresEspecificos(yacimientoId);
    }
  }

  checklistCardClick(numero: number) {
    this.presentPreguntas(numero);
  }

  async presentPreguntas(numero: number) {
    const modal = await this.modalController.create({
      component: ChecklistQuestionsComponent,
      cssClass: 'checklist-questions',
      componentProps: {
        grupos: this.checklist.CheckListGrupos,
        numero
      }
    });
    await modal.present();
    await modal.onWillDismiss();
    this.checklist.CheckListGrupos.forEach(grupo => {
      const hayCheck = grupo.CheckListItems.some(item => item.respuesta === true);
      grupo.reportada = hayCheck;
    });
  }

  async takePicture() {
    try {
      const image = await this.cameraService.selectImage();
      this.fotos.push(image);
    } catch (error) {
      this.alertService.presentToast(error, 'warning');
    }
  }

  eliminarFoto(foto: Photo, index: number) {
    this.fotos.splice(index, 1);
    foto.file.remove(() => { });
  }

  async cancelarTOP() {
    const question = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Está seguro que desea salir?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => { }
        }, {
          text: 'Salir',
          handler: () => {
            this.router.navigate(['/home']);
          }
        }
      ]
    });
    await question.present();
  }

  async onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    const atLeastOneCheck = this.checklist.CheckListGrupos.some(grupo => grupo.reportada);

    if (!atLeastOneCheck) {
      this.alertService.presentToast('Debe seleccionar al menos un item de alguno de los grupos', 'danger');
      return;
    }

    const question = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Está seguro que desea enviar la TOP?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => { }
        }, {
          text: 'Enviar',
          handler: async () => {
            const loader = await this.alertService.presentLoading('Enviando TOP');

            this.topService.sendTOP(this.inspeccion, this.checklist, this.fotos, this.geoposition)
              .then(() => {
                loader.dismiss();
                this.router.navigate(['/home']);
              }).catch(error => {
                loader.dismiss();
                this.alertService.presentToast(error, 'danger');
              });
          }
        }
      ]
    });
    await question.present();
  }

}
