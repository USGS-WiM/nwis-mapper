import cherrypy

class FileDemo(object):

    def index(self):
        return """
        <html><body>
            <h2>Upload a file</h2>
            <form action="upload" method="post" enctype="multipart/form-data">
            <input type="file" name="myFile" /><br />
            <input type="submit" />
            </form>
        </body></html>
        """
    index.exposed = True

    def upload(self, myFile):
        out = """<html>
        <head>
        <title>NWIS Mapper</title>
        <meta http-equiv="REFRESH" content="0;url=https://maps.waterdata.usgs.gov/mapper/nwisquery.html?URL=https://waterdata.usgs.gov/usa/nwis/inventory?multiple_site_no=%s&format=sitefile_output&sort_key=site_no&sitefile_output_format=xml&column_name=agency_cd&column_name=site_no&column_name=station_nm&list_of_search_criteria=multiple_site_no&column_name=site_tp_cd&column_name=dec_lat_va&column_name=dec_long_va&column_name=agency_use_cd"></HEAD>
        <BODY>
        You are being redirected
        </BODY>
        </html>"""

        sites = ""

        while True:
            data = myFile.file.readlines()
            if not data:
                break

            # try to account for different cases of files
            for line in data:               
                #first case, where agency is first value on a line site number	 is second
                if line.split()[0] == "USGS":
                    print line + " 1"               
                    sites += line.split()[1] + "%0A"
                #second case just site number is on a line
                elif (line.split()[0]).isdigit() and (8 <= len(line.split()[0]) <= 15):
                    print line + " 2"   
                    sites += line.split()[0] + "%0A"
            print sites

        return out % (sites)
   
    upload.exposed = True

cherrypy.server.socket_port = 9997
cherrypy.quickstart(FileDemo())
