import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ListasObligatorias } from '@app/_models/listas/listas-obligatorias';
import { DatabaseService } from './database.service';
import { TableNames } from '@app/_helpers/enums/table-names';
import { UnidadNegocio } from '../_models/listas/unidad-negocio';
import { Empresa } from '../_models/listas/empresa';
import { select, like, isNotNull, update } from 'sql-bricks';
import { ListasRegistracion } from '../_models/registracion/listas-registracion';
import { AreaDeTrabajo } from '../_models/listas/area-de-trabajo';
import { ListasRegistracionAdfs } from '@app/_models/registracion/listas-registracion-adfs';
import { Yacimiento } from '../_models/listas/yacimiento';
import { Gerencia } from '../_models/listas/gerencia';
import { ListasTop } from '@app/_models/top/listas-top';
import { LugarEspecifico } from '../_models/listas/lugar-especifico';
import { ChecklistCabecera } from '../_models/listas/checklist-cabecera';
import { ChecklistGrupo } from '../_models/listas/checklist-grupo';
import { ChecklistItem } from '@app/_models/listas/checklist-item';
import { FileService } from './file.service';
import { CargoContratista } from '../_models/listas/cargo-contratista';

@Injectable({
  providedIn: 'root'
})
export class ListasService {
  constructor(private http: HttpClient, private databaseService: DatabaseService, private fileService: FileService) { }

  async getListas() {
    try {
      const listas = await this.http.get<ListasObligatorias>(`${environment.baseApi}Mobile`).toPromise();

      await this.guardarListas(listas);
      await this.guardarImagenesChecklist();
    } catch (error) {
      throw error;
    }
  }

  getListasRegistracion(): Promise<ListasRegistracion> {
    return new Promise((resolve, reject) => {
      const promiseCargosContratistas = this.getCargosContratistas();
      const promiseUnidadesNegocio = this.getUnidadesNegocio();
      const promiseAreasTrabajo = this.getAreasTrabajo();

      Promise.all([promiseCargosContratistas, promiseUnidadesNegocio, promiseAreasTrabajo])
        .then(promises => {
          const cargosContratistasDB = promises[0];
          const unidadesNegocioDB = promises[1];
          const areasTrabajoDB = promises[2];
          const listas = new ListasRegistracion();

          listas.cargos = cargosContratistasDB.map(cargoContratistaDB => new CargoContratista(cargoContratistaDB.id, cargoContratistaDB.descripcion, this.databaseService.integerToBoolean(cargoContratistaDB.activo)));
          listas.unidadesNegocio = unidadesNegocioDB.map(unidadNegocioDB => new UnidadNegocio(unidadNegocioDB.id, unidadNegocioDB.descripcion, this.databaseService.integerToBoolean(unidadNegocioDB.activo)));
          listas.areasTrabajo = areasTrabajoDB.map(areaTrabajoDB => new AreaDeTrabajo(areaTrabajoDB.id, areaTrabajoDB.descripcion, areaTrabajoDB.sigla, areaTrabajoDB.unidad_negocio_id, this.databaseService.integerToBoolean(areaTrabajoDB.activo)));

          resolve(listas);
        }).catch(error => {
          console.log(error);
        });
    });
  }

