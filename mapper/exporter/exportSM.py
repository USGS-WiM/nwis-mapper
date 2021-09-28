import cherrypy
import urllib
import xml.dom.minidom
import xml.etree.ElementTree as etree 
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
	#     One big ugly URL, with file format tacked on the end: fformat=1=html, 2=txt, 3=Excel, 4=csv, 5=rdb, 6=kml, 7=shp

	def exportFileSM(self, mapperURL=""):

		#change symbols back to make real URL
		convertedURL = mapperURL.replace("$","&")

		#get actual proxied NWISweb URL and fformat that was tacked on the end
		global fformat
		NWISqueryURL_proxy,fformat = convertedURL.split("&fformat=")

		#get real NWIS URL as station list
		tempURL = NWISqueryURL_proxy.replace("sitefile_output","station_list")

		#strip proxied URL back to non proxied
		NWISqueryURL = tempURL
		if tempURL.find("https://maps.waterdata.usgs.gov/mapper/sitesmapper") != -1:
			NWISqueryURL = NWISqueryURL.replace("https://maps.waterdata.usgs.gov/mapper/sitesmapper","https://waterdata.usgs.gov")
		elif tempURL.find("https://maps.waterdata.usgs.gov/mapper/nwissitesmapper") != -1:
			NWISqueryURL = NWISqueryURL.replace("https://maps.waterdata.usgs.gov/mapper/nwissitesmapper","https://nwis.waterdata.usgs.gov")

		# pass the query to the NWIS Sitefile Web Service
		try:
			tree = etree.parse(urllib.urlopen(NWISqueryURL_proxy))
		except:
			return "Error reading DOM" 

		#initialize array for site records
		siteRecords = []

		#create elementtree of xml
		root = tree.getroot()

		# get the site data from each site node
		for child in root:

			# build the tuple records
			site_no = child.find("site_no").text
			site_name = child.find("station_nm").text  
			site_cat  = child.find("site_tp_cd").text
			site_agc = child.find("agency_cd").text
			site_lng = child.find("dec_long_va").text
			site_lat = child.find("dec_lat_va").text
			site_url = "https://waterdata.usgs.gov/nwis/inventory?agency_code=" + site_agc + "&site_no=" + site_no

			# create a new tuple from the variables
			siteRecord = (site_no, site_name, site_cat, site_agc, site_lng, site_lat, site_url)
			#print siteRecord

			# append to siteRecords tuple
			siteRecords.append((siteRecord))

		#branch off for export type
		if fformat == "1":
			cherrypy.response.headers['Content-Type'] = 'text/html'
			return sendHTML(siteRecords, NWISqueryURL)
		elif fformat == "2":
			#expFile = sendTXT(bbox, scodes, siteRecords)
			expFile = sendTXT(siteRecords, NWISqueryURL)
			cherrypy.response.headers['Content-Type'] = 'text/plain'
			cherrypy.response.headers['Content-disposition'] = "attachment;filename=" + expFile + ".zip"					
			return open("/var/www/mapper/exporter/temp/" + expFile + "/" + expFile + ".zip")
		elif fformat == "3":
			expFile = sendExcel(siteRecords, NWISqueryURL)			
			cherrypy.response.headers['Content-Type'] = 'text/plain'
			cherrypy.response.headers['Content-disposition'] = "attachment;filename=" + expFile + ".zip"
			return open("/var/www/mapper/exporter/temp/" + expFile + "/" + expFile + ".zip")

		elif fformat == "4":
			expFile = sendCSV(siteRecords, NWISqueryURL)			
			cherrypy.response.headers['Content-Type'] = 'text/plain'
			cherrypy.response.headers['Content-disposition'] = "attachment;filename=" + expFile + ".zip"
			return open("/var/www/mapper/exporter/temp/" + expFile + "/" + expFile + ".zip")

		elif fformat == "5":
			expFile = sendRDB(siteRecords, NWISqueryURL)			
			cherrypy.response.headers['Content-Type'] = 'text/plain'
			cherrypy.response.headers['Content-disposition'] = "attachment;filename=" + expFile + ".zip"
			return open("/var/www/mapper/exporter/temp/" + expFile + "/" + expFile + ".zip")	

		elif fformat == "6":
			expFile = sendKML(siteRecords, NWISqueryURL, NWISqueryURL_proxy)
			cherrypy.response.headers['Content-Type'] = 'text/plain'
			cherrypy.response.headers['Content-disposition'] = "attachment;filename=" + expFile + ".zip"
			return open("/var/www/mapper/exporter/temp/" + expFile + "/" + expFile + ".zip")			

		elif fformat == "7":
			expFile = sendShape(siteRecords, NWISqueryURL)
			cherrypy.response.headers['Content-Type'] = 'text/plain'
			cherrypy.response.headers['Content-disposition'] = "attachment;filename=" + expFile + ".zip"
			return open("/var/www/mapper/exporter/temp/" + expFile + "/" + expFile + ".zip")

		else:
			sendHTML(siteRecords, NWISqueryURL)


	exportFileSM.exposed = True

