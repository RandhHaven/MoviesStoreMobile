import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NuevaTopComponent } from './nueva-top/nueva-top.component';
import { HistorialComponent } from './historial/historial.component';


const routes: Routes = [
  {
    path: 'nueva',
    component: NuevaTopComponent
  },
  {
    path: 'historial',
    component: HistorialComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TopRoutingModule { }
