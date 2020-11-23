import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { Location } from '@angular/common';
@Component({
  selector: 'app-view-employee',
  templateUrl: './view-employee.component.html',
  styleUrls: ['./view-employee.component.css']
})
export class ViewEmployeeComponent implements OnInit {
  EmployeeDetails;
  title = 'Employee Details';
  IsViewPage: boolean = true;
  constructor(
    private router: Router,
    private location: Location) {
    router.events.subscribe((val) => {
      if (location.path() === "ViewEmployee")
        this.IsViewPage = true;
      else if (location.path() != "" && location.path() != "!ViewEmployee")
        this.IsViewPage = false;
    });
  }

  ngOnInit(): void {
    this.EmployeeDetails = JSON.parse(localStorage.getItem("item"));
    console.log("ED", this.EmployeeDetails);
  }
  Back() {
    console.log("VP",this.IsViewPage)
    this.router.navigate(['employee']);

  }
}
