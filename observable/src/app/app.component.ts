import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
 	title = 'app';
	ngOnInit() {
		//============================================
		// Practive 1
		//// primise after let is an object, not a variable
	 	//  	let promise = new Promise( resolve => {
		//  	console.log('promise execution');
		////setTimeout is run immediately, but inside setTimeout(), after 5000ms run resolve(problem resolved)
		////'problem resolved' pass to promise.thn() kuohao limian, yejiushi value:string
		// 	setTimeout( () => {
		// 		//do something, then return to resolve
		// 		resolve('problem resolved');
		// 	}, 5000);
		// });
		//// then means must accept
		// promise.then( (value: string) => console.log(value));


		//============================================
		// practice #2
		// let stream$ = new Observable(observer => {
		// 	console.log('observable execution');
		// 	setTimeout( () => {
		// 		observer.next('observer next value');
		// 	}, 5000);
		// });
		// // if any stream$ happens, run () inside
		// stream$.subscribe(value => console.log(value));


		//============================================
		// practice #3
		// result: observable execution 1/2/3/4
		// let stream$ = new Observable(observer => {
		// 	console.log('observable execution');
		// 	observer.next(1);
		// 	observer.next(2);
		// 	setTimeout( () => {
		// 		observer.next(4);
		// 	}, 5000);
		// 	observer.next(3);
		// });
		// // if any stream$ happens, run () inside
		// stream$.subscribe(value => console.log(value));


		//============================================
		// practice #4
		// result: observable executuion/ 1/2/3
		let stream$ = new Observable(observer => {
			console.log('observable execution');
			observer.next(1);
			observer.next(2);
			setTimeout( () => {
				observer.next(4);
			}, 5000);
			observer.next(3);
		});
		// if any stream$ happens, run () inside
		let subscription = stream$.subscribe(value => console.log(value));
		setTimeout(() => {
	  		subscription.unsubscribe();
	  	}, 3000);
	}
}


//ng new observable
//run localhost:4200