import { Injectable } from '@angular/core';
import { InspeccionCabecera } from '@app/_models/top/inspeccion-cabecera';
import { TableNames } from '../_helpers/enums/table-names';
import { DatabaseService } from './database.service';
import { ChecklistCabecera } from '@app/_models/listas/checklist-cabecera';
import { Photo } from '@app/_models/photo';
import { InspeccionDetalle } from '@app/_models/top/inspeccion-detalle';
import { Geoposition } from '@ionic-native/geolocation/ngx';
import { insert, deleteFrom, update, select } from 'sql-bricks';
import { FileService } from './file.service';
import { NetworkService } from './network.service';
import { AlertService } from './alert.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { AccountService } from './account.service';
import { ImagenPendiente } from '../_models/top/imagen-pendiente';
import { format as formatDate } from 'date-fns';
import { es as dateFnsLocalES } from 'date-fns/locale';
import { WsHistorialExtendido } from '@app/_models/top/ws-historial-extendido';
import { Historial } from '@app/_models/top/historial';

@Injectable({
  providedIn: 'root'
})
export class TopService {

  constructor(private databaseService: DatabaseService, private fileService: FileService, private networkService: NetworkService, private alertService: AlertService, private http: HttpClient, private accountService: AccountService) {
  }

  async sendTOP(inspeccion: InspeccionCabecera, checklist: ChecklistCabecera, fotos: Photo[], geoposition: Geoposition) {
    inspeccion.inspeccionDetalles = [];

    checklist.CheckListGrupos.forEach(grupo => {
      grupo.CheckListItems.forEach(item => {
        const itemToSend = new InspeccionDetalle();
        itemToSend.CheckListItemID = item.Id;
        if (item.respuesta) {
          itemToSend.marcado = item.respuesta;
        }
        inspeccion.inspeccionDetalles.push(itemToSend);
      });
    });

    inspeccion.latitude = geoposition ? geoposition.coords.latitude.toString() : null;
    inspeccion.longitude = geoposition ? geoposition.coords.longitude.toString() : null;
    inspeccion.userName = this.accountService.userValue.username;
    inspeccion.checkListCabeceraId = checklist.Id;
    inspeccion.fecha = new Date();

    await this.guardarTOP(inspeccion, fotos);

    if (this.networkService.isOnline()) {
      try {
        const inspeccionRequest = await this.sendInspeccion(inspeccion);
        inspeccion.id = inspeccionRequest.Id;
      } catch (error) {
        throw error;
      }

      if (inspeccion.id !== 0) {
        await this.updateInspeccionServerId(inspeccion.localId, inspeccion.id);
        const imagenesPromises = [];
        let contadorPromesasValidas = 0;

        fotos.forEach(foto => {
          const imagePromise = this.sendInspeccionFoto(inspeccion.id, foto);
          imagenesPromises.push(imagePromise);
        });

        const results = await Promise.all(imagenesPromises.map(p => p.catch(e => e)));
        results.forEach(result => {
          if (!(result instanceof Error)) {
            contadorPromesasValidas++;
          }
        });

        if (contadorPromesasValidas === imagenesPromises.length) {
          this.alertService.presentToast('TOP enviada con éxito', 'success');
        } else {
          this.alertService.presentToast('Algunas imágenes no se pudieron enviar. Inténtelo de nuevo más tarde', 'warning');
        }
      }

    } else {
      this.alertService.presentToast('No se puede enviar la TOP ya que no tiene internet', 'warning');
    }
  }

  private async sendInspeccionFoto(inspeccionId: number, foto: Photo) {
    try {
      const formData = new FormData();
      const fileBlob = await this.fileService.fileToBlob(foto.directory, foto.filename, 'image/jpeg');
      formData.append('file', fileBlob, foto.filename);
      const result = await this.http.post<{ Url: string }>(`${environment.baseApi}inspecciones/${inspeccionId}/images`, formData).toPromise();
      await this.updateInspeccionImagenSync(foto.localId);
    } catch (error) {
      throw new Error('No se pudo enviar la imagen');
    }
  }

  private sendInspeccion(inspeccion: InspeccionCabecera) {
    const formData = new FormData();
    formData.append('formulario', JSON.stringify(inspeccion));
    return this.http.post<{ Id: number }>(`${environment.baseApi}inspecciones`, formData).toPromise();
  }

  private async guardarTOP(inspeccion: InspeccionCabecera, fotos: Photo[]): Promise<void> {
    return new Promise(async (resolve, reject) => {
      let inspeccionId: number;
      try {
        const todayJSON = new Date().toJSON();
        const queryInspeccion = insert(TableNames.INSPECCION_TOP, ['formulario', 'id_servidor', 'fecha_alta', 'sincronizado'])
          .values([JSON.stringify(inspeccion), null, todayJSON, 0])
          .toParams();
        const inspeccionDB = await this.databaseService.query(queryInspeccion.text, queryInspeccion.values);
        inspeccionId = inspeccionDB.insertId;
        inspeccion.localId = inspeccionId;
        for (const foto of fotos) {
          const fotoCopied = await this.fileService.savePicture(foto, inspeccionId);
          foto.directory = fotoCopied.directory;
          foto.file = fotoCopied.file;
          foto.filename = fotoCopied.filename;
          foto.filepath = fotoCopied.filepath;

          const queryFoto = insert(TableNames.INSPECCION_TOP_IMAGEN, ['inpseccion_top_id', 'imagen', 'fecha_alta', 'sincronizado'])
            .values([inspeccionId, foto.filename, todayJSON, 0])
            .toParams();

          const fotoDB = await this.databaseService.query(queryFoto.text, queryFoto.values);
          foto.localId = fotoDB.insertId;
        }
        resolve();
      } catch (error) {
        if (inspeccionId) {
          const deleteInspeccionImagenesQuery = deleteFrom(TableNames.INSPECCION_TOP_IMAGEN).where('inpseccion_top_id', inspeccionId).toString();
          await this.databaseService.query(deleteInspeccionImagenesQuery);
          const deleteInspeccionQuery = deleteFrom(TableNames.INSPECCION_TOP).where('id', inspeccionId).toString();
          await this.databaseService.query(deleteInspeccionQuery);
          reject(error);
        }
      }
    });
  }

