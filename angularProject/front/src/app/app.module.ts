import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { DininghallComponent } from './components/dininghall/dininghall.component';
import { ItemComponent } from './components/item/item.component';
import { NavComponent } from './components/nav/nav.component';
import { SwitchComponent } from './components/switch/switch.component';
import { StationNameComponent } from './components/station-name/station-name.component';
import { AppButtonComponent } from './components/app-button/app-button.component';
import { StarsComponent } from './components/stars/stars.component';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { RegisterComponent } from './components/register/register.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { TextShadowDirective } from './directives/text-shadow/text-shadow.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoAutocompleteBgDirective } from './directives/no-autocomplete/no-autocomplete-bg.directive';
import { SettingsComponent } from './components/settings/settings.component';
import { SettingsTabComponent } from './components/settings-tab/settings-tab.component';
import { ToggleComponent } from './components/toggle/toggle.component';

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
        ToggleComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        CommonModule,
        ReactiveFormsModule,
        HttpClientXsrfModule.withOptions({
            cookieName: 'CSRF_TOKEN',
            headerName: 'H_CSRF_TOKEN',
        }),
        FormsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
