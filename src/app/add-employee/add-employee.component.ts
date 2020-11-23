import { Component, OnInit, ElementRef, ViewChild, Injectable} from '@angular/core';
import { AgmMap, MapsAPILoader } from '@agm/core';
import { CrudService } from '../firebase-service.service';
import { Inject } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
import { from, Observable, Subject  } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { Router } from "@angular/router";
import { Location } from '@angular/common';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

export interface FilesUploadMetadata {
  uploadProgress$: Observable<number>;
  downloadUrl$: Observable<string>;
}

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css']
})
export class AddEmployeeComponent implements OnInit {
  @ViewChild(AgmMap, { static: true }) public agmMap: AgmMap;
  downloadUrl = ''

  title = 'Angular-Firebase Employee Details App';
  zoom;
  employeeDetails: any;
  employeeName: string;
  employeeAge: number;
  employeePhone: number;
  employeeEmail: string;
  employeeAddress: string;
  path: string;
  submitted;
  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  MEDIA_STORAGE_PATH = 'EmployeeProfile';
  IsEmployeePage: boolean = true;
  constructor(
    private apiloader: MapsAPILoader,
    private crudService: CrudService,
    private _snackBar: MatSnackBar,
    private storage: AngularFireStorage,
    private router: Router,
    private location: Location
  ) {
    router.events.subscribe((val) => {
      if (location.path() === "employee")
        this.IsEmployeePage = true;
      else if (location.path() != "" && location.path() != "!employee")
        this.IsEmployeePage = false;
    });
  }

