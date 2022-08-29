import { Component, OnInit } from '@angular/core';
import { TopService } from '@app/_services/top.service';
import { Historial } from '@app/_models/top/historial';

@Component({
  selector: 'app-top-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
  historialItems: Historial[];
  constructor(private topService: TopService) { }

  ngOnInit() { }

  ionViewWillEnter() {
    this.topService.getHistorial().then(fechas => {
      this.historialItems = fechas;
    });
  }

}
