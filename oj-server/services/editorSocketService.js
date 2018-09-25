// add redis
var redisClient = require('../modules/redisClient');
// dingyi one timeout 1hr
const TIMEOUT_IN_SECONDS = 3600;

// node's yongfa, to export a function
module.exports = function(io) {
	// record a collaboration sessions
	// record all the participants in each session
	// so that server can send changes to all participants in a session
	var collaborations = {};

	// map from socketId to sessionId
	var socketIdToSessionId = {};

	// Redis can serve different application
	// each application has their own session
	// We also use Redis for our second project
	var sessionPath = '/temp_sessions/';

	// when 'connection' event happends,
	// keyi search socket io 
	// ()means when '' happends, what do we do
	io.on('connection', (socket) => {
		// get message
		// query is from oj-client(service/collaboration.service.ts)
		var sessionId = socket.handshake.query['sessionId'];
		// session means dijiti	
		socketIdToSessionId[socket.id] = sessionId;

		// // if sessionId is not in collaborations, it means no one does this problem before
		// if (!(sessionId in collaborations)) {
		// 	collaborations[sessionId] = {
		// 		'participants': []
		// 	};
		// }
		//collaborations[sessionId]['participants'].push(socket.id);

		// when connection,first check in collaborations.
		if (sessionId in collaborations) {
			// add the current socketId to participants
			collaborations[sessionId]['participants'].push(socket.id);

			// count online user
			let participants = collaborations[sessionId]['participants'];
			for (i = 0; i < participants.length; i++) {
				io.to(participants[i]).emit("userChange", participants);
			}
		} else {
			// not in memory, check in redis
			//.get de key is sessionpath+sessionid
			// once get value, return function(data), which means if data exists, do function
			redisClient.get(sessionPath + sessionId, function(data) {
				if (data) {
					console.log("session terminated previously, pulling back from redis");
					// if exist in Redis, restore the changes from redis
					collaborations[sessionId] = {
						'cachedInstructions': JSON.parse(data),
						'participants': []
					};
				} else {
					console.log("creating new session");
					collaborations[sessionId] = {
						'cachedInstructions': [],
						'participants': []
					};
				}
				collaborations[sessionId]['participants'].push(socket.id);

				// count online user
				io.to(socket.id).emit("userChange", socket.id);
			});
		}

		// socket event listeners
		// delta is the change info
		// it records the row and cloumn of the changes
		socket.on('change', delta => {
			// log, easy for debuging
			console.log("change " + socketIdToSessionId[socket.id] + " " + delta);
			// get session id based on socket.id
			let sessionId = socketIdToSessionId[socket.id];
			if (sessionId in collaborations) {
				// for redis
				// change's content is delta, and add timestamp
				collaborations[sessionId]['cachedInstructions'].push(
					["change", delta, Date.now()]);

				// get all participants on this session
				let participants = collaborations[sessionId]['participants'];
				// send changes to all participants
				for (let i = 0; i < participants.length; i++) {
					// skip the one who created this change
					if (socket.id != participants[i]) {
						io.to(participants[i]).emit("change", delta);
					}
				}
			} else {
				console.log("could not tie socket id to any collaboration");
			}
		});

		//below is for a new user load previous online buddy's code
		socket.on("restoreBuffer", () => {
			let sessionId = socketIdToSessionId[socket.id];
			console.log("restore buffer for sesion: " + sessionId + ", socket: " +
				socket.id);

			if (sessionId in collaborations) {
				let instructions = collaborations[sessionId]['cachedInstructions'];

				for (let i = 0; i < instructions.length; i++) {
					//emit has two varialbes 1. event type, this is from line 77 'change'
					// 2. jutide change neirong
					socket.emit(instructions[i][0], instructions[i][1]);
				}
			} else {
				console.log("warning: could not find socket id in collaborations");
			}
		});
		// only disconnect, write into redis
		socket.on('disconnect', () => {
			let sessionId = socketIdToSessionId[socket.id];
			console.log("socket " + socket.id + " disconnected from session " + 
				sessionId);
			// determine if we found sessionId
			let foundAndRemoved = false;
			let participants;
			if (sessionId in collaborations) {
				participants = collaborations[sessionId]['participants'];
				// rightnow socket in which position
				let index = participants.indexOf(socket.id);

				if (index >= 0) {
					// remove from participants(splice means remove from 'index' '1' item)
					participants.splice(index, 1);
					foundAndRemoved = true;
					// if remove wanle there's no one here(last one)
					if (participants.length == 0) {
						console.log("last participant in collaborations, committing to redis");
					}
					// redis de key, value
					let key = sessionPath + sessionId;
					let value = JSON.stringify
						(collaborations[sessionId]['cachedInstructions']);
					//redisClient.redisPrint is callback
					redisClient.set(key, value, redisClient.redisPrint);
					
					redisClient.expire(key, TIMEOUT_IN_SECONDS);
					delete collaborations[sessionId];
				}
			}

			//count online user
			for (let i = 0; i < participants.length; i++) {
			 io.to(participants[i]).emit("userChange", participants); 
			}

			if (!foundAndRemoved) {
				console.log("warning: could not find socket id in collaborations");
			}

			console.log(collaborations);
		});
	});
}

//this service cannot be used directly, we need to add something in oj-server/server.js

/*
When connection happens, we will get sessionId which is problem id. First, we check if the session is already
in memory. If not, then we check the session in Redis. If we still cannot find in Redis, then we create new
session. If the session exists in Redis, we load it from Redis.

We only store the participants in session now. When change event happens, we want to store every changes
in session so that we can send the history changes to new participants.

We already add restoreBuffer in the front-end so we need server to handle this restoreBuffer event

When disconnect event happens, meaning a participant leaves the session, we need to remove it from
participant list. In addiction, we should check if the participant is the last one in the session. If yes, then we
store the session into Redis. When the participants come back to the session and the it is not expired in
Redis, then we can load the session in Redis.
*/