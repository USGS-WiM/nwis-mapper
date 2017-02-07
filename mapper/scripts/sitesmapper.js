/*
These are the set of functions used by the sites mapper implementation in the NWIS mapper beta
Martyn Smith 9/06/2012
*/

//pass the query URL to the get function
function startSM() {
	sitesMapperStandby.show();
	//grab url
	var url = window.location.href;
	nwisWebURL = url.substring(url.indexOf("=") + 1, url.length);
	getQuery();
}

function makeSitesMapperStandby() {
	sitesMapperStandby = new dojox.widget.Standby({target:"leftPane", color:"gray", text:"Please wait, gathering site information"});
	document.body.appendChild(sitesMapperStandby.domNode);
	sitesMapperStandby.startup();
}

function showQueryParameters() {

	// get all the URL parameters
	var url = nwisWebURL;

	//get parameters from beginning section of NWIS query URL
	var urlStrip = url.substring(0,url.indexOf("&format=sitefile_output"));
	var params = urlStrip.substring(urlStrip.indexOf("?") + 1, urlStrip.length);
	var urlKeyPairs = dojo.queryToObject(params);
	
	//strip out json stuff
	var URLargsJSON = dojo.toJson(urlKeyPairs);
	var URLargsTXT = URLargsJSON.replace(/\\|\\|\{|\}|\"/g,' ');
	var URLargsHTML = URLargsTXT.replace(/\,/g,'<br/>');
	
	////send cleaned up query arguments to div
	document.getElementById("queryArgs").innerHTML = URLargsHTML;
}

function getQuery() {

	var parser = document.createElement('a');
	parser.href = nwisWebURL;
	var curURL = window.location.protocol + "//" + window.location.hostname + "/" + window.location.pathname.split("/")[1]
	
	//check for the two possible urls, which each need to be proxied seperately
	if (parser.hostname == "nwis.waterdata.usgs.gov") {
		//get site coutner before doing anything else
		var counterURL = curURL + "/sitecounter/?mapperURL=" + nwisWebURL.replace(/&/g,"$");
		var xmlLoadCounter = 
		{
			url: counterURL,
			handleAs: "text",
			load: siteCounter,
			error: errGet_NWISweb
		}
		var deferred = dojo.xhrGet(xmlLoadCounter);
	}
		
//check for the two possible urls, which easy need to be proxied seperately
	else if (parser.hostname == "waterdata.usgs.gov") {
		//get site count -- have to replace & with $ or else URL wont get sent to cherrypy correctly
		var counterURL = curURL + "/sitecounter/?mapperURL=" +  nwisWebURL.replace(/&/g,"$");
		var xmlLoadCounter = 
		{
			url: counterURL,
			handleAs: "text",
			load: siteCounter,
			error: errGet_NWISweb
		}
		var deferred = dojo.xhrGet(xmlLoadCounter);
	}
	
	
	else {
		var xmlLoad = 
		{
			url: nwisWebURL,
			handleAs: "xml",
			load: draw_NWISweb_sites,
			error: errGet_NWISweb
		}
		var deferred = dojo.xhrGet(xmlLoad);
		
	}
	
	//Show loading message and query params
	showQueryParameters();
}

//this is the function that runs the actual site retrieval if the siteCount is greater than one
function siteCounter(numsites, ioargs) {

	//set the global vars
	siteCount = numsites.split(",")[0];
	siteData = numsites.split(",");

	//first check for null xml
	if (siteCount > 0) 
	{
		//check for large return
		if (siteCount > 2500)
		{
			fancy_confirm(
				"Warning",
				"Your query had too many results to display (>2500), only the extent is shown.  Please refine your query and redraw map to display sites.  Alternatively, you can export the results using the 'Export..' button in the 'Search Results' panel.");			
		}
		//otherwise do normal display
		else
		{
			load_NWISweb_sites();
		}
	}
	else
	{
		alert("No sites returned, please refine your NWIS query");
		sitesMapperStandby.hide();
	}
	
	
}

function load_NWISweb_sites() {
	//sitesMapperStandby.show();
	var xmlLoad = 
	{
		url: nwisWebURL,	
		handleAs: "xml",
		load: draw_NWISweb_sites,
		error: errGet_NWISweb
	}
	
	//run
	var deferred = dojo.xhrGet(xmlLoad);
}

function errGet_NWISweb(error, ioargs) {
	alert("There was a problem with the request...");
	console.log(error);
}

function draw_NWISweb_sites(xml, ioargs) {
		if (xml) {
			//get all elements and store to a variable
			var markers_NWISweb = xml.getElementsByTagName("site");
		}
		
		// if something is returned, go ahead
		if (markers_NWISweb)
		{	
			//show number of results
			document.getElementById("siteCount").innerHTML = "Number of results: " + siteCount
			
			//initialize variables
			var site_no = "";
			var site_name = "";
			var cat_code = "";
			var agency = "";
			var jsonStr = "";
			var jsonObj;
			var emptySite = {"items":[]};
			
			//create graphicsarray to store all points--used for zooming after display
			var markerarray=new Array();
			
			//initialize dojo store
			sitesNWISwebStore = new dojo.data.ItemFileWriteStore({data:emptySite});

			//read in sites from XML
			var nmarkers_NWISweb = 0;
			while( nmarkers_NWISweb < markers_NWISweb.length) {

				// get attributes
				var site_no = markers_NWISweb[nmarkers_NWISweb].getElementsByTagName("site_no")[0].firstChild.nodeValue;
				var site_name = markers_NWISweb[nmarkers_NWISweb].getElementsByTagName("station_nm")[0].firstChild.nodeValue;
				var cat_code = markers_NWISweb[nmarkers_NWISweb].getElementsByTagName("site_tp_cd")[0].firstChild.nodeValue;
				var agency =  markers_NWISweb[nmarkers_NWISweb].getElementsByTagName("agency_cd")[0].firstChild.nodeValue;
				
				if (markers_NWISweb[nmarkers_NWISweb].getElementsByTagName("dec_long_va")[0].firstChild != null) {
					var longDD = markers_NWISweb[nmarkers_NWISweb].getElementsByTagName("dec_long_va")[0].firstChild.nodeValue;
				}
				if (markers_NWISweb[nmarkers_NWISweb].getElementsByTagName("dec_lat_va")[0].firstChild != null) {
					var latDD = markers_NWISweb[nmarkers_NWISweb].getElementsByTagName("dec_lat_va")[0].firstChild.nodeValue;
				}
				
				//watch at for null values in agency_use_cd field.  everything other than "A,L,M" is set to inactive	
				var siteStatus = "ina";
				if (markers_NWISweb[nmarkers_NWISweb].getElementsByTagName("agency_use_cd")[0].firstChild != null)
				{
					if ((markers_NWISweb[nmarkers_NWISweb].getElementsByTagName("agency_use_cd")[0].firstChild.nodeValue == "A") || (markers_NWISweb[nmarkers_NWISweb].getElementsByTagName("agency_use_cd")[0].firstChild.nodeValue == "L") || (markers_NWISweb[nmarkers_NWISweb].getElementsByTagName("agency_use_cd")[0].firstChild.nodeValue == "M"))
					{
						var siteStatus = "act";
					}
				}
				
				//SET SITE TYPES		
				//surface water
				if (cat_code == "ES" || cat_code == "LK" || cat_code == "OC" || cat_code == "OC-CO" || cat_code == "ST" || cat_code == "ST-CA" || cat_code == "ST-DCH" || cat_code == "ST-TS" || cat_code == "WE")
				{ 
					var siteType = "swNWISweb";
				}
				
				//groundwater
				if (cat_code == "GW" || cat_code == "GW-CR" || cat_code == "GW-EX" || cat_code == "GW-HZ" || cat_code == "GW-IW" || cat_code == "GW-MW" || cat_code == "GW-TH" || cat_code == "SB" || cat_code == "SB-CV" || cat_code == "SB-GWD" || cat_code == "SB-TSM" || cat_code == "SB-UZ")
				{ 
					var siteType = "gwNWISweb";
				}
				
				//spring
				if (cat_code == "SP")
				{ 
					var siteType = "spNWISweb";
				}
				
				//atmospheric
				if (cat_code == "AT")
				{ 
					var siteType = "atNWISweb";
				}
				
				//other
				if (cat_code == "AG" || cat_code == "AS" || cat_code == "AW" ||	cat_code == "FA-CI" || cat_code == "FA-CS" || cat_code == "FA-DV" || cat_code == "FA-FON" || cat_code == "FA-GC" || cat_code == "FA-LF" || cat_code == "FA-OF" || cat_code == "FA-PV" || cat_code == "FA-QC" || cat_code == "FA-SEW" || cat_code == "FA-SPS" || cat_code == "FA-STS" ||	cat_code == "FA-WDS" || cat_code == "FA-WIW" || cat_code == "FA-WU" || cat_code == "FA-WWD" || cat_code == "LA" || cat_code == "LA-EX" || cat_code == "LA-OU" || cat_code == "LA-SH" ||	cat_code == "LA-SNK" || cat_code == "LA-SR" || cat_code == "GL")
				{ 
					var siteType = "otNWISweb";
				}
							
				//set other marker variables
				var markers_NWISweb;
				var icon_width = 22;
				var icon_height = 30;
				var icon_postfix = "_30";
				
				//strip out 'NWISweb' part of site status so we can get the right symbol
				var siteTypeOrig = siteType.replace("NWISweb","");
				
				//create the icon
				var glayer_NWISweb = map.getLayer(siteType + "_" + siteStatus + "_glayer");

				var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/" + siteTypeOrig + "_" + siteStatus + icon_postfix + ".png", icon_width, icon_height);
				
				// build the symbol
				var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(parseFloat(longDD), parseFloat(latDD),  new esri.SpatialReference({ wkid: 4326 })));
				var attr = {"site_no":site_no, "site_name":site_name, "agency":agency };
				var marker_NWISweb = new esri.Graphic(point, icon, attr, siteTemplate);
				
				// add marker to map
				if (glayer_NWISweb != "undefined") {
					glayer_NWISweb.add(marker_NWISweb);
					}
				
				// single quotes in JSON string are causing a problem for the grid
				if (site_name.indexOf("'") > -1) {
					site_name = site_name.replace(/'/g," ");
				}
				
				// format site data as JSON
				var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'" + siteType + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
				var jsonObj = dojo.fromJson(jsonStr);
				sitesNWISwebStore.newItem(jsonObj);
				
				//add to marker array
				markerarray[nmarkers_NWISweb] = marker_NWISweb;

				// increment the marker counter
				nmarkers_NWISweb++;
			}
			
			// end of the markers, so save the store
			sitesNWISwebStore.save();

			// set the grid to the datastore
			sitesNWISwebGrid.setStore(sitesNWISwebStore);
			
			//get extent of all map graphics and zoom to the extent then zoom out with a factor
			if (markerarray.length > 1) 
			{
				var esriExtent = esri.graphicsExtent(markerarray);
				map.setExtent(esriExtent.expand(2));
			}
			//if there is only one site, do this
			else if (markerarray.length = 1) 
			{
				map.centerAt(point);
				//set delay on the zoom because maps needs to center first
				setTimeout(function() {map.setLevel(10)},500);
			}

			
			//make sure active layers are on top
			map.reorderLayer("gwNWISweb_act_glayer",1000);
			map.reorderLayer("swNWISweb_act_glayer",1001);
		}
	sitesMapperStandby.hide();
}

//this is the function for >2500 sites
function draw_NWISweb_hull() {

	//show site count
	document.getElementById("siteCountHull").innerHTML = "<br/>Number of results: " + siteCount + "<br/><br/>WARNING: Your query had too many results to display, only the extent is shown.  You can export the results below.<br/><br/></i>"
	document.getElementById("siteCount").innerHTML = "Number of results: " + siteCount
	
	//define layer to hold extent polygon
	var glayer_NWISweb_extent = map.getLayer("NWISquery_extent");
			
	//create polygon from bounding box extent and draw it on the map
	var polygonSymbol = new esri.symbol.SimpleFillSymbol();
	
	//create polygon hull string
	hullString = '{"rings": [[';
	for (var i = 5; i < siteData.length; i+=2) {
		hullString += '[' + siteData[i] + ',' + siteData[i+1] + '],';
	}
	//add first point again to close hull
	hullString += '[' + siteData[5] + ',' + siteData[6] + ']';
	
	//close hull string
	hullString += ']],"spatialReference": {"wkid": 4326} }';
	
	//convert to JSON object (doesn't work in IE7/8)
	//var jsonString = JSON.parse(hullString);
	//var jsonString = dojo.fromJson(hullString);
	require(["dojo/json"], function(json){
		jsonString = json.parse(hullString)
	});

	//create ESRI polygon for hull
	var polygon = esri.geometry.geographicToWebMercator(new esri.geometry.Polygon(jsonString));
	var attr = {"numResults":siteCount};
	var infoTemplate = new esri.InfoTemplate("Summary of query","Number of results: ${numResults} <br/><br/><i>WARNING: Your query had too many results to display, only the extent is shown.  You can export the results using the 'Search Results' panel.</i><br/><br/>");   
	
	//create marker
	var marker_NWISweb_extent = new esri.Graphic(polygon, polygonSymbol, attr, infoTemplate);
	
	//add marker to map
	glayer_NWISweb_extent.add(marker_NWISweb_extent);
	
	//zoom to new box
	map.setExtent(polygon.getExtent().expand(2));

	sitesMapperStandby.hide();
}

function formatSitesMapperUrl(baseUrl) {
	var siteNumberText = baseUrl.split("site_no=");
	return "<a href=https://waterdata.usgs.gov/nwis/inventory?agency_code=" + baseUrl + " target='_blank'>" + siteNumberText[1] + "</a>";
} 

function makeSiteGrids_NWISweb() {
//set up grid
	sitesNWISwebGrid = new dojox.grid.DataGrid({ autoWidth: true, autoHeight: true,
		structure:[
			{name:"Site Number", field:"grSiteUrl", formatter:formatSitesMapperUrl, width:"80px"},
			{name:"Site Name", field:"grSiteName", width:"154px"}
		]
	}, "sitesNWISwebGrid");
	sitesNWISwebGrid.startup();
	
	//attach listeners to grids to show highlight when selected
	dojo.connect(sitesNWISwebGrid, "onRowMouseOver", sitesNWISwebGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesNWISwebStore.getValue(item, "grSiteNo");
		var site_type = sitesNWISwebStore.getValue(item, "grSiteType");
		var site_status = sitesNWISwebStore.getValue(item, "grSiteStatus");
		if (rowValue) {
			drawSelectHalo(site_type + "_" + site_status + "_glayer", rowValue);
		}
	});
	
	//this listener is for a per site infowindow popup
	dojo.connect(sitesNWISwebGrid, "onRowClick", sitesNWISwebGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesNWISwebStore.getValue(item, "grSiteNo");
		var site_type = sitesNWISwebStore.getValue(item, "grSiteType");
		var site_status = sitesNWISwebStore.getValue(item, "grSiteStatus");
		if (rowValue) {
			drawSelectPopup(site_type + "_" + site_status + "_glayer", rowValue);
		}
	});
}