  getListasRegistracionAdfs(): Promise<ListasRegistracionAdfs> {
    return new Promise((resolve, reject) => {
      const promiseUnidadesNegocio = this.getUnidadesNegocio();
      const promiseAreasTrabajo = this.getAreasTrabajo();
      const promiseYacimientos = this.getYacimientos();
      const promiseGerencias = this.getGerencias();

      Promise.all([promiseUnidadesNegocio, promiseAreasTrabajo, promiseYacimientos, promiseGerencias])
        .then(promises => {
          const unidadesNegocioDB = promises[0];
          const areasTrabajoDB = promises[1];
          const yacimientosDB = promises[2];
          const gerenciasDB = promises[3];
          const listas = new ListasRegistracionAdfs();

          listas.unidadesNegocio = unidadesNegocioDB.map(unidadNegocioDB => new UnidadNegocio(unidadNegocioDB.id, unidadNegocioDB.descripcion, this.databaseService.integerToBoolean(unidadNegocioDB.activo)));
          listas.areasTrabajo = areasTrabajoDB.map(areaTrabajoDB => new AreaDeTrabajo(areaTrabajoDB.id, areaTrabajoDB.descripcion, areaTrabajoDB.sigla, areaTrabajoDB.unidad_negocio_id, this.databaseService.integerToBoolean(areaTrabajoDB.activo)));
          listas.yacimientos = yacimientosDB.map(yacimientoDB => new Yacimiento(yacimientoDB.id, yacimientoDB.descripcion, yacimientoDB.area_trabajo_id, this.databaseService.integerToBoolean(yacimientoDB.activo)));
          listas.gerencias = gerenciasDB.map(gerenciaDB => new Gerencia(gerenciaDB.id, gerenciaDB.descripcion, this.databaseService.integerToBoolean(gerenciaDB.activo)));

          resolve(listas);
        }).catch(error => {
          console.log(error);
        });

    });
  }

  getEmpresas(text: string): Promise<Empresa[]> {
    return new Promise((resolve, reject) => {
      const query = select('*').from(TableNames.EMPRESA)
        .where(like('razon_social', `%${text}%`))
        .orderBy('razon_social')
        .toParams({ placeholder: '?%d' });
      this.databaseService.query(query.text, query.values)
        .then(result => {
          const empresas = this.databaseService.getAll(result);
          const empresasMap = empresas.map(empresaDB => {
            const empresaMap = new Empresa();
            empresaMap.Id = empresaDB.id;
            empresaMap.RazonSocial = empresaDB.razon_social;
            empresaMap.EsContratista = this.databaseService.integerToBoolean(empresaDB.es_contratista);
            empresaMap.CUIT = empresaDB.cuit;
            empresaMap.Rubro = empresaDB.rubro;
            return empresaMap;
          });
          resolve(empresasMap);
        });
    });
  }

  getListasTop(): Promise<ListasTop> {
    return new Promise((resolve, reject) => {
      const promiseUnidadesNegocio = this.getUnidadesNegocio();
      const promiseAreasTrabajo = this.getAreasTrabajo();
      const promiseYacimientos = this.getYacimientos();
      const promiseGerencias = this.getGerencias();
      const promiseLugaresEspecificos = this.getLugaresEspecificos();
      const promiseChecklist = this.getChecklistCabecera();

      Promise.all([promiseUnidadesNegocio, promiseAreasTrabajo, promiseYacimientos, promiseGerencias, promiseLugaresEspecificos, promiseChecklist])
        .then(promises => {
          const unidadesNegocioDB = promises[0];
          const areasTrabajoDB = promises[1];
          const yacimientosDB = promises[2];
          const gerenciasDB = promises[3];
          const lugaresEspecificosDB = promises[4];
          const listas = new ListasTop();

          listas.unidadesNegocio = unidadesNegocioDB.map(unidadNegocioDB => new UnidadNegocio(unidadNegocioDB.id, unidadNegocioDB.descripcion, this.databaseService.integerToBoolean(unidadNegocioDB.activo)));
          listas.areasTrabajo = areasTrabajoDB.map(areaTrabajoDB => new AreaDeTrabajo(areaTrabajoDB.id, areaTrabajoDB.descripcion, areaTrabajoDB.sigla, areaTrabajoDB.unidad_negocio_id, this.databaseService.integerToBoolean(areaTrabajoDB.activo)));
          listas.yacimientos = yacimientosDB.map(yacimientoDB => new Yacimiento(yacimientoDB.id, yacimientoDB.descripcion, yacimientoDB.area_trabajo_id, this.databaseService.integerToBoolean(yacimientoDB.activo)));
          listas.gerencias = gerenciasDB.map(gerenciaDB => new Gerencia(gerenciaDB.id, gerenciaDB.descripcion, this.databaseService.integerToBoolean(gerenciaDB.activo)));
          listas.lugaresEspecificos = lugaresEspecificosDB.map(lugarEspecificosDB => new LugarEspecifico(lugarEspecificosDB.id, lugarEspecificosDB.descripcion, lugarEspecificosDB.yacimiento_id, this.databaseService.integerToBoolean(lugarEspecificosDB.activo)));
          listas.checklist = promises[5];

          resolve(listas);
        }).catch(error => {
          console.log(error);
        });

    });
  }

