import {
    AboutUsComponent,
    HomeComponent,
    PageNotFoundComponent,
    RegisterComponent,
    ReviewsComponent,
    SettingsComponent,
    SignInComponent,
} from './components';
import { RouterModule, type Routes } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: SignInComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'aboutus', component: AboutUsComponent },
    { path: 'reviews', component: ReviewsComponent },
    { path: 'settings', component: SettingsComponent },
    { path: '**', component: PageNotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {
    constructor() {}
}