function drawSelectPopup(siteLayerId, rowValue) {
		
	// get the graphics layer and the selection layer
	var glayer = map.getLayer(siteLayerId);
	var slayer1 = map.getLayer("sel_glayer");
	
	//clear the selection layer
	slayer1.clear();
	
	//set popups
	popup.setFeatures(slayer1);
	
	// if the infoWindow is already open, then close it
	if (popup.isShowing) {
		popup.hide();
	}
	
	// get an array of all graphics for the layer
	var graphics = glayer.graphics;
	
	// find the map graphic that matches the row in the table and open the window at that graphic
	for (var i = 0; i < graphics.length; i++) {
		if (graphics[i].attributes.site_no == rowValue) {
			// create the selected icon
			var icon = new esri.symbol.PictureMarkerSymbol("./images/selected_site_yellow.png", 64, 64);
			
			// get the attributes and the template
			var attr = graphics[i].attributes;

			// create a selection graphic
			var selGraphic1 = new esri.Graphic(graphics[i].geometry, icon, attr, siteTemplate);
			slayer1.add(selGraphic1);
			break;
		}
	}

	//popup.select(i);
	map.infoWindow.setContent(selGraphic1.getContent());
	map.infoWindow.setTitle("Site Information");
	popup.show(selGraphic1.geometry);
}

