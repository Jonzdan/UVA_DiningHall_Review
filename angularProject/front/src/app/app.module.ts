import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
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
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { RegisterComponent } from './register/register.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TextShadowDirective } from './text-shadow.directive';
import { ReactiveFormsModule } from '@angular/forms';
import { NoAutocompleteBgDirective } from './no-autocomplete-bg.directive';
import { SettingsComponent } from './settings/settings.component';
import { SettingsTabComponent } from './settings-tab/settings-tab.component'


@NgModule({
  declarations: [
    AppComponent,
    DininghallComponent,
    ItemComponent,
    NavComponent,
    SwitchComponent,
    StationNameComponent,
    AppButtonComponent,
    StarsComponent,
    HomeComponent,
    ReviewsComponent,
    RegisterComponent,
    SignInComponent,
    AboutUsComponent,
    PageNotFoundComponent,
    TextShadowDirective,
    NoAutocompleteBgDirective,
    SettingsComponent,
    SettingsTabComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'CSRF_TOKEN',
      headerName: 'H_CSRF_TOKEN'
    })
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
