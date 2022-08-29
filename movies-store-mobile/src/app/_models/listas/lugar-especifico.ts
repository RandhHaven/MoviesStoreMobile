import { BaseModel } from '../base-model';
import { Yacimiento } from './yacimiento';
export class LugarEspecifico implements BaseModel {
  Id: number;
  Descripcion: string;
  YacimientoID: number;
  Yacimiento: Yacimiento;
  Activo: boolean;

  constructor(id: number, descripcion: string, yacimientoId: number, activo: boolean) {
    this.Id = id;
    this.Descripcion = descripcion;
    this.YacimientoID = yacimientoId;
    this.Activo = activo;
  }
}