  private async guardarListas(listas: ListasObligatorias) {
    return new Promise(async (resolve, reject) => {
      const tx = this.databaseService.initTransaction();

      for (const tipoUsuario of listas.TiposUsuarios) {
        await this.databaseService.insertOrReplace(
          TableNames.TIPO_USUARIO,
          ['id', 'descripcion'],
          [tipoUsuario.Id, tipoUsuario.Descripcion],
          tx
        );
      }

      for (const cargo of listas.Cargos) {
        await this.databaseService.insertOrReplace(
          TableNames.CARGO,
          ['id', 'descripcion', 'activo'],
          [cargo.Id, cargo.Descripcion, this.databaseService.booleanToInteger(cargo.Activo)],
          tx
        );
      }

      for (const cargoContratista of listas.CargosContratistas) {
        await this.databaseService.insertOrReplace(
          TableNames.CARGO_CONTRATISTA, ['id', 'descripcion', 'activo'],
          [cargoContratista.Id, cargoContratista.Descripcion, this.databaseService.booleanToInteger(cargoContratista.Activo)],
          tx
        );
      }

      for (const gerencia of listas.Gerencias) {
        await this.databaseService.insertOrReplace(
          TableNames.GERENCIA,
          ['id', 'descripcion', 'activo'],
          [gerencia.Id, gerencia.Descripcion, this.databaseService.booleanToInteger(gerencia.Activo)],
          tx
        );
      }

      for (const modulo of listas.Modulos) {
        await this.databaseService.insertOrReplace(TableNames.MODULO, ['id', 'descripcion'], [modulo.Id, modulo.Descripcion], tx);
      }

      for (const empresa of listas.Empresas) {
        await this.databaseService.insertOrReplace(
          TableNames.EMPRESA,
          ['id', 'cuit', 'razon_social', 'rubro', 'es_contratista', 'activo'],
          [empresa.Id, empresa.CUIT, empresa.RazonSocial, empresa.Rubro, this.databaseService.booleanToInteger(empresa.EsContratista), this.databaseService.booleanToInteger(empresa.Activo)],
          tx
        );
      }

      for (const unidadNegocio of listas.UnidadesNegocio) {
        await this.databaseService.insertOrReplace(
          TableNames.UNIDAD_NEGOCIO,
          ['id', 'descripcion', 'activo'],
          [unidadNegocio.Id, unidadNegocio.Descripcion, this.databaseService.booleanToInteger(unidadNegocio.Activo)],
          tx
        );
      }

      for (const areaTrabajo of listas.AreasDeTrabajo) {
        await this.databaseService.insertOrReplace(
          TableNames.AREA_TRABAJO,
          ['id', 'descripcion', 'sigla', 'unidad_negocio_id', 'activo'],
          [areaTrabajo.Id, areaTrabajo.Descripcion, areaTrabajo.Sigla, areaTrabajo.UnidadNegocioID, this.databaseService.booleanToInteger(areaTrabajo.Activo)],
          tx
        );
      }

      for (const yacimiento of listas.Yacimientos) {
        await this.databaseService.insertOrReplace(
          TableNames.YACIMIENTO,
          ['id', 'descripcion', 'area_trabajo_id', 'activo'],
          [yacimiento.Id, yacimiento.Descripcion, yacimiento.AreaDeTrabajoID, this.databaseService.booleanToInteger(yacimiento.Activo)],
          tx
        );
      }

      for (const lugarEspecifico of listas.LugaresEspecificos) {
        await this.databaseService.insertOrReplace(
          TableNames.LUGAR_ESPECIFICO,
          ['id', 'descripcion', 'yacimiento_id', 'activo'],
          [lugarEspecifico.Id, lugarEspecifico.Descripcion, lugarEspecifico.YacimientoID, this.databaseService.booleanToInteger(lugarEspecifico.Activo)],
          tx
        );
      }

      for (const checklistCabecera of listas.CheckListCabeceras) {
        await this.databaseService.insertOrReplace(
          TableNames.CHECKLIST_CABECERA,
          ['id', 'nombre'],
          [checklistCabecera.Id, checklistCabecera.Nombre],
          tx
        );

        for (const checklistGrupo of checklistCabecera.CheckListGrupos) {
          await this.databaseService.insertOrReplace(
            TableNames.CHECKLIST_CABECERA_GRUPO,
            ['id', 'checklist_cabecera_id', 'nombre', 'numero', 'iconos'],
            [checklistGrupo.Id, checklistGrupo.CheckListCabeceraID, checklistGrupo.Nombre, checklistGrupo.Numero, this.databaseService.booleanToInteger(checklistGrupo.Iconos)],
            tx
          );

          for (const checklistItem of checklistGrupo.CheckListItems) {
            await this.databaseService.insertOrReplace(
              TableNames.CHECKLIST_CABECERA_GRUPO_ITEM,
              ['id', 'checklist_cabecera_grupo_id', 'titulo', 'texto', 'orden', 'numerado', 'icono', 'imagen'],
              [checklistItem.Id, checklistItem.CheckListGrupoID, checklistItem.Titulo, checklistItem.Texto, checklistItem.Orden, this.databaseService.booleanToInteger(checklistItem.Numerado), checklistItem.Icono, null],
              tx
            );
          }
        }
      }

      tx.commit()
        .then(results => {
          console.log(results);
          resolve();
        })
        .then(null, error => {
          console.log(error);
          reject(error);
        });
    });
  }

