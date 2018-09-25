# executor_utils.py: some utility functions, such as build and run the code
import docker
import os
import shutil
import uuid

from docker.errors import APIError
from docker.errors import ContainerError
from docker.errors import ImageNotFound

# get current folder relpath:relative path
CURRENT_DIR = os.path.dirname(os.path.relpath(__file__))
IMAGE_NAME = 'baokaka/cs503_1801'

client = docker.from_env()

# store the code in tmp folder
TEMP_BUILD_DIR = "%s/tmp/" % CURRENT_DIR

# latest is the latest version of docker image
CONTAINER_NAME = "%s:latest" % IMAGE_NAME

SOURCE_FILE_NAMES = {
	"java": "Example.java",
	"python": "example.py",
  "c++": "example.cpp"

}

BINARY_NAMES = {
	"java": "Example",
	"python": "example.py",
  "c++": "./a.out"
}

BUILD_COMMANDS = {
	"java": "javac",
	"python": "python3",
  "c++": "g++"
}

EXECUTE_COMMANDS = {
	"java": "java",
	"python": "python3",
  "c++": ""
}

# load docker image to execute code
def load_image():
	try:
		client.images.get(IMAGE_NAME)
		print("iamge exists locally")
	except ImageNotFound:
		# if we don't have local copy of the image, loading from docker hub
		print("Image not found locally, loading from docker hub")
		client.image.pull(IMAGE_NAME)
	except APIError:
		# if we cannot connect to docker, we cannot run the code
		# so just return
		print("Can't connect to docker")
	return

# create directory file
def make_dir(dir):
	try:
		os.mkdir(dir)
	except OSError:
		print("Can't create directory")

def build_and_run(code, lang):
	# the result we want, limian you 3 results
	result = {'build': None, 'run': None, 'error': None}
	# use the uuid to create unique file name,create a uuid folder in local
	source_file_parent_dir_name = uuid.uuid4()
	# shared folder that can be used in docker, build a yingshe between host and docker
	source_file_host_dir = "%s/%s" % (TEMP_BUILD_DIR, source_file_parent_dir_name)
	# guest is docker
	source_file_guest_dir = "/test/%s" % (source_file_parent_dir_name)


	make_dir(source_file_host_dir)
	# write the code into source file
	with open("%s/%s" % (source_file_host_dir, SOURCE_FILE_NAMES[lang]), 'w') as source_file:
		source_file.write(code)

	#build code
	try:
		client.containers.run(
			image = IMAGE_NAME,
			# run this command to build the code
			command = "%s %s" % (BUILD_COMMANDS[lang], SOURCE_FILE_NAMES[lang]),
			# bind the host dir and guest dir, 'rw': read and write
			# means we have read and write permission of guest dir
			# docker can access the host dir
			volumes = {source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
			working_dir = source_file_guest_dir
		)
		# successfully build the source code
		print("Source built")
		# fail to build, get the error message from container
		result['build'] = 'OK'
	except ContainerError as e:
		result['build'] = str(e.stderr, 'utf-8')
		shutil.rmtree(source_file_host_dir)

		return result

	# run code if it is built
	try:
		log = client.containers.run(
			image = IMAGE_NAME,
			command = "%s %s" % (EXECUTE_COMMANDS[lang], BINARY_NAMES[lang]),
			volumes = {source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
			working_dir = source_file_guest_dir
		)
		log = str(log, 'utf-8')
		print(log)
		result['run'] = log
	except ContainerError as e:
		result['run'] = str(e.stderr, 'utf-8')
		shutil.rmtree(source_file_host_dir)
		return result
	# after build and run clean up dir
	shutil.rmtree(source_file_host_dir)
	return result