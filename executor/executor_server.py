# similar server.js, a main function
# executor_server.py: use as router
import json
from flask import Flask
app = Flask(__name__)

from flask import jsonify
from flask import request

import executor_utils as eu

@app.route('/build_and_run', methods=['POST'])
def build_and_run():
	# get "request" limiande shuju
	data = request.get_json()

	if 'code' not in data or 'lang' not in data:
		return 'You should provide "code" and "lang"'

	code = data['code']
	lang = data['lang']

	print("API got called with code: %s in %s" % (code, lang))

	result = eu.build_and_run(code, lang)
	#result is a object, jsonify change it to string
	return jsonify(result)

# python standard model
# run program on command line: python executor_server.py will
if __name__ == '__main__':
	#when chengxu start, run docker image
	eu.load_image()
	# run application
	# debug = true means when change code, automatic rebuild compile
	import sys
	port = int(sys.argv[1])
	app.run(port = port)