  ngOnInit() {
    //this.IsEmployeePage = true;
     this.crudService.read_Employee().subscribe(data => {
      console.log("Data",data)
      this.employeeDetails = data.map(e => {
        return {
          id: e.payload.doc.id,
          Name: e.payload.doc.data()['Name'],
          Age: e.payload.doc.data()['Age'],
          Phone: e.payload.doc.data()['Phone'],
          Email: e.payload.doc.data()['Email'],
          Address: e.payload.doc.data()['Address'],
          Url: e.payload.doc.data()['Url']
        };
      })
      console.log('Get', this.employeeDetails);

     });
    this.get()
    this.agmMap.triggerResize(true);
    this.zoom = 16;
    this._snackBar.open('Cannonball!!', 'End  now', { duration: 500, horizontalPosition: 'start', verticalPosition: 'bottom' })
  }
  openSnackBar() {
    console.log("Hir")
    this._snackBar.open('Cannonball!!', 'End now', {
      duration: 500,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
  @ViewChild("Name") Name: ElementRef;
  @ViewChild("Age") Age: ElementRef;
  @ViewChild("Number") Number: ElementRef;
  @ViewChild("EmailID") EmailID: ElementRef;
  @ViewChild("Address") Address: ElementRef;

  async CreateRecord() {
    console.log("ADD")
    console.log('EN', String(this.employeeName).trim())
    console.log('UEN', this.employeeName);
    if (this.employeeName == undefined || String(this.employeeName).trim() == '') {
      alert("Plase enter Name");
      //this.openSnackBar();
      //this._snackBar.open("Plase enter Name", '', { duration: 5000, verticalPosition: 'top' })
      setTimeout(() => {
        this.Name.nativeElement.focus();
      }, 100);
    }
    else if (this.employeeAge == undefined || String(this.employeeAge).trim() == '') {
      alert("Plase enter Age");
      setTimeout(() => {
        this.Age.nativeElement.focus();
      }, 100);
    }
    else if (this.employeePhone == undefined || String(this.employeePhone).trim() == '') {
      alert("Plase enter Phonenumber");
      setTimeout(() => {
        this.Number.nativeElement.focus();
      }, 100);
    }
    else if ((String(this.employeePhone).trim()).length < 10) {
      alert("Plase enter 10 digit Phonenumber");
      setTimeout(() => {
        this.Number.nativeElement.focus();
      }, 100);
    }
    else if (this.employeeEmail == undefined || String(this.employeeEmail).trim() == '') {
      alert("Plase enter Email");
      setTimeout(() => {
        this.EmailID.nativeElement.focus();
      }, 100);
    }
    else if (this.employeeAddress == undefined || String(this.employeeAddress).trim() == '') {
      alert("Plase enter Address");
      setTimeout(() => {
        this.Address.nativeElement.focus();
      }, 100);
    }
    else {
      console.log("else")
        await this.uploadImage()
      if (!this.submitted && this.downloadUrl) {
          console.log("100")
        }
    
    }
  }
  isNumber(CustomObj, KeyName) {
    console.log("phone");
    console.log("CustomObj", CustomObj);
    console.log("KeyName", KeyName);

    let regex = /^[0-9]/;
    let ValidInput = "";
    for (let i = 0; i < String(CustomObj[KeyName]).length; i++) {
      if (regex.test(String(String(CustomObj[KeyName])[i]))) {
        ValidInput = ValidInput + String(String(CustomObj[KeyName])[i]);
      }
    }
    CustomObj[KeyName] = ValidInput;
  }
  focusOutEmailValidate(CustomObj, KeyName, Lable) {
    console.log("300", CustomObj, KeyName, Lable);
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w+)+$/;
    let email = CustomObj[KeyName];
    console.log('email', email);
    var emailValidation = false;
    if (mailformat.test(email)) {
      emailValidation = true;

      var a = email.split('@')[1];
      var count = 0;
      for (var i = 0; i < a.length; i++) {
        if (a[i] == '.') {
          count++;
        }
      }
      if (count > 2) {
        emailValidation = false;
      }
    }
    if (!emailValidation) {
      alert("You have entered an invalid email address")
      setTimeout(() => {
        this.EmailID.nativeElement.focus();
      }, 100);
    }
  }
 
  onFileSelected(event) {
    this.path = event.target.files[0];
    console.log(' this.path', this.path)
  }
  
  destroy$: Subject<null> = new Subject();
  uploadImage() {
    this.submitted = true;
    const mediaFolderPath = `${this.MEDIA_STORAGE_PATH}`;
    const { downloadUrl$, uploadProgress$ } = this.uploadFireBaseImage(mediaFolderPath,this.path,
    ); 
    downloadUrl$ 
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe((downloadUrl) => {
        console.log('downloadUrl', downloadUrl)
        this.submitted = false;
        this.downloadUrl = downloadUrl


        let record = {};
        record['Name'] = this.employeeName;
        record['Age'] = this.employeeAge;
        record['Phone'] = this.employeePhone;
        record['Email'] = this.employeeEmail;
        record['Address'] = this.employeeAddress;
        record['Url'] = this.downloadUrl;


        this.crudService.create_NewEmployee(record).then(resp => {
          alert("Employee Created Successfully")
          this.employeeName = "";
          this.employeeAge = undefined;
          this.employeePhone = undefined;
          this.employeeEmail = "";
          this.employeeAddress = "";
          this.downloadUrl = "";
          this.path = "";
          this.path = undefined;
          console.log('create', resp);
        })
          .catch(error => {
            console.log(error);
          });
      });

  }


  uploadFireBaseImage(
    mediaFolderPath: String,
    fileToUpload): FilesUploadMetadata {
    const { name } = fileToUpload;
    const filePath = `${mediaFolderPath}/${new Date().getTime()}_${name}`;
    const uploadTask: AngularFireUploadTask = this.storage.upload(
      filePath,
      fileToUpload,
    );
    return {
      downloadUrl$: this.getDownloadUrl$(uploadTask, filePath),
      uploadProgress$: uploadTask.percentageChanges(),
    };
  }

  private getDownloadUrl$(
    uploadTask: AngularFireUploadTask,
    path: string,
  ): Observable<string> {
    return from(uploadTask).pipe(
      switchMap((_) => this.storage.ref(path).getDownloadURL()),
    );
  }
  ViewRecord(item) {
    console.log("item", item)
    localStorage.setItem("item", JSON.stringify(item));
    this.router.navigate(['ViewEmployee']); 
  }
  lat;
  lng;
  getAddress;
  get() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: Position) => {
        if (position) {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          this.getAddress = (this.lat, this.lng)
          console.log(position)
          this.apiloader.load().then(() => {
            let geocoder = new google.maps.Geocoder;
            let latlng = {
              lat: this.lat,
              lng: this.lng
            };
            geocoder.geocode({
              'location': latlng
            }, function (results) {
              if (results[0]) {
                this.currentLocation = results[0].formatted_address;
                console.log(this.assgin);
              } else {
                console.log('Not found');
              }
            });
          });
        }
      })
    }
  }
  latitude;
  longitude;
  mapClicked($event: any) {
    console.log('Event', $event);
    this.latitude = $event?.coords?.lat||0,
      this.longitude = $event?.coords?.lng || 0,
    this.apiloader.load().then(() => {
      let geocoder = new google.maps.Geocoder;
      let latlng = {
        lat: this.latitude,
        lng: this.longitude
      };
      geocoder.geocode({
        'location': latlng
      }, function (results) {
        if (results[0]) {
          this.currentLocation = results[0].formatted_address;
          console.log(this.currentLocation);
        } else {
          console.log('Not found');
        }
      });
    });
  }  
}

  