function drawSelectHalo(siteLayerId, rowValue) {
		
	// get the graphics layer and the selection layer
	var glayer = map.getLayer(siteLayerId);
	var slayer = map.getLayer("sel_glayer");
	
	// clear the selection layer
	slayer.clear();
	
	// get an array of all graphics for the layer
	var graphics = glayer.graphics;
	
	// find the map graphic that matches the row in the table
	for (var i = 0; i < graphics.length; i++) {
		if (graphics[i].attributes.site_no == rowValue) {

			// create the selected icon
			var icon = new esri.symbol.PictureMarkerSymbol("./images/selected_site_yellow.png", 64, 64);
			
			// get the attributes and the template
			var attr = graphics[i].attributes;
			var siteTemplate = new esri.InfoTemplate();
			
			// create a selection graphic
			var selGraphic = new esri.Graphic( graphics[i].geometry, icon, attr, siteTemplate);
			slayer.add(selGraphic);
			//add this to make sure halo is in back
			map.reorderLayer(slayer,0);
			break;
		}
	}
}

function setExport(tabCode) {
	// show the export formats dialog
	dijit.byId('exportDialog').show()
}

function makeExportFile() {

	// need to build the URL for the exporter web service
	var expURL = "https://maps.waterdata.usgs.gov/mapper/exportSM/?mapperURL=";
	
	var modURL = nwisWebURL.replace(/&/g,"$");
	expURL += modURL;
	
	// get export file format from list of buttons
	var expButtons = dojo.byId("exportButtons");

	var expFormat = "";
	dojo.query('input', expButtons).forEach (
		function(inputElem) {
			if (inputElem.checked) {
				expFormat = inputElem.id;
			}
		}
	);

  var fmtCode = "";
	switch(expFormat) {
		case "expFmtTable": 		fmtCode = "1";break
		case "expFmtSiteNums":	fmtCode  ="2";break
		case "expFmtExcel":			fmtCode  ="3";break
		case "expFmtCSV":				fmtCode  ="4";break
		case "expFmtRDB":				fmtCode  ="5";break
		case "expFmtKML":				fmtCode  ="6";break
		case "expFmtShapeFile":	fmtCode  ="7";break
	}

	// add format to URL
	expURL += "$fformat=" + fmtCode;
	
	if (fmtCode == "1") {
		window.open(expURL);
	} 
	else {
		window.open(expURL);
		// this causes the browser to "save as" a file.
		//var dlframe = dojo.create("iframe", {src: expURL, style: "display: none"},  dojo.doc.body);
	}
}

