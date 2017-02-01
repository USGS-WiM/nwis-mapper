import cherrypy
import urllib
import xml.etree.ElementTree as etree
from shapely.geometry import MultiPoint

class root: 
	def counterProcess(self, mapperURL=""):

		#change symbols back to make real URL
		NWISqueryURL_proxy = mapperURL.replace("$","&")

		# pass the query to the NWIS Sitefile Web Service
		try:
			tree = etree.parse(urllib.urlopen(NWISqueryURL_proxy))

			#initialize array for site records
			siteRecords = []
	
			#create elementtree of xml
			root = tree.getroot()

			#check for no sites and continue
			if root[0].tag != "error":
				# get the site data from each site node
				for child in root:
					#get lat long if records are not null
					if child.find("dec_long_va").text:
						site_lng = child.find("dec_long_va").text
					if child.find("dec_lat_va").text:
						site_lat = child.find("dec_lat_va").text
		
					# create a new tuple from the variables
					siteRecord = (float(site_lng), float(site_lat))
		
					# append to siteRecords tuple
					siteRecords.append(siteRecord)
	
				#create shapely multipoint geometry
				points = MultiPoint(siteRecords)
				bbox = points.bounds
				hull = points.convex_hull
	
				#create return string and add bounding box coordinates
				returnData = str(len(root)) + "," + str(bbox[0]) + "," + str(bbox[1]) + "," + str(bbox[2]) + "," + str(bbox[3])
				print str(len(root))
	
				#make sure hull is a polygon
				if hull.geom_type == "Polygon":
					#add convex hull coordinates to return string
					for item in list(hull.exterior.coords):
						returnData += "," + str(item[0]) + "," + str(item[1])
	
				#return the data
				cherrypy.response.headers['Content-Type'] = 'text/plain'
				return returnData
	
			else:
				#return zero if no records
				print "NO RECORDS FOUND"
				return "0"


		except:
			print "THERE WAS A PROBLEM WITH THE HTTP REQUEST"
			return "0"

	counterProcess.exposed = True

cherrypy.server.socket_port = 9998
cherrypy.quickstart(root())