import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Menu1Component } from "./menu1/menu1.component";
import { Menu2Component } from "./menu2/menu2.component";

export const routes: Routes = [
  { path: '', redirectTo: '/menu1', pathMatch: 'full' },
  { path: 'menu1', component: Menu1Component },
  { path: 'menu2', component: Menu2Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