  private async updateInspeccionServerId(localId: number, serverId: number) {
    const updateQuery = update(TableNames.INSPECCION_TOP).set('id_servidor', serverId).set('sincronizado', 1).where('id', localId).toString();
    await this.databaseService.query(updateQuery);
  }

  private async updateInspeccionImagenSync(imagenId: number) {
    const updateQuery = update(TableNames.INSPECCION_TOP_IMAGEN).set('sincronizado', 1).where('id', imagenId).toString();
    await this.databaseService.query(updateQuery);
  }

  async getInspeccionesEImagenesSinSincronizar() {
    const inspeccionesPendientes = await this.getInspeccionesSinSincronizar();

    const imagenesPendientes = await this.getInspeccionesImagenesSinSincronizar();

    return { inspecciones: inspeccionesPendientes.length, imagenes: imagenesPendientes.length };
  }

  private async getInspeccionesSinSincronizar() {
    const query = select().from(TableNames.INSPECCION_TOP).where(`${TableNames.INSPECCION_TOP}.sincronizado`, 0).toString();

    const result = await this.databaseService.query(query);
    const resultAll = this.databaseService.getAll(result);

    return resultAll;
  }

  private async getInspeccionesImagenesSinSincronizar() {
    const query = select([`${TableNames.INSPECCION_TOP_IMAGEN}.*`, `${TableNames.INSPECCION_TOP}.id_servidor AS inspeccionServerId`])
      .from(TableNames.INSPECCION_TOP_IMAGEN)
      .innerJoin(TableNames.INSPECCION_TOP)
      .on(`${TableNames.INSPECCION_TOP_IMAGEN}.inpseccion_top_id`, `${TableNames.INSPECCION_TOP}.id`)
      .where(`${TableNames.INSPECCION_TOP_IMAGEN}.sincronizado`, 0)
      .toString();

    const result = await this.databaseService.query(query);
    const resultAll = this.databaseService.getAll(result);

    return resultAll;
  }

  async enviarPendientes() {
    if (this.networkService.isOnline()) {
      const loader = await this.alertService.presentLoading('Enviando TOPs');
      let inspeccionesError = 0;
      let inspeccionesFotosError = 0;

      const inspeccionesPendientesDB = await this.getInspeccionesSinSincronizar();
      const inspeccionesPendientes = inspeccionesPendientesDB.map(inspeccion => {
        const formulario: InspeccionCabecera = JSON.parse(inspeccion.formulario);
        formulario.localId = inspeccion.id;
        return formulario;
      });

      for (const inspeccionPendiente of inspeccionesPendientes) {
        try {
          const inspeccionRequest = await this.sendInspeccion(inspeccionPendiente);
          inspeccionPendiente.id = inspeccionRequest.Id;
          await this.updateInspeccionServerId(inspeccionPendiente.localId, inspeccionPendiente.id);
        } catch (error) {
          inspeccionesError = inspeccionesError++;
        }
      }

      loader.message = 'Enviando imágenes';

      const imagenesPendientesDB = await this.getInspeccionesImagenesSinSincronizar();
      const imagenesPendientes = imagenesPendientesDB.map(imagenPendiente =>
        new ImagenPendiente(imagenPendiente.id, imagenPendiente.inpseccion_top_id, imagenPendiente.imagen, imagenPendiente.inspeccionServerId)
      );

      for (const imagenPendiente of imagenesPendientes) {
        try {
          if (imagenPendiente.topIdServidor) {
            const foto = await this.fileService.getPhotoFromFileSystem(imagenPendiente.topId, imagenPendiente.imageName);
            foto.localId = imagenPendiente.id;
            await this.sendInspeccionFoto(imagenPendiente.topIdServidor, foto);
          }
        } catch (error) {
          inspeccionesFotosError = inspeccionesFotosError++;
        }
      }

      loader.dismiss();
    } else {
      this.alertService.presentToastSinConexion();
    }
  }

  async getHistorial(): Promise<Historial[]> {
    if (this.networkService.isOnline()) {
      const loader = await this.alertService.presentLoading('Obteniendo historial');
      try {
        const response = await this.http.get<WsHistorialExtendido[]>(`${environment.baseApi}inspecciones/HistorialExtendido/${this.accountService.userValue.username}`).toPromise();

        const result = response.reduce((accumulator, historialItem) => {
          const dateObj = new Date(historialItem.Fecha);
          const monthYear = formatDate(dateObj, 'MMMM yyyy', { locale: dateFnsLocalES });
          if (!accumulator[monthYear]) {
            historialItem.Fecha = formatDate(dateObj, 'dd/MM/yyyy HH:mm');
            accumulator[monthYear] = { monthYear, entries: [historialItem] };
          }
          else {
            historialItem.Fecha = formatDate(dateObj, 'dd/MM/yyyy HH:mm');
            accumulator[monthYear].entries.push(historialItem);
          }
          return accumulator;
        }, {});

        const agrupados: Historial[] = Object.values(result);
        loader.dismiss();
        return agrupados;
      } catch (error) {
        loader.dismiss();
        this.alertService.presentToast(error, 'danger');
      }
    } else {
      this.alertService.presentToastSinConexion();
    }
  }
}
