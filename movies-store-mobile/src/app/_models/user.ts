import { Empresa } from './listas/empresa';
import { Cargo } from './listas/cargo';
import { CargoContratista } from './listas/cargo-contratista';
import { UnidadNegocio } from './listas/unidad-negocio';
import { AreaDeTrabajo } from './listas/area-de-trabajo';
import { BaseModel } from './base-model';
export class User {
  id: string;
  esAdministrador: boolean;
  esLiderSSMA: boolean;
  esSuperAdministrador: boolean;
  esSuperUsuario: boolean;
  liderSSMAPuedeEditar: boolean;
  puedeRealizarInspeccion: boolean;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  dni: string;
  cargo?: Cargo;
  cargoContratista?: CargoContratista;
  unidadNegocio?: UnidadNegocio[];
  areaTrabajo?: AreaDeTrabajo[];
  empresa: Empresa;
  modulos: BaseModel[];
  password: string;
  token: string;
  yacimientoId?: number;
  gerenciaId?: number;
}