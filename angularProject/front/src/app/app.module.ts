import {
    AboutUsComponent,
    AppButtonComponent,
    AppComponent,
    DininghallComponent,
    HomeComponent,
    ItemComponent,
    NavComponent,
    PageNotFoundComponent,
    RegisterComponent,
    ReviewsComponent,
    SettingsComponent,
    SettingsTabComponent,
    SignInComponent,
    StarsComponent,
    StationNameComponent,
    SwitchComponent,
    ToggleComponent,
} from './components';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { NoAutocompleteBgDirective, TextShadowDirective } from './directives';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from './components/footer/footer.component';
import { NavLinkComponent } from './components/nav-link/nav-link.component';
import { DropDownComponent } from './components/drop-down/drop-down.component';
import { SideCarComponent } from './components/side-car/side-car.component';
import { SettingsTabProfileComponent } from './components/settings-tab-profile/settings-tab-profile.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

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
        FooterComponent,
        NavLinkComponent,
        SideCarComponent,
        SettingsTabProfileComponent,
        ResetPasswordComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        DropDownComponent,
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
