import { BaseModel } from '../base-model';
import { AreaDeTrabajo } from './area-de-trabajo';
export class Yacimiento implements BaseModel {
  Id: number;
  Descripcion: string;
  AreaDeTrabajoID: number;
  AreaDeTrabajo: AreaDeTrabajo;
  Activo: boolean;

  constructor(id: number, descripcion: string, areaTrabajoId: number, activo: boolean) {
    this.Id = id;
    this.Descripcion = descripcion;
    this.AreaDeTrabajoID = areaTrabajoId;
    this.Activo = activo;
  }
}
