import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutUsComponent } from './about-us/about-us.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { SignInComponent } from './sign-in/sign-in.component';

const routes: Routes = [
  { path: '' , component: HomeComponent},
  { path: 'login', component: SignInComponent},
  { path: 'register', component: RegisterComponent},
  { path: 'aboutus', component: AboutUsComponent},
  { path: 'reviews', component: ReviewsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

  constructor() {

  }

 }
