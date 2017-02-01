import cherrypy
import urllib
import sys
import os
import tempfile
import uuid
import shutil
import datetime
import string
import zipfile
import math
import Image

class GlobalMercator(object):

	def __init__(self, tileSize=256):
		"Initialize the TMS Global Mercator pyramid"
		self.tileSize = tileSize
		self.initialResolution = 2 * math.pi * 6378137 / self.tileSize
		# 156543.03392804062 for tileSize 256 pixels
		self.originShift = 2 * math.pi * 6378137 / 2.0
		# 20037508.342789244

	def LatLonToMeters(self, lat, lon ):
		"Converts given lat/lon in WGS84 Datum to XY in Spherical Mercator EPSG:900913"

		mx = lon * self.originShift / 180.0
		my = math.log( math.tan((90 + lat) * math.pi / 360.0 )) / (math.pi / 180.0)

		my = my * self.originShift / 180.0
		return mx, my

	def MetersToLatLon(self, mx, my ):
		"Converts XY point from Spherical Mercator EPSG:900913 to lat/lon in WGS84 Datum"

		lon = (mx / self.originShift) * 180.0
		lat = (my / self.originShift) * 180.0

		lat = 180 / math.pi * (2 * math.atan( math.exp( lat * math.pi / 180.0)) - math.pi / 2.0)
		return lat, lon

	def PixelsToMeters(self, px, py, zoom):
		"Converts pixel coordinates in given zoom level of pyramid to EPSG:900913"

		res = self.Resolution( zoom )
		mx = px * res - self.originShift
		my = py * res - self.originShift
		return mx, my

	def MetersToPixels(self, mx, my, zoom):
		"Converts EPSG:900913 to pyramid pixel coordinates in given zoom level"

		res = self.Resolution( zoom )
		px = (mx + self.originShift) / res
		py = (my + self.originShift) / res
		return px, py

	def PixelsToTile(self, px, py):
		"Returns a tile covering region in given pixel coordinates"

		tx = int( math.ceil( px / float(self.tileSize) ) - 1 )
		ty = int( math.ceil( py / float(self.tileSize) ) - 1 )
		return tx, ty

	def PixelsToRaster(self, px, py, zoom):
		"Move the origin of pixel coordinates to top-left corner"

		mapSize = self.tileSize << zoom
		return px, mapSize - py

	def MetersToTile(self, mx, my, zoom):
		"Returns tile for given mercator coordinates"

		px, py = self.MetersToPixels( mx, my, zoom)
		return self.PixelsToTile( px, py)

	def TileBounds(self, tx, ty, zoom):
		"Returns bounds of the given tile in EPSG:900913 coordinates"

		minx, miny = self.PixelsToMeters( tx*self.tileSize, ty*self.tileSize, zoom )
		maxx, maxy = self.PixelsToMeters( (tx+1)*self.tileSize, (ty+1)*self.tileSize, zoom )
		return ( minx, miny, maxx, maxy )

	def TileLatLonBounds(self, tx, ty, zoom ):
		"Returns bounds of the given tile in latutude/longitude using WGS84 datum"

		bounds = self.TileBounds( tx, ty, zoom)
		minLat, minLon = self.MetersToLatLon(bounds[0], bounds[1])
		maxLat, maxLon = self.MetersToLatLon(bounds[2], bounds[3])

		return ( minLat, minLon, maxLat, maxLon )

	def Resolution(self, zoom ):
		"Resolution (meters/pixel) for given zoom level (measured at Equator)"

		# return (2 * math.pi * 6378137) / (self.tileSize * 2**zoom)
		return self.initialResolution / (2**zoom)

	def ZoomForPixelSize(self, pixelSize ):
		"Maximal scaledown zoom of the pyramid closest to the pixelSize."

		for i in range(30):
			if pixelSize > self.Resolution(i):
				return i-1 if i!=0 else 0 # We don't want to scale up

	def GoogleTile(self, tx, ty, zoom):
		"Converts TMS tile coordinates to Google Tile coordinates"

		# coordinate origin is moved from bottom-left to top-left corner of the extent
		return tx, (2**zoom - 1) - ty

	def QuadTree(self, tx, ty, zoom ):
		"Converts TMS tile coordinates to Microsoft QuadTree"

		quadKey = ""
		ty = (2**zoom - 1) - ty
		for i in range(zoom, 0, -1):
			digit = 0
			mask = 1 << (i-1)
			if (tx & mask) != 0:
				digit += 1
			if (ty & mask) != 0:
				digit += 2
			quadKey += str(digit)

		return quadKey

class root:

	# url and parameters to query aquifer map tiles
	# parameters:
	#     ptInfo: ptInfo=z,x,y where z = API zoom level
	#                                x = Web Mercator X coordinate
	#                                y = Web Mercator X coordinate
	#

	def aquiferName(self, ptInfo=""):

		if ptInfo == "":
			return "Error Code: Invalid URL argument: bounding box"

		# tokenize the ptInfo fields
		ptParts = ptInfo.split(",")

		# if there are three values assume, z, x, y
		if len(ptParts) == 3:
			zoomLevel = int(ptParts[0])
			mercX = float(ptParts[1])
			mercY = float(ptParts[2])

		# create the object for transformations
		mercator = GlobalMercator()

		# for the zoom level, we need to find the tile index
		# this is the TMS tiling format so we convert it to
		# the google tiling format
		tileX, tileY = mercator.MetersToTile(mercX, mercY, zoomLevel)
		googleX, googleY = mercator.GoogleTile(tileX, tileY, zoomLevel)

		# the ESRI tile naming is based on Lxx/Rxxxxxxxx/Cxxxxxx.png
		#    where L=Level, R=Row, and C=Column.
		#    The Level numbers are 0-19 in decimal integers
		#    The Row and Column numbers are  hexidecimal numbers
		#    padded with zeros to a filename width of 9 characters.
		#    For example,
		#         L12/R00000615/C000002fe.png

		if zoomLevel < 10:
			esriLevel = "L0" + str(zoomLevel)
		else:
			esriLevel = "L" + str(zoomLevel)

		# note the ESRI ROW is the the googleY value
		esriRow =  "R" +  paddedHex(googleY)
		esriCol =  "C" +  paddedHex(googleX) + ".png"

		tileFile = "/var/www/mapper/sandbox/dmc/tiles/pr_aq/" + esriLevel + "/" + esriRow + "/" + esriCol
		#tileFile = "https://nwis-mapper-tiles.s3.amazonaws.com/pr_aq/" + esriLevel + "/" + esriRow + "/" + esriCol
		
		# we have the point the user clicked on and we figured out from that
		# coordinate which tile was clicked on. Now we need the origin of that tile
		mercXmin, mercYmin, mercXmax, mercYmax = mercator.TileBounds(tileX, tileY, zoomLevel)

		# next convert the mercator coordinates back to pixels coordinates. The pixels
		# coordinates are the coordinates if the zoom level were one gigantic image
		xpixO1, ypixO1 = mercator.MetersToPixels(mercXmin, mercYmax, zoomLevel)

		# the functions return TMS pixels, so we have to convert to google rasters
		# which simply reverses the y-scale
		xpixO2, ypixO2 = mercator.PixelsToRaster(xpixO1, ypixO1, zoomLevel)

		# do the same procedure thing for the selected point
		xpixG1, ypixG1 = mercator.MetersToPixels(mercX, mercY, zoomLevel)
		xpixG2, ypixG2 = mercator.PixelsToRaster(xpixG1, ypixG1, zoomLevel)

		# the difference in coordinates between the (G)iven pixel and
		# the (O)origin pixel is the pixel offset in the tile.
		offsetX = int((xpixG2 - xpixO2))
		offsetY = int((ypixG2 - ypixO2))

		# at this point we know the map tile's filename and the pixel in
		# that tile where the user clicked. Now we load the image, get
		# the RGB value at that point and map the values back to the
		# aquifers attributes.

		# open the image file with PIL
		im = Image.open(tileFile)

		# get the pixel's rgba value
		r,g,b,a = im.getpixel((offsetX, offsetY))

		# set the header info
		cherrypy.response.headers['Content-Type'] = 'text/xml;charset=UTF-8'
		# return the aquifer name
		return getAquiferMeta(r,g,b)

	aquiferName.exposed = True

def paddedHex(x):

	# argument x is an integer, so convert it into a
	# hexadecimal number and then string
	xh = str(hex(x))

	# xh has the "0x" syntax convert to a string, so drop those
	xh = xh.lstrip("0x")

	# now pad the result
	return xh.zfill(8)

def getAquiferMeta(r, g, b):

	aquifers =[("Ada-Vamoosa aquifer",114,197,81),
	("Arbuckle-Simpson aquifer",217,103,76),
	("Basin and Range basin-fill aquifers",162,195,236),
	("Basin and Range carbonate-rock aquifers",187,119,98),
	("Biscayne aquifer",228,163,81),
	("Blaine aquifer",204,145,111),
	("California Coastal Basin aquifers",31,173,195),
	("Cambrian-Ordovician aquifer system",198,234,102),
	("Castle Hayne aquifer",201,120,57),
	("Central Oklahoma aquifer",112,212,174),
	("Central Valley aquifer system",10,216,210),
	("Coastal lowlands aquifer system",255,243,45),
	("Colorado Plateaus aquifers",212,240,200),
	("Columbia Plateau basaltic-rock aquifers",250,58,105),
	("Columbia Plateau basin-fill aquifers",129,235,251),
	("Denver Basin aquifer system",114,155,85),
	("Early Mesozoic basin aquifers",12,176,115),
	("Edwards-Trinity aquifer system",175,151,177),
	("Floridan aquifer system",200,169,114),
	("Hawaiian Sedimentary deposit aquifers",237,76,109),
	("Hawaiian Volcanic-rock aquifers",237,76,109),
	("High Plains aquifer",143,195,235),
	("Jacobsville aquifer",169,173,62),
	("Kingshill aquifer",154,95,65),
	("Lower Cretaceous aquifers",157,224,193),
	("Lower Tertiary aquifers",190,229,122),
	("Marshall aquifer",25,172,81),
	("Mississippi embayment aquifer system",255,243,45),
	("Mississippi River Valley alluvial aquifer",136,174,185),
	("Mississippian aquifers",177,99,138),
	("New York and New England carbonate-rock aquifers",193,167,93),
	("New York sandstone aquifers",142,207,51),
	("Northern Atlantic Coastal Plain aquifer system",255,243,45),
	("Northern Rocky Mountains Intermontane Basins aquifer system",10,164,202),
	("Ordovician aquifers",214,136,64),
	("Other rocks",0,0,0),
	("Ozark Plateaus aquifer system",181,151,117),
	("Pacific Northwest basaltic-rock aquifers",252,126,103),
	("Pacific Northwest basin-fill aquifers",15,140,206),
	("Paleozoic aquifers",123,108,177),
	("Pecos River Basin alluvial aquifer",33,203,239),
	("Pennsylvanian aquifers",157,194,117),
	("Piedmont and Blue Ridge carbonate-rock aquifers",225,110,66),
	("Piedmont and Blue Ridge crystalline-rock aquifers",253,253,243),
	("Puerto Rico North Coast Limestone aquifer system",174,141,100),
	("Puerto Rico south coast aquifer",14,184,184),
	("Puget Sound aquifer system",101,170,167),
	("Rio Grande aquifer system",83,195,233),
	("Roswell Basin aquifer system",176,131,76),
	("Rush Springs aquifer",61,206,167),
	("Seymour aquifer",117,193,209),
	("Silurian-Devonian aquifers",163,141,92),
	("Snake River Plain basaltic-rock aquifers",251,214,170),
	("Snake River Plain basin-fill aquifers",166,234,219),
	("Southeastern Coastal Plain aquifer system",255,243,45),
	("Southern Nevada volcanic-rock aquifers",255,105,74),
	("Surficial aquifer system",155,206,235),
	("Texas coastal uplands aquifer system",255,243,45),
	("Upper carbonate aquifer",238,175,95),
	("Upper Cretaceous aquifers",59,185,147),
	("Upper Tertiary aquifers",148,216,73),
	("Valley and Ridge aquifers",214,136,175),
	("Valley and Ridge carbonate-rock aquifers",214,136,175),
	("Willamette Lowland basin-fill aquifers",65,168,227)]

	# loop over the list looking at the values
	for aquifer in aquifers:
		if (r == aquifer[1]) and (g == aquifer[2]) and (b == aquifer[3]):
			xmlString = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
			xmlString = xmlString + '<aquifers>'
			xmlString = xmlString + '<aquifer name="' + aquifer[0] +'"'
			xmlString = xmlString + ' red="' + str(aquifer[1])  +'"'
			xmlString = xmlString + ' green="' + str(aquifer[2]) +'"'
			xmlString = xmlString + ' blue="' + str(aquifer[3]) + '"/>'
			xmlString = xmlString + '</aquifers>'
			return xmlString

	# otherwise nothing was found
	xmlString = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
	xmlString = xmlString + '<aquifers>'
	xmlString = xmlString + '<aquifer name="" red="-1" green="-1" blue=""/>'
	xmlString = xmlString + '</aquifers>'
	return xmlString

cherrypy.server.socket_port = 8082
cherrypy.quickstart(root())