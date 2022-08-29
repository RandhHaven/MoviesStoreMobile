import { BaseModel } from '../base-model';
import { UnidadNegocio } from './unidad-negocio';
export class AreaDeTrabajo implements BaseModel {
  Id: number;
  Descripcion: string;
  Sigla: string;
  UnidadNegocioID: number;
  UnidadNegocio: UnidadNegocio;
  Activo: boolean;

  constructor(id: number, descripcion: string, sigla: string, unidadNegocioId: number, activo: boolean) {
    this.Id = id;
    this.Descripcion = descripcion;
    this.Sigla = sigla;
    this.UnidadNegocioID = unidadNegocioId;
    this.Activo = activo;
  }
}
