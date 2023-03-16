import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutUsComponent } from './about-us/about-us.component';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RegisterComponent } from './register/register.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { SettingsComponent } from './settings/settings.component';
import { SignInComponent } from './sign-in/sign-in.component';

const routes: Routes = [
  { path: '' , component: HomeComponent},
  { path: 'login', component: SignInComponent},
  { path: 'register', component: RegisterComponent},
  { path: 'aboutus', component: AboutUsComponent},
  { path: 'reviews', component: ReviewsComponent},
  { path: 'settings', component: SettingsComponent},
  { path: '**', component: PageNotFoundComponent }  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

  constructor() {

  }

 }
