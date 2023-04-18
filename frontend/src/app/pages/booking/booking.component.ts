import { Component, OnInit, inject } from '@angular/core';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface TimeSlot {
  bookedBy: string | null;
  start: string;
  end: string;
}

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit {
  timeSlots$: Observable<TimeSlot[]>;
  firestore: Firestore = inject(Firestore);

  constructor() {
    const itemCollection = collection(this.firestore, 'bookings');
    console.log(itemCollection);
    this.timeSlots$ = collectionData(itemCollection) as Observable<TimeSlot[]>;
    console.log(this.timeSlots$);
  }

  ngOnInit(): void {
    console.log('ngOnInit');
    // log timeslots after data
    this.timeSlots$.subscribe((data) => {
      console.log(data);
    });
  }
}
