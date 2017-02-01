# Python script to convert ESRI tile cache format to TMS tile cache format
#
# Version 1.0 - Feb 25, 2014
# Authors: David McCulloch, USGS Reston, VA (dmccullo@usgs.gov)
#          Martyn Smith, USGS Troy, NY (marsmith@usgs.gov)
# 
# Map tile caches are a structured set of map tile names and directory names. When
# using ESRI map tile cache generation tools, the resulting map cache names and
# directories are different than the Tile Map Service (TMS) cache names
# expected by such API's as Leaflet or OpenLayers. Therefore, the ESRI tile 
# caches have to be renamed to the generic TMS cache tilenames. 
# 
# ESRI tile caches use the format:
# 
# 			L<level>/R<row>/C<column>.<image extension>
# 
# The level is a literal uppercase 'L' follwed by an zero-padded decimal value
# in the range 00 to 19. The row and columns start with a literal uppercase
# 'R' and 'C' respectively, followed by padded hex values. Lastly, the image 
# extension is some typical image format such as .png or .gif. 
#
# As an example, consider the ESRI tile name:
#		/myCache/L05/R0000000d/C00000007.png
# 	
# and the equivalent TMS cache tile:
# 		/myCache/5/13/7.png
# 
# Converting the ESRI tile cache format to the TMS cache format can be complicated
# because directory names are involved and the entire directory tree has to be
# traversed. Converting a single level, row, or column in itself is straightforward,
# however, so the overall process is to convert each of the entities in separate
# passes. This particular script converts all levels first, then rows, then columns.
# 
# PLEASE NOTE: 
# The script is called with command line arguments for tile cache directory and
# image extension. The tile cache directory argument is required, as is the extension
# format. The script should work on both Linux and Windows.
#
# USAGE:
# python esri2tms.py --cache /gisdata/arcgisserver/arcgiscache/at_act/NWIS/_alllayers/ --ext png
#

import os
import sys
import argparse

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

def getLevel(p):
	
	# Linux and Windows path separators are different
	pParts = p.split(os.sep)

	# is this a level it will have a length of 2
	if len(pParts) == 1:
		
		# get the level name and check
		levelName = pParts[0]
		if levelName[0] == "L":
			levelName = levelName[1:]
			levelName = str(int(levelName))
			return levelName

def getRow(p):
	
	# Linux and Windows path separators are different
	pParts = p.split(os.sep)
	
	# is this a level it will have a length of 3
	if len(pParts) == 2:
		
		# get the level name and check
		rowName = pParts[1]
		if rowName[0] == "R":
			rowName = rowName[1:]
			rowName = pParts[0] + os.sep + str(int(rowName, 16))
			return rowName

def getImage(p):
	
	# Linux and Windows path separators are different
	pParts = p.split(os.sep)
	
	# get the image name and check
	imgFileName = pParts[len(pParts) - 1]
	
	# image file name starts with a C
	if imgFileName[0] == "C":
		
		# image file also includes the extension, but
		# we can use the int() function with unless
		# the extension is removed, so we have to split it
		imgNameParts =  imgFileName.split(".")
		
		# first part is the name, second is extension
		imgName = imgNameParts[0]
		imgExt = imgNameParts[1]
		
		# remove the C from the image name
		imgName = imgName[1:]
		
		# put all the parts back together with the converted filename
		imgPath = ""
		
		# loop over the original parts
		for i,p in enumerate(pParts):
			
			# concatenate all the pieces with the os.sep in between
			imgPath = imgPath + p + os.sep
			
			# we don't want the original filename and the len()
			# function returns the total number of parts so 
			# minus 1 for the zero-ordered list and minus 1
			# for the original filename
			if i == len(pParts) - 2:
				break
		# now concatenate the path, converted filename and extension
		imgPath = imgPath + str(int(imgName, 16)) + "." + imgExt
		return imgPath
				
if __name__ == '__main__':
			
	parser = argparse.ArgumentParser(description='Convert ESRI map cache tile format to TMS format')
	parser.add_argument('--cache', required=True, help='map tile cache directory')
	parser.add_argument('--ext', required=True, help='image file extension (e.g. png, gif, jpg)')
	
	args = parser.parse_args()
	
	# check the directory to see if it really is a cache
	if os.path.isdir(args.cache):
	
		# get the current working directory
		currDir = os.getcwd()
		print "         . . . Current Directory: ", currDir
		
		# if there are Levels in the specified directory 
		# then we need to be one directory above
		files = os.listdir(args.cache)
		
		isLevelFlag = False
		for file in files:
			if len(file) == 3 and file[0] == 'L':
				isLevelFlag = True
				break
		
		if isLevelFlag == False:
			print "         . . . Specified Directory does not appear to be a map tile cache OR has already been converted to TMS, exiting..."
			sys.exit()
		
		# change to the cache directory
		os.chdir(args.cache)
		
	else:
		print "         . . . Invalid cache directory specified"
		
	# LEVELS
	# read all files in the cache
	levels = Walk('.', 1, '*', 1)
	
	# on first pass process only levels	
	for level in levels:
		try:
			# is this a directory only
			if os.path.isdir(level):
				
				# returns only a level
				newLevel = getLevel(level)
				
				if newLevel:
					os.rename(level, newLevel)
					print "            . . . converting level: ", newLevel

		except:
			print "         . . . Unable to rename levels, exiting..."
			os.chdir(currDir)
			sys.exit(0)

	# ROWS
	# read all files in the cache
	rows = Walk('.', 1, '*', 1)
	
	# on second pass process only rows	
	for row in rows:
		try:
			# is this a directory only
			if os.path.isdir(row):
				
				# returns only a row
				newRow = getRow(row)
				
				if newRow:
					os.rename(row, newRow)
					print "            . . . converting row: ", newRow

		except:
			print "         . . . Unable to rename rows, exiting..."
			os.chdir(currDir)
			sys.exit(0)

	# FILES

	# check the extension
	imgExt = args.ext
	if imgExt[0] != ".":
		imgExt = "." + imgExt
		
	# create a wildcard
	imgExt = "*" + imgExt

	# read all image files	
	files = Walk('.', 1, imgExt, 1)
	
	# on third pass process image files	
	for file in files:
		try:
			# returns only the image name
			newFile = getImage(file)
				
			if newFile:
				os.rename(file, newFile)
					
		except:
			print "         . . . Unable to rename image files, exiting..."
			os.chdir(currDir)
			sys.exit(0)
			
	# return to current directory
	os.chdir(currDir)