# ------------------------------------------------------------------------------
# Name: 3_updateS3Bucket.py
# Description: Delete and update tiles on S3 Bucket
#    
# Requirements:  Amazon AWS CLI tools with a profile configured using 
# access ID and secret key, in this case "WIM", see:
# https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html
# https://docs.aws.amazon.com/cli/latest/topic/config-vars.html
# On windows 7, location is: C:\Users\marsmith\.aws\credentials
#
# USAGE: pass in tile cache path
# python 3_updateS3Bucket.py D:/cache s3://nwismapper
#
# Author: Martyn Smith
# last modified: 4/26/2016
# ------------------------------------------------------------------------------

import arcpy, time, glob, os, sys, subprocess

cachePath = 'D:/cache/no_cleanup'
destinationBucket = 's3://nwismapper'
if len(sys.argv) >= 3:
	cachePath = sys.argv[1]
	destinationBucket = sys.argv[2]
else:
	print "Not enough arguments provided"
	sys.exit()

#main
if __name__ == "__main__":

	# Start time recording
	startTime = time.time()
	startTimeStr  = time.strftime("%Y%m%d-%H%M%S")
	print "\nStarting program: ", startTimeStr, "\n"
	
	for cacheName in os.listdir(cachePath):
		print "Working on: " + cacheName

		print "Step 1 -- Deleting existing folder..."
		subprocess.call(["aws", "s3", "rm", destinationBucket + "/" + cacheName, "--recursive", "--profile", "WIM"])
		print "       ...Done..."

		print "Step 2 -- Copying cache to s3..."
		subprocess.call(["aws", "s3", "cp", cachePath + "/" + cacheName + "/NWIS/_alllayers", destinationBucket + "/" + cacheName, "--recursive", "--profile", "WIM"])
		print "       ...Done..."

		#pause loop for testing
		#raw_input("Press Enter to continue...")		
		
	#button it up
	print "Finished generating tile cache"
	endTime = time.time()
	elapsed = (endTime - startTime)/60
	endTimeStr = time.strftime("%Y%m%d-%H%M%S")
	print "ending recording time: ", endTimeStr
	print "total time elapsed(minutes): ", elapsed