(C) Copyright, 2012, United States Geological Survey (USGS).
File last edited: 24-July-2012

Description of Export Files

	The NWIS Mapper provides the ability to export descriptive 
	information and access data for most water-data sites in the 
	National Water Information System (NWIS). These sites are or have 
	been operated by USGS or in some cases by its cooperative partners. 
	Provisonal data are available for immediate use to evaluate 
	current or recent hydrologic conditions. Historical data are 
	available if they have passed quality-assurance evaluation and
	been approved for release. Exporting provides metadata (data 
      about data) and other ancillary information for sites displayed on
	the Mapper, not the water data itself, but it also provides direct 
	links to retrieve the data. Because a variable number of files are 
	required for the different export formats, NWIS Mapper Export data 
	are distributed in a .zip archive. The archive provides a container 
	for all the files required during the export process. In general, 
	there are three types of files in the .zip archive:

		1) General Information - found in this Readme.txt file
		2) Metadata - found in the Metadata.txt file
		3) Site Data - the actual data itself, found in one or more
			files named NWISMapperExport.xxx
			where xxx is a suffix that indicates the file type.

Readme File (General Information)

	The first file is provided in two formats, Readme.txt and 
	Readme.html. It describes the other two files and their formats.

NWISMapperExport File (Site Data)

	The second file is named NWISMapperExport.xxx and contains the 
	actual NWIS Mapper export data. The file extension for 
	NWISMapperExport depends on the requested export format. There 
	are seven export formats with seven corresponding file extensions, 
	each summarized in the following descriptions. In general, site 
	data exported from the NWIS Mapper provide the following data 
	fields from the NWIS Site Information database:

		Site Number - a unique ID number in the NWIS database for the site.
			Examples: 14335072 (8-digits for most surface-water sites), 
				385041075395602 (15-digits for sites other than surface water)

		Site Name - a textual description of the site.
			Example: UPPER KLAMATH LAKE AT ROCKY POINT, OR

		Site Category - an NWIS code that describes the type of site. For
			Example: LK (surface-water site at a lake)

		Site Agency - the agency responsible for the site.
			Example: USGS

		Site Longitude - the longitude of the site. Units are decimal degrees,
			horizontal datum is North American Datum of 1983 (NAD83). Positive
			values represent locations in the Eastern Hemisphere, while negative
			values represent locations in the Western Hemisphere.
			Example: -90.075 (a line of longitude that runs approximately through
			New Orleans, LA, USA).

		Site Latitude  - the latitude of the site. Units are decimal degrees,
			horizontal datum is North American Datum of 1983 (NAD83). Positive
			values represent locations in the Northern Hemisphere, while negative
			values represent locations in the Southern Hemisphere.
			Example: 41.0604 (a line of latitude that runs approximately through
			Fort Wayne, IN, USA).
			
		Site NWIS URL - the web link to the NWIS online database for the site.
			Example: https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=11502500

	Description of Export Formats

	============================================================================
	Table of Sites
	============================================================================
	Export Format Name:	Table of Sites
	File Format: 		Hypertext Markup Language
	Filename extension:	.html
	Explanation: 		Exported data formatted for display in a web browser

	============================================================================
	List of Site Numbers
	============================================================================
	Export Format Name:	List of Site Numbers
	File Format:		ASCII text
	Filename extension:	.txt
	Explanation: 		A simple list of NWIS Site Numbers with one number 
	per line. The list of Site Numbers can be saved to a file that is entered 
	into NWIS online searches to facilitate data retrieval for known sites, or
	the list can be entered into the search using cut and paste.

	============================================================================
	Microsoft Excel
	============================================================================
	Export Format Name:	Microsoft Excel
	File Format:		Binary
	Filename extension:	.xls
	Explanation: 		A binary tabular format used natively by Microsoft's
	Excel spreadsheet software, and capable of being imported by many other
	software applications. The first row in the spreadsheet includes the
	following column headers representing the NWIS Site Information data field 
	information:

		SiteNumber
		SiteName
		SiteCategory
		SiteAgency
		SiteLongitude
		SiteLatitude
		SiteNWISURL

	============================================================================
	Comma Separated
	============================================================================
	Export Format Name:	Comma Separated
	File Format:		ASCII text
	Filename extension:	.csv
	Explanation: 		A textual tabular format compatible with many software
	applications. Each line or row in the file represents an NWIS site and
	associated information. Data values are separated by commas. In addition,
	text values are delimited by double quotes. The first row of the file
	contains the column names or names of the data fields:

		SiteNumber
		SiteName
		SiteCategory
		SiteAgency
		SiteLongitude,
		SiteLatitude
		SiteNWISURL

	============================================================================
	Tab Separated
	============================================================================
	Export Format Name:	Tab Separated
	File Format:		ASCII text
	Filename extension:	.rdb
	Explanation: 		A textual tabular format compatible with many 
	software applications. Each line or row in the file represents an NWIS site 
	and associated information. All data values are separated by TAB characters.
	The first row of the file contains the column names or names of the data
	fields. The second row of the file contains information that describes
	each data field in terms of length and type. The length of the field is
	the maximum number of characters used to store the data values. A data
	field can be one of three types: String, Date, or Number, designated
	respectively by S, D, or N. For example, the value for an NWIS Station
	Name is "50S",meaning a string of up to 50 characters. The field
	information in the file is:

	SiteNumber SiteName SiteCategory SiteAgency SiteLongitude SiteLatitude SiteNWISURL
	25S 50S 2S 10S 15N 15N 50S

	============================================================================
	Keyhole Markup Language
	============================================================================
	Export Format Name:	Keyhole Markup Language
	File Format:		ASCII text
	Filename extension:	.kml
	Explanation:		Keyhole Markup Language is an XML based markup
	language used by geographic applications such as Google Maps and
	Google Earth. KML describes the location of geographic features and
	their attributes and allows software to place those features on
	maps.

	============================================================================
	ESRI ShapeFile
	============================================================================
	Export Format Name:	ESRI ShapeFile
	File Format:		binary
	Filename extensions:	.shp, .dbf, .shx
	Explanation:		A data format for storing, managing, and displaying
	geographic data and associated tabular information. ShapeFiles were
	developed by Environmental Systems Research Institute (ESRI), developers of
	Geographic Information Systems (GIS) software and related products and
	technologies. Many geographic software applications are capable of
	importing ESRI ShapeFiles. Conceptually, an ESRI ShapeFile is a container
	for storing geographic data and the physical implementation of that
	container requires a minimum of three physical disk files. The geometry
	of the geographic features is stored in a file with the extension .shp,
	the tabular attributes associated the geographic features are stored
	in a file with a .dbf extension, and the index between the geometry
	and attributes is stored in a file with the extension .shx. The field
	information for Shapefiles is dependent on the dBase format:

		SITENO	Data Type: Character,	Width:	25
		SITENAME	Data Type: Character,	Width:	50
		CATEGORY	Data Type: Character,	Width:	2
		AGENCY	Data Type: Character,	Width:	10
		LONGDD	Data Type: Character,	Width:	15
		LATDD		Data Type: Character,	Width:	15
		SITEURL	Data Type: Character,	Width:	50

Metadata File

	The third file, called Metadata.txt, provides information about
	the export process and data file. It includes information about 
	the date and time the data export was requested, what kind of 
	sites were exported, what kind of data are associated with the 
	exported sites, how many NWIS sites are included in the export 
	file, and the longitude and latitude extents that contain the 
	requested data.



