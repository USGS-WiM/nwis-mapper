# ---------------------------------------------------------------------------
# Name: 1_getNWISSites.py
# Description: traverses the US using a box feature class and a search cursor 
# then writes output directly to fgdb feature classes for each site type
#    
# Requirements:  ArcGIS (arcpy)
#
# Notes:
# - Script is customized for making requests for the NWIS mapper basic site 
#   type categories of sw,gw,at,sp,ot
# - There is a URL options object for modified waterservices request 
#   parameters
# - The output is a file geodatabase created in the script folder with the 5 
#   site types , active and inactive for 10 total feature classes, in web 
#   mercator projection.
# - The script requires an included fgdb that contains a bounding box feature 
#   class that it needs to loop over. 
# - There is logging enabled, so you can see if anything failed, and how long 
#   each site type request takes.  
# - Has been heavily modified to make it more robust dealing with URL 
#   timeouts and other issues.  
# - Switched from minidom to etree for XML parsing
#
# Author: Martyn Smith
# last modified: 5/14/2015
# ---------------------------------------------------------------------------

import urllib
import urllib2
import httplib
import socket
import xml.etree.ElementTree as etree 
import arcpy
import time
import logging
import os

#function for making NWIS request with arguments
def getUrl(url, query_args):

    #encode argument string
    encoded_args = urllib.urlencode(query_args)

    #reset attempt counter
    attempts = 0

    #make request out of six tries
    for attempt in range(6):
        try:
            f = urllib2.urlopen(url + encoded_args, timeout=20)
            res = f.read()
            f.close()
            return res

        except urllib2.HTTPError as e:
            #if its just a 404 just bail, means no sites
            if e.code == 404:
                print "404 Error (no sites)"
                return False
            #otherwise its another error so retry
            else:
                attempts += 1
                time.sleep(15)
                logger.error("HTTP Error [" + str(e.code) + "] error retrying url: " + url)

        except urllib2.URLError as e:
            attempts += 1
            time.sleep(15)
            logger.error("URL Error [" + str(e.code) + "] error retrying url: " + url)

        except httplib.HTTPException as e:
            attempts += 1
            time.sleep(15)
            logger.error("HTTP Error [" + str(e.code) + "] Exception retrying url: " + url)

        except socket.error as e:
            attempts += 1
            time.sleep(15)
            logger.error("Socket Error [" + str(e[0]) + "] retrying url: " + url)

        except Exception:
            attempts += 1
            time.sleep(15)
            import traceback
            logger.error("Generic exception [" + str(traceback.format_exc()) + "] retrying url: " + url)