  private async guardarImagenesChecklist() {
    const imagenesNombre = await this.getImagenesChecklist();
    for (const imagenNombre of imagenesNombre) {
      const imageBlob = await this.http.get(`${environment.baseWeb}img/PlantillaTop/${imagenNombre.icono}`, { responseType: 'blob' }).toPromise();
      const dataURL = await this.fileService.blobToDataURL(imageBlob);
      await this.updateImagenIcono(imagenNombre.icono, dataURL);
    }
  }

  private async updateImagenIcono(imagenNombre: string, imagenDataURL: string) {
    const query = update(TableNames.CHECKLIST_CABECERA_GRUPO_ITEM).set('imagen', imagenDataURL).where('icono', imagenNombre).toString();
    await this.databaseService.query(query);
  }

  private async getImagenesChecklist(): Promise<{ icono: string }[]> {
    const query = select().distinct('icono').from(TableNames.CHECKLIST_CABECERA_GRUPO_ITEM).where(isNotNull('icono')).toString();
    console.log(query);
    const result = await this.databaseService.query(query);
    const resultDB = this.databaseService.getAll(result);

    return resultDB;
  }

  private async getCargos() {
    const queryCargos = select('*').from(TableNames.CARGO).where('activo', 1).orderBy('descripcion').toString();
    const cargosResult = await this.databaseService.query(queryCargos);
    const cargosDB = this.databaseService.getAll(cargosResult);

    return cargosDB;
  }

  private async getCargosContratistas() {
    const queryCargos = select('*').from(TableNames.CARGO_CONTRATISTA).where('activo', 1).orderBy('descripcion').toString();
    const cargosResult = await this.databaseService.query(queryCargos);
    const cargosDB = this.databaseService.getAll(cargosResult);

    return cargosDB;
  }

  private async getUnidadesNegocio() {
    const queryUnidadesNegocio = select('*').from(TableNames.UNIDAD_NEGOCIO).where('activo', 1).orderBy('descripcion').toString();
    const unidadesNegocioResult = await this.databaseService.query(queryUnidadesNegocio);
    const unidadesNegocioDB = this.databaseService.getAll(unidadesNegocioResult);

    return unidadesNegocioDB;
  }