def sendHTML(siteRecords, NWISqueryURL):

	outTemplate = Template(filename='/var/www/mapper/exporter/Templates/HTMLExport.txt')
	# build a metadata string from the scodes 
	metaData = getHTMLMetaData(len(siteRecords), NWISqueryURL)
	htmlOut = outTemplate.render(meta = metaData, sites = siteRecords )
	return htmlOut

def sendTXT(siteRecords, NWISqueryURL):
#def sendTXT(bbox, scodes, siteRecords):

	# change dir to the mappers exporter / temp director
	os.chdir("/var/www/mapper/exporter/temp")

	# create a temporary directory name using a uuid
	tempDirName = str(uuid.uuid4())

	# create the directory
	os.mkdir(tempDirName)

	# change dir to the temp dir
	os.chdir(tempDirName)

	# build a metadata string from the scodes 
	metaData = getMetaData(tempDirName, len(siteRecords), NWISqueryURL)	

	# create the metadata file
	fp = open("Metadata.txt", "w")

	# write the metadata
	fp.write(metaData)
	#fp.write("\r\n\r\n")

	# close the file
	fp.close()

	txtOut  = ""
	# add each agency code each site number separated by a newline
	for site in siteRecords:
		#site_agency = formatAgency(site[3])
		txtOut += site[3] + " " + site[0] + "\r\n"

	# the last character is a comma, but instead of checking
	# during the loop, we will just chop it off the end
	i = len(txtOut) - 1
	txtOut = txtOut[0:i]
	txtOut += "\r\n"

	# open the data fle
	# create the metadata file
	fp = open("NWISMapperExport.txt", "w")
	fp.write(txtOut)
	fp.close()

	# copy the readme file
	shutil.copyfile("/var/www/mapper/exporter/Templates/Readme.txt", "./Readme.txt")
	shutil.copyfile("/var/www/mapper/exporter/Templates/Readme.html", "./Readme.html")

	# now create the zip file
	zipFile = zipfile.ZipFile(tempDirName + ".zip", mode="w")

	# add the files
	zipFile.write("Readme.txt")
	zipFile.write("NWISMapperExport.txt")
	zipFile.write("Metadata.txt")
	zipFile.close()

	return tempDirName

def sendExcel(siteRecords, NWISqueryURL):
	# change dir to the mappers exporter / temp director
	os.chdir("/var/www/mapper/exporter/temp")

	# create a temporary directory name using a uuid
	tempDirName = str(uuid.uuid4())

	# create the directory
	os.mkdir(tempDirName)

	# change dir to the temp dir
	os.chdir(tempDirName)

	# build a metadata string from the scodes 
	metaData = getMetaData(tempDirName, len(siteRecords), NWISqueryURL)	

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
		siteLng = site[4]
		siteLat = site[5]
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
	shutil.copyfile("/var/www/mapper/exporter/Templates/Readme.html", "./Readme.html")

	# now create the zip file
	zipFile = zipfile.ZipFile(tempDirName + ".zip", mode="w")

	# add the files
	zipFile.write("Readme.txt")
	zipFile.write("NWISMapperExport.xls")
	zipFile.write("Metadata.txt")
	zipFile.close()

	return tempDirName	

