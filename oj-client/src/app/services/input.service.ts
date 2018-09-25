import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';

// input service is used for get input
@Injectable({
  providedIn: 'root'
})

export class InputService {
  // $ means string
  private inputSubject$ = new BehaviorSubject<string>('');
  constructor() { }

  //when search term come in, anybody who subscribe ths input subject will get the search term
  changeInput(term) {
  	console.log(term);
  	this.inputSubject$.next(term);
  }

  // let subscriber get private bianliang inputSubject from outside
  getInput(): Observable<string> {
  	return this.inputSubject$.asObservable();
  }
}
