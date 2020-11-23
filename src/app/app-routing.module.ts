import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { ViewEmployeeComponent } from './view-employee/view-employee.component';


const routes: Routes = [
{
  path:'', component : HomepageComponent,
  children: [
    {path: 'employee', component: AddEmployeeComponent },
   { path: 'ViewEmployee', component: ViewEmployeeComponent}
]
},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