def sendCSV(siteRecords, NWISqueryURL):

	# change dir to the mappers exporter / temp director
	os.chdir("/var/www/mapper/exporter/temp")

	# create a temporary directory name using a uuid
	tempDirName = str(uuid.uuid4())

	# create the directory
	os.mkdir(tempDirName)

	# change dir to the temp dir
	os.chdir(tempDirName)

	# build a metadata string from the scodes 
	metaData = getMetaData(tempDirName, len(siteRecords), NWISqueryURL)	

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
	shutil.copyfile("/var/www/mapper/exporter/Templates/Readme.html", "./Readme.html")

	# now create the zip file
	zipFile = zipfile.ZipFile(tempDirName + ".zip", mode="w")

	# add the files
	zipFile.write("Readme.txt")
	zipFile.write("NWISMapperExport.csv")
	zipFile.write("Metadata.txt")
	zipFile.close()

	return tempDirName

def sendRDB(siteRecords, NWISqueryURL):

	# change dir to the mappers exporter / temp director
	os.chdir("/var/www/mapper/exporter/temp")

	# create a temporary directory name using a uuid
	tempDirName = str(uuid.uuid4())

	# create the directory
	os.mkdir(tempDirName)

	# change dir to the temp dir
	os.chdir(tempDirName)

	# build a metadata string from the scodes 
	metaData = getMetaData(tempDirName, len(siteRecords), NWISqueryURL)	

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
	shutil.copyfile("/var/www/mapper/exporter/Templates/Readme.html", "./Readme.html")

	# now create the zip file
	zipFile = zipfile.ZipFile(tempDirName + ".zip", mode="w")

	# add the files
	zipFile.write("Readme.txt")
	zipFile.write("NWISMapperExport.rdb")
	zipFile.write("Metadata.txt")
	zipFile.close()

	return tempDirName

def sendKML(siteRecords, NWISqueryURL, NWISqueryURL_proxy):

	# change dir to the mappers exporter / temp director
	os.chdir("/var/www/mapper/exporter/temp")

	# create a temporary directory name using a uuid
	tempDirName = str(uuid.uuid4())

	# create the directory
	os.mkdir(tempDirName)

	# change dir to the temp dir
	os.chdir(tempDirName)

	class Element(xml.dom.minidom.Element):

		def writexml(self, writer, indent="", addindent="", newl=""):
			# indent = current indentation
			# addindent = indentation to add to higher levels
			# newl = newline string
			writer.write(indent+"<" + self.tagName)

			attrs = self._get_attributes()
			a_names = attrs.keys()
			a_names.sort()

			for a_name in a_names:
				writer.write(" %s=\"" % a_name)
				xml.dom.minidom._write_data(writer, attrs[a_name].value)
				writer.write("\"")
			if self.childNodes:
				newl2 = newl
				if len(self.childNodes) == 1 and \
				   self.childNodes[0].nodeType == xml.dom.minidom.Node.TEXT_NODE:
					indent, addindent, newl = "", "", ""
				writer.write(">%s"%(newl))
				for node in self.childNodes:
					node.writexml(writer,indent+addindent,addindent,newl)
				writer.write("%s</%s>%s" % (indent,self.tagName,newl2))
			else:
				writer.write("/>%s"%(newl))

	# Monkey patch Element class to use our subclass instead.
	xml.dom.minidom.Element = Element

	def create_document(title, description=''):
		"""Create the overall KML document."""
		doc = xml.dom.minidom.Document()
		kml = doc.createElement('kml')
		kml.setAttribute('xmlns', 'http://www.opengis.net/kml/2.2')
		doc.appendChild(kml)
		document = doc.createElement('Document')
		kml.appendChild(document)
		docName = doc.createElement('name')
		document.appendChild(docName)
		docName_text = doc.createTextNode(title)
		docName.appendChild(docName_text)
		docDesc = doc.createElement('description')
		document.appendChild(docDesc)
		docDesc_text = doc.createTextNode(description)
		docDesc.appendChild(docDesc_text)
		return doc

	def create_placemark(site):
		"""Generate the KML Placemark for a given address."""
		doc = xml.dom.minidom.Document()
		pm = doc.createElement("Placemark")
		doc.appendChild(pm)
		name = doc.createElement("name")
		pm.appendChild(name)
		name_text = doc.createTextNode(site.find("site_no").text)
		name.appendChild(name_text)
		desc = doc.createElement("description")
		pm.appendChild(desc)
		desc_text = doc.createTextNode('<b>Site: </b>' + site.find("site_no").text + '</br><b>Site Name: </b>' + site.find("station_nm").text + '</br><b>Agency: </b>' + child.find("agency_cd").text + '</br><a href="https://waterdata.usgs.gov/nwis/inventory?agency_code=' + child.find("agency_cd").text + '&amp;site_no=' + site.find("site_no").text + '">Access Data</a>')
		desc.appendChild(desc_text)
		pt = doc.createElement("Point")
		pm.appendChild(pt)
		coords = doc.createElement("coordinates")
		pt.appendChild(coords)
		coords_text = doc.createTextNode(site.find("dec_long_va").text + "," + site.find("dec_lat_va").text )
		coords.appendChild(coords_text)
		return doc

	if __name__ == '__main__':
		kml_doc = create_document('NWIS Mapper Export KML')
		document = kml_doc.documentElement.getElementsByTagName('Document')[0]

		tree = etree.parse(urllib.urlopen(NWISqueryURL_proxy))
		root = tree.getroot()
		for child in root:
			placemark = create_placemark(child)
			document.appendChild(placemark.documentElement)
		fp = open("NWISMapperExport.kml", "w")
		fp.write(kml_doc.toprettyxml(indent="  ", encoding='UTF-8'))
		# close the file
		fp.close()

	# build a metadata string from the scodes 
	metaData = getMetaData(tempDirName, len(siteRecords), NWISqueryURL)	

	# create the metadata file
	fp = open("Metadata.txt", "w")

	# write the metadata
	fp.write(metaData)
	fp.write("\n\n")

	# close the file
	fp.close()

	# copy the readme file
	shutil.copyfile("/var/www/mapper/exporter/Templates/Readme.txt", "./Readme.txt")
	shutil.copyfile("/var/www/mapper/exporter/Templates/Readme.html", "./Readme.html")

	# now create the zip file
	zipFile = zipfile.ZipFile(tempDirName + ".zip", mode="w")

	# add the files
	zipFile.write("Readme.txt")
	zipFile.write("NWISMapperExport.kml")
	zipFile.write("Metadata.txt")
	zipFile.close()

	return tempDirName

def sendShape(siteRecords, NWISqueryURL):

	# change dir to the mappers exporter / temp director
	os.chdir("/var/www/mapper/exporter/temp")

	# create a temporary directory name using a uuid
	tempDirName = str(uuid.uuid4())

	# create the directory
	os.mkdir(tempDirName)

	# change dir to the temp dir
	os.chdir(tempDirName)

	# build a metadata string from the scodes 
	metaData = getMetaData(tempDirName, len(siteRecords), NWISqueryURL)	

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
		#check for bad lat longs
		if (site[4] is not None) and (site[5] is not None):            
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
	shutil.copyfile("/var/www/mapper/exporter/Templates/Readme.html", "./Readme.html")

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

def getMetaData(GUID, nSites, queryURL):

	#get query arguments from URL
	URLargs = queryURL.split("?")[1].split("&format=station_list")[0].replace("&",", ")

	#get data type
	dataType = queryURL.split("?")[0].split("/")[-1]

	if dataType == "uv":
		dataTypeProper = "Unit Values"
	elif dataType == "dv":
		dataTypeProper = "Daily Values"
	elif dataType == "current":
		dataTypeProper = "Current Values"
	elif dataType == "inventory":
		dataTypeProper = "Site Inventory"
	elif dataType == "sw" or dataType == "measurements":
		dataTypeProper = "Surface-Water"
	elif dataType == "dvstat":
		dataTypeProper = "Daily Value Statistics"
	elif dataType == "peak":
		dataTypeProper = "Peak Values"
	elif dataType == "gwlevels":
		dataTypeProper = "Groundwater"
	elif dataType == "qwdata":
		dataTypeProper = "Water Quality"
	elif dataType == "water_use":
		dataTypeProper = "Water Use"
	else:
		dataTypeProper = "Unknown"

	# get current time and date
	currDateTime = datetime.datetime.now()

	metaData =  "Metadata for NWIS Sites exported from NWIS Mapper\r\n"
	metaData += "(Exporter Version 1.1.0)\r\n"
	metaData += "Time and Date data were exported: " 
	metaData += currDateTime.strftime("%Y-%m-%d %H:%M") + "\r\n"	
	metaData += "Request Number: " + GUID + "\r\n"
	metaData += "Number of sites in request: " + str(nSites) + "\r\n"
	metaData += "Site type: " + dataTypeProper + "\r\n\r\n"
	metaData += "Unique NWIS query arguments: " + URLargs + "\r\n\r\n"
	metaData += "NWIS request URL as XML:\r\n"
	metaData += queryURL

	#write to log file
	with open("/var/www/mapper/exporter/logs/logSM.txt", "a") as myfile:
		#myfile.write(currDateTime.strftime("%Y-%m-%d %H:%M") + " UTC,ExportType:" + fformat + ",GUID:" + GUID + ",NumSites:" + str(nSites) + ",SiteType:" + dataTypeProper + ",URLargs:" + URLargs.replace(",","&") + "\r\n")
		myfile.write(currDateTime.strftime("%Y-%m-%d %H:%M") + " UTC,ExportType:" + fformat + ",GUID:" + GUID + ",NumSites:" + str(nSites) + ",SiteType:" + dataTypeProper + ",URL:" + queryURL + "\r\n")
		
	return metaData

def getHTMLMetaData(nSites, queryURL):

	#get query arguments from URL
	URLargs = queryURL.split("?")[1].split("&format=station_list")[0].replace("&",", ")

	#get data type
	dataType = queryURL.split("?")[0].split("/")[-1]

	if dataType == "uv":
		dataTypeProper = "Unit Values"
	elif dataType == "dv":
		dataTypeProper = "Daily Values"
	elif dataType == "current":
		dataTypeProper = "Current Values"
	elif dataType == "inventory":
		dataTypeProper = "Site Inventory"
	elif dataType == "sw" or dataType == "measurements":
		dataTypeProper = "Surface-Water"
	elif dataType == "dvstat":
		dataTypeProper = "Daily Value Statistics"
	elif dataType == "peak":
		dataTypeProper = "Peak Values"
	elif dataType == "gwlevels":
		dataTypeProper = "Groundwater"
	elif dataType == "qwdata":
		dataTypeProper = "Water Quality"
	elif dataType == "water_use":
		dataTypeProper = "Water Use"
	else:
		dataTypeProper = "Unknown"

	# get current time and date
	currDateTime = datetime.datetime.now()

	metaData = "<b>Request Time and Date:</b>&nbsp;&nbsp;" 
	metaData += currDateTime.strftime("%Y-%m-%d %H:%M") + " UTC"
	metaData += "</br><b>Number of sites in request:</b>&nbsp;&nbsp;" + str(nSites)
	metaData += "</br><b>Site Type:</b>&nbsp;&nbsp;" + dataTypeProper
	metaData += "</br><b>Unique NWIS query arguments:</b>&nbsp;&nbsp;" + URLargs + "</br>"
	metaData += '<b>NWIS query URL: </b><a href= "' + queryURL + '" target="_blank">link</a></br>'

	#write to log file
	with open("/var/www/mapper/exporter/logs/logSM.txt", "a") as myfile:
		myfile.write(currDateTime.strftime("%Y-%m-%d %H:%M") + " UTC,ExportType:" + fformat + ",GUID:htmlTable,NumSites:" + str(nSites) + ",SiteType:" + dataTypeProper + ",URLargs:" + URLargs.replace(",","&") + "\r\n")

	return metaData

cherrypy.server.socket_port = 8089
cherrypy.quickstart(root())