import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { AccountRoutingModule } from './account-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { IonicSelectableModule } from 'ionic-selectable';
import { RegisterAdfsComponent } from './register-adfs/register-adfs.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    AccountRoutingModule,
    IonicSelectableModule
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    RegisterAdfsComponent,
    MyProfileComponent
  ]
})
export class AccountModule { }
