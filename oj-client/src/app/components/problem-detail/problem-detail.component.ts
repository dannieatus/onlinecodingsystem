import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router'; //rightnow path lujing canshu
import { Problem } from '../../models/problem.model';
import { DataService } from '../../services/data.service';

@Component({
	selector: 'app-problem-detail',
	templateUrl: './problem-detail.component.html',
	styleUrls: ['./problem-detail.component.css']
})

export class ProblemDetailComponent implements OnInit {
  problem: Problem;

  //modify problem
  modifyMode = false;

  //injection done in constructor. 
  //first declare privat date service, then declare route
  constructor(private dataService: DataService,
  	private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      //this.problem = this.dataService.getProblem(+params['id']);
      this.dataService.getProblem(+params['id'])
        .then(problem => this.problem = problem);
    });
  }

  //modify problem
  edit() {
    this.modifyMode = !this.modifyMode;
  }
}