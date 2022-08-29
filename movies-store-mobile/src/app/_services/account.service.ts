import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { User } from '@app/_models/user';
import { WsLogin } from '@app/_models/ws-login';
import { WsDatosUsuario } from '@app/_models/ws-datos-usuario';
import { WsRegister } from '@app/_models/registracion/ws-register';
import { Photo } from '@app/_models/photo';
import { FileService } from './file.service';
import { CallbackAdfs } from '@app/_models/callback-adfs';
import { WsRegisterAdfs } from '@app/_models/registracion/ws-register-adfs';
import {
  InAppBrowser,
  InAppBrowserOptions,
} from '@ionic-native/in-app-browser/ngx';
import { CallbackAdfsLoggedUser } from '@app/_models/callback-adfs-logged-user';
import { StorageKeys } from '@app/_helpers/enums/storage-keys';
import { NotificationService } from './notification.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private userSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  public user: Observable<User>;
  public tempUser: CallbackAdfs;
  authState = new BehaviorSubject(false);

  constructor(
    private router: Router,
    private storage: Storage,
    private http: HttpClient,
    private fileService: FileService,
    private iab: InAppBrowser,
    private notificationService: NotificationService
  ) {
    this.storage
      .get(StorageKeys.USER)
      .then((storageUser) => {
        if (storageUser) {
          this.userSubject = new BehaviorSubject<User>(storageUser);
          this.authState.next(true);
        } else {
          this.userSubject = new BehaviorSubject<User>(null);
        }

        this.user = this.userSubject.asObservable();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  async login(username: string, password: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = `grant_type=password&username=${username}&password=${password}`;

    const jwt = await this.http
      .post<string>(`${environment.baseUrl}get/token`, body, {
        headers,
        responseType: 'text' as 'json',
      })
      .toPromise();

    // store user details and jwt token in local storage to keep user logged in between page refreshes
    const user = await this.saveUser(jwt, username);
    this.notificationService.registerPushNotifications(username);
    return user;
  }

  public loginAD(jwt: string, username: string) {
    const user = this.saveUser(jwt, username);
    this.notificationService.registerPushNotifications(username);

    return user;
  }

  private async saveUser(jwt: string, username: string) {
    const user = new User();
    user.token = jwt;
    this.storage.set(StorageKeys.USER, user);
    this.userSubject.next(user);

    const userData = await this.http
      .get<WsDatosUsuario>(`${environment.baseApi}usuarios/${username}`)
      .toPromise();
    this.guardarDatosUsuario(user, userData);
    this.storage.set(StorageKeys.USER, user);
    this.userSubject.next(user);
    this.authState.next(true);

    return user;
  }

  private guardarDatosUsuario(userSession: User, userData: WsDatosUsuario) {
    userSession.id = userData.Id;
    userSession.firstName = userData.Nombre;
    userSession.lastName = userData.Apellido;
    userSession.username = userData.UserName;
    userSession.dni = userData.DNI;
    userSession.email = userData.Email;
    userSession.cargo = userData.Cargo;
    userSession.unidadNegocio = userData.UnidadesNegocio?.map(
      (un) => un.UnidadNegocio
    );
    userSession.areaTrabajo = userData.AreasDeTrabajo?.map(
      (at) => at.AreaDeTrabajo
    );
    userSession.empresa = userData.Empresa;
    userSession.cargoContratista = userData.CargoContratista;
    userSession.esAdministrador = userData.EsAdministrador;
    userSession.esLiderSSMA = userData.EsLiderSSMA;
    userSession.esSuperAdministrador = userData.EsSuperAdministrador;
    userSession.esSuperUsuario = userData.EsSuperUsuario;
    userSession.puedeRealizarInspeccion = userData.PuedeRealizarInspeccion;
    userSession.liderSSMAPuedeEditar = userData.LiderSSMAPuedeEditar;
    userSession.modulos = userData.Modulos;
    userSession.yacimientoId = userData.YacimientoID;
    userSession.gerenciaId = userData.GerenciaID;
  }

  logout() {
    // remove user from local storage and set current user to null
    this.storage.remove(StorageKeys.USER);
    this.userSubject.next(null);
    this.authState.next(false);
    this.notificationService.unregisterPushNotifications();
    this.router.navigate(['/account/login']);
  }

  register(user: any) {
    const usuarioExterno = new WsRegister(
      user.firstName,
      user.lastName,
      user.username,
      user.documento,
      user.empresa.Id,
      user.password,
      user.password2,
      user.cargo,
      user.unidadNegocio,
      user.areaTrabajo
    );
    return this.http.post(
      `${environment.baseApi}usuarios/RegistrarContratistaExterno`,
      usuarioExterno
    );
  }

  registerWithAdfs(user: any) {
    const usuarioAdfs = new WsRegisterAdfs(
      user.nombre,
      user.apellido,
      user.username,
      user.email,
      user.cargo,
      user.unidadNegocio,
      user.areaTrabajo,
      user.yacimiento,
      user.gerencia
    );
    return this.http.post<string>(
      `${environment.baseApi}usuarios/registrar-usuario-ad`,
      usuarioAdfs,
      { responseType: 'text' as 'json' }
    );
  }

  getAzureADTokenId(): Promise<string> {
    return new Promise((resolve, reject) => {
      const encodedRedirectURI = encodeURI(environment.azureAD.redirectURI);
      const uuid = uuidv4();
      const url = `https://login.microsoftonline.com/${environment.azureAD.tenantId}/oauth2/v2.0/authorize?response_type=id_token&scope=user.read%20openid%20profile&client_id=${environment.azureAD.clientId}&redirect_uri=${encodedRedirectURI}&nonce=${uuid}`;

      const browserOptions: InAppBrowserOptions = {
        cleardata: 'yes',
        clearcache: 'yes',
        location: 'no',
        clearsessioncache: 'yes',
      };

      const browser = this.iab.create(url, '_blank', browserOptions);

      browser.on('loadstart').subscribe((event) => {
        if (event.url.indexOf(environment.azureAD.redirectURI) === 0) {
          const tokenId = event.url.substring(
            event.url.indexOf('id_token=') + 'id_token='.length,
            event.url.indexOf('&session_state=')
          );
          browser.close();
          resolve(tokenId);
        }
      });
    });
  }

  getUserFromAzureAD(tokenId: string) {
    return this.http.get<CallbackAdfsLoggedUser>(
      environment.baseApi + 'usuarios/get-access-token-ad/' + tokenId,
    );
  }

  getUserImage() {
    return this.http.get<string>(
      `${environment.baseApi}usuarios/${this.userValue.username}/ProfilePictureBase64`,
      { responseType: 'text' as 'json' }
    );
  }

  async updateUserImage(image: Photo) {
    const formData = new FormData();
    const fileBlob = await this.fileService.fileToBlob(
      image.directory,
      image.filename,
      'image/jpeg'
    );
    formData.append('file', fileBlob, image.filename);

    return this.http
      .post<string>(
        `${environment.baseApi}usuarios/${this.userValue.username}/ProfilePicture`,
        formData,
        { responseType: 'text' as 'json' }
      )
      .toPromise();
  }

  isAuthenticated() {
    return this.authState.asObservable();
  }
}
