# ---------------------------------------------------------------------------
# Name: 2_generateTileCache.py
# Description: Generates tiles cache, then cleans up redudant files 
# and optionally converts to TMS tile cache
#    
# Requirements:  ArcGIS (arcpy)
#
# Notes: pass in desired output cache location as sole argument:
#
# USAGE:
# python 2_generateTileCache.py D:/
#
# Author: Martyn Smith
# last modified: 4/20/2016
# ---------------------------------------------------------------------------

import arcpy, time, glob, os, subprocess

outPath = 'D:/'
if len(sys.argv) >= 2:
	outPath = sys.argv[1]

#main
if __name__ == "__main__":

	# Start time recording
	startTime = time.time()
	startTimeStr  = time.strftime("%Y%m%d-%H%M%S")
	print "\nStarting program: ", startTimeStr, "\n"

	#paths
	scriptPath = os.path.dirname(os.path.realpath(__file__))
	dataPath = scriptPath + '/data'
	cachePath = outPath + '/cache'
	if not os.path.exists(cachePath):
		os.makedirs(cachePath)

	#variables
	tilingScheme = scriptPath + '/PredefinedTilingScheme_levels_ALL.xml'
	webMapScaleList = ["591657527.591555","295828763.795777","147914381.897889","73957190.948944","36978595.474472","18489297.737236","9244648.868618","4622324.434309","2311162.217155","1155581.108577","577790.554289","288895.277144","144447.638572","72223.819286","36111.909643","18055.954822","9027.977411","4513.988705","2256.994353","1128.497176"]

	#overwrite outputs
	arcpy.env.overwriteOutput = True

	for mxd in glob.glob(dataPath + '/*.mxd'):

		

		siteType = os.path.basename(mxd).split('.mxd')[0]

		scaleList = webMapScaleList [0:9]
		if siteType.split('_')[0] == 'gw':
			scaleList = webMapScaleList [0:10]

		siteCachePath = cachePath + '/' + siteType + "/NWIS/_alllayers/"

		print(siteType + '\n----------------------')    

		print "Step 1 -- Creating tile cache..."
		arcpy.ManageTileCache_management(in_cache_location=cachePath, manage_mode="RECREATE_ALL_TILES", in_cache_name=siteType, in_datasource=mxd, tiling_scheme="IMPORT_SCHEME", import_tiling_scheme=tilingScheme, scales=scaleList, area_of_interest="", max_cell_size="", min_cached_scale=scaleList[0], max_cached_scale=scaleList[-1])        
		print "Step 1 -- Done..."

		print "Step 2 -- Removing empty PNG files from cache..."
		subprocess.call(["python",scriptPath + "/2a_removeEmptyPNG.py", siteCachePath])
		print "Step 2 -- Done..."

		print "Step 3 -- Removing empty folders from cache..."
		subprocess.call(["python",scriptPath + "/2b_removeEmptyDirs.py", siteCachePath])
		print "Step 3 -- Done..."

		print "Step 4 -- Converting to TMS cache..."
		subprocess.call(["python",scriptPath + "/2c_esri2tms.py", "--cache", siteCachePath, "--ext", "png"])
		print "Step 4 -- Done..."

		print('----------------------')   

		#pause loop for testing
		#raw_input("Press Enter to continue...")

	#button it up
	print "Finished generating tile cache"
	endTime = time.time()
	elapsed = (endTime - startTime)/60
	endTimeStr = time.strftime("%Y%m%d-%H%M%S")
	print "ending recording time: ", endTimeStr
	print "total time elapsed(minutes): ", elapsed