#main
if __name__ == "__main__":

    # Start time recording
    startTime = time.time()
    startTimeStr  = time.strftime("%Y%m%d-%H%M%S")
    print 
    print "Starting program: ", startTimeStr
    print

    #paths
    rootpath = os.path.dirname(os.path.realpath(__file__))
    gdb = "NWISSites.gdb"
    dataPath = rootpath + "/data"
    gdb_path = dataPath + "/" + gdb
    print gdb_path

    #create file gdb if it doesn't exist
    if not arcpy.Exists(gdb_path):
        arcpy.CreateFileGDB_management(out_folder_path=dataPath, out_name=gdb, out_version="CURRENT")
    arcpy.env.workspace = rootpath

    #overwrite outputs
    arcpy.env.overwriteOutput = True

    #set up logging
    logging.basicConfig(level=logging.INFO)
    script_name = os.path.basename(__file__)
    logger = logging.getLogger('getNWISsites')
    hdlr = logging.FileHandler(dataPath + '/NWISsites_' + startTimeStr + '.txt')
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    hdlr.setFormatter(formatter)
    logger.addHandler(hdlr) 
    logger.info('Starting program: ' + script_name)

    #coordinate systems
    inCS = arcpy.SpatialReference('WGS 1984')
    outCS = arcpy.SpatialReference('WGS 1984 Web Mercator (Auxiliary Sphere)')

    #site type array list of lists in format: [master site type, list of site types]
    siteTypesArray = [["sw","ES,LK,OC,ST,WE"],["gw","GW,SB"],["sp","SP"],["at","AT"],["ot","AG,AS,AW,FA,GL,LA"]]
    siteStatusArray = [["act","active"],["ina","inactive"]]

    #loop over all site types
    for siteType in siteTypesArray:

        #loop over active and inactive
        for siteStatus in siteStatusArray:

            #set up vars for current iteration
            curSiteType = siteType[0]
            curSiteTypeList = siteType[1]
            curSiteStatus = siteStatus[0]
            curSiteStatusVerbose = siteStatus[1]

            #initiate total counter
            totalcount = 0

            #name feature class
            currentFC = curSiteType + "_" + curSiteStatus 

            #write to log
            logger.info('Starting processing ' + currentFC)

            #delete existing feature class if it exists
            if arcpy.Exists(gdb_path + "/" + currentFC):
                arcpy.Delete_management(gdb_path + "/" + currentFC)

            #create an fgdb if it doesn't exist
            if not arcpy.Exists(gdb_path):
                arcpy.CreateFileGDB_management(rootpath, gdb)

            #create feature class and fields
            print
            print "  Creating new feature class and new fields..."
            print
            arcpy.CreateFeatureclass_management(gdb_path, currentFC, "POINT", "", "DISABLED", "DISABLED", outCS)
            arcpy.AddField_management(gdb_path + "/" + currentFC, "site_no", "TEXT", "", "", "255")
            arcpy.AddField_management(gdb_path + "/" + currentFC, "site_name", "TEXT", "", "", "255")
            arcpy.AddField_management(gdb_path + "/" + currentFC, "site_cat", "TEXT", "", "", "255")
            arcpy.AddField_management(gdb_path + "/" + currentFC, "site_agc", "TEXT", "", "", "255")
            arcpy.AddField_management(gdb_path + "/" + currentFC, "site_status", "TEXT", "", "", "255")
            arcpy.AddField_management(gdb_path + "/" + currentFC, "site_lng", "DOUBLE", "", "", "")
            arcpy.AddField_management(gdb_path + "/" + currentFC, "site_lat", "DOUBLE", "", "", "")

            #creating cursor
            cursor = arcpy.da.InsertCursor(gdb_path + "/" + currentFC, ("site_no","site_name","site_cat","site_agc","site_status","site_lng","site_lat","SHAPE@XY"))	

            #begin looping over bounding boxes
            for row in arcpy.da.SearchCursor(rootpath + "/data/CacheTools.gdb/boxes_globe_4deg_Intersect", ["SHAPE@", "Id"]):
                ext = row[0].extent

                #reset counter for this box
                counter = 0

                #do the actual url site retreival
                print "-----------------------------------------------"
                print
                print "Getting sites for: " + currentFC + " | Bbox: " + str(row[1]) + " of 249 | " +  str(ext.XMin) + "," + str(ext.YMin) + "," + str(ext.XMax) + "," + str(ext.YMax)
                print

                #set up base url
                baseURL = "https://waterservices.usgs.gov/nwis/site/?"

                #NWIS request arguments 
                # https://waterservices.usgs.gov/rest/Site-Service.html
                query_args = { 
                    'format':'mapper,1.0', 
                    'siteType':curSiteTypeList, 
                    'bBox': str(ext.XMin) + "," + str(ext.YMin) + "," + str(ext.XMax) + "," + str(ext.YMax), 
                    'siteStatus':curSiteStatusVerbose
                }

                #make http request
                response = getUrl(baseURL,query_args)

                #make sure there is a reponse
                if response:
                    print "  Found some sites"

                    #use etree to parse xml response from waterservices
                    tree = etree.fromstring(response)

                    #get single sites
                    singlesites = tree.find('sites')
                    print "   processing single sites..."
                    for site in singlesites.iter('site'):

                        #increment counter
                        counter +=1

                        # build the tuple records
                        site_no = site.attrib["sno"]
                        site_name = site.attrib["sna"]
                        site_cat  = site.attrib["cat"]
                        site_agc = site.attrib["agc"]
                        site_lng = float(site.attrib["lng"])
                        site_lat = float(site.attrib["lat"])
                        site_status = curSiteStatusVerbose

                        #cant just insert, because lat lons are decimal final feature class is web mercator, create DD point
                        point = arcpy.Point()
                        point.X, point.Y = site_lng, site_lat					
                        DDpointGeometry = arcpy.PointGeometry(point, inCS)

                        #use projectAs method to get a web mercator pointGeometry
                        WMpointGeometry = DDpointGeometry.projectAs(outCS)		

                        #write line to gdb
                        cursor.insertRow((site_no,site_name,site_cat,site_agc,site_status,site_lng,site_lat,(WMpointGeometry.firstPoint.X,WMpointGeometry.firstPoint.Y)))

                    #get colocated sites
                    colosites = tree.find('colocated_sites')
                    #make sure there is a colosites element
                    if not colosites is None: 
                        print "   processing colosites..."
                        for colosite in colosites.iter('site'):

                            #increment counter
                            counter +=1

                            # build the tuple records
                            site_no = site.attrib["sno"]
                            site_name = site.attrib["sna"]
                            site_cat  = site.attrib["cat"]
                            site_agc = site.attrib["agc"]
                            site_lng = float(site.attrib["lng"])
                            site_lat = float(site.attrib["lat"])
                            site_status = curSiteStatusVerbose

                            #cant just insert, because lat lons are decimal final feature class is web mercator, create DD point
                            point = arcpy.Point()
                            point.X, point.Y = site_lng, site_lat					
                            DDpointGeometry = arcpy.PointGeometry(point, inCS)				

                            #use projectAs method to get it to web mercator
                            WMpointGeometry = DDpointGeometry.projectAs(outCS)		

                            #write line to gdb
                            cursor.insertRow((site_no,site_name,site_cat,site_agc,site_status,site_lng,site_lat,(WMpointGeometry.firstPoint.X,WMpointGeometry.firstPoint.Y)))

                totalcount = totalcount + counter
                print "Found in this bbox: " + str(counter) + " | Total sites: " + str(totalcount)
                print

            #write to log
            logger.info('Finished processing ' + currentFC + '. Total sites: ' + str(totalcount))

            #close arcpy.da insertCursor
            del cursor

    #button it up
    print "Finished getting sites..."
    endTime = time.time()
    elapsed = (endTime - startTime)/60
    endTimeStr = time.strftime("%Y%m%d-%H%M%S")
    print "ending recording time: ", endTimeStr
    print "total time elapsed(minutes): ", elapsed
    logger.info('Ending program... Total time elapsed (minutes): ' + str(elapsed))