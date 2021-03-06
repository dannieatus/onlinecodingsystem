import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { InputService } from '../../services/input.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit, OnDestroy {

	title = 'OJ CLIENT'

	searchBox: FormControl = new FormControl();
	subscription: Subscription;

  	constructor(private input: InputService, private router: Router) { }

  	ngOnInit() {
  		this.subscription = this.searchBox
  						.valueChanges
  						.subscribe(
  							term => {
  								this.input.changeInput(term);
  							});
  	}

  	ngOnDestroy() {
  		this.subscription.unsubscribe();
  	}

  	searchProblem(): void {
  		this.router.navigate(['/problems']);
  	}
}