import { WsHistorialExtendido } from './ws-historial-extendido';
export interface Historial {
  monthYear: string;
  entries: WsHistorialExtendido[];
}
