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
import { ROUTE_PATHS } from './constants';

// Define typed routes
const routes: Routes = [
    { path: ROUTE_PATHS.HOME, component: HomeComponent },
    { path: ROUTE_PATHS.LOGIN, component: SignInComponent },
    { path: ROUTE_PATHS.REGISTER, component: RegisterComponent },
    { path: ROUTE_PATHS.ABOUT_US, component: AboutUsComponent },
    { path: ROUTE_PATHS.REVIEWS, component: ReviewsComponent },
    { path: ROUTE_PATHS.SETTINGS, component: SettingsComponent },
    { path: ROUTE_PATHS.NOT_FOUND, component: PageNotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {
    constructor() {}
}