//zoom tools
function zoomInTool() {
	if (dojo.isIE) {
		map.setMapCursor("url(images/nav_zoomin.png)");
	} else {
		map.setMapCursor("url(images/nav_zoomin.png),auto");
	}
	navToolBar.activate(esri.toolbars.Navigation.ZOOM_IN);
}

function zoomOutTool() {
	if (dojo.isIE) {
		map.setMapCursor("url(images/nav_zoomout.png)");
	} else {
		map.setMapCursor("url(images/nav_zoomout.png),auto");
	}

	navToolBar.activate(esri.toolbars.Navigation.ZOOM_OUT);
}

//clear glayer
function clearGLayer(glayerId) {
	var glayer = map.getLayer(glayerId);
	if (glayer) {
		glayer.clear();
	}
}

//show usgs offices
function showUSGSOffices() {

	clearGLayer("wsc_glayer");
	if (dojo.byId('chkWSC').checked == false) {
		return;
	} 
	
	function drawUSGSOffices(items, request) {

		if (items) {

			var glayer = map.getLayer("wsc_glayer");

			// calculate bounding box for current map extent
			var bboxExtent = new esri.geometry.Extent(map.extent.xmin, map.extent.ymin, map.extent.xmax, map.extent.ymax, map.spatialReference);
			bboxExtent = esri.geometry.webMercatorToGeographic(bboxExtent);

			// round the latitude and longitude values
			var xmin = Math.round(bboxExtent.xmin * 1000) / 1000;
			var ymin = Math.round(bboxExtent.ymin * 1000) / 1000;
			var xmax = Math.round(bboxExtent.xmax * 1000) / 1000;
			var ymax = Math.round(bboxExtent.ymax * 1000) / 1000;

			var item;
			var longDD, latDD;
			var point, office, city, state, zip, phone;
			var icon_width, icon_height, icon_name, icon_color, icon;
			var siteTemplate, attr, marker;

			for (var i = 0; i < items.length; i++) {
				item = items[i];

				// get the longitude and latitude of the USGS office location
				longDD = parseFloat(item.LONGDD);
				latDD = parseFloat(item.LATDD);

				// check if the point is within the current mapextent
				if (longDD < xmax && longDD > xmin) {
					if (latDD > ymin && latDD < ymax) {

						// create a point object from the long/lat
						point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(longDD, latDD,  new esri.SpatialReference({ wkid: 4326 })));

						// get the other attributes for the HTML popup
						office = item.OFFICE;
						city = item.CITY;
						state = item.STATE;
						zip = item.ZIP;
						phone = item.PHONE;
						url = item.URL;

						icon_width = 28; icon_height = 18
						icon_color = "green";
						if (office[0].indexOf("Field Office") > -1) {
							icon_color = "black";
						}
						icon_name = "usgslogo_" + icon_width.toString() + "_" + icon_color;

						// create an icon for the marker based on map scale - larger icon for Water Science Center
						icon = new esri.symbol.PictureMarkerSymbol("./images/" + icon_name + ".png", icon_width, icon_height);

						// build the html popup info if user has not submitted a custom site
						if (url == "") {
							siteTemplate = new esri.InfoTemplate("USGS Water Office Information",
							"<b>${office}</b><br />${city}, ${state} ${zip}<br /><b>Phone: </b>${phone}<br /><a href=https://" + state + ".water.usgs.gov target='_blank'>Water Science Center Home Page</a>");
							attr = {"office":office, "city":city, "state":state, "zip":zip, "phone":phone};
						} else {
							siteTemplate = new esri.InfoTemplate("USGS Water Office Information",
							"<iframe width='500px' height='300px' src='${url}'> </iframe>");
							attr = {"url":url};
						}
						
						marker = new esri.Graphic(point, icon, attr, siteTemplate);

						glayer.add(marker);
					}
				}
			}
		}
	}
	// fetch data
	usgsStore.fetch( { onComplete: drawUSGSOffices } );
}

