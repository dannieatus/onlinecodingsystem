const express = require('express'); // import express package
const router = express.Router(); // import router

//backend service
const problemService = require('../services/problemService');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

/// for executor
// node right now as a client
const nodeRestClient = require('node-rest-client').Client;
// for server to call the RESTful API
const restClient = new nodeRestClient();
// Python Flask server listen on port 5000 by default
EXECUTOR_SERVER_URL = 'http://executor/build_and_run';
// reigster a method
restClient.registerMethod('build_and_run', EXECUTOR_SERVER_URL, 'POST')

//get "problem" request, problemservice deals with it. return async promise to "then"
router.get('/problems', function(req, res) {
	problemService.getProblems()
		//async promise,then: when get result, put it to res.json
		.then(problems => res.json(problems));
});

router.get('/problems/:id', function(req, res) {
	const id = req.params.id;
	//"+" convert string to number
	problemService.getProblem(+id)
		.then(problem => res.json(problem));
});

//modify problem
router.put('/problems/:id', jsonParser, (req, res) => {
    problemService.modifyProblem(req.body)
        .then(problem => res.json(problem), error => res.status(400).send(error.body || error));
});

//jaonParser is a middleware, data come into jsonparser to be understood
router.post('/problems', jsonParser, function(req, res) {
	problemService.addProblem(req.body)
		.then(problem => {
			res.json(problem);
		}, error => {
			res.status(400).send('Problem name already exists!');
		});
});

//for executor
// jsonParser: middleware, used to parse the body of the POST request
router.post('/build_and_run', jsonParser, function(req, res) {
	const code = req.body.code;
	const lang = req.body.lang;

	console.log('lang: ', lang, 'code: ', code);
	// this is the method we registered before (line 17)
	restClient.methods.build_and_run(
	{
		data: {code: code, lang: lang},
		headers: {'Content-Type': 'application/json'}
	},
	(data, response) => {
		// response: raw data, data: parsed response
		const text = `Build output: ${data['build']}, execute output: ${data['run']}`;
		res.json(text);
	}
	)
})

module.exports = router;