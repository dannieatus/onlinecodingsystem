var redis = require('redis');
//create a client
// only one client is created
var client = redis.createClient();

//write
function set(key, value, callback) {
	client.set(key, value, function(err, res) {
		if (err) {
			console.log(err);
			return;
		}

		callback(res);
	});
}

function get(key, callback) {
	// don't need value, since get value
	client.get(key, function(err, res) {
		if (err) {
			console.log(err);
			return;
		}

		callback(res);
	});
}

//regularly refresh 
// only store the keys in timeInSeconds seconds
// once expired, keys will be deleted.
// since the cache is limited and may not be synchonoused with databse, data only
// valid during a peorid which depends application.
function expire(key, timeInSeconds) {
	client.expire(key, timeInSeconds);
}

//exit connection
function quit() {
	client.quit();
}

//export module
module.exports = {
	get: get,
	set: set,
	expire: expire,
	quit: quit,
	// directly export the function in redis
	redisPrint: redis.print
}