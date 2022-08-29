import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChecklistGrupo } from '../../../_models/listas/checklist-grupo';

@Component({
  selector: 'app-checklist-questions',
  templateUrl: './checklist-questions.component.html',
  styleUrls: ['./checklist-questions.component.scss'],
})
export class ChecklistQuestionsComponent implements OnInit {
  @Input() grupos: ChecklistGrupo[];
  @Input() numero: number;
  titulo: string;
  grupoActivo: ChecklistGrupo;
  minGrupo: number;
  maxGrupo: number;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.grupoActivo = this.grupos.find(grupo => grupo.Numero === this.numero);
    this.titulo = this.grupoActivo.Nombre;
    const numeros = this.grupos.map(grupo => grupo.Numero);
    this.minGrupo = Math.min(...numeros);
    this.maxGrupo = Math.max(...numeros);
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }

  onAnterior() {
    if (this.grupoActivo.Numero === this.minGrupo) {
      this.modalCtrl.dismiss();
    } else {
      this.grupoActivo = this.grupos.find(grupo => grupo.Numero === (this.grupoActivo.Numero - 1));
      this.titulo = this.grupoActivo.Nombre;
    }
  }

  onSiguiente() {
    if (this.grupoActivo.Numero === this.maxGrupo) {
      this.modalCtrl.dismiss();
    } else {
      this.grupoActivo = this.grupos.find(grupo => grupo.Numero === (this.grupoActivo.Numero + 1));
      this.titulo = this.grupoActivo.Nombre;
    }
  }
}