//used for displaying USGS sites JSON layer
function makeUSGSLayer() {
	usgsStore = new dojo.data.ItemFileWriteStore({
		url:"json/usgs_water_offices.json",
		urlPreventCache:true
	});
}

//used for drawing hucs tile layer
function defineTileLayer2(layerName, agsName, op) {

	dojo.declare(layerName, esri.layers.TiledMapServiceLayer,{
			constructor: function() {

				this.spatialReference = new esri.SpatialReference({
					"wkid":102113
				});

				this.initialExtent = new esri.geometry.Extent({
						"xmin":-20037508.34,
						"ymin":-20037508.34,
						"xmax":20037508.34,
						"ymax":20037508.34,
						"spatialReference":{
								"wkid":102113
						}
				});

				// layer provides initial extent & full extent.
				this.fullExtent = new esri.geometry.Extent({
						"xmin":-20037508.34,
						"ymin":-20037508.34,
						"xmax":20037508.34,
						"ymax":20037508.34,
						"spatialReference":{
								"wkid": 102113
						}
				});

				this.tileInfo = new	esri.layers.TileInfo({
					"rows" : 256,
					"cols" : 256,
					"dpi" : 96,
					"format" : "PNG8",
					"compressionQuality" : 0,
					"origin" : {
						"x":-20037508.342787001,
						"y":20037508.342787001
					},
					"spatialReference" : {
					"wkid" : 102113
				},
					"lods" : [
						{"level" : 0 , "resolution" : 156543.033928000140, "scale" : 591657527.59155500},
						{"level" : 1 , "resolution" : 78271.5169639999370, "scale" : 295828763.79577702},
						{"level" : 2 , "resolution" : 39135.7584820000920, "scale" : 147914381.89788899},
						{"level" : 3 , "resolution" : 19567.8792409999190, "scale" : 73957190.948944002},
						{"level" : 4 , "resolution" : 9783.93962049995930, "scale" : 36978595.474472001},
						{"level" : 5 , "resolution" : 4891.96981024997970, "scale" : 18489297.737236001},
						{"level" : 6 , "resolution" : 2445.98490512498980, "scale" : 9244648.8686180003},
						{"level" : 7 , "resolution" : 1222.99245256249490, "scale" : 4622324.4343090001},
						{"level" : 8 , "resolution" : 611.496226281379680, "scale" : 2311162.2171550002},
						{"level" : 9 , "resolution" : 305.748113140557560, "scale" : 1155581.1085770000},
						{"level" : 10, "resolution" : 152.874056570411060, "scale" : 577790.55428899999},
						{"level" : 11, "resolution" : 76.4370282850732390, "scale" : 288895.27714399999},
						{"level" : 12, "resolution" : 38.2185141425366200, "scale" : 144447.63857200000},
						{"level" : 13, "resolution" : 19.1092570712683100, "scale" : 72223.819285999998},
						{"level" : 14, "resolution" : 9.55462853563415490, "scale" : 36111.909642999999},
						{"level" : 15, "resolution" : 4.77731426794936990, "scale" : 18055.954822000000}
						//{"level" : 16, "resolution" : 2.38865713397468490, "scale" : 9027.9774109999998},
						//{"level" : 17, "resolution" : 1.19432856685505030, "scale" : 4513.9887049999998},
						//{"level" : 18, "resolution" : 0.59716428355981721, "scale" : 2256.9943530000000},
						//{"level" : 19, "resolution" : 0.29858214164761665, "scale" : 1128.4971760000001}
					]
				});

				this.id = layerName;
				this.opacity = op;
				this.visible=false;
				this.loaded = true;
				this.onLoad(this);

			},

			getTileUrl:	function(level,	row, col) {
				return "https://107.21.119.135/mapper/tiles/" + layerName + "/NWIS/_alllayers/" +
					"L" + dojo.string.pad(level, 2, '0') + "/" +
					"R" + dojo.string.pad(row.toString(16), 8, '0') + "/" +
					"C" + dojo.string.pad(col.toString(16), 8, '0') + "." +
					"png";
		}
	});
}

