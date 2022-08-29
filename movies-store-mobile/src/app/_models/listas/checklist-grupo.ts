import { ChecklistItem } from './checklist-item';

export class ChecklistGrupo {
  Id: number;
  CheckListCabeceraID: number;
  Nombre: string;
  Numero: number;
  Iconos: boolean;
  CheckListItems: ChecklistItem[];
  // se usa en la vista
  reportada = false;
}
