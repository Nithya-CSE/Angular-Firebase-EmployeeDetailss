import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor(private firestore: AngularFirestore) { }
  create_NewEmployee(record) {
   return this.firestore.collection('employee').add(record);
  }

  read_Employee() {
    return this.firestore.collection('employee').snapshotChanges();
  }
}