//used for drawing hucs tile layer
function drawTLayer(chkBoxId, tlayerId) {

	var tlayer = map.getLayer(tlayerId);
	if (dojo.isObject(tlayer)) {
		if (dojo.byId(chkBoxId).checked) {
			if (tlayer.loaded) {
				tlayer.show();
			}
		}	else {
			if (tlayer.loaded) {
				tlayer.hide();
			}
		}
	}
}

//used for drawing hucs tile layer
function defineGraphicLayer(layerName, op) {

	var layerObj = new esri.layers.GraphicsLayer(
		{ id:layerName, visible:true, opacity:op});
	map.addLayer(layerObj);
}

//used for drawing hucs tile layer
function HUCLayer() {
	drawTLayer("chkHUC", "hucs");
}

//for forward and back extent buttons
function extentHistoryChangeHandler() {
	dijit.byId("zoomprev").disabled = navToolBar.isFirstExtent();
	dijit.byId("zoomnext").disabled = navToolBar.isLastExtent();
}

//for globe extent button
function zoomToFirstExtent() {
	var MapX = "-96.0";
	var MapY = "36.0";
	var MapZoom = "4";
	var geometry = new esri.geometry.Point(MapX, MapY);
	geometry = esri.geometry.geographicToWebMercator(geometry);
	map.centerAndZoom(geometry, MapZoom);
}

//create basemap gallery
function createBasemapGallery() {

	var basemaps= [];

	//add hydro basemap
	var HydroBasemapLayer = new esri.dijit.BasemapLayer({
	  url:"https://hydrology.esri.com/arcgis/rest/services/WorldHydroReferenceOverlay/MapServer"
	});
	var TerrainBasemapLayer = new esri.dijit.BasemapLayer({
	  url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer"
	});
	
	var hydroBasemap = new esri.dijit.Basemap({
	  layers:[TerrainBasemapLayer, HydroBasemapLayer],
	  thumbnailUrl:"images/hydroThumb.png",
	  title:"World Hydro Basemap"
	});
	basemaps.push(hydroBasemap);

	// create a basemap Gallery
	var basemapGallery = new esri.dijit.BasemapGallery({
		showArcGISBasemaps:true,
		basemaps:basemaps,
		map:map
	}, "basemapGallery");
	basemapGallery.startup();
}

function fancy_confirm(title, message) {
  var p = dijit.byId('id_dialog');
  p.attr( "title", title );
  dojo.byId('id_dialog_text').innerHTML = message;
  p.show();
}