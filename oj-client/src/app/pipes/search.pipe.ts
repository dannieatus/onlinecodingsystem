import { Pipe, PipeTransform } from '@angular/core';
import { Problem } from '../models/problem.model';

// pipe is use for filter problems
@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {
  // based on problems tiku, and search term, return problem array
  transform(problems: Problem[], term: string): Problem[] {
  	console.log(problems);
  	console.log(term);
  	return problems.filter(
  		problem => problem.name.toLowerCase().includes(term.toLowerCase()));
  }
}