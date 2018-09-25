import { Component, OnInit } from '@angular/core';
import { CollaborationService } from '../../services/collaboration.service'
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data.service';
// import router to get url, get what we are on which problem right now (for collaboration socket io)
import { ActivatedRoute, Params } from '@angular/router';

//reference ace limiande variable
declare var ace: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
	editor: any;

	sessionId: string;

	// for executor
	output: string = '';

	// count online user: define users
  	users: string = '';
  	subscriptionUsers: Subscription;

	//setup language, and default language
	public languages: string[] = ['Java', 'Python', 'C++'];
	language: string = 'Java';

	//user come in this page, default see
  defaultContent = {
    'Java': `public class Example {
  public static void main(String[] args) {
  // Type your Java code here
  }
  }`,
  'Python': `class Solution:
    def example():
      # Write your Python code here`,
  'C++': `int main()
  {
    return 0;
  }`
  };

	constructor(private collaboration: CollaborationService,
  		private route: ActivatedRoute,
    	private dataService: DataService) { }

  	//chushihua
  	ngOnInit() {
		// use problem id as session id
		// since we subscribe the changes, every time the params changes
		// sessionId will be updated and the editor will be initilized
		this.route.params
			.subscribe(params => {
				this.sessionId = params['id'];
				this.initEditor();
		});
		this.collaboration.restoreBuffer();
  	}

  	initEditor(): void{
		 // "editor" is the id in html
		this.editor = ace.edit("editor");
		this.editor.setTheme("ace/theme/eclipse");
		
		// when language changes, need to reset the editor
		this.resetEditor();
		//get textarea's focus
		document.getElementsByTagName('textarea')[0].focus();
		//pass editor and sessid to collaboration
		//collaboration.init is in service/collaborationservice.ts
  		this.collaboration.init(this.editor, this.sessionId)
      		.subscribe(users => this.users = users);

		// registrer change callback, if changes, refresh local screen
		// null = default is none changes
		this.editor.lastAppliedChange = null;
		// if editor.on change
		this.editor.on("change", (e) => {
			// JSON.stringify xuliehua,serealization, change "changes" to string
			console.log('editor changes: ' + JSON.stringify(e));
			// check if the change is same as last change,
			// if they are the same, skip this change
			if (this.editor.lastAppliedChange != e) {
				this.collaboration.change(JSON.stringify(e));
			}
		})
  	}

  	//reset editor
  	resetEditor(): void {
  		this.editor.setValue(this.defaultContent[this.language]);
  		this.editor.getSession().setMode("ace/mode/" + this.language.toLowerCase());
    }

    setLanguage(language: string): void {
	  	this.language = language;
	  	this.resetEditor();
    }

    // first get user's code(from ace editor) .getValue is an api
    // tmp write a log
     submit(): void {
	  	let usercode = this.editor.getValue();
	  	console.log(usercode);

	  	// executor
	  	// create object that contains user's code and language
		// send this to server
	  	const data = {
      		code: usercode,
      		lang: this.language.toLowerCase()
      	}
      	// buildAndRun return a Promise
      	this.dataService.buildAndRun(data).then(res => this.output = res);
  	}

}
