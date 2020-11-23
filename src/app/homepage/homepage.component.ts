import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import {Location} from '@angular/common';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {

  IsHomePage:boolean = true;
  constructor(
    private router : Router,
    private location: Location ) {
    router.events.subscribe((val) => {
      if(location.path() === "")
      this.IsHomePage = true;
      else
      this.IsHomePage= false;
    });
  }

  ngOnInit(): void {
  }

}
