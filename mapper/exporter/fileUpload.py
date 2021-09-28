 #!/usr/bin/python2.4

import cherrypy
import cgi
import tempfile
import os
import sys
import json, time, shapefile, zipfile

class myFieldStorage(cgi.FieldStorage):
    """Our version uses a named temporary file instead of the default
    non-named file; keeping it visibile (named), allows us to create a
    2nd link after the upload is done, thus avoiding the overhead of
    making a copy to the destination filename."""
    
    def make_file(self, binary=None):
        return tempfile.NamedTemporaryFile()


def noBodyProcess():
    """Sets cherrypy.request.process_request_body = False, giving
    us direct control of the file upload destination. By default
    cherrypy loads it to memory, we are directing it to disk."""
    cherrypy.request.process_request_body = False

cherrypy.tools.noBodyProcess = cherrypy.Tool('before_request_body', noBodyProcess)


class fileUpload:
    """fileUpload cherrypy application"""
       
    @cherrypy.expose
    @cherrypy.tools.noBodyProcess()
    def index(self, myFile=None):
        """upload action
        
        We use our variation of cgi.FieldStorage to parse the MIME
        encoded HTML form data containing the file."""
        
        # the file transfer can take a long time; by default cherrypy
        # limits responses to 300s; we increase it to 1h
        cherrypy.response.timeout = 3600
        
        # convert the header keys to lower case
        lcHDRS = {}
        for key, val in cherrypy.request.headers.iteritems():
            lcHDRS[key.lower()] = val
        
        # at this point we could limit the upload on content-length...
        # incomingBytes = int(lcHDRS['content-length'])
        
        # create our version of cgi.FieldStorage to parse the MIME encoded
        # form data where the file is contained
        formFields = myFieldStorage(fp=cherrypy.request.rfile,
                                    headers=lcHDRS,
                                    environ={'REQUEST_METHOD':'POST'},
                                    keep_blank_values=True)
        
        # we now create a 2nd link to the file, using the submitted
        # filename; if we renamed, there would be a failure because
        # the NamedTemporaryFile, used by our version of cgi.FieldStorage,
        # explicitly deletes the original filename
        myFile = formFields['myFile']
        uploadZip = '/var/www/mapper/exporter/temp/'+myFile.filename

        #if file already exists, kill it
        if os.path.exists(uploadZip):
            os.remove(uploadZip)

        #write zip file from upload to disk
        os.link(myFile.file.name, uploadZip)
        
        #load zip into zipfile
        zip = zipfile.ZipFile(uploadZip)

        #examine zip
        for file in zip.namelist():
            #clean up before unzip if files already exist
            if os.path.exists('/var/www/mapper/exporter/temp/' + file):
                os.remove('/var/www/mapper/exporter/temp/' + file)  
            #grab new shapefile name from zip
            if file.find(".shp") != -1:
                if file.find(".xml") == -1:
                    shpName = file

        #finally unzip
        zip.extractall('/var/www/mapper/exporter/temp/')
        
        #name of shapefile for processing
        lyrName = '/var/www/mapper/exporter/temp/' + shpName
        print
        print lyrName


        ############################################################################
        ## Tool Name:  Export Feature Class to GeoJSON
        ## Source Name: GeoJSONExporter.py
        ##
        ## This script will iterate through all features in a feature layer and
        ## export them with attributes to a geojson file
        ############################################################################
        
        startTime = time.clock()
        nodeCounter = 0
        
        print
        print "Started."
        print
        #get input parameters
        #lyrName = sys.argv[1] #FC to be exported
        #lyrName = shapeFile
        #outputFile = sys.argv[2] #output JSON file
        #outputFile = "test.json"
        #fieldList = "ID;WSC_Name;City;State;Zip;LongDD;LatDD;Phone;ESRI_OID"
        
        #if (sys.argv[3]  != "#"):
            #fieldList = sys.argv[3].split(";") #fields to return
        #else:
            #fieldList = "#"
        
        ##set the outFile
        #outFile = open(outputFile, "w")
        
        ##open shapefile
        sf = shapefile.Reader(lyrName)
        
        ## get the shape field's name
        #where [shapeType,Label, ESRIcollectionName, ESRIgeometryName]
        shapeTypes = [[0,"Null Shape", "null", "null"],[1,"Point", "pointsCollection"],[3,"Polyline", "linesCollection", "paths"],[5,"Polygon", "polysCollection", "rings"],[8,"MultiPoint", "pointsCollection", "points"]]
        
        ##get shape Type
        for shape in shapeTypes:
            if shape[0] == sf.shapeType:
                lyrType = shape[1]
                esriColl = shape[2]
                #esriGeom = shape[3]
                break
        print "Shape type is: ",lyrType
        
        ## get feature count
        count = len(sf.shapes())
        
        ## get fieldlist
        fields = sf.fields
        fieldList = []
        iterFields = iter(fields)
        #skip first field 'deletionflag'
        next(iterFields)
        for field in iterFields:
            fieldList.append(field[0])
        print fieldList
        
        ## get shape records
        shapeRecs = sf.shapeRecords()
        
        ##get extent
        extent = sf.bbox
        print "BBox is: ",extent
        
        ##initialize collection
        FeatureCollection = {}
        
        ###write metadata
        FeatureCollection["metadata"] = {}
        FeatureCollection["metadata"]["description"] = "Shapefile description goes here"
        FeatureCollection["metadata"]["featureType"] = lyrType
        FeatureCollection["metadata"]["featureCount"] = count
        FeatureCollection["metadata"]["displayLevels"] = [6,7,8,9,10,11,12,13,14,15,16,17,18,19]
        
        FeatureCollection["metadata"]["extent"] = {}
        FeatureCollection["metadata"]["extent"]["xmin"] = round(extent[0],4)
        FeatureCollection["metadata"]["extent"]["ymin"] = round(extent[1],4)
        FeatureCollection["metadata"]["extent"]["xmax"] = round(extent[2],4)
        FeatureCollection["metadata"]["extent"]["ymax"] = round(extent[3],4)
        FeatureCollection["metadata"]["extent"]["spatialReference"] = {}
        FeatureCollection["metadata"]["extent"]["spatialReference"]["wkid"] = 4326
        
        FeatureCollection["metadata"]["fields"] = fieldList
        FeatureCollection["metadata"]["infoTemplate"] = {}
        FeatureCollection["metadata"]["infoTemplate"]["title"] = "Info Template Title"
        FeatureCollection["metadata"]["infoTemplate"]["content"] = "<b>ID: ${ID}</b><br /><br />Other info<br /><a href=https://usgs.gov target='_blank'>Hyperlink</a>"
        FeatureCollection["metadata"]["symbol"] = {}
        
        if lyrType == "Point":
            FeatureCollection["metadata"]["symbol"]["color"] = [255,0,0,128]
            FeatureCollection["metadata"]["symbol"]["size"] = 12
            FeatureCollection["metadata"]["symbol"]["angle"] = 0
            FeatureCollection["metadata"]["symbol"]["xoffset"] = 0
            FeatureCollection["metadata"]["symbol"]["yoffset"] = 0
            FeatureCollection["metadata"]["symbol"]["type"] = "esriSMS"
            FeatureCollection["metadata"]["symbol"]["style"] = "esriSMSSquare"
            FeatureCollection["metadata"]["symbol"]["outline"] = {}
            FeatureCollection["metadata"]["symbol"]["outline"]["color"] = [0,0,0,255]
            FeatureCollection["metadata"]["symbol"]["outline"]["width"] = 1
            FeatureCollection["metadata"]["symbol"]["outline"]["type"] = "esriSLS"
            FeatureCollection["metadata"]["symbol"]["outline"]["style"] = "esriSLSSolid"
        
        if lyrType == "Polygon":
            FeatureCollection["metadata"]["symbol"]["color"] = [255,204,153,50]
            FeatureCollection["metadata"]["symbol"]["type"] = "esriSFS"
            FeatureCollection["metadata"]["symbol"]["style"] = "esriSFSSolid"
            FeatureCollection["metadata"]["symbol"]["outline"] = {}
            FeatureCollection["metadata"]["symbol"]["outline"]["color"] = [110,110,110,255]
            FeatureCollection["metadata"]["symbol"]["outline"]["width"] = 1
            FeatureCollection["metadata"]["symbol"]["outline"]["type"] = "esriSLS"
            FeatureCollection["metadata"]["symbol"]["outline"]["style"] = "esriSLSSolid"    

        if lyrType == "Polyline":
            FeatureCollection["metadata"]["symbol"]["color"] = [115,76,0,255]
            FeatureCollection["metadata"]["symbol"]["type"] = "esriSLS",
            FeatureCollection["metadata"]["symbol"]["style"] = "esriSLSSolid"
            FeatureCollection["metadata"]["symbol"]["width"] = 1 
        
        ##start writing features
        FeatureCollection[esriColl] = []    
        
        ## Enter while loop for each feature/row
        for shapeRec in shapeRecs:
            
            tmpFeature = {} 
            tmpFeature["ID"] = {}
            tmpFeature["geometry"] = {}
            tmpFeature["attributes"] = {}
            
            if (lyrType == "Point"):
        
                #testing-- the record to be used as an ID should be identified by user
                tmpFeature["ID"] = shapeRec.record[1]
        
                pnt = shapeRec.shape.points
                tmpFeature["geometry"]["x"] = round(pnt[0][0],4)
                tmpFeature["geometry"]["y"] = round(pnt[0][1],4)
        
                for i, v in enumerate(shapeRec.record):
                    tmpFeature["attributes"][fieldList[i]] = v
        
                nodeCounter += 1
                
        
            elif (lyrType == "Polygon"):
        
                tmpFeature["ID"] = shapeRec.record[1]
        
                for i, v in enumerate(shapeRec.record):
                    tmpFeature["attributes"][fieldList[i]] = v
        
                nodeCounter += 1
                #tmpFeature["geometry"]["bbox"] = shapeRec.bbox
                    
                fCollection = []
                partnum = 0        
                print "Number of parts:",len(shapeRec.shape.parts)
                # Enter while loop for each part in the feature (if a singlepart feature this will occur only once)
                while partnum < len(shapeRec.shape.parts):
                    part = shapeRec.shape.points
        
                    print "Bbox for this part:",shapeRec.shape.bbox
                
                    intRing = False
        
                    aPoly = []
                    #print "aPoly",aPoly
                    outPoly = []
                    #print "outPoly",outPoly
                    inPolyColl = []
                    #print "inPolyColl",inPolyColl
                    inPolyTemp = []
                    #print "inPolyTemp",inPolyTemp
                    for pnt in part:
        
                        ## Print x, y coordinates of current point
                        if intRing:
                            inPolyTemp.append([round(pnt[0],4), round(pnt[1],4)])
                        else:
                            outPoly.append([round(pnt[0],4), round(pnt[1],4)])
        
        
                        # If pnt is null, either the part is finished or there is an interior ring
                        if not pnt:
                            if (len(inPolyTemp) != 0):
                                aPoly.append(inPolyTemp)
                            pnt = part.Next()
                            if pnt:
                                inPolyTemp = []
                                intRing = True
        
                    aPoly.insert(0,outPoly)
        
                    partnum += 1
                    fCollection.append(aPoly)
                          
                tmpFeature["geometry"]["extent"] = {}
                tmpFeature["geometry"]["extent"]["xmin"] = round(shapeRec.shape.bbox[0],4)
                tmpFeature["geometry"]["extent"]["ymin"] = round(shapeRec.shape.bbox[1],4)
                tmpFeature["geometry"]["extent"]["xmax"] = round(shapeRec.shape.bbox[2],4)
                tmpFeature["geometry"]["extent"]["ymax"] = round(shapeRec.shape.bbox[3],4)
                tmpFeature["geometry"]["extent"]["spatialReference"] = {}
                tmpFeature["geometry"]["extent"]["spatialReference"]["wkid"] = 4326
        
                if len(shapeRec.shape.parts) > 1:
                    tmpFeature["geometry"]["rings"] = aPoly
                    #tmpFeature[esriGeom]["type"] = "MultiPolygon"
                else:
                    tmpFeature["geometry"]["rings"] = fCollection[0]
                    #tmpFeature[esriGeom]["type"] = "Polygon"

            elif (lyrType == "Polyline"):
        
                tmpFeature["ID"] = shapeRec.record[0]
        
                for i, v in enumerate(shapeRec.record):
                    tmpFeature["attributes"][fieldList[i]] = v
        
                nodeCounter += 1
                partnum = 0
        
                #write data about current feature
                tmpFeature["geometry"]["extent"] = {}
                tmpFeature["geometry"]["extent"]["xmin"] = round(shapeRec.shape.bbox[0],4)
                tmpFeature["geometry"]["extent"]["ymin"] = round(shapeRec.shape.bbox[1],4)
                tmpFeature["geometry"]["extent"]["xmax"] = round(shapeRec.shape.bbox[2],4)
                tmpFeature["geometry"]["extent"]["ymax"] = round(shapeRec.shape.bbox[3],4)
                tmpFeature["geometry"]["extent"]["spatialReference"] = {}
                tmpFeature["geometry"]["extent"]["spatialReference"]["wkid"] = 4326
        
                tmpFeature["geometry"][esriGeom] = []
        
                # Enter while loop for each part in the feature (if a singlepart feature this will occur only once)
                while partnum < len(shapeRec.shape.parts):
                    part = shapeRec.shape.points
        
                    print "Bbox for this part:",shapeRec.shape.bbox        
        
                    for pnt in part:
                        tmpFeature["geometry"][esriGeom].append([round(pnt[0],4), round(pnt[1],4)])
                    partnum += 1
        
            else:
                print "Bad Geometry. Please check the type of layer!!!"
        
            print "Finished", nodeCounter, "out of", count, "features."
        
            #print tmpFeature    
            FeatureCollection[esriColl].append(tmpFeature)
        
        #pretty
        #obj = json.dumps(FeatureCollection, sort_keys=True, indent=4, separators=(',', ': '))
        #ugly
        #obj = json.dumps(FeatureCollection)

        return json.dumps(FeatureCollection)
        #print str(FeatureCollection)
        #return FeatureCollection
        
        #outFile.write(obj)
        #outFile.close()
        
        stopTime = time.clock()
        elapsedTime = stopTime - startTime
        
        print
        print "I've counted " + str(nodeCounter) + " vertices!"
        print "done in " + str(round(elapsedTime, 1)) + " seconds."
        print "Finished."






# remove any limit on the request body size; cherrypy's default is 100MB
# (maybe we should just increase it ?)
cherrypy.server.max_request_body_size = 0

# increase server socket timeout to 60s; we are more tolerant of bad
# quality client-server connections (cherrypy's defult is 10s)
cherrypy.server.socket_timeout = 60

cherrypy.server.socket_port = 9997
cherrypy.quickstart(fileUpload())