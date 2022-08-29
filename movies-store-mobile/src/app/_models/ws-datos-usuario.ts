import { Empresa } from './listas/empresa';
import { Cargo } from './listas/cargo';
import { CargoContratista } from './listas/cargo-contratista';
import { UnidadNegocio } from './listas/unidad-negocio';
import { AreaDeTrabajo } from './listas/area-de-trabajo';
import { BaseModel } from './base-model';

class UnidadNegocioWS {
  Id: number;
  UnidadNegocio: UnidadNegocio;
  UnidadNegocioID: number;
  UserId: string;
}

class AreaTrabajoWS {
  Id: number;
  AreaDeTrabajo: AreaDeTrabajo;
  AreaDeTrabajoId: number;
  UserId: string;
}

export class WsDatosUsuario {
  Id: string;
  UserName: string;
  Nombre: string;
  Apellido: string;
  Email: string;
  DNI: string;
  Empresa: Empresa;
  Cargo?: Cargo;
  UnidadesNegocio?: UnidadNegocioWS[];
  AreasDeTrabajo?: AreaTrabajoWS[];
  CargoContratista?: CargoContratista;
  EsAdministrador: boolean;
  EsLiderSSMA: boolean;
  EsSuperAdministrador: boolean;
  EsSuperUsuario: boolean;
  LiderSSMAPuedeEditar: boolean;
  PuedeRealizarInspeccion: boolean;
  Modulos: BaseModel[];
  YacimientoID?: number;
  GerenciaID?: number;
}
