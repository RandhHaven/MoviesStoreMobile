import { BaseModel } from '../base-model';
export class CargoContratista implements BaseModel {
  Id: number;
  Descripcion: string;
  Activo: boolean;

  constructor(id: number, descripcion: string, activo: boolean) {
    this.Id = id;
    this.Descripcion = descripcion;
    this.Activo = activo;
  }
}
