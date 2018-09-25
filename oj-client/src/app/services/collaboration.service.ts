import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

//reference socket io
// io is alread imported in .angular.cli.json
declare var io: any; 

@Injectable({
  providedIn: 'root'
})

export class CollaborationService {
	// any: not specify type kid
	collaborationSocket: any;
	private _userSource = new Subject<string>();

  	constructor() { }

  	init(editor: any, sessionId: string): Observable<string> {
  		//window.location.origin means the server location on the current page
  		// for example, the current page on the browser is "localhost:3000/problems/1", the window.location.origin = "http/localhost:3000"
  		//query: send handshake message
		this.collaborationSocket = io(window.location.origin, {query: 'sessionId=' + sessionId});

		// on: on message, wait for server's message
	  	// wait for 'message' event
		// when receive the message, for now just print the socket connection message

		// delta means changees. 
		// "change" is sent from server
		this.collaborationSocket.on("change", (delta: string) => {
			console.log('collabration: editor changes by ' + delta);
			// put delta deseralize to object
			delta = JSON.parse(delta); // delta is json format
			// if server changes, tell local, so local changes, this local changes doesn't need to tell server again
			editor.lastAppliedChange = delta;
			// apply the changes on editor
			editor.getSession().getDocument().applyDeltas([delta]);
		});

		// for count online user
		// when "userchange" happens, do (data: function)
		this.collaborationSocket.on("userChange", (data: string[]) => {
			console.log('collaboration user change: ' + data);
			//.next means next data
			this._userSource.next(data.toString());
    	});

    	return this._userSource.asObservable();
  	}

  	// emit event to make changes and inform server and other collaborators
	change(delta: string): void {
		// emit "change" event
		this.collaborationSocket.emit("change", delta);
	}
	restoreBuffer(): void {
    	this.collaborationSocket.emit("restoreBuffer");
  	}

}