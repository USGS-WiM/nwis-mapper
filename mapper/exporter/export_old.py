import cherrypy
import urllib
from xml.dom import minidom
from mako.template import Template
import sys
import os
import tempfile
import uuid
import shutil
import datetime
import string
import zipfile
import xlwt
import shapefile

class root:

        # url and parameters to query site file and deliver output file
        # parameters:
        #     Bounding Box: bBox=xmin,ymin,xmax,ymax
        #
        #     siteCodes:    scodes="TSC" where T=type,       1=SW,     2=GW,      3=SP, 4=AT, 5=OT
        #                                      S=status,     1=Active, 0=Inactive
        #                                      C=data codes, 1=all,    2=iv,      3=dv, 4=qw, 5=pk, 6=sv, 7=ad
        #
        #     File format:  fformat=1=html, 2=txt, 3=Excel, 4=csv, 5=rdb, 6=kml, 7=shp

        def exportFile(self, bbox="", scodes="", fformat=""):

                if bbox == "":
                        return "Error Code: Invalid URL argument: bounding box"

                if scodes == "":
                        return "Error Code: Invalid URL argument: site codes" 

                if fformat == "":
                        return "Error Code: Invalid URL argument: file format"    

                # verify url arguments - to some degree - we are sending the url not the user so it should be
                # reasonably well formed

                # build base url
                web_query_url = "https://waterservices.usgs.gov/nwis/site?"

                # add the bouunding box parameters
                web_query_url = web_query_url + "bBox=" + bbox

                # use the mapper format - this needs to be fixed for kml
                if fformat == "6":
                        web_query_url = web_query_url + "&format=ge,1.0"
                else:
                        web_query_url = web_query_url + "&format=mapper,1.0"

                # add the sitetype
                web_query_url = web_query_url + "&siteType=" + getSiteType(scodes)	

                # decode the site status
                web_query_url = web_query_url + "&siteStatus=" + getSiteStatus(scodes)

                # add the dataType
                web_query_url = web_query_url + "&hasDataTypeCd=" + getSiteDataCode(scodes)	

                # pass the query to the NWIS Sitefile Web Service
                try:
                        sitesDOM  = minidom.parse(urllib.urlopen(web_query_url))

                        # we only want the KML in DOM to count the number of features
                        # so we have to also have the raw KML. This is not efficient.
                        if fformat == "6":
                                fpKML = urllib.urlopen(web_query_url)
                                sitesKML = fpKML.read()
                except:
                        return "Error reading DOM" 

                # loop through the nodes if format is not KML
                # have to move to the "sites" node because there is also a "colocated sites" node
                if fformat != "6":
                        for rootNode in sitesDOM.getElementsByTagName("sites"):

                                # build a header record, note that siteRecord is a list
                                # siteRecords = [("site_no", "site_name", "cat_code", "agency", "longitude", "latitude", "url")]
                                siteRecords = []

                                # get the site data from each site node
                                for sites in rootNode.getElementsByTagName("site"):

                                        # build the tuple records
                                        site_no = sites.getAttribute("sno")
                                        site_name = sites.getAttribute("sna")
                                        site_cat  = sites.getAttribute("cat")
                                        site_agc = sites.getAttribute("agc")	
                                        site_lng = sites.getAttribute("lng")
                                        site_lat = sites.getAttribute("lat")	
                                        site_url = "https://waterdata.usgs.gov/nwis/inventory?agency_code=" + site_agc + "&site_no=" + site_no

                                        # create a new tuple from the variables
                                        siteRecord = (site_no, site_name, site_cat, site_agc, site_lng, site_lat, site_url)

                                        # append to siteRecords tuple
                                        siteRecords.append((siteRecord))

                # all the records are stored in siteRecords except for KML, so pass the tuple 
                # to a formatter (1=html,2=txt,3=Excel,4=csv,5=rdb,6=kml,7=shp)
                # KML just gets passed back to the user

                if fformat == "1":
                        cherrypy.response.headers['Content-Type'] = 'text/html'
                        return sendHTML(bbox, scodes, siteRecords)
                elif fformat == "2":
                        expFile = sendTXT(bbox, scodes, siteRecords)
                        cherrypy.response.headers['Content-Type'] = 'text/plain'
                        cherrypy.response.headers['Content-disposition'] = "attachment;filename=" + expFile + ".zip"					
                        return open("/var/www/mapper/exporter/temp/" + expFile + "/" + expFile + ".zip")
                elif fformat == "3":
                        expFile = sendExcel(bbox, scodes, siteRecords)			
                        cherrypy.response.headers['Content-Type'] = 'text/plain'
                        cherrypy.response.headers['Content-disposition'] = "attachment;filename=" + expFile + ".zip"
                        return open("/var/www/mapper/exporter/temp/" + expFile + "/" + expFile + ".zip")

                elif fformat == "4":
                        expFile = sendCSV(bbox, scodes, siteRecords)			
                        cherrypy.response.headers['Content-Type'] = 'text/plain'
                        cherrypy.response.headers['Content-disposition'] = "attachment;filename=" + expFile + ".zip"
                        return open("/var/www/mapper/exporter/temp/" + expFile + "/" + expFile + ".zip")

                elif fformat == "5":
                        expFile = sendRDB(bbox, scodes, siteRecords)			
                        cherrypy.response.headers['Content-Type'] = 'text/plain'
                        cherrypy.response.headers['Content-disposition'] = "attachment;filename=" + expFile + ".zip"
                        return open("/var/www/mapper/exporter/temp/" + expFile + "/" + expFile + ".zip")	

                elif fformat == "6":
                        expFile = sendKML(bbox, scodes, sitesDOM, sitesKML)
                        cherrypy.response.headers['Content-Type'] = 'text/plain'
                        cherrypy.response.headers['Content-disposition'] = "attachment;filename=" + expFile + ".zip"
                        return open("/var/www/mapper/exporter/temp/" + expFile + "/" + expFile + ".zip")			

                elif fformat == "7":
                        expFile = sendShape(bbox, scodes, siteRecords)
                        cherrypy.response.headers['Content-Type'] = 'text/plain'
                        cherrypy.response.headers['Content-disposition'] = "attachment;filename=" + expFile + ".zip"
                        return open("/var/www/mapper/exporter/temp/" + expFile + "/" + expFile + ".zip")

                else:
                        sendHTML(siteRecords)


        exportFile.exposed = True

def sendHTML(bbox, scodes, siteRecords):

        outTemplate = Template(filename='/var/www/mapper/exporter/Templates/HTMLExport.txt')
        # build a metadata string from the scodes 
        metaData = getHTMLMetaData(bbox, scodes, len(siteRecords))
        htmlOut = outTemplate.render(meta = metaData, sites = siteRecords )
        return htmlOut

def sendTXT(bbox, scodes, siteRecords):

        # change dir to the mappers exporter / temp director
        os.chdir("/var/www/mapper/exporter/temp")

        # create a temporary directory name using a uuid
        tempDirName = str(uuid.uuid4())

        # create the directory
        os.mkdir(tempDirName)

        # change dir to the temp dir
        os.chdir(tempDirName)

        # build a metadata string from the scodes 
        metaData = getMetaData(bbox, scodes, tempDirName, len(siteRecords))	

        # create the metadata file
        fp = open("Metadata.txt", "w")

        # write the metadata
        fp.write(metaData)
        fp.write("\n\n")

        # close the file
        fp.close()

        txtOut  = ""
        # add each agency code each site number separated by a newline
        for site in siteRecords:
                site_agency = formatAgency(site[3])
                txtOut += site_agency + site[0] + "\n"

        # the last character is a comma, but instead of checking
        # during the loop, we will just chop it off the end
        i = len(txtOut) - 1
        txtOut = txtOut[0:i]
        txtOut += "\n"

        # open the data fle
        # create the metadata file
        fp = open("NWISMapperExport.txt", "w")
        fp.write(txtOut)
        fp.close()

        # copy the readme file
        shutil.copyfile("/var/www/mapper/exporter/Templates/Readme.txt", "./Readme.txt")

        # now create the zip file
        zipFile = zipfile.ZipFile(tempDirName + ".zip", mode="w")

        # add the files
        zipFile.write("Readme.txt")
        zipFile.write("NWISMapperExport.txt")
        zipFile.write("Metadata.txt")
        zipFile.close()

        return tempDirName

def sendExcel(bbox, scodes, siteRecords):
        # change dir to the mappers exporter / temp director
        os.chdir("/var/www/mapper/exporter/temp")

        # create a temporary directory name using a uuid
        tempDirName = str(uuid.uuid4())

        # create the directory
        os.mkdir(tempDirName)

        # change dir to the temp dir
        os.chdir(tempDirName)

        # build a metadata string from the scodes 
        metaData = getMetaData(bbox, scodes, tempDirName, len(siteRecords))	

        # create the metadata file
        fp = open("Metadata.txt", "w")

        # write the metadata
        fp.write(metaData)
        fp.write("\n\n")

        # close the file
        fp.close()

        # create an excel workbook
        fpBook = xlwt.Workbook()
        # create a worksheet in the workbook
        nwisSheet = fpBook.add_sheet("NWIS Mapper Export Sheet")

        # write a header for the data, start with row 2
        nwisSheet.write(1, 0, "SiteNumber")
        nwisSheet.write(1, 1, "SiteName")
        nwisSheet.write(1, 2, "SiteCategory")
        nwisSheet.write(1, 3, "SiteAgency")
        nwisSheet.write(1, 4, "SiteLongitude")
        nwisSheet.write(1, 5, "SiteLatitude")
        nwisSheet.write(1, 6, "SiteNWISURL")

        # add each site data to the spreadsheet
        row = 2
        for site in siteRecords:
                siteNum = site[0]
                siteName = site[1]
                siteCat = site[2]
                siteAgc = site[3]
                siteLng = float(site[4])
                siteLat = float(site[5])	
                siteURL = site[6]
                nwisSheet.write(row, 0, siteNum)
                nwisSheet.write(row, 1, siteName)
                nwisSheet.write(row, 2, siteCat)
                nwisSheet.write(row, 3, siteAgc)
                nwisSheet.write(row, 4, siteLng)
                nwisSheet.write(row, 5, siteLat)
                nwisSheet.write(row, 6, xlwt.Formula('HYPERLINK("' + siteURL + '";"Access Data")'))
                row = row + 1

        # create the excel file
        fpBook.save("NWISMapperExport.xls")

        # copy the readme file
        shutil.copyfile("/var/www/mapper/exporter/Templates/Readme.txt", "./Readme.txt")

        # now create the zip file
        zipFile = zipfile.ZipFile(tempDirName + ".zip", mode="w")

        # add the files
        zipFile.write("Readme.txt")
        zipFile.write("NWISMapperExport.xls")
        zipFile.write("Metadata.txt")
        zipFile.close()

        return tempDirName	

def sendCSV(bbox, scodes, siteRecords):

        # change dir to the mappers exporter / temp director
        os.chdir("/var/www/mapper/exporter/temp")

        # create a temporary directory name using a uuid
        tempDirName = str(uuid.uuid4())

        # create the directory
        os.mkdir(tempDirName)

        # change dir to the temp dir
        os.chdir(tempDirName)

        # build a metadata string from the scodes 
        metaData = getMetaData(bbox, scodes, tempDirName, len(siteRecords))	

        # create the metadata file
        fp = open("Metadata.txt", "w")

        # write the metadata
        fp.write(metaData)
        fp.write("\n\n")

        # close the file
        fp.close()

        csvOut  = "SiteNumber, SiteName, SiteCategory, SiteAgency, SiteLongitude, SiteLatitude, SiteNWISURL\n"
        for site in siteRecords:
                csvRec = ""
                for i in range(0,7):
                        if i == 4 or i == 5: 
                                csvRec += site[i] + ","
                        else:
                                csvRec += '"' + site[i] + '"' + ","

                # the last character is a comma, but instead of checking
                # during the loop, we will just chop it off the end and add a linefeed
                i = len(csvRec) - 1
                csvRec = csvRec[0:i]
                csvRec += "\n"

                csvOut += csvRec	



        # open the data fle
        # create the metadata file
        fp = open("NWISMapperExport.csv", "w")
        fp.write(csvOut)
        fp.close()

        # copy the readme file
        shutil.copyfile("/var/www/mapper/exporter/Templates/Readme.txt", "./Readme.txt")

        # now create the zip file
        zipFile = zipfile.ZipFile(tempDirName + ".zip", mode="w")

        # add the files
        zipFile.write("Readme.txt")
        zipFile.write("NWISMapperExport.csv")
        zipFile.write("Metadata.txt")
        zipFile.close()

        return tempDirName

def sendRDB(bbox, scodes, siteRecords):

        # change dir to the mappers exporter / temp director
        os.chdir("/var/www/mapper/exporter/temp")

        # create a temporary directory name using a uuid
        tempDirName = str(uuid.uuid4())

        # create the directory
        os.mkdir(tempDirName)

        # change dir to the temp dir
        os.chdir(tempDirName)

        # build a metadata string from the scodes 
        metaData = getMetaData(bbox, scodes, tempDirName, len(siteRecords))	

        # create the metadata file
        fp = open("Metadata.txt", "w")

        # write the metadata
        fp.write(metaData)
        fp.write("\n\n")

        # close the file
        fp.close()

        rdbOut = "# Tab-delimited output format (https://waterdata.usgs.gov/nwis?tab_delimited_format_info)\n"
        rdbOut += "SiteNumber\tSiteName\tSiteCategory\tSiteAgency\tSiteLongitude\tSiteLatitude\tSiteNWISURL\n"
        rdbOut += "25S\t50S\t2S\t10S\t15N\t15N\t100S\n"  
        for site in siteRecords:
                rdbOut += site[0] + "\t" + site[1] + "\t" + site[2]  + "\t" + site[3] + "\t" + site[4] + "\t" + site[5]  + "\t" +  site[6] + "\n"

        # open the data fle
        # create the metadata file
        fp = open("NWISMapperExport.rdb", "w")
        fp.write(rdbOut)
        fp.close()

        # copy the readme file
        shutil.copyfile("/var/www/mapper/exporter/Templates/Readme.txt", "./Readme.txt")

        # now create the zip file
        zipFile = zipfile.ZipFile(tempDirName + ".zip", mode="w")

        # add the files
        zipFile.write("Readme.txt")
        zipFile.write("NWISMapperExport.rdb")
        zipFile.write("Metadata.txt")
        zipFile.close()

        return tempDirName

def sendKML(bbox, scodes, sitesDOM, sitesKML):

        # change dir to the mappers exporter / temp director
        os.chdir("/var/www/mapper/exporter/temp")

        # create a temporary directory name using a uuid
        tempDirName = str(uuid.uuid4())

        # create the directory
        os.mkdir(tempDirName)

        # change dir to the temp dir
        os.chdir(tempDirName)

        # the metadata includes the number of sites returned in the
        # request. For KML we don't know this because we just pass
        # KML straight through from the web service. So we have
        # count the number of sites from the KML
        nSites = 0
        for rootNode in sitesDOM.getElementsByTagName("Document"):
                nSites = 0
                # get the site data from each site node
                for sites in rootNode.getElementsByTagName("Placemark"):
                        nSites = nSites + 1

        # build a metadata string from the scodes 
        metaData = getMetaData(bbox, scodes, tempDirName, nSites)	

        # create the metadata file
        fp = open("Metadata.txt", "w")

        # write the metadata
        fp.write(metaData)
        fp.write("\n\n")

        # close the file
        fp.close()

        # open the data fle
        # create the metadata file
        fp = open("NWISMapperExport.kml", "w")
        fp.write(sitesKML)
        fp.close()

        # copy the readme file
        shutil.copyfile("/var/www/mapper/exporter/Templates/Readme.txt", "./Readme.txt")

        # now create the zip file
        zipFile = zipfile.ZipFile(tempDirName + ".zip", mode="w")

        # add the files
        zipFile.write("Readme.txt")
        zipFile.write("NWISMapperExport.kml")
        zipFile.write("Metadata.txt")
        zipFile.close()

        return tempDirName

def sendShape(bbox, scodes, siteRecords):

        # change dir to the mappers exporter / temp director
        os.chdir("/var/www/mapper/exporter/temp")

        # create a temporary directory name using a uuid
        tempDirName = str(uuid.uuid4())

        # create the directory
        os.mkdir(tempDirName)

        # change dir to the temp dir
        os.chdir(tempDirName)

        # build a metadata string from the scodes 
        metaData = getMetaData(bbox, scodes, tempDirName, len(siteRecords))	

        # create the metadata file
        fp = open("Metadata.txt", "w")

        # write the metadata
        fp.write(metaData)
        fp.write("\n\n")

        # close the file
        fp.close()

        # create an shapefile writer object
        fpShape  = shapefile.Writer(shapefile.POINT)

        # shapefile fields
        fpShape.field("SITENO", "C", "25")
        fpShape.field("SITENAME", "C", "50")
        fpShape.field("CATEGORY", "C", "2")
        fpShape.field("AGENCY", "C", "10")
        fpShape.field("LONGDD", "C", "15" )
        fpShape.field("LATDD" , "C", "15")
        fpShape.field("SITEURL", "C", "100")

        # add points to the shapefile
        for site in siteRecords:
                siteNum = site[0]
                siteName = site[1]
                siteCat = site[2]
                siteAgc = site[3]
                siteLng = float(site[4])
                siteLat = float(site[5])	
                siteURL = site[6]

                # create the geometry
                fpShape.point(siteLng, siteLat)
                fpShape.record(siteNum, siteName, siteCat, siteAgc, siteLng, siteLat, siteURL)
        fpShape.save("NWISMapperExport")

        # copy the readme file
        shutil.copyfile("/var/www/mapper/exporter/Templates/Readme.txt", "./Readme.txt")
        
       # copy the projection  file
        shutil.copyfile("/var/www/mapper/exporter/Templates/NWISMapperExport.prj", "./NWISMapperExport.prj")
        
        # now create the zip file
        zipFile = zipfile.ZipFile(tempDirName + ".zip", mode="w")

        # add the files
        zipFile.write("Readme.txt")
        zipFile.write("NWISMapperExport.shp")
        zipFile.write("NWISMapperExport.shx")
        zipFile.write("NWISMapperExport.dbf")
        zipFile.write("NWISMapperExport.prj")        
        zipFile.write("Metadata.txt")
        zipFile.close()

        return tempDirName	

def getSiteType(scodes):

        siteType = scodes[0]

        if siteType == "1":
                return "ES,GL,LK,OC,ST,WE"
        elif siteType == "2":
                return "GW,SB"
        elif siteType == "3":	
                return "SP"
        elif siteType == "4":	
                return "AT"
        elif siteType == "5":
                return "AG,AS,FA,LA"
        else:
                return ""


def getSiteStatus(scodes):

        siteStatus = scodes[1]

        if siteStatus == "1":
                return "active"
        else:
                return "inactive "	


def getSiteDataCode(scodes):

        siteCode = scodes[2]

        if siteCode == "1":
                return "all"
        elif siteCode == "2":
                return "iv"
        elif siteCode == "3":	
                return "dv"
        elif siteCode == "4":	
                return "qw"
        elif siteCode == "5":
                return "pk"
        elif siteCode == "6":
                return "sv"
        elif siteCode == "7":
                return "ad"
        else:
                return ""

def getMetaData(bbox, scodes, GUID, nSites):

        # get current time and date
        currDateTime = datetime.datetime.now()

        metaData =  "Metadata for NWIS Sites exported from NWIS Mapper\n"
        metaData += "(Exporter Version 1.1.0)\n"
        metaData += "Time and Date data were exported: " 
        metaData += currDateTime.strftime("%Y-%m-%d %H:%M") + "\n"	
        metaData += "Request Number: " + GUID + "\n"
        metaData += "Number of sites in request: " + str(nSites) + "\n"
        metaData += "Longitude and Latitude extent of request:\n"
        metaData += "\tWest: "  + bbox.split(",")[0] + "\n"
        metaData += "\tSouth: " + bbox.split(",")[1] + "\n"	
        metaData += "\tEast: "  + bbox.split(",")[2] + "\n"
        metaData += "\tNorth: " + bbox.split(",")[3] + "\n"

        # add the site type
        siteType = scodes[0]

        metaData += "Sites Type: "
        if siteType == "1":
                metaData += "Surface-Water\n"
        elif siteType == "2":
                metaData += "Groundwater\n"
        elif siteType == "3":	
                metaData += "Springs\n"		
        elif siteType == "4":	
                metaData += "Atmospheric\n"		
        elif siteType == "5":
                metaData += "Other\n"
        else:
                metaData += "Unknown\n"

        # add the status
        siteStatus = scodes[1]

        metaData += "Sites Status: "
        if siteStatus == "1":
                metaData += "Active\n"
        else:
                metaData += "Inactive\n"

        # add the data type
        siteCode = scodes[2]

        metaData += "Requested type of data for sites: "	
        if siteCode == "1":
                metaData += "All Data\n"
        elif siteCode == "2":
                metaData +=  "Instantaneous Values\n"
        elif siteCode == "3":	
                metaData +=  "Daily Value\n"
        elif siteCode == "4":	
                metaData +=  "Water Quality\n"
        elif siteCode == "5":
                metaData +=  "Peak Value\n"
        elif siteCode == "6":
                metaData +=  "Measurements\n"
        elif siteCode == "7":
                metaData +=  "Annual Water Data Report\n"
        else:
                metaData += "Unknown\n"

        return metaData

def getHTMLMetaData(bbox, scodes, nSites):

        # get current time and date
        currDateTime = datetime.datetime.now()

        metaData = "<b>Request Time and Date:</b>&nbsp;&nbsp;" 
        metaData += currDateTime.strftime("%Y-%m-%d %H:%M")
        metaData += "</br><b>Number of sites in request:</b>&nbsp;&nbsp;" + str(nSites)
        metaData += "</br><b>Longitude and Latitude extent of request:</b>&nbsp;&nbsp;"
        metaData += "&nbsp;&nbsp;<b>West:</b>&nbsp;&nbsp;" + bbox.split(",")[0]
        metaData += "&nbsp;&nbsp;<b>South</b>&nbsp;&nbsp;" + bbox.split(",")[1]
        metaData += "&nbsp;&nbsp;<b>East:</b>&nbsp;&nbsp;" + bbox.split(",")[2]
        metaData += "&nbsp;&nbsp;<b>North:</b>&nbsp;&nbsp;" + bbox.split(",")[3]

        # add the site type
        siteType = scodes[0]
        metaData += "</br><b>Sites Type:</b>&nbsp;&nbsp;"
        if siteType == "1":
                metaData += "Surface-Water"
        elif siteType == "2":
                metaData += "Groundwater"
        elif siteType == "3":	
                metaData += "Springs"		
        elif siteType == "4":	
                metaData += "Atmospheric"		
        elif siteType == "5":
                metaData += "Other"
        else:
                metaData += "Unknown"

        # add the status
        siteStatus = scodes[1]

        metaData += "</br><b>Sites Status:</b>&nbsp;&nbsp;"
        if siteStatus == "1":
                metaData += "Active"
        else:
                metaData += "Inactive"

        # add the data type
        siteCode = scodes[2]

        metaData += "</br><b>Requested type of data for sites:</b>&nbsp;&nbsp;"	
        if siteCode == "1":
                metaData += "All Data"
        elif siteCode == "2":
                metaData +=  "Instantaneous Values"
        elif siteCode == "3":	
                metaData +=  "Daily Value"
        elif siteCode == "4":	
                metaData +=  "Water Quality"
        elif siteCode == "5":
                metaData +=  "Peak Value"
        elif siteCode == "6":
                metaData +=  "Measurements"
        elif siteCode == "7":
                metaData +=  "Annual Water Data Report"
        else:
                metaData += "Unknown"


        return metaData

def formatAgency(agency):
        
        if len(agency) == 0:
                return "USGS "
        
        if len(agency) == 5:
                return agency
        
        if len(agency) > 5:
                return agency[0:4]
        
        if len(agency) < 5:
                nSpaces = 5- len(agency)
                for i in range(nSpaces):
                        agency = agency + " "
                return agency
        
        return "USGS "

cherrypy.quickstart(root())