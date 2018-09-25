const express = require('express'); // import express package
const app = express(); // create http application (create a app)
const path = require('path');
//rest response for api, index fuze jingtai yemian
const restRouter = require('./routes/rest');
const indexRouter = require('./routes/index');

var http = require('http');
var socketIO = require('socket.io');
var io = socketIO();
// io is from editorsocketservice export limiande io
var editorSocketService = require('./services/editorSocketService')(io);

// connect mongoDb
const mongoose = require('mongoose');
mongoose.connect('mongodb://cs504danni:cs504danni@ds159661.mlab.com:59661/test-db');


// response for GET request when url matches '/' (root rolder)
// send 'Hello World!' to client no matter what the request is
//req: request, res: response
// test if the server works
//app.get('/', (req, res) => {
// 	res.send('Hello express world');
//});

app.use('/api/v1', restRouter);

app.use(express.static(path.join(__dirname, '../public')));

app.use((req, res) => {
	res.sendFile('index.html', { root: path.join(__dirname, '../public')});
})
// launch application, listen on port 3000
//app.listen(3000, function() {
//	console.log('App listening on port 3000');
//});;

// listen a socket io port
// connect io with server
const server = http.createServer(app);
io.attach(server);
//same as last listen use method
server.listen(3000);
// listening call back
server.on('listening', function() {
 	console.log('App listening on port 3000');
 });