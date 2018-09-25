import { Component, OnInit } from '@angular/core';
import { Problem } from '../../models/problem.model';
import { DataService } from '../../services/data.service';
import { Input} from '@angular/core';

@Component({
  selector: 'app-modify-problem',
  templateUrl: './modify-problem.component.html',
  styleUrls: ['./modify-problem.component.css']
})
export class ModifyProblemComponent implements OnInit {
  @Input() problem: Problem;
  difficulties = ['easy', 'medium', 'hard', 'super'];

  constructor(private dataService: DataService) { }

  ngOnInit() {
  }

  modifyProblem() {
    this.dataService.modifyProblem(this.problem);
    location.reload();
  }
}
