# ---------------------------------------------------------------------------
# Name: generateTileCache.py
# Description: Generates tiles cache, then cleans up redudant files 
# and  converts to TMS tile cache
#    
# Requirements:  ArcGIS 10.6.1
#
# Notes: pass in desired output cache location as sole argument:
#
# USAGE:
# python generateTileCache.py
#
# Author: Martyn Smith
# last modified: 7/1/2019
# ---------------------------------------------------------------------------

###### START DEFINE INPUT PATHS HERE ######

#input data path containing MXDs
dataPath = 'C:/NYBackup/GitHub/nwis-mapper/tile-creation/data'

#location for output cache
outputPath = 'C:/NYBackup/GitHub/nwis-mapper/tile-creation/cache'

#input tiling scheme
tilingScheme = 'C:/NYBackup/GitHub/nwis-mapper/tile-creation/PredefinedTilingScheme_levels_ALL.xml'

###### END DEFINE INPUT PATHS HERE ######

def createCache(dataSource,outputPath,tilingScheme):

	import arcpy,os

	#standard web map scales	
	webMapScaleList = ["591657527.591555","295828763.795777","147914381.897889","73957190.948944","36978595.474472","18489297.737236","9244648.868618","4622324.434309","2311162.217155","1155581.108577","577790.554289","288895.277144","144447.638572","72223.819286","36111.909643","18055.954822","9027.977411","4513.988705","2256.994353","1128.497176"]

	#get sitetype from MXD name
	siteType = os.path.basename(dataSource).split('.mxd')[0]

	#default scale range is 0-8 but we need an extra level for gw sites
	scaleList = webMapScaleList [0:9]
	if siteType.split('_')[0] == 'gw':
		scaleList = webMapScaleList [0:10]

	#siteCachePath includes layer group in MXD so we need to include
	siteCachePath = outputPath + '/' + siteType + "/NWIS/_alllayers/"

	#create output folder if it doesnt exist
	if not os.path.exists(outputPath):
		os.makedirs(outputPath)

	#overwrite outputs
	arcpy.env.overwriteOutput = True

	arcpy.ManageTileCache_management(in_cache_location=outputPath, manage_mode="RECREATE_ALL_TILES", in_cache_name=siteType, in_datasource=dataSource, tiling_scheme="IMPORT_SCHEME", import_tiling_scheme=tilingScheme, scales=scaleList, area_of_interest="", max_cell_size="", min_cached_scale=scaleList[0], max_cached_scale=scaleList[-1])    

	return siteCachePath

def Walk( root, recurse=0, pattern='*', return_folders=0 ):
	import fnmatch, string

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

def removeEmptyPNG(workPath):
	from PIL import Image

	files = Walk(workPath, 1, '*.png', 1)
	print "         . . . There are %s PNG files below current location" % len(files)
	nFD = 0

	if len(files) < 100000:
		nFDInc = 1000
	else:
		nFDInc = 10000

	for file in files:
		try:
			im = Image.open(file)
		except:
			print "         . . . Unable to open file, exiting..."
			sys.exit(2)

		# get the number of color bands
		bands = im.getbands()
		nbands = 0
		for band in bands:
			nbands = nbands + 1

		if nbands == 1:
			# get the color values from the image
			color_min, color_max = im.getextrema()

			if color_min == 0 and color_max == 0:
				os.remove(file)
				nFD = nFD + 1
				if nFD % nFDInc == 0:
					print '         . . . Working: ', nFD


def removeEmptyDirs(workPath):
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

def ESRItoTMS(cache, ext):

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

	# check the directory to see if it really is a cache
	if os.path.isdir(cache):
	
		# get the current working directory
		currDir = os.getcwd()
		print "         . . . Current Directory: ", currDir
		
		# if there are Levels in the specified directory 
		# then we need to be one directory above
		files = os.listdir(cache)
		
		isLevelFlag = False
		for file in files:
			if len(file) == 3 and file[0] == 'L':
				isLevelFlag = True
				break
		
		if isLevelFlag == False:
			print "         . . . Specified Directory does not appear to be a map tile cache OR has already been converted to TMS, exiting..."
			sys.exit()
		
		# change to the cache directory
		os.chdir(cache)
		
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
	imgExt = ext
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

#main
if __name__ == "__main__":

	import time, glob, os, sys

	startTime = time.time()
	startTimeStr  = time.strftime("%Y%m%d-%H%M%S")

	print "\nStarting program: ", startTimeStr, "\n"

	for mxd in glob.glob(dataPath + '/*.mxd'):

		print('Processing: ' + mxd + '\n----------------------')    

		print "Step 1 -- Creating tile cache..."
		cachePath = createCache(mxd,outputPath,tilingScheme)     
		print "       ...Done..."

		print "Step 2 -- Removing empty PNG files from cache..."
		removeEmptyPNG(cachePath)
		print "       ...Done..."

		print "Step 3 -- Removing empty folders from cache..."
		removeEmptyDirs(cachePath)
		print "       ...Done..."

		print "Step 4 -- Converting to TMS cache..."
		ESRItoTMS(cachePath,'png')
		print "       ...Done..."

		print('----------------------')   

	#button it up
	print "Finished generating tile cache"
	endTime = time.time()
	elapsed = (endTime - startTime)/60
	endTimeStr = time.strftime("%Y%m%d-%H%M%S")
	print "ending recording time: ", endTimeStr
	print "total time elapsed(minutes): ", elapsed