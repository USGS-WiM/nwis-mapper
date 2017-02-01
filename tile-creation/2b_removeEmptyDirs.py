# ---------------------------------------------------------------------------
# Name: 2a_removeEmptyDirs.py
# Description: traversers folder tree and removes blank PNG files
#
# Author: Martyn Smith
# last modified: 4/19/2016
# ---------------------------------------------------------------------------

import os
import sys

#make working path a variable
workPath = sys.argv[1]
#workPath = "D:/cache/at_act/NWIS"

def Walk( root, recurse=0, pattern='*', return_folders=0 ):
	import fnmatch, os, string

	# initialize
	result = []

	# must have at least root folder
	try:
		names = os.listdir(root)
	except os.error:
		return result

	# expand pattern
	pattern = pattern or '*'
	pat_list = string.splitfields( pattern , ';' )

	# check each file
	for name in names:
		fullname = os.path.normpath(os.path.join(root, name))

		# grab if it matches our pattern and entry type
		for pat in pat_list:
			if fnmatch.fnmatch(name, pat):
				if os.path.isfile(fullname) or (return_folders and os.path.isdir(fullname)):
					result.append(fullname)
				continue

		# recursively scan other folders, appending results
		if recurse:
			if os.path.isdir(fullname) and not os.path.islink(fullname):
				result = result + Walk( fullname, recurse, pattern, return_folders )

	return result

if __name__ == '__main__':
	#files = Walk('.', 1, '*', 1)
	files = Walk(workPath, 1, '*', 1)
	print "         . . . There are %s files below current location" % len(files)
           
	for file in files:
		try:
			if os.path.isdir(file):
				try:
					os.rmdir(file)
					print "         . . . removing: " + file
				except:
					"         . . . Directory not empty..."
		except:
			print "         . . . Unable to open file, exiting..."
			sys.exit(2)