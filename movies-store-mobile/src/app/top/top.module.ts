import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TopRoutingModule } from './top-routing.module';
import { NuevaTopComponent } from './nueva-top/nueva-top.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ChecklistQuestionsComponent } from './nueva-top/checklist-questions/checklist-questions.component';
import { HistorialComponent } from './historial/historial.component';


@NgModule({
  declarations: [NuevaTopComponent, ChecklistQuestionsComponent, HistorialComponent],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    TopRoutingModule
  ]
})
export class TopModule { }
