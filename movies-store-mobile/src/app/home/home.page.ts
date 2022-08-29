import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { MenuController } from '@ionic/angular';
import { TopService } from '../_services/top.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  nombre: string;
  apellido: string;
  topsPendientes = 0;
  imagenesPendientes = 0;
  constructor(private accountService: AccountService, private menuCtrl: MenuController, private topService: TopService) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
    const user = this.accountService.userValue;
    this.nombre = user.firstName;
    this.apellido = user.lastName;
    this.getPendientes();
  }

  async forzarSincronizacion() {
    this.topService.enviarPendientes().then(() => {
      this.getPendientes();
    });
  }

  private getPendientes() {
    this.topService.getInspeccionesEImagenesSinSincronizar()
      .then(pendientes => {
        this.topsPendientes = pendientes.inspecciones;
        this.imagenesPendientes = pendientes.imagenes;
      });
  }

}
