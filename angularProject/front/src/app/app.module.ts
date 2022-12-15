import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DininghallComponent } from './dininghall/dininghall.component';
import { ItemComponent } from './item/item.component';
import { NavComponent } from './nav/nav.component';
import { SwitchComponent } from './switch/switch.component';
import { StationNameComponent } from './station-name/station-name.component';
import { AppButtonComponent } from './app-button/app-button.component';
import { StarsComponent } from './stars/stars.component';

@NgModule({
  declarations: [
    AppComponent,
    DininghallComponent,
    ItemComponent,
    NavComponent,
    SwitchComponent,
    StationNameComponent,
    AppButtonComponent,
    StarsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
