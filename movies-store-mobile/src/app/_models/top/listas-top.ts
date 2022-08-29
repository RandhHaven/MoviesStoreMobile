import { UnidadNegocio } from '../listas/unidad-negocio';
import { AreaDeTrabajo } from '../listas/area-de-trabajo';
import { Yacimiento } from '../listas/yacimiento';
import { LugarEspecifico } from '../listas/lugar-especifico';
import { Gerencia } from '../listas/gerencia';
import { ChecklistCabecera } from '../listas/checklist-cabecera';

export class ListasTop {
  unidadesNegocio: UnidadNegocio[];
  areasTrabajo: AreaDeTrabajo[];
  yacimientos: Yacimiento[];
  gerencias: Gerencia[];
  lugaresEspecificos: LugarEspecifico[];
  checklist: ChecklistCabecera;
}