  private async getAreasTrabajo() {
    const queryAreasTrabajo = select('*').from(TableNames.AREA_TRABAJO).where('activo', 1).orderBy('descripcion').toString();
    const areasTrabajoResult = await this.databaseService.query(queryAreasTrabajo);
    const areasTrabajoDB = this.databaseService.getAll(areasTrabajoResult);

    return areasTrabajoDB;
  }

  private async getYacimientos() {
    const queryYacimientos = select('*').from(TableNames.YACIMIENTO).where('activo', 1).orderBy('descripcion').toString();
    const yacimientosResult = await this.databaseService.query(queryYacimientos);
    const yacimientosDB = this.databaseService.getAll(yacimientosResult);

    return yacimientosDB;
  }

  private async getGerencias() {
    const queryGerencias = select('*').from(TableNames.GERENCIA).where('activo', 1).orderBy('descripcion').toString();
    const gerenciasResult = await this.databaseService.query(queryGerencias);
    const gerenciasDB = this.databaseService.getAll(gerenciasResult);

    return gerenciasDB;
  }

  private async getLugaresEspecificos() {
    const queryLugaresEspecificos = select('*').from(TableNames.LUGAR_ESPECIFICO).where('activo', 1).orderBy('descripcion').toString();
    const lugaresEspecificosResult = await this.databaseService.query(queryLugaresEspecificos);
    const lugaresEspecificosDB = this.databaseService.getAll(lugaresEspecificosResult);

    return lugaresEspecificosDB;
  }

  public async getChecklistCabecera() {
    const queryChecklist = select('*').from(TableNames.CHECKLIST_CABECERA).toString();
    const checklistResult = await this.databaseService.query(queryChecklist);
    const checklistDB = this.databaseService.getFirst(checklistResult);

    const checklist = new ChecklistCabecera();
    checklist.Id = checklistDB.id;
    checklist.Nombre = checklistDB.nombre;
    checklist.CheckListGrupos = [];

    const checklistGruposDB = await this.getChecklistCabeceraGrupos(checklist.Id);

    for (const grupoDB of checklistGruposDB) {
      const grupo = new ChecklistGrupo();
      grupo.Id = grupoDB.id;
      grupo.Nombre = grupoDB.nombre;
      grupo.Numero = grupoDB.numero;
      grupo.Iconos = this.databaseService.integerToBoolean(grupoDB.iconos);
      grupo.CheckListCabeceraID = checklist.Id;
      grupo.CheckListItems = [];
      const itemsDB = await this.getChecklistCabeceraGrupoItems(grupo.Id);
      for (const itemDB of itemsDB) {
        const item = new ChecklistItem();
        item.Id = itemDB.id;
        item.CheckListGrupoID = grupo.Id;
        item.Titulo = itemDB.titulo;
        item.Texto = itemDB.texto;
        item.Orden = itemDB.orden;
        item.Numerado = this.databaseService.integerToBoolean(itemDB.numerado);
        item.Icono = itemDB.icono;
        item.imagenBase64 = itemDB.imagen;
        grupo.CheckListItems.push(item);
      }
      checklist.CheckListGrupos.push(grupo);
    }

    return checklist;
  }

  public async getChecklistCabeceraGrupos(cabeceraId: number) {
    const queryChecklistGrupos = select('*').from(TableNames.CHECKLIST_CABECERA_GRUPO).where('checklist_cabecera_id', cabeceraId).orderBy(['numero']).toString();
    const checklistGruposResult = await this.databaseService.query(queryChecklistGrupos);
    const checklistGruposDB = this.databaseService.getAll(checklistGruposResult);

    return checklistGruposDB;
  }

  public async getChecklistCabeceraGrupoItems(grupoId: number) {
    const queryChecklistGrupoItems = select('*').from(TableNames.CHECKLIST_CABECERA_GRUPO_ITEM).where('checklist_cabecera_grupo_id', grupoId).orderBy(['orden']).toString();
    const checklistGrupoItemsResult = await this.databaseService.query(queryChecklistGrupoItems);
    const checklistGrupoItemsDB = this.databaseService.getAll(checklistGrupoItemsResult);

    return checklistGrupoItemsDB;
  }
}
