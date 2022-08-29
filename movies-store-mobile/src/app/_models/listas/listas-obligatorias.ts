import { Empresa } from './empresa';
import { Yacimiento } from './yacimiento';
import { AreaDeTrabajo } from './area-de-trabajo';
import { LugarEspecifico } from './lugar-especifico';
import { ChecklistCabecera } from './checklist-cabecera';
import { Modulo } from './modulo';
import { Cargo } from './cargo';
import { CargoContratista } from './cargo-contratista';
import { Gerencia } from './gerencia';
import { TipoUsuario } from './tipo-usuario';
import { UnidadNegocio } from './unidad-negocio';

export class ListasObligatorias {
  AreasDeTrabajo: AreaDeTrabajo[];
  Cargos: Cargo[];
  CargosContratistas: CargoContratista[];
  CheckListCabeceras: ChecklistCabecera[];
  Empresas: Empresa[];
  Gerencias: Gerencia[];
  LugaresEspecificos: LugarEspecifico[];
  Modulos: Modulo[];
  TiposUsuarios: TipoUsuario[];
  UnidadesNegocio: UnidadNegocio[];
  Yacimientos: Yacimiento[];
}
