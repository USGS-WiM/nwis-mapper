// NWIS Mapper support functions:
// Sections:
//	layers
//	markers
//	strings

// Section: layers
function drawGLayer(chkBoxId, glayerId) {

	var glayer = map.getLayer(glayerId);

	if (glayer) {
		glayer.show();
		if (dojo.byId(chkBoxId).checked) {
			glayer.clear();
			drawSitesByType(chkBoxId);
		} else {
			glayer.clear();
			clearGrid(glayerId.left(6));
		}
	}
}

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

function hideTLayer(tlayerId) {
	var tlayer = map.getLayer(tlayerId);
	if (dojo.isObject(tlayer)) {
		if (tlayer.loaded) {
			tlayer.hide();
		}
	}
}

function clearGLayer(glayerId) {
	var glayer = map.getLayer(glayerId);
	if (glayer) {
		glayer.clear();
	}
}

function disableDataTypeRadio(maxIndex) {

	var sp;
	if (maxIndex == 0) {
		sp = dojo.byId("sp_sw_act");DisAndGreyOut(sp);
		sp = dojo.byId("sp_sw_ina");DisAndGreyOut(sp);
		return;
	}
	if (maxIndex == 1) {
		sp = dojo.byId("sp_gw_act");DisAndGreyOut(sp);
		sp = dojo.byId("sp_gw_ina");DisAndGreyOut(sp);
		return;
	}
	if (maxIndex == 2) {
		sp = dojo.byId("sp_sp_act");DisAndGreyOut(sp);
		sp = dojo.byId("sp_sp_ina");DisAndGreyOut(sp);
		return;
	}
	if (maxIndex == 3) {
		sp = dojo.byId("sp_at_act");DisAndGreyOut(sp);
		sp = dojo.byId("sp_at_ina");DisAndGreyOut(sp);
		return;
	}
	if (maxIndex == 4) {
		sp = dojo.byId("sp_ot_act");DisAndGreyOut(sp);
		sp = dojo.byId("sp_ot_ina");DisAndGreyOut(sp);
		return;
	}
}

function enableDataTypeRadio(maxIndex) {

	var sp;
	if (maxIndex == 0) {
		sp = dojo.byId("sp_sw_act");EnableAndBlack(sp);
		sp = dojo.byId("sp_sw_ina");EnableAndBlack(sp);
		return;
	}
	if (maxIndex == 1) {
		sp = dojo.byId("sp_gw_act");EnableAndBlack(sp);
		sp = dojo.byId("sp_gw_ina");EnableAndBlack(sp);
		return;
	}
	if (maxIndex == 2) {
		sp = dojo.byId("sp_sp_act");EnableAndBlack(sp);
		sp = dojo.byId("sp_sp_ina");EnableAndBlack(sp);
		return;
	}
	if (maxIndex == 3) {
		sp = dojo.byId("sp_at_act");EnableAndBlack(sp);
		sp = dojo.byId("sp_at_ina");EnableAndBlack(sp);
		return;
	}
	if (maxIndex == 4) {
		sp = dojo.byId("sp_ot_act");EnableAndBlack(sp);
		sp = dojo.byId("sp_ot_ina");EnableAndBlack(sp);
		return;
	}
}

function EnableAndBlack(greySpan) {

	//set opacity back to normal
	dojo.setStyle(greySpan, { "opacity": 1 });

	dojo.query('input', greySpan).forEach(
		function(inputElem) {
			inputElem.disabled = '';
		}
	);
	// make labels black
	greySpan.className="treeLevel3";
}

function DisAndGreyOut(greySpan) {

	//add this to gray out radio button when disabled
	dojo.setStyle(greySpan, { "opacity": 0.3 });

	dojo.query('input',	greySpan).forEach(
		function(inputElem) {
			inputElem.disabled = 'disabled';
		}
	);
	// grey out labels
	greySpan.className="treeLevel3dis";
}

function defineGraphicLayer(layerName, op) {

	var layerObj = new esri.layers.GraphicsLayer(
		{ id:layerName, visible:true, opacity:op});
	map.addLayer(layerObj);
}

function fixSiteType(siteType) {
	// the siteType	parameter in this case is actually the url parameter
	if (siteType.left(2) == "ES") return "sw";
	if (siteType.left(2) == "GW") return "gw";
	if (siteType == "SP") return "sp";
	if (siteType == "AT") return "at";
	if (siteType.left(2) == "AG") return "ot";
}

function getSiteStatus(siteType) {

	// siteType is a checkboxID, so get right three characters, for example chkOTAct
	var primaryStatus = siteType.substr(5,3)
	switch (primaryStatus) {
		case "Act": return "active"; break;
		case "Ina": return "inactive"; break;
	}
}

function getSiteTypeText(cat_code) {
	//get first two letters
	var cat_code2dig = cat_code.substring(0,2).toUpperCase();

	//get site type for each site
	switch(cat_code2dig)
		{
			//SW SITES
			case "ES": return "Estuary"; break;
			case "LK": return "Lake"; break;
			case "OC": return "Ocean"; break;
			case "ST": return "Stream";	break;
			case "WE": return "Wetland"; break;
			//GW SITES
			case "GW":  return "Well"; break;
			case "SB": return "Subsurface"; break;
			//SP SITES
			case "SP": return "Spring"; break;
			//AT SITES
			case "AT": return "Atmospheric"; break;
			//OT SITES
			case "AG": return "Aggregate groundwater use"; break;
			case "AS": return "Aggregate surface-water-use"; break;
			case "AW": return "Aggregate water-use establishment"; break;
			case "FA": return "Facility"; break;
			case "GL": return "Glacier"; break;
			case "LA": return "Land"; break;
			default: return "Other";
		}
}

function getSiteTypeUrl(siteType) {

	// siteType is a checkboxID, so get chars 4&5
	var siteTypeUrl = "";
	var primaryType = siteType.substr(3,2)
	switch (primaryType) {
		case "SW": siteTypeUrl = "ES,GL,LK,OC,ST,WE"; break;
		case "GW": siteTypeUrl = "GW,SB"; break;
		case "SP": siteTypeUrl = "SP"; break;
		case "AT": siteTypeUrl = "AT"; break;
		case "OT": siteTypeUrl = "AG,AS,FA,LA"; break
	}
	return siteTypeUrl;
}

function getHasDataType(siteType) {

	var sp;
	switch (siteType) {
		case "chkSWAct": sp = dojo.byId("sp_sw_act"); break;
		case "chkSWIna": sp = dojo.byId("sp_sw_ina"); break;
		case "chkGWAct": sp = dojo.byId("sp_gw_act"); break;
		case "chkGWIna": sp = dojo.byId("sp_gw_ina"); break;
		case "chkSPAct": sp = dojo.byId("sp_sp_act"); break;
		case "chkSPIna": sp = dojo.byId("sp_sp_ina"); break;
		case "chkATAct": sp = dojo.byId("sp_at_act"); break;
		case "chkATIna": sp = dojo.byId("sp_at_ina"); break;
		case "chkOTAct": sp = dojo.byId("sp_ot_act"); break;
		case "chkOTIna": sp = dojo.byId("sp_ot_ina"); break;
	}

	var hasDataCode = "";
	dojo.query('input', sp).forEach (
		function(inputElem) {
			if (inputElem.checked) {
				hasDataCode = inputElem.id;
			}
		}
	);

	// data code is post-fixed to end of radio button id
	hasDataCode = hasDataCode.right(2);
	if (hasDataCode == "ll") {
		hasDataCode = "all";
	}

	return hasDataCode;

}

function getSiteTemplate(siteType) {

	var sp;
	switch (siteType) {
		case "chkSWAct": sp = dojo.byId("sp_sw_act"); break;
		case "chkSWIna": sp = dojo.byId("sp_sw_ina"); break;
		case "chkGWAct": sp = dojo.byId("sp_gw_act"); break;
		case "chkGWIna": sp = dojo.byId("sp_gw_ina"); break;
		case "chkSPAct": sp = dojo.byId("sp_sp_act"); break;
		case "chkSPIna": sp = dojo.byId("sp_sp_ina"); break;
		case "chkATAct": sp = dojo.byId("sp_at_act"); break;
		case "chkATIna": sp = dojo.byId("sp_at_ina"); break;
		case "chkOTAct": sp = dojo.byId("sp_ot_act"); break;
		case "chkOTIna": sp = dojo.byId("sp_ot_ina"); break;
	}

	var hasDataCode = "";
	dojo.query('input', sp).forEach (
		function(inputElem) {
			if (inputElem.checked) {
				hasDataCode = inputElem.id;
			}
		}
	);

	// data code is post-fixed to end of radio button id
	var nwisDataType = "";
	hasDataCode = hasDataCode.right(2);

	if (hasDataCode == "ll" || hasDataCode == "ad") {
		nwisDataType = "inventory";
	}

	if (hasDataCode == "iv") {
		nwisDataType = "uv";
	}

	if (hasDataCode == "dv") {
		nwisDataType = "dv";
	}

	if (hasDataCode == "qw") {
		nwisDataType = "qwdata";
	}

	if (hasDataCode == "pk") {
		nwisDataType = "peak";
	}

	if (hasDataCode == "sv") {
		nwisDataType = "measurements";
	}

	if (hasDataCode == "gw") {
		nwisDataType = "gwlevels";
	}

	// there are slight parameter differences between the NWIS web query and the Sites web service query
	// if sw_act_iv, sw_ina_iv, gw_act_iv, gw_ina_iv, sp_act_iv, sp_ina_iv, at_act_iv, at_ina_iv, ot_act_iv, ot_ina_iv
	// 		then the NWIS Data Type = "uv"
	// if sw_act_iv, sw_ina_dv, gw_act_dv, gw_ina_dv, sp_act_dv, sp_ina_dv, at_act_dv, at_ina_dv, ot_act_dv, ot_ina_dv
	// 		then the NWIS Data Type = "dv"
	// if sw_act_pk, sw_ina_pk, ot_act_pk, ot_ina_pk
	// 		then the NWIS Data Type = "peak"
	// if sw_act_sv, sw_ina_sv, sp_act_sv, sp_ina_sv
	// 		then the NWIS Data Type = "measurements"
	// if gw_act_gw, gw_ina_gw
	// 		then the NWIS Data Type = "gwlevels"
	// if sw_act_qw, sw_ina_qw, gw_act_qw, gw_ina_qw, sp_act_qw, sp_ina_qw, at_act_qw, at_ina_qw, ot_act_qw, ot_ina_qw
	// 		then the NWIS Data Type =  "qwdata"
	// all other data types, default value
	// 		then the NWIS Data Type = "inventory"

	siteTemplate = new esri.InfoTemplate("Site Information",
	"<b>Site Number: </b>${site_no}<br /><b>Site Name: </b> ${site_name}<br /><b>Site Type: </b> ${siteTypeText}<br /><b>Agency: </b>${agency}<br /><a href=" + waterdataURL + "/nwis/" + nwisDataType + "?agency_code=${agency}&site_no=${site_no} target='_blank'>Access Data</a>");

	return siteTemplate;
}

function HUCLayer() {
	drawTLayer("chkHUC", "hucs");
}

function AQLayer() {
	drawTLayer("chkAQ", "pr_aq");
}

function setLayersFromURL() {

	// parse siteGroups and check the appropriate layers
	// data has to be a double XX,YYY where
	// XX = SW, GW, SP, AT, OT
	// YYY = ACT, INA


	// we could write a huge amount of code for error checking but it's not
	// worth the overhead - it's not that hard to the get the url correct

	// get the list of tokens from the URL
	var tokens = siteGroups.split(",");

	// number of tokens has to be a multiple of two
	if (tokens.length % 2 != 0) return;

	for (i = 0; i < tokens.length; i += 2) {

		var cb;
		if (tokens[i] == "SW" && tokens[i+1] == "ACT") {
			cb = dijit.byId("chkSWAct");
			cb.set("checked","true");
		}

		if (tokens[i] == "SW" && tokens[i+1] == "INA") {
			cb = dijit.byId("chkSWIna");
			cb.set("checked","true");
		}

		if (tokens[i] == "GW" && tokens[i+1] == "ACT") {
			cb = dijit.byId("chkGWAct");
			cb.set("checked","true");
		}

		if (tokens[i] == "GW" && tokens[i+1] == "INA") {
			cb = dijit.byId("chkGWIna");
			cb.set("checked","true");
		}

		if (tokens[i] == "SP" && tokens[i+1] == "ACT") {
			cb = dijit.byId("chkSPAct");
			cb.set("checked","true");
		}

		if (tokens[i] == "SP" && tokens[i+1] == "INA") {
			cb = dijit.byId("chkSPIna");
			cb.set("checked","true");
		}

		if (tokens[i] == "AT" && tokens[i+1] == "ACT") {
			cb = dijit.byId("chkATAct");
			cb.set("checked","true");
		}

		if (tokens[i] == "AT" && tokens[i+1] == "INA") {
			cb = dijit.byId("chkATIna");
			cb.set("checked","true");
		}

		if (tokens[i] == "OT" && tokens[i+1] == "ACT") {
			cb = dijit.byId("chkOTAct");
			cb.set("checked","true");
		}

		if (tokens[i] == "OT" && tokens[i+1] == "INA") {
			cb = dijit.byId("chkOTIna");
			cb.set("checked","true");
		}
	}
}


function drawSitesByType(siteType) {

	// declare webservice url
	var nwisWebURL = "./nwis/site/?";
	//var nwisWebURL = "https://waterservices.usgs.gov/nwis/site/?";

	// calculate bounding box for web service query
	var bboxExtent = new esri.geometry.Extent(map.extent.xmin, map.extent.ymin, map.extent.xmax, map.extent.ymax, map.spatialReference);
	bboxExtent = esri.geometry.webMercatorToGeographic(bboxExtent);

	// round the latitude and longitude values
	var xmin = Math.round(bboxExtent.xmin * 1000) / 1000;
	var ymin = Math.round(bboxExtent.ymin * 1000) / 1000;
	var xmax = Math.round(bboxExtent.xmax * 1000) / 1000;
	var ymax = Math.round(bboxExtent.ymax * 1000) / 1000;

	// add the bBox values to the URL
	nwisWebURL += "bBox=" + xmin + "," + ymin + "," + xmax +  ","  + ymax;

	// set the format
	nwisWebURL += "&format=mapper,1.0";

	// set the status
	nwisWebURL += "&siteStatus=" + getSiteStatus(siteType);

	// set the site types
	nwisWebURL += "&siteType=" + getSiteTypeUrl(siteType);

	// set the dataType
	nwisWebURL += "&hasDataTypeCd=" + getHasDataType(siteType);

	// set the xhrGet properties
	var urlObj = esri.urlToObject(nwisWebURL);

	// get the load function names
	var loadFuncName = "setMarkers_" + siteType;
	loadFuncName = window[loadFuncName];
	var errFuncName = "errGet_" + siteType;
	errFuncName = window[errFuncName];

	var siteFileRequest = {
		url: urlObj.path,
		handleAs: "xml",
		content: urlObj.query,
		load: loadFuncName,
		error: errFuncName
	}

	// show the 'Loading... icon"
	switch (siteType) {
		case "chkSWAct":swActStandby.show(); break;
		case "chkSWIna":swInaStandby.show(); break;
		case "chkGWAct":gwActStandby.show(); break;
		case "chkGWIna":gwInaStandby.show(); break;
		case "chkSPAct":spActStandby.show(); break;
		case "chkSPIna":spInaStandby.show(); break;
		case "chkATAct":atActStandby.show(); break;
		case "chkATIna":atInaStandby.show(); break;
		case "chkOTAct":otActStandby.show(); break;
		case "chkOTIna":otInaStandby.show(); break;
	}

	// AJAX call to fetch sites
	var deferred = dojo.xhrGet(siteFileRequest);
}

function setMarkers_chkSWAct(xml, ioargs) {
	var site_no = "";
	var site_name = "";
	var cat_code = "";
	var agency = "";
	var emptySite = {"items":[]};
	var siteType = "sw";
	var siteStatus = "act";
	var glayer = map.getLayer(siteType + "_" + siteStatus + "_glayer");
	var siteTemplate = getSiteTemplate("chkSWAct");

	// there are two groups of sites possible:
	//		single sites with a group tag of <sites> and
	//		colocated sites with a group tag of <colocated_sites>
	var single_sites = xml.getElementsByTagName("sites");
	var colo_sites = xml.getElementsByTagName("colocated_sites");

	// combinations:
	//		single = N, colo = N
	//		single = Y, colo = N
	//		single = Y, colo = Y
	//		single = N, colo = Y

	// single = N, colo = N
	if (single_sites.length == 0 && colo_sites.length == 0){
		swActStandby.hide();
		return;
	}

	// single = Y
	if (single_sites.length == 1) {
		var markers = single_sites[0].getElementsByTagName("site");

		// it's possible to have an XML tag but with no markers
		if (markers.length == 0) {

			// so if there really are no single sites and no
			// colocated sites we can exit
			if (colo_sites.length == 0) {
				swActStandby.hide();
				return;
			}
		// otherwise process the single sites
		} else {
			// update the status page on the bottom page with the number of sites
			updateStatus(markers.length.toString(), 0);
			sitesSWActStore = new dojo.data.ItemFileWriteStore({data:emptySite});

			// get the icon from the siteType and status - this could be a global icon
			// object for each site type, but we will leave this code and build the icon
			// on the fly in case we need to do scale dependent rendering
			var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/" + siteType + "_" + siteStatus + icon_postfix + ".png", icon_width, icon_height);

			// loop through the marker elements
			var nmarkers = 0;
			while( nmarkers < markers.length) {

				// get attributes
				site_no = markers[nmarkers].getAttribute("sno");
				site_name = markers[nmarkers].getAttribute("sna");
				cat_code = markers[nmarkers].getAttribute("cat");
				agency =  markers[nmarkers].getAttribute("agc");
				siteTypeText = getSiteTypeText(cat_code);

				// build the symbol
				var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(parseFloat(markers[nmarkers].getAttribute("lng")), parseFloat(markers[nmarkers].getAttribute("lat")),  new esri.SpatialReference({ wkid: 4326 })));
				var attr = {"site_no":site_no, "site_name":site_name, "siteTypeText":siteTypeText, "agency":agency };
				var marker = new esri.Graphic(point, icon, attr, siteTemplate);

				// add symbol to graphics layer
				glayer.add(marker);

				// single quotes in site names are being interpreted as JSON strings and
				// causing a problem for the grid, so replace them with double-quotes
				if (site_name.indexOf("'") > -1) {
					site_name = site_name.replace(/'/g," ");
				}

				// format the site data as JSON to add to the grid on the bottom pane

				//JUST CHANGE SITETYPE TO getSiteTypeText(cat_code) FOR GRID CHANGE
				var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
					+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
				var jsonObj = dojo.fromJson(jsonStr);

				// append the row to the grid
				sitesSWActStore.newItem(jsonObj);
				nmarkers++;
			}
		}
	}

	// at this point, all single sites have been plotted OR
	// there are no single sites, only colocated sites.
	// process colocated sites
	if (colo_sites.length == 1) {
		var cl_markers = colo_sites[0].getElementsByTagName("site");
		setCoLoMarkers(siteType, siteStatus, cl_markers);

		//update status grid
		var totalMarkers = markers.length + cl_markers.length;
		updateStatus(totalMarkers.toString() , 0);

		// loop through the marker elements
		var n_cl_markers = 0;
		while(n_cl_markers < cl_markers.length) {

			// get attributes
			site_no = cl_markers[n_cl_markers].getAttribute("sno");
			site_name = cl_markers[n_cl_markers].getAttribute("sna");
			cat_code = cl_markers[n_cl_markers].getAttribute("cat");
			agency =  cl_markers[n_cl_markers].getAttribute("agc");
			siteTypeText = getSiteTypeText(cat_code);

			// single quotes in site names are being interpreted as JSON strings and
			// causing a problem for the grid, so replace them with double-quotes
			if (site_name.indexOf("'") > -1) {
				site_name = site_name.replace(/'/g," ");
			}

			// format the site data as JSON to add to the grid on the bottom pane
			var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
				+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
			var jsonObj = dojo.fromJson(jsonStr);

			// append the row to the grid
			sitesSWActStore.newItem(jsonObj);
			n_cl_markers++;
		}
	}

	// end of the markers, so save the store
	sitesSWActStore.save();

	// set the grid to the datastore
	sitesSWActGrid.setStore(sitesSWActStore);

	// hide the loading icon
	swActStandby.hide();
}


function setMarkers_chkSWIna(xml, ioargs) {
	var site_no = "";
	var site_name = "";
	var cat_code = "";
	var agency = "";
	var emptySite = {"items":[]};
	var siteType = "sw";
	var siteStatus = "ina";
	var glayer = map.getLayer(siteType + "_" + siteStatus + "_glayer");
	var siteTemplate = getSiteTemplate("chkSWIna");

	// there are two groups of sites possible:
	//		single sites with a group tag of <sites> and
	//		colocated sites with a group tag of <colocated_sites>
	var single_sites = xml.getElementsByTagName("sites");
	var colo_sites = xml.getElementsByTagName("colocated_sites");

	// combinations:
	//		single = N, colo = N
	//		single = Y, colo = N
	//		single = Y, colo = Y
	//		single = N, colo = Y

	// single = N, colo = N
	if (single_sites.length == 0 && colo_sites.length == 0){
		swInaStandby.hide();
		return;
	}

	// single = Y
	if (single_sites.length == 1) {
		var markers = single_sites[0].getElementsByTagName("site");

		// it's possible to have an XML tag but with no markers
		if (markers.length == 0) {

			// so if there really are no single sites and no
			// colocated sites we can exit
			if (colo_sites.length == 0) {
				swInaStandby.hide();
				return;
			}
		// otherwise process the single sites
		} else {
			// update the status page on the bottom page with the number of sites
			updateStatus(markers.length.toString(), 1);
			sitesSWInaStore = new dojo.data.ItemFileWriteStore({data:emptySite});

			// get the icon from the siteType and status - this could be a global icon
			// object for each site type, but we will leave this code and build the icon
			// on the fly in case we need to do scale dependent rendering
			var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/" + siteType + "_" + siteStatus + icon_postfix + ".png", icon_width, icon_height);

			// loop through the marker elements
			var nmarkers = 0;
			while( nmarkers < markers.length) {

				// get attributes
				site_no = markers[nmarkers].getAttribute("sno");
				site_name = markers[nmarkers].getAttribute("sna");
				cat_code = markers[nmarkers].getAttribute("cat");
				agency =  markers[nmarkers].getAttribute("agc");
				siteTypeText = getSiteTypeText(cat_code);

				// build the symbol
				var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(parseFloat(markers[nmarkers].getAttribute("lng")), parseFloat(markers[nmarkers].getAttribute("lat")),  new esri.SpatialReference({ wkid: 4326 })));
				var attr = {"site_no":site_no, "site_name":site_name, "siteTypeText":siteTypeText, "agency":agency };
				var marker = new esri.Graphic(point, icon, attr, siteTemplate);

				// add symbol to graphics layer
				glayer.add(marker);

				// single quotes in site names are being interpreted as JSON strings and
				// causing a problem for the grid, so replace them with double-quotes
				if (site_name.indexOf("'") > -1) {
					site_name = site_name.replace(/'/g," ");
				}

				// format the site data as JSON to add to the grid on the bottom pane
				var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
					+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
				var jsonObj = dojo.fromJson(jsonStr);

				// append the row to the grid
				sitesSWInaStore.newItem(jsonObj);
				nmarkers++;
			}
		}
	}

	// at this point, all single sites have been plotted OR
	// there are no single sites, only colocated sites.
	// process colocated sites
	if (colo_sites.length == 1) {
		var cl_markers = colo_sites[0].getElementsByTagName("site");
		setCoLoMarkers(siteType, siteStatus, cl_markers);

		//update status grid
		var totalMarkers = markers.length + cl_markers.length;
		updateStatus(totalMarkers.toString() , 1);

		// loop through the marker elements
		var n_cl_markers = 0;
		while(n_cl_markers < cl_markers.length) {

			// get attributes
			site_no = cl_markers[n_cl_markers].getAttribute("sno");
			site_name = cl_markers[n_cl_markers].getAttribute("sna");
			cat_code = cl_markers[n_cl_markers].getAttribute("cat");
			agency =  cl_markers[n_cl_markers].getAttribute("agc");
			siteTypeText = getSiteTypeText(cat_code);

			// single quotes in site names are being interpreted as JSON strings and
			// causing a problem for the grid, so replace them with double-quotes
			if (site_name.indexOf("'") > -1) {
				site_name = site_name.replace(/'/g," ");
			}

			// format the site data as JSON to add to the grid on the bottom pane
			var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
				+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
			var jsonObj = dojo.fromJson(jsonStr);

			// append the row to the grid
			sitesSWInaStore.newItem(jsonObj);
			n_cl_markers++;
		}
	}

	// end of the markers, so save the store
	sitesSWInaStore.save();

	// set the grid to the datastore
	sitesSWInaGrid.setStore(sitesSWInaStore);

	// hide the loading icon
	swInaStandby.hide();
}


function setMarkers_chkGWAct(xml, ioargs) {

	var site_no = "";
	var site_name = "";
	var cat_code = "";
	var agency = "";
	var emptySite = {"items":[]};
	var siteType = "gw";
	var siteStatus = "act";
	var glayer = map.getLayer(siteType + "_" + siteStatus + "_glayer");
	var siteTemplate = getSiteTemplate("chkGWAct");

	// there are two groups of sites possible:
	//		single sites with a group tag of <sites> and
	//		colocated sites with a group tag of <colocated_sites>
	var single_sites = xml.getElementsByTagName("sites");
	var colo_sites = xml.getElementsByTagName("colocated_sites");

	// combinations:
	//		single = N, colo = N
	//		single = Y, colo = N
	//		single = Y, colo = Y
	//		single = N, colo = Y

	// single = N, colo = N
	if (single_sites.length == 0 && colo_sites.length == 0){
		gwActStandby.hide();
		return;
	}

	// single = Y
	if (single_sites.length == 1) {
		var markers = single_sites[0].getElementsByTagName("site");

		// it's possible to have an XML tag but with no markers
		if (markers.length == 0) {

			// so if there really are no single sites and no
			// colocated sites we can exit
			if (colo_sites.length == 0) {
				gwActStandby.hide();
				return;
			}
		// otherwise process the single sites
		} else {
			// update the status page on the bottom page with the number of sites
			updateStatus(markers.length.toString(), 2);
			sitesGWActStore = new dojo.data.ItemFileWriteStore({data:emptySite});

			// get the icon from the siteType and status - this could be a global icon
			// object for each site type, but we will leave this code and build the icon
			// on the fly in case we need to do scale dependent rendering
			var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/" + siteType + "_" + siteStatus + icon_postfix + ".png", icon_width, icon_height);

			// loop through the marker elements
			var nmarkers = 0;
			while( nmarkers < markers.length) {

				// get attributes
				site_no = markers[nmarkers].getAttribute("sno");
				site_name = markers[nmarkers].getAttribute("sna");
				cat_code = markers[nmarkers].getAttribute("cat");
				agency =  markers[nmarkers].getAttribute("agc");
				siteTypeText = getSiteTypeText(cat_code);

				// build the symbol
				var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(parseFloat(markers[nmarkers].getAttribute("lng")), parseFloat(markers[nmarkers].getAttribute("lat")),  new esri.SpatialReference({ wkid: 4326 })));
				var attr = {"site_no":site_no, "site_name":site_name, "siteTypeText":siteTypeText, "agency":agency };
				var marker = new esri.Graphic(point, icon, attr, siteTemplate);

				// add symbol to graphics layer
				glayer.add(marker);

				// single quotes in site names are being interpreted as JSON strings and
				// causing a problem for the grid, so replace them with double-quotes
				if (site_name.indexOf("'") > -1) {
					site_name = site_name.replace(/'/g," ");
				}

				// format the site data as JSON to add to the grid on the bottom pane
				var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
					+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
				var jsonObj = dojo.fromJson(jsonStr);

				// append the row to the grid
				sitesGWActStore.newItem(jsonObj);
				nmarkers++;
			}
		}
	}

	// at this point, all single sites have been plotted OR
	// there are no single sites, only colocated sites.
	// process colocated sites
	if (colo_sites.length == 1) {
		var cl_markers = colo_sites[0].getElementsByTagName("site");
		setCoLoMarkers(siteType, siteStatus, cl_markers);

		//update status grid
		var totalMarkers = markers.length + cl_markers.length;
		updateStatus(totalMarkers.toString() , 2);

		// loop through the marker elements
		var n_cl_markers = 0;
		while(n_cl_markers < cl_markers.length) {

			// get attributes
			site_no = cl_markers[n_cl_markers].getAttribute("sno");
			site_name = cl_markers[n_cl_markers].getAttribute("sna");
			cat_code = cl_markers[n_cl_markers].getAttribute("cat");
			agency =  cl_markers[n_cl_markers].getAttribute("agc");
			siteTypeText = getSiteTypeText(cat_code);

			// single quotes in site names are being interpreted as JSON strings and
			// causing a problem for the grid, so replace them with double-quotes
			if (site_name.indexOf("'") > -1) {
				site_name = site_name.replace(/'/g," ");
			}

			// format the site data as JSON to add to the grid on the bottom pane
			var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
				+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
			var jsonObj = dojo.fromJson(jsonStr);

			// append the row to the grid
			sitesGWActStore.newItem(jsonObj);
			n_cl_markers++;
		}
	}

	// end of the markers, so save the store
	sitesGWActStore.save();

	// set the grid to the datastore
	sitesGWActGrid.setStore(sitesGWActStore);

	// hide the loading icon
	gwActStandby.hide();
}

function setMarkers_chkGWIna(xml, ioargs) {

	var site_no = "";
	var site_name = "";
	var cat_code = "";
	var agency = "";
	var emptySite = {"items":[]};
	var siteType = "gw";
	var siteStatus = "ina";
	var glayer = map.getLayer(siteType + "_" + siteStatus + "_glayer");
	var siteTemplate = getSiteTemplate("chkGWIna");

	// there are two groups of sites possible:
	//		single sites with a group tag of <sites> and
	//		colocated sites with a group tag of <colocated_sites>
	var single_sites = xml.getElementsByTagName("sites");
	var colo_sites = xml.getElementsByTagName("colocated_sites");

	// combinations:
	//		single = N, colo = N
	//		single = Y, colo = N
	//		single = Y, colo = Y
	//		single = N, colo = Y

	// single = N, colo = N
	if (single_sites.length == 0 && colo_sites.length == 0){
		gwInaStandby.hide();
		return;
	}

	// single = Y
	if (single_sites.length == 1) {
		var markers = single_sites[0].getElementsByTagName("site");

		// it's possible to have an XML tag but with no markers
		if (markers.length == 0) {

			// so if there really are no single sites and no
			// colocated sites we can exit
			if (colo_sites.length == 0) {
				gwInaStandby.hide();
				return;
			}
		// otherwise process the single sites
		} else {
			// update the status page on the bottom page with the number of sites
			updateStatus(markers.length.toString(), 3);
			sitesGWInaStore = new dojo.data.ItemFileWriteStore({data:emptySite});

			// get the icon from the siteType and status - this could be a global icon
			// object for each site type, but we will leave this code and build the icon
			// on the fly in case we need to do scale dependent rendering
			var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/" + siteType + "_" + siteStatus + icon_postfix + ".png", icon_width, icon_height);

			// loop through the marker elements
			var nmarkers = 0;
			while( nmarkers < markers.length) {

				// get attributes
				site_no = markers[nmarkers].getAttribute("sno");
				site_name = markers[nmarkers].getAttribute("sna");
				cat_code = markers[nmarkers].getAttribute("cat");
				agency =  markers[nmarkers].getAttribute("agc");
				siteTypeText = getSiteTypeText(cat_code);

				// build the symbol
				var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(parseFloat(markers[nmarkers].getAttribute("lng")), parseFloat(markers[nmarkers].getAttribute("lat")),  new esri.SpatialReference({ wkid: 4326 })));
				var attr = {"site_no":site_no, "site_name":site_name, "siteTypeText":siteTypeText, "agency":agency };
				var marker = new esri.Graphic(point, icon, attr, siteTemplate);

				// add symbol to graphics layer
				glayer.add(marker);

				// single quotes in site names are being interpreted as JSON strings and
				// causing a problem for the grid, so replace them with double-quotes
				if (site_name.indexOf("'") > -1) {
					site_name = site_name.replace(/'/g," ");
				}

				// format the site data as JSON to add to the grid on the bottom pane
				var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
					+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
				var jsonObj = dojo.fromJson(jsonStr);

				// append the row to the grid
				sitesGWInaStore.newItem(jsonObj);
				nmarkers++;
			}
		}
	}

	// at this point, all single sites have been plotted OR
	// there are no single sites, only colocated sites.
	// process colocated sites
	if (colo_sites.length == 1) {
		var cl_markers = colo_sites[0].getElementsByTagName("site");
		setCoLoMarkers(siteType, siteStatus, cl_markers);

		//update status grid
		var totalMarkers = markers.length + cl_markers.length;
		updateStatus(totalMarkers.toString() , 3);

		// loop through the marker elements
		var n_cl_markers = 0;
		while(n_cl_markers < cl_markers.length) {

			// get attributes
			site_no = cl_markers[n_cl_markers].getAttribute("sno");
			site_name = cl_markers[n_cl_markers].getAttribute("sna");
			cat_code = cl_markers[n_cl_markers].getAttribute("cat");
			agency =  cl_markers[n_cl_markers].getAttribute("agc");
			siteTypeText = getSiteTypeText(cat_code);

			// single quotes in site names are being interpreted as JSON strings and
			// causing a problem for the grid, so replace them with double-quotes
			if (site_name.indexOf("'") > -1) {
				site_name = site_name.replace(/'/g," ");
			}

			// format the site data as JSON to add to the grid on the bottom pane
			var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
				+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
			var jsonObj = dojo.fromJson(jsonStr);

			// append the row to the grid
			sitesGWInaStore.newItem(jsonObj);
			n_cl_markers++;
		}
	}

	// end of the markers, so save the store
	sitesGWInaStore.save();

	// set the grid to the datastore
	sitesGWInaGrid.setStore(sitesGWInaStore);

	// hide the loading icon
	gwInaStandby.hide();
}

function setMarkers_chkSPAct(xml, ioargs) {

	var site_no = "";
	var site_name = "";
	var cat_code = "";
	var agency = "";
	var emptySite = {"items":[]};
	var siteType = "sp";
	var siteStatus = "act";
	var glayer = map.getLayer(siteType + "_" + siteStatus + "_glayer");
	var siteTemplate = getSiteTemplate("chkSPAct");


	// there are two groups of sites possible:
	//		single sites with a group tag of <sites> and
	//		colocated sites with a group tag of <colocated_sites>
	var single_sites = xml.getElementsByTagName("sites");
	var colo_sites = xml.getElementsByTagName("colocated_sites");

	// combinations:
	//		single = N, colo = N
	//		single = Y, colo = N
	//		single = Y, colo = Y
	//		single = N, colo = Y

	// single = N, colo = N
	if (single_sites.length == 0 && colo_sites.length == 0){
		spActStandby.hide();
		return;
	}

	// single = Y
	if (single_sites.length == 1) {
		var markers = single_sites[0].getElementsByTagName("site");

		// it's possible to have an XML tag but with no markers
		if (markers.length == 0) {

			// so if there really are no single sites and no
			// colocated sites we can exit
			if (colo_sites.length == 0) {
				spActStandby.hide();
				return;
			}
		// otherwise process the single sites
		} else {
			// update the status page on the bottom page with the number of sites
			updateStatus(markers.length.toString(), 4);
			sitesSPActStore = new dojo.data.ItemFileWriteStore({data:emptySite});

			// get the icon from the siteType and status - this could be a global icon
			// object for each site type, but we will leave this code and build the icon
			// on the fly in case we need to do scale dependent rendering
			var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/" + siteType + "_" + siteStatus + icon_postfix + ".png", icon_width, icon_height);

			// loop through the marker elements
			var nmarkers = 0;
			while( nmarkers < markers.length) {

				// get attributes
				site_no = markers[nmarkers].getAttribute("sno");
				site_name = markers[nmarkers].getAttribute("sna");
				cat_code = markers[nmarkers].getAttribute("cat");
				agency =  markers[nmarkers].getAttribute("agc");
				siteTypeText = getSiteTypeText(cat_code);

				// build the symbol
				var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(parseFloat(markers[nmarkers].getAttribute("lng")), parseFloat(markers[nmarkers].getAttribute("lat")),  new esri.SpatialReference({ wkid: 4326 })));
				var attr = {"site_no":site_no, "site_name":site_name, "siteTypeText":siteTypeText, "agency":agency };
				var marker = new esri.Graphic(point, icon, attr, siteTemplate);

				// add symbol to graphics layer
				glayer.add(marker);

				// single quotes in site names are being interpreted as JSON strings and
				// causing a problem for the grid, so replace them with double-quotes
				if (site_name.indexOf("'") > -1) {
					site_name = site_name.replace(/'/g," ");
				}

				// format the site data as JSON to add to the grid on the bottom pane
				var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
					+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
				var jsonObj = dojo.fromJson(jsonStr);

				// append the row to the grid
				sitesSPActStore.newItem(jsonObj);
				nmarkers++;
			}
		}
	}

	// at this point, all single sites have been plotted OR
	// there are no single sites, only colocated sites.
	// process colocated sites
	if (colo_sites.length == 1) {
		var cl_markers = colo_sites[0].getElementsByTagName("site");
		setCoLoMarkers(siteType, siteStatus, cl_markers);

		//update status grid
		var totalMarkers = markers.length + cl_markers.length;
		updateStatus(totalMarkers.toString() , 4);

		// loop through the marker elements
		var n_cl_markers = 0;
		while(n_cl_markers < cl_markers.length) {

			// get attributes
			site_no = cl_markers[n_cl_markers].getAttribute("sno");
			site_name = cl_markers[n_cl_markers].getAttribute("sna");
			cat_code = cl_markers[n_cl_markers].getAttribute("cat");
			agency =  cl_markers[n_cl_markers].getAttribute("agc");
			siteTypeText = getSiteTypeText(cat_code);

			// single quotes in site names are being interpreted as JSON strings and
			// causing a problem for the grid, so replace them with double-quotes
			if (site_name.indexOf("'") > -1) {
				site_name = site_name.replace(/'/g," ");
			}

			// format the site data as JSON to add to the grid on the bottom pane
			var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
				+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
			var jsonObj = dojo.fromJson(jsonStr);

			// append the row to the grid
			sitesSPActStore.newItem(jsonObj);
			n_cl_markers++;
		}
	}

	// end of the markers, so save the store
	sitesSPActStore.save();

	// set the grid to the datastore
	sitesSPActGrid.setStore(sitesSPActStore);

	// hide the loading icon
	spActStandby.hide();
}

function setMarkers_chkSPIna(xml, ioargs) {
	var site_no = "";
	var site_name = "";
	var cat_code = "";
	var agency = "";
	var emptySite = {"items":[]};
	var siteType = "sp";
	var siteStatus = "ina";
	var glayer = map.getLayer(siteType + "_" + siteStatus + "_glayer");
	var siteTemplate = getSiteTemplate("chkSPIna");

	// there are two groups of sites possible:
	//		single sites with a group tag of <sites> and
	//		colocated sites with a group tag of <colocated_sites>
	var single_sites = xml.getElementsByTagName("sites");
	var colo_sites = xml.getElementsByTagName("colocated_sites");

	// combinations:
	//		single = N, colo = N
	//		single = Y, colo = N
	//		single = Y, colo = Y
	//		single = N, colo = Y

	// single = N, colo = N
	if (single_sites.length == 0 && colo_sites.length == 0){
		spInaStandby.hide();
		return;
	}

	// single = Y
	if (single_sites.length == 1) {
		var markers = single_sites[0].getElementsByTagName("site");

		// it's possible to have an XML tag but with no markers
		if (markers.length == 0) {

			// so if there really are no single sites and no
			// colocated sites we can exit
			if (colo_sites.length == 0) {
				spInaStandby.hide();
				return;
			}
		// otherwise process the single sites
		} else {
			// update the status page on the bottom page with the number of sites
			updateStatus(markers.length.toString(), 5);
			sitesSPInaStore = new dojo.data.ItemFileWriteStore({data:emptySite});

			// get the icon from the siteType and status - this could be a global icon
			// object for each site type, but we will leave this code and build the icon
			// on the fly in case we need to do scale dependent rendering
			var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/" + siteType + "_" + siteStatus + icon_postfix + ".png", icon_width, icon_height);

			// loop through the marker elements
			var nmarkers = 0;
			while( nmarkers < markers.length) {

				// get attributes
				site_no = markers[nmarkers].getAttribute("sno");
				site_name = markers[nmarkers].getAttribute("sna");
				cat_code = markers[nmarkers].getAttribute("cat");
				agency =  markers[nmarkers].getAttribute("agc");
				siteTypeText = getSiteTypeText(cat_code);

				// build the symbol
				var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(parseFloat(markers[nmarkers].getAttribute("lng")), parseFloat(markers[nmarkers].getAttribute("lat")),  new esri.SpatialReference({ wkid: 4326 })));
				var attr = {"site_no":site_no, "site_name":site_name, "siteTypeText":siteTypeText, "agency":agency };
				var marker = new esri.Graphic(point, icon, attr, siteTemplate);

				// add symbol to graphics layer
				glayer.add(marker);

				// single quotes in site names are being interpreted as JSON strings and
				// causing a problem for the grid, so replace them with double-quotes
				if (site_name.indexOf("'") > -1) {
					site_name = site_name.replace(/'/g," ");
				}

				// format the site data as JSON to add to the grid on the bottom pane
				var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
					+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
				var jsonObj = dojo.fromJson(jsonStr);

				// append the row to the grid
				sitesSPInaStore.newItem(jsonObj);
				nmarkers++;
			}
		}
	}

	// at this point, all single sites have been plotted OR
	// there are no single sites, only colocated sites.
	// process colocated sites
	if (colo_sites.length == 1) {
		var cl_markers = colo_sites[0].getElementsByTagName("site");
		setCoLoMarkers(siteType, siteStatus, cl_markers);

		//update status grid
		var totalMarkers = markers.length + cl_markers.length;
		updateStatus(totalMarkers.toString() , 5);

		// loop through the marker elements
		var n_cl_markers = 0;
		while(n_cl_markers < cl_markers.length) {

			// get attributes
			site_no = cl_markers[n_cl_markers].getAttribute("sno");
			site_name = cl_markers[n_cl_markers].getAttribute("sna");
			cat_code = cl_markers[n_cl_markers].getAttribute("cat");
			agency =  cl_markers[n_cl_markers].getAttribute("agc");
			siteTypeText = getSiteTypeText(cat_code);

			// single quotes in site names are being interpreted as JSON strings and
			// causing a problem for the grid, so replace them with double-quotes
			if (site_name.indexOf("'") > -1) {
				site_name = site_name.replace(/'/g," ");
			}

			// format the site data as JSON to add to the grid on the bottom pane
			var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
				+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
			var jsonObj = dojo.fromJson(jsonStr);

			// append the row to the grid
			sitesSPInaStore.newItem(jsonObj);
			n_cl_markers++;
		}
	}

	// end of the markers, so save the store
	sitesSPInaStore.save();

	// set the grid to the datastore
	sitesSPInaGrid.setStore(sitesSPInaStore);

	// hide the loading icon
	spInaStandby.hide();
}

function setMarkers_chkATAct(xml, ioargs) {

	var site_no = "";
	var site_name = "";
	var cat_code = "";
	var agency = "";
	var emptySite = {"items":[]};
	var siteType = "at";
	var siteStatus = "act";
	var glayer = map.getLayer(siteType + "_" + siteStatus + "_glayer");
	var siteTemplate = getSiteTemplate("chkATAct");

	// there are two groups of sites possible:
	//		single sites with a group tag of <sites> and
	//		colocated sites with a group tag of <colocated_sites>
	var single_sites = xml.getElementsByTagName("sites");
	var colo_sites = xml.getElementsByTagName("colocated_sites");

	// combinations:
	//		single = N, colo = N
	//		single = Y, colo = N
	//		single = Y, colo = Y
	//		single = N, colo = Y

	// single = N, colo = N
	if (single_sites.length == 0 && colo_sites.length == 0){
		atActStandby.hide();
		return;
	}

	// single = Y
	if (single_sites.length == 1) {
		var markers = single_sites[0].getElementsByTagName("site");

		// it's possible to have an XML tag but with no markers
		if (markers.length == 0) {

			// so if there really are no single sites and no
			// colocated sites we can exit
			if (colo_sites.length == 0) {
				atActStandby.hide();
				return;
			}
		// otherwise process the single sites
		} else {
			// update the status page on the bottom page with the number of sites
			updateStatus(markers.length.toString(), 6);
			sitesATActStore = new dojo.data.ItemFileWriteStore({data:emptySite});

			// get the icon from the siteType and status - this could be a global icon
			// object for each site type, but we will leave this code and build the icon
			// on the fly in case we need to do scale dependent rendering
			var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/" + siteType + "_" + siteStatus + icon_postfix + ".png", icon_width, icon_height);

			// loop through the marker elements
			var nmarkers = 0;
			while( nmarkers < markers.length) {

				// get attributes
				site_no = markers[nmarkers].getAttribute("sno");
				site_name = markers[nmarkers].getAttribute("sna");
				cat_code = markers[nmarkers].getAttribute("cat");
				agency =  markers[nmarkers].getAttribute("agc");
				siteTypeText = getSiteTypeText(cat_code);

				// build the symbol
				var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(parseFloat(markers[nmarkers].getAttribute("lng")), parseFloat(markers[nmarkers].getAttribute("lat")),  new esri.SpatialReference({ wkid: 4326 })));
				var attr = {"site_no":site_no, "site_name":site_name, "siteTypeText":siteTypeText, "agency":agency };
				var marker = new esri.Graphic(point, icon, attr, siteTemplate);

				// add symbol to graphics layer
				glayer.add(marker);

				// single quotes in site names are being interpreted as JSON strings and
				// causing a problem for the grid, so replace them with double-quotes
				if (site_name.indexOf("'") > -1) {
					site_name = site_name.replace(/'/g," ");
				}

				// format the site data as JSON to add to the grid on the bottom pane
				var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
					+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
				var jsonObj = dojo.fromJson(jsonStr);

				// append the row to the grid
				sitesATActStore.newItem(jsonObj);
				nmarkers++;
			}
		}
	}

	// at this point, all single sites have been plotted OR
	// there are no single sites, only colocated sites.
	// process colocated sites
	if (colo_sites.length == 1) {
		var cl_markers = colo_sites[0].getElementsByTagName("site");
		setCoLoMarkers(siteType, siteStatus, cl_markers);

		//update status grid
		var totalMarkers = markers.length + cl_markers.length;
		updateStatus(totalMarkers.toString() , 6);

		// loop through the marker elements
		var n_cl_markers = 0;
		while(n_cl_markers < cl_markers.length) {

			// get attributes
			site_no = cl_markers[n_cl_markers].getAttribute("sno");
			site_name = cl_markers[n_cl_markers].getAttribute("sna");
			cat_code = cl_markers[n_cl_markers].getAttribute("cat");
			agency =  cl_markers[n_cl_markers].getAttribute("agc");
			siteTypeText = getSiteTypeText(cat_code);

			// single quotes in site names are being interpreted as JSON strings and
			// causing a problem for the grid, so replace them with double-quotes
			if (site_name.indexOf("'") > -1) {
				site_name = site_name.replace(/'/g," ");
			}

			// format the site data as JSON to add to the grid on the bottom pane
			var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
				+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
			var jsonObj = dojo.fromJson(jsonStr);

			// append the row to the grid
			sitesATActStore.newItem(jsonObj);
			n_cl_markers++;
		}
	}

	// end of the markers, so save the store
	sitesATActStore.save();

	// set the grid to the datastore
	sitesATActGrid.setStore(sitesATActStore);

	// hide the loading icon
	atActStandby.hide();
}

function setMarkers_chkATIna(xml, ioargs) {
	var site_no = "";
	var site_name = "";
	var cat_code = "";
	var agency = "";
	var emptySite = {"items":[]};
	var siteType = "at";
	var siteStatus = "ina";
	var glayer = map.getLayer(siteType + "_" + siteStatus + "_glayer");
	var siteTemplate = getSiteTemplate("chkATIna");

	// there are two groups of sites possible:
	//		single sites with a group tag of <sites> and
	//		colocated sites with a group tag of <colocated_sites>
	var single_sites = xml.getElementsByTagName("sites");
	var colo_sites = xml.getElementsByTagName("colocated_sites");

	// combinations:
	//		single = N, colo = N
	//		single = Y, colo = N
	//		single = Y, colo = Y
	//		single = N, colo = Y

	// single = N, colo = N
	if (single_sites.length == 0 && colo_sites.length == 0){
		atInaStandby.hide();
		return;
	}

	// single = Y
	if (single_sites.length == 1) {
		var markers = single_sites[0].getElementsByTagName("site");

		// it's possible to have an XML tag but with no markers
		if (markers.length == 0) {

			// so if there really are no single sites and no
			// colocated sites we can exit
			if (colo_sites.length == 0) {
				atInaStandby.hide();
				return;
			}
		// otherwise process the single sites
		} else {
			// update the status page on the bottom page with the number of sites
			updateStatus(markers.length.toString(), 7);
			sitesATInaStore = new dojo.data.ItemFileWriteStore({data:emptySite});

			// get the icon from the siteType and status - this could be a global icon
			// object for each site type, but we will leave this code and build the icon
			// on the fly in case we need to do scale dependent rendering
			var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/" + siteType + "_" + siteStatus + icon_postfix + ".png", icon_width, icon_height);

			// loop through the marker elements
			var nmarkers = 0;
			while( nmarkers < markers.length) {

				// get attributes
				site_no = markers[nmarkers].getAttribute("sno");
				site_name = markers[nmarkers].getAttribute("sna");
				cat_code = markers[nmarkers].getAttribute("cat");
				agency =  markers[nmarkers].getAttribute("agc");
				siteTypeText = getSiteTypeText(cat_code);

				// build the symbol
				var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(parseFloat(markers[nmarkers].getAttribute("lng")), parseFloat(markers[nmarkers].getAttribute("lat")),  new esri.SpatialReference({ wkid: 4326 })));
				var attr = {"site_no":site_no, "site_name":site_name, "siteTypeText":siteTypeText, "agency":agency };
				var marker = new esri.Graphic(point, icon, attr, siteTemplate);

				// add symbol to graphics layer
				glayer.add(marker);

				// single quotes in site names are being interpreted as JSON strings and
				// causing a problem for the grid, so replace them with double-quotes
				if (site_name.indexOf("'") > -1) {
					site_name = site_name.replace(/'/g," ");
				}

				// format the site data as JSON to add to the grid on the bottom pane
				var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
					+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
				var jsonObj = dojo.fromJson(jsonStr);

				// append the row to the grid
				sitesATInaStore.newItem(jsonObj);
				nmarkers++;
			}
		}
	}

	// at this point, all single sites have been plotted OR
	// there are no single sites, only colocated sites.
	// process colocated sites
	if (colo_sites.length == 1) {
		var cl_markers = colo_sites[0].getElementsByTagName("site");
		setCoLoMarkers(siteType, siteStatus, cl_markers);

		//update status grid
		var totalMarkers = markers.length + cl_markers.length;
		updateStatus(totalMarkers.toString() , 7);

		// loop through the marker elements
		var n_cl_markers = 0;
		while(n_cl_markers < cl_markers.length) {

			// get attributes
			site_no = cl_markers[n_cl_markers].getAttribute("sno");
			site_name = cl_markers[n_cl_markers].getAttribute("sna");
			cat_code = cl_markers[n_cl_markers].getAttribute("cat");
			agency =  cl_markers[n_cl_markers].getAttribute("agc");
			siteTypeText = getSiteTypeText(cat_code);

			// single quotes in site names are being interpreted as JSON strings and
			// causing a problem for the grid, so replace them with double-quotes
			if (site_name.indexOf("'") > -1) {
				site_name = site_name.replace(/'/g," ");
			}

			// format the site data as JSON to add to the grid on the bottom pane
			var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
				+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
			var jsonObj = dojo.fromJson(jsonStr);

			// append the row to the grid
			sitesATInaStore.newItem(jsonObj);
			n_cl_markers++;
		}
	}

	// end of the markers, so save the store
	sitesATInaStore.save();

	// set the grid to the datastore
	sitesATInaGrid.setStore(sitesATInaStore);

	// hide the loading icon
	atInaStandby.hide();
}

function setMarkers_chkOTAct(xml, ioargs) {

	var site_no = "";
	var site_name = "";
	var cat_code = "";
	var agency = "";
	var emptySite = {"items":[]};
	var siteType = "ot";
	var siteStatus = "act";
	var glayer = map.getLayer(siteType + "_" + siteStatus + "_glayer");
	var siteTemplate = getSiteTemplate("chkOTAct");

	// there are two groups of sites possible:
	//		single sites with a group tag of <sites> and
	//		colocated sites with a group tag of <colocated_sites>
	var single_sites = xml.getElementsByTagName("sites");
	var colo_sites = xml.getElementsByTagName("colocated_sites");

	// combinations:
	//		single = N, colo = N
	//		single = Y, colo = N
	//		single = Y, colo = Y
	//		single = N, colo = Y

	// single = N, colo = N
	if (single_sites.length == 0 && colo_sites.length == 0){
		otActStandby.hide();
		return;
	}

	// single = Y
	if (single_sites.length == 1) {
		var markers = single_sites[0].getElementsByTagName("site");

		// it's possible to have an XML tag but with no markers
		if (markers.length == 0) {

			// so if there really are no single sites and no
			// colocated sites we can exit
			if (colo_sites.length == 0) {
				otActStandby.hide();
				return;
			}
		// otherwise process the single sites
		} else {
			// update the status page on the bottom page with the number of sites
			updateStatus(markers.length.toString(), 8);
			sitesOTActStore = new dojo.data.ItemFileWriteStore({data:emptySite});

			// get the icon from the siteType and status - this could be a global icon
			// object for each site type, but we will leave this code and build the icon
			// on the fly in case we need to do scale dependent rendering
			var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/" + siteType + "_" + siteStatus + icon_postfix + ".png", icon_width, icon_height);

			// loop through the marker elements
			var nmarkers = 0;
			while( nmarkers < markers.length) {

				// get attributes
				site_no = markers[nmarkers].getAttribute("sno");
				site_name = markers[nmarkers].getAttribute("sna");
				cat_code = markers[nmarkers].getAttribute("cat");
				agency =  markers[nmarkers].getAttribute("agc");
				siteTypeText = getSiteTypeText(cat_code);

				// build the symbol
				var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(parseFloat(markers[nmarkers].getAttribute("lng")), parseFloat(markers[nmarkers].getAttribute("lat")),  new esri.SpatialReference({ wkid: 4326 })));
				var attr = {"site_no":site_no, "site_name":site_name, "siteTypeText":siteTypeText, "agency":agency };
				var marker = new esri.Graphic(point, icon, attr, siteTemplate);

				// add symbol to graphics layer
				glayer.add(marker);

				// single quotes in site names are being interpreted as JSON strings and
				// causing a problem for the grid, so replace them with double-quotes
				if (site_name.indexOf("'") > -1) {
					site_name = site_name.replace(/'/g," ");
				}

				// format the site data as JSON to add to the grid on the bottom pane
				var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
					+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
				var jsonObj = dojo.fromJson(jsonStr);

				// append the row to the grid
				sitesOTActStore.newItem(jsonObj);
				nmarkers++;
			}
		}
	}

	// at this point, all single sites have been plotted OR
	// there are no single sites, only colocated sites.
	// process colocated sites
	if (colo_sites.length == 1) {
		var cl_markers = colo_sites[0].getElementsByTagName("site");
		setCoLoMarkers(siteType, siteStatus, cl_markers);

		//update status grid
		var totalMarkers = markers.length + cl_markers.length;
		updateStatus(totalMarkers.toString() , 8);

		// loop through the marker elements
		var n_cl_markers = 0;
		while(n_cl_markers < cl_markers.length) {

			// get attributes
			site_no = cl_markers[n_cl_markers].getAttribute("sno");
			site_name = cl_markers[n_cl_markers].getAttribute("sna");
			cat_code = cl_markers[n_cl_markers].getAttribute("cat");
			agency =  cl_markers[n_cl_markers].getAttribute("agc");
			siteTypeText = getSiteTypeText(cat_code);

			// single quotes in site names are being interpreted as JSON strings and
			// causing a problem for the grid, so replace them with double-quotes
			if (site_name.indexOf("'") > -1) {
				site_name = site_name.replace(/'/g," ");
			}

			// format the site data as JSON to add to the grid on the bottom pane
			var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
				+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
			var jsonObj = dojo.fromJson(jsonStr);

			// append the row to the grid
			sitesOTActStore.newItem(jsonObj);
			n_cl_markers++;
		}
	}

	// end of the markers, so save the store
	sitesOTActStore.save();

	// set the grid to the datastore
	sitesOTActGrid.setStore(sitesOTActStore);

	// hide the loading icon
	otActStandby.hide();
}


function setMarkers_chkOTIna(xml, ioargs) {
	var site_no = "";
	var site_name = "";
	var cat_code = "";
	var agency = "";
	var emptySite = {"items":[]};
	var siteType = "ot";
	var siteStatus = "ina";
	var glayer = map.getLayer(siteType + "_" + siteStatus + "_glayer");
	var siteTemplate = getSiteTemplate("chkOTIna");

	// there are two groups of sites possible:
	//		single sites with a group tag of <sites> and
	//		colocated sites with a group tag of <colocated_sites>
	var single_sites = xml.getElementsByTagName("sites");
	var colo_sites = xml.getElementsByTagName("colocated_sites");

	// combinations:
	//		single = N, colo = N
	//		single = Y, colo = N
	//		single = Y, colo = Y
	//		single = N, colo = Y

	// single = N, colo = N
	if (single_sites.length == 0 && colo_sites.length == 0){
		otInaStandby.hide();
		return;
	}

	// single = Y
	if (single_sites.length == 1) {
		var markers = single_sites[0].getElementsByTagName("site");

		// it's possible to have an XML tag but with no markers
		if (markers.length == 0) {

			// so if there really are no single sites and no
			// colocated sites we can exit
			if (colo_sites.length == 0) {
				otInaStandby.hide();
				return;
			}
		// otherwise process the single sites
		} else {
			// update the status page on the bottom page with the number of sites
			updateStatus(markers.length.toString(), 9);
			sitesOTInaStore = new dojo.data.ItemFileWriteStore({data:emptySite});

			// get the icon from the siteType and status - this could be a global icon
			// object for each site type, but we will leave this code and build the icon
			// on the fly in case we need to do scale dependent rendering
			var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/" + siteType + "_" + siteStatus + icon_postfix + ".png", icon_width, icon_height);

			// loop through the marker elements
			var nmarkers = 0;
			while( nmarkers < markers.length) {

				// get attributes
				site_no = markers[nmarkers].getAttribute("sno");
				site_name = markers[nmarkers].getAttribute("sna");
				cat_code = markers[nmarkers].getAttribute("cat");
				agency =  markers[nmarkers].getAttribute("agc");
				siteTypeText = getSiteTypeText(cat_code);

				// build the symbol
				var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(parseFloat(markers[nmarkers].getAttribute("lng")), parseFloat(markers[nmarkers].getAttribute("lat")),  new esri.SpatialReference({ wkid: 4326 })));
				var attr = {"site_no":site_no, "site_name":site_name, "siteTypeText":siteTypeText, "agency":agency };
				var marker = new esri.Graphic(point, icon, attr, siteTemplate);

				// add symbol to graphics layer
				glayer.add(marker);

				// single quotes in site names are being interpreted as JSON strings and
				// causing a problem for the grid, so replace them with double-quotes
				if (site_name.indexOf("'") > -1) {
					site_name = site_name.replace(/'/g," ");
				}

				// format the site data as JSON to add to the grid on the bottom pane
				var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
					+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
				var jsonObj = dojo.fromJson(jsonStr);

				// append the row to the grid
				sitesOTInaStore.newItem(jsonObj);
				nmarkers++;
			}
		}
	}

	// at this point, all single sites have been plotted OR
	// there are no single sites, only colocated sites.
	// process colocated sites
	if (colo_sites.length == 1) {
		var cl_markers = colo_sites[0].getElementsByTagName("site");
		setCoLoMarkers(siteType, siteStatus, cl_markers);

		//update status grid
		var totalMarkers = markers.length + cl_markers.length;
		updateStatus(totalMarkers.toString() , 9);

		// loop through the marker elements
		var n_cl_markers = 0;
		while(n_cl_markers < cl_markers.length) {

			// get attributes
			site_no = cl_markers[n_cl_markers].getAttribute("sno");
			site_name = cl_markers[n_cl_markers].getAttribute("sna");
			cat_code = cl_markers[n_cl_markers].getAttribute("cat");
			agency =  cl_markers[n_cl_markers].getAttribute("agc");
			siteTypeText = getSiteTypeText(cat_code);

			// single quotes in site names are being interpreted as JSON strings and
			// causing a problem for the grid, so replace them with double-quotes
			if (site_name.indexOf("'") > -1) {
				site_name = site_name.replace(/'/g," ");
			}

			// format the site data as JSON to add to the grid on the bottom pane
			var jsonStr = "{'grSiteNo':'" + site_no + "'," +  "'grSiteName':'" + site_name + "'," + "'grSiteType':'"
				+ siteTypeText + "'," + "'grSiteStatus':'" + siteStatus + "'," + "'grSiteAgency':'" + agency + "'," + "'grSiteUrl':'" + agency + "&site_no=" + site_no + "'}";
			var jsonObj = dojo.fromJson(jsonStr);

			// append the row to the grid
			sitesOTInaStore.newItem(jsonObj);
			n_cl_markers++;
		}
	}

	// end of the markers, so save the store
	sitesOTInaStore.save();

	// set the grid to the datastore
	sitesOTInaGrid.setStore(sitesOTInaStore);

	// hide the loading icon
	otInaStandby.hide();
}


function setCoLoMarkers(siteType, siteStatus, coloMarkers) {

	var CurrLat = "";
	var CurrLng = "";
	var CurrID = "";
	var CurrName = "";
	var CurrCode = "";
	var CurrAgency = "";

	var NextLat = "";
	var NextLng = "";
	var NextID = "";
	var NextName = "";
	var NextCode = "";
	var NextAgency = "";

	var tablabels = [];
	var tabcontent = [];
	var glayer = map.getLayer(siteType + "_" + siteStatus + "_glayer");

	var i = 0;
	do {

		if (i >= coloMarkers.length) {
			break;
		}

		CurrID = coloMarkers[i].getAttribute("sno");
		CurrName = coloMarkers[i].getAttribute("sna");
		CurrCode = coloMarkers[i].getAttribute("cat");
		CurrAgency = coloMarkers[i].getAttribute("agc");
		CurrLat = coloMarkers[i].getAttribute("lat");
		CurrLng = coloMarkers[i].getAttribute("lng");

		// create a point
		var CurrPoint = esri.geometry.geographicToWebMercator(new esri.geometry.Point(parseFloat(coloMarkers[i].getAttribute("lng")),parseFloat(coloMarkers[i].getAttribute("lat")) ,  new esri.SpatialReference({ wkid: 4326 })));

		// all the sites in this web service stream have at least one colocated site
		// but the do loop will run off the markers array unless checked
		var j = 1;
		var k = 0;
		var DupFlag = 0;

		do {

			//check for end of markers array
			if ((i + j) >= coloMarkers.length) {
				NextLat = "";
				NextLng = "";
			} else {

				NextID = coloMarkers[i + j].getAttribute("sno");
				NextName = coloMarkers[i + j].getAttribute("sna");
				NextCode = coloMarkers[i + j].getAttribute("cat");
				NextAgency = coloMarkers[i + j].getAttribute("agc");
				NextLat = coloMarkers[i + j].getAttribute("lat");
				NextLng = coloMarkers[i + j].getAttribute("lng");
			}

			// if this marker as the same lat/long as the previous marker
			// then the site is a duplicate - need to accumulate the values
			// and check the next marker. If this is the first duplicate,
			// however, we need to save the previous marker information

			if ((CurrLat == NextLat) && (CurrLng == NextLng)) {

				// get the first colocated site data
				if (j == 1) {
					tablabels[k] = CurrID;
					tabcontent[k] = '<b>Site: </b>' + CurrID
					+ '<br /><b>Site Name: </b>' + CurrName
					+ '<br /><b>Site Type: </b>' + getSiteTypeText(CurrCode)
					+ '<br /><b>Agency: </b>' + CurrAgency
					+ '<br /><a href=' + waterdataURL + '/nwis/inventory?agency_code=' + CurrAgency + '&site_no=' + CurrID + ' target="_blank">Access Data</a>'
					k = k + 1;
				}

				// now get second colocated site
				tablabels[k] = NextID;
				tabcontent[k] = '<b>Site: </b>' + NextID
					+ '<br /><b>Site Name: </b>' + NextName
					+ '<br /><b>Site Type: </b>' + getSiteTypeText(NextCode)
					+ '<br /><b>Agency: </b>' + NextAgency
					+ '<br /><a href=' + waterdataURL + '/nwis/inventory?agency_code=' + NextAgency + '&site_no=' + NextID + ' target="_blank">Access Data</a>'

				// increment both inner loop counters
				k = k + 1;
				j = j + 1;

			} else {

				// if we fell through the if it means that the site is not a duplicate of the current group, but
				// instead is the first site in a new group of duplicate sites. It also means that we have to
				// now create a marker and info window for the last group

				// decrement the accumulated counter
				k = k - 1;

				// now create the marker
				var html = '<div style="height: 150px; overflow-y: scroll">';
				var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/multi_" + siteType + "_" + siteStatus + ".png", 42, 40);

				var boxHeader = 'Location has ' + (k + 1) + ' sites';
				for (var nColo = 0; nColo < (k + 1); nColo++) {
					html += tabcontent[nColo];
					html += '<hr>';
				}
				html += '</div>';

				var attr = {"html":html};
				var siteTemplate = new esri.InfoTemplate(boxHeader, "${html}");
				var marker = new esri.Graphic(CurrPoint, icon, attr, siteTemplate);
				glayer.add(marker);

				//jump over j duplicates and break out of the inner do loop
				i = (i + j);

				//set the break flag
				DupFlag = 1;
			}

		} while (DupFlag == 0)
	} while (i < coloMarkers.length)
}


function createMultiMarker(point, htmls, labels, cat_code, nlabels, siteType, siteStatus) {

	var i;
	var boxHeader = "";
	var html = '<div style="height: 150px; overflow-y: scroll">';
	var icon_width = 42;
	var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/multi_" + siteType + "_" + siteStatus + ".png", icon_width, 40);

	boxHeader = 'Location has ' + (nlabels + 1) + ' sites';
	for (i = 0; i < (nlabels + 1); i++) {
		html += htmls[i];
		html += '<hr>';
	}
	html += '</div>';

	var siteTemplate = new esri.InfoTemplate(boxHeader, "${html}");

	var attr = {"html":html};
	var marker = new esri.Graphic(point, icon, attr, siteTemplate);

	return marker;
}

// error callbacks
// function errGet_chkSWAct(error, ioargs) {updateStatus("None", 0);swActStandby.hide();}
// function errGet_chkSWIna(error, ioargs) {updateStatus("None", 1);swInaStandby.hide();}
// function errGet_chkGWAct(error, ioargs) {updateStatus("None", 2);gwActStandby.hide();}
// function errGet_chkGWIna(error, ioargs) {updateStatus("None", 3);gwInaStandby.hide();}
// function errGet_chkSPAct(error, ioargs) {updateStatus("None", 4);spActStandby.hide();}
// function errGet_chkSPIna(error, ioargs) {updateStatus("None", 5);spInaStandby.hide();}
// function errGet_chkATAct(error, ioargs) {updateStatus("None", 6);atActStandby.hide();}
// function errGet_chkATIna(error, ioargs) {updateStatus("None", 7);atInaStandby.hide();}
// function errGet_chkOTAct(error, ioargs) {updateStatus("None", 8);otActStandby.hide();}
// function errGet_chkOTIna(error, ioargs) {updateStatus("None", 9);otInaStandby.hide();}

function errGet_chkSWAct(error, ioargs) {if (error.xhr.statusText.indexOf("Bounding Box") != -1) alert((error.xhr && typeof error.xhr.statusText === 'string') ? "There was an error retrieving sites:\r\n" + error.xhr.statusText : "There was an error retrieving sites");console.log(error);updateStatus("None", 0);swActStandby.hide();}
function errGet_chkSWIna(error, ioargs) {if (error.xhr.statusText.indexOf("Bounding Box") != -1) alert((error.xhr && typeof error.xhr.statusText === 'string') ? "There was an error retrieving sites:\r\n" + error.xhr.statusText : "There was an error retrieving sites");console.log(error);updateStatus("None", 1);swInaStandby.hide();}
function errGet_chkGWAct(error, ioargs) {if (error.xhr.statusText.indexOf("Bounding Box") != -1) alert((error.xhr && typeof error.xhr.statusText === 'string') ? "There was an error retrieving sites:\r\n" + error.xhr.statusText : "There was an error retrieving sites");console.log(error);updateStatus("None", 2);gwActStandby.hide();}
function errGet_chkGWIna(error, ioargs) {if (error.xhr.statusText.indexOf("Bounding Box") != -1) alert((error.xhr && typeof error.xhr.statusText === 'string') ? "There was an error retrieving sites:\r\n" + error.xhr.statusText : "There was an error retrieving sites");console.log(error);updateStatus("None", 3);gwInaStandby.hide();}
function errGet_chkSPAct(error, ioargs) {if (error.xhr.statusText.indexOf("Bounding Box") != -1) alert((error.xhr && typeof error.xhr.statusText === 'string') ? "There was an error retrieving sites:\r\n" + error.xhr.statusText : "There was an error retrieving sites");console.log(error);updateStatus("None", 4);spActStandby.hide();}
function errGet_chkSPIna(error, ioargs) {if (error.xhr.statusText.indexOf("Bounding Box") != -1) alert((error.xhr && typeof error.xhr.statusText === 'string') ? "There was an error retrieving sites:\r\n" + error.xhr.statusText : "There was an error retrieving sites");console.log(error);updateStatus("None", 5);spInaStandby.hide();}
function errGet_chkATAct(error, ioargs) {if (error.xhr.statusText.indexOf("Bounding Box") != -1) alert((error.xhr && typeof error.xhr.statusText === 'string') ? "There was an error retrieving sites:\r\n" + error.xhr.statusText : "There was an error retrieving sites");console.log(error);updateStatus("None", 6);atActStandby.hide();}
function errGet_chkATIna(error, ioargs) {if (error.xhr.statusText.indexOf("Bounding Box") != -1) alert((error.xhr && typeof error.xhr.statusText === 'string') ? "There was an error retrieving sites:\r\n" + error.xhr.statusText : "There was an error retrieving sites");console.log(error);updateStatus("None", 7);atInaStandby.hide();}
function errGet_chkOTAct(error, ioargs) {if (error.xhr.statusText.indexOf("Bounding Box") != -1) alert((error.xhr && typeof error.xhr.statusText === 'string') ? "There was an error retrieving sites:\r\n" + error.xhr.statusText : "There was an error retrieving sites");console.log(error);updateStatus("None", 8);otActStandby.hide();}
function errGet_chkOTIna(error, ioargs) {if (error.xhr.statusText.indexOf("Bounding Box") != -1) alert((error.xhr && typeof error.xhr.statusText === 'string') ? "There was an error retrieving sites:\r\n" + error.xhr.statusText : "There was an error retrieving sites");console.log(error);updateStatus("None", 9);otInaStandby.hide();}

function updateStatus(nSites, gridIndex) {
	var item = statusGrid.getItem(gridIndex);
	statusStore.setValue(item, 'grStatusNSites', nSites);
	statusGrid.update();
}

function showCongDist() {
	clearGLayer("cgd_glayer");

}

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
				point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(longDD, latDD,  new esri.SpatialReference({ wkid: 4326 })));
				//if (map.extent.intersects(point)) {

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
					//}
			}
		}
	}
	// fetch data
	usgsStore.fetch( { onComplete: drawUSGSOffices } );
}
/*
url.js
Functions supporting map parameters in URL
*/

function getURLParameters() {

	// get all the URL parameters
	var url = window.location.href.toLowerCase();
	var params = url.substring(url.indexOf("?") + 1, url.length);
	var urlKeyPairs = dojo.queryToObject(params);

	// query for url parameter arguments

	// overviewmap
	MapShowOv=dojox.json.query("$.overviewmap", urlKeyPairs);

	// map x,y, zoom
	MapX=dojox.json.query("$.mapcenterx", urlKeyPairs);
	MapY=dojox.json.query("$.mapcentery", urlKeyPairs);
	MapZoom  = dojox.json.query("$.mapzoom", urlKeyPairs);

	// state name - we call this Place, but it's really a state/place list
	MapZoomPlace  = dojox.json.query("$.state", urlKeyPairs);

	// site categories
	siteGroups  = dojox.json.query("$.sitegroups", urlKeyPairs);

	// set defaults if argument not supplied
	if (!MapShowOv) MapShowOv = "yes";
	if (!MapX) MapX = "-96.0";
	if (!MapY) MapY = "36.0";
	if (!MapZoom) MapZoom = "4";

	if (!MapZoomPlace) {
		MapZoomPlace = "";
	} else {
		MapZoomPlace = MapZoomPlace.toUpperCase();
	}

	if (!siteGroups) {
		siteGroups = "SW,ACT";
	} else {
		siteGroups = siteGroups.toUpperCase();
	}
}

function zoomToLevel() {

	if (MapZoomPlace == "" ) {
		setTimeout( function() { map.setLevel(parseFloat(MapZoom)); }, 250);
		dojo.disconnect(MapZoomConnect);
	}

	ZoomManager(0);
}

function createOvMap() {

		if (map.loaded) {
			ovMap = new esri.dijit.OverviewMap({
				map:map,
				attachTo:"bottom-right",
				color:"#0000FF",
				visible:false,
				opacity:0.30
			});

			if (MapShowOv == "yes") {
				ovMap.visible = true;
			}
			ovMap.startup();
		}
}

function zoomURLState(selRegion) {
	stateZoomStore.fetchItemByIdentity({identity:selRegion,
		onItem : function(region) {
			var west = stateZoomStore.getValue(region, 'MinX');
			var south = stateZoomStore.getValue(region, 'MinY');
			var east = stateZoomStore.getValue(region, 'MaxX');
			var north = stateZoomStore.getValue(region, 'MaxY');
			var esriExtent = new esri.geometry.Extent(west, south, east, north, new esri.SpatialReference({wkid: 4326}));
			setTimeout( function() {
				map.setExtent(esri.geometry.geographicToWebMercator(esriExtent));
 			}, 250);
		}
	});
}
/*
zoom.js
Functions for managing zooming and panning

Zoom events management
	Several global variables are used for managing zoom events:
			ZoomStart	- the previous map level
			ZoomEnd		- the current map level
			if (ZoomEnd < ZoomStart) then the user zoomed out
			if (ZoomEnd > ZoomStart) means the user zoomed in

			ClickLevelMin = the level below which no sites are drawn. The sites can
											either be turned off or the map tiles have not been built
			ClickLevelMax = the level above which selectable sites are drawn

			ClickLevelMin to ClickLevelMax are the levels where the tile overlays are drawn

			if (ZoomEnd > ClickLevelMax) then selectable sites are drawn
			if (ZoomEnd =< ClickLevelMax) then tile overlays are drawn
*/

function ZoomManager(zoomType) {

	// set zoom level graphic
	setSliderZoom(ZoomEnd);

	// clear selection layer
	clearGLayer("sel_glayer");

	// draw USGS offices
	showUSGSOffices();

	// the checkbox listeners need this
	if (zoomType == 0) {
		ZoomStart = ZoomEnd;
	}

	// check for nozoom, zoomin, zoomout
	if (ZoomEnd == ZoomStart) {

		// Surface Water Sites
		if (ZoomEnd < ClickLevelMax[0]) {
			drawTLayer("chkSWAct", "sw_act");
			drawTLayer("chkSWIna", "sw_ina");
			clearGLayer("sw_act_glayer");
			clearGLayer("sw_ina_glayer");
			disableDataTypeRadio(0);
		} else {
			hideTLayer("sw_act");
			hideTLayer("sw_ina");
			drawGLayer("chkSWAct", "sw_act_glayer");
			drawGLayer("chkSWIna", "sw_ina_glayer");
			enableDataTypeRadio(0);
		}

		// Groundwater Sites
		if (ZoomEnd < ClickLevelMax[1]) {
			drawTLayer("chkGWAct", "gw_act");
			drawTLayer("chkGWIna", "gw_ina");
			clearGLayer("gw_act_glayer");
			clearGLayer("gw_ina_glayer");
			disableDataTypeRadio(1);
		} else {
			hideTLayer("gw_act");
			hideTLayer("gw_ina");
			drawGLayer("chkGWAct", "gw_act_glayer");
			drawGLayer("chkGWIna", "gw_ina_glayer");
			enableDataTypeRadio(1);
		}

		// Springs
		if (ZoomEnd < ClickLevelMax[2]) {
			drawTLayer("chkSPAct", "sp_act");
			drawTLayer("chkSPIna", "sp_ina");
			clearGLayer("sp_act_glayer");
			clearGLayer("sp_ina_glayer");
			disableDataTypeRadio(2);
		} else {
			hideTLayer("sp_act");
			hideTLayer("sp_ina");
			drawGLayer("chkSPAct", "sp_act_glayer");
			drawGLayer("chkSPIna", "sp_ina_glayer");
			enableDataTypeRadio(2);
		}

		// Atmospheric Sites
		if (ZoomEnd < ClickLevelMax[3]) {
			drawTLayer("chkATAct", "at_act");
			drawTLayer("chkATIna", "at_ina");
			clearGLayer("at_act_glayer");
			clearGLayer("at_ina_glayer");
			disableDataTypeRadio(3);
		} else {
			hideTLayer("at_act");
			hideTLayer("at_ina");
			drawGLayer("chkATAct", "at_act_glayer");
			drawGLayer("chkATIna", "at_ina_glayer");
			enableDataTypeRadio(3);
		}

		// Other Sites
		if (ZoomEnd < ClickLevelMax[4]) {
			drawTLayer("chkOTAct", "ot_act");
			drawTLayer("chkOTIna", "ot_ina");
			clearGLayer("ot_act_glayer");
			clearGLayer("ot_ina_glayer");
			disableDataTypeRadio(4);
		} else {
			hideTLayer("ot_act");
			hideTLayer("ot_ina");
			drawGLayer("chkOTAct", "ot_act_glayer");
			drawGLayer("chkOTIna", "ot_ina_glayer");
			enableDataTypeRadio(4);
		}


		// toggle visibility grid cell on the status tab
		setStatusVisibility(dojo.byId("chkSWAct"),0);
		setStatusVisibility(dojo.byId("chkSWIna"),1);
		setStatusVisibility(dojo.byId("chkGWAct"),2);
		setStatusVisibility(dojo.byId("chkGWIna"),3);
		setStatusVisibility(dojo.byId("chkSPAct"),4);
		setStatusVisibility(dojo.byId("chkSPIna"),5);
		setStatusVisibility(dojo.byId("chkATAct"),6);
		setStatusVisibility(dojo.byId("chkATIna"),7);
		setStatusVisibility(dojo.byId("chkOTAct"),8);
		setStatusVisibility(dojo.byId("chkOTIna"),9);

		// toggle selectable grid cell on the status tab
		setStatusSelectable(ClickLevelMax[0],0);
		setStatusSelectable(ClickLevelMax[0],1);
		setStatusSelectable(ClickLevelMax[1],2);
		setStatusSelectable(ClickLevelMax[1],3);
		setStatusSelectable(ClickLevelMax[2],4);
		setStatusSelectable(ClickLevelMax[2],5);
		setStatusSelectable(ClickLevelMax[3],6);
		setStatusSelectable(ClickLevelMax[3],7);
		setStatusSelectable(ClickLevelMax[4],8);
		setStatusSelectable(ClickLevelMax[4],9);

		return;
	}

	// user zoomed out
	if (ZoomEnd < ZoomStart) {
		ZoomOutManager();
	} else {
		ZoomInManager();
	}

	// toggle selectable grid cell on the status tab
	setStatusSelectable(ClickLevelMax[0],0);
	setStatusSelectable(ClickLevelMax[0],1);
	setStatusSelectable(ClickLevelMax[1],2);
	setStatusSelectable(ClickLevelMax[1],3);
	setStatusSelectable(ClickLevelMax[2],4);
	setStatusSelectable(ClickLevelMax[2],5);
	setStatusSelectable(ClickLevelMax[3],6);
	setStatusSelectable(ClickLevelMax[3],7);
	setStatusSelectable(ClickLevelMax[4],8);
	setStatusSelectable(ClickLevelMax[4],9);
}

function ZoomOutManager() {

	// there are three cases when zooming out:
	//		selectable to selectable: s2s
	//		selectable to not selectable: s2n
	//		not selectable to not selectable: n2n

	var i;
	for (i = 0; i < 5; i++) {
		ZoomOutSiteType(i);
	}
}

function ZoomInManager() {

	// there are three cases when zooming in:
	//		selectable to selectable: s2s
	//		not selectable to selectable: n2s
	//		not selectable to not selectable: n2s
	var i;
	for (i = 0; i < 5; i++) {
		ZoomInSiteType(i);
	}
}

function ZoomOutSiteType(maxIndex) {

	// n2n - nothing needs to be done
	if ((ZoomStart < ClickLevelMax[maxIndex]) && (ZoomEnd < ClickLevelMax[maxIndex])){
		return;
	}

	// s2n
	if ((ZoomStart >= ClickLevelMax[maxIndex]) && (ZoomEnd < ClickLevelMax[maxIndex])) {

		// clear the graphics layers
		if (maxIndex == 0) {
			clearGLayer("sw_act_glayer");clearGLayer("sw_ina_glayer");
			clearGrid("sw_act");clearGrid("sw_ina");
			drawTLayer("chkSWAct", "sw_act");drawTLayer("chkSWIna", "sw_ina");
			disableDataTypeRadio(0);
		} else if (maxIndex == 1) {
			clearGLayer("gw_act_glayer");clearGLayer("gw_ina_glayer");
			clearGrid("gw_act");clearGrid("gw_ina");
			drawTLayer("chkGWAct", "gw_act");drawTLayer("chkGWIna", "gw_ina");
			disableDataTypeRadio(1);
		} else if (maxIndex == 2) {
			clearGLayer("sp_act_glayer");clearGLayer("sp_ina_glayer");
			clearGrid("sp_act");clearGrid("sp_ina");
			drawTLayer("chkSPAct", "sp_act");drawTLayer("chkSPIna", "sp_ina");
			disableDataTypeRadio(2);
		} else if (maxIndex == 3) {
			clearGLayer("at_act_glayer");clearGLayer("at_ina_glayer");
			clearGrid("at_act");clearGrid("at_ina");
			drawTLayer("chkATAct", "at_act");drawTLayer("chkATIna", "at_ina");
			disableDataTypeRadio(3);
		} else if (maxIndex == 4) {
			clearGLayer("ot_act_glayer");clearGLayer("ot_ina_glayer");
			clearGrid("ot_act");clearGrid("ot_ina");
			drawTLayer("chkOTAct", "ot_act");drawTLayer("chkOTIna", "ot_ina");
			disableDataTypeRadio(4);
		}

		// clear all the data in the grids
		return;
	}

		// s2s
		if ((ZoomStart >= ClickLevelMax[maxIndex]) && (ZoomEnd >= ClickLevelMax[maxIndex])) {

			if (maxIndex == 0) {
				drawGLayer("chkSWAct", "sw_act_glayer");drawGLayer("chkSWIna", "sw_ina_glayer");
				enableDataTypeRadio(0);
			} else if (maxIndex == 1) {
				drawGLayer("chkGWAct", "gw_act_glayer");drawGLayer("chkGWIna", "gw_ina_glayer");
				enableDataTypeRadio(1);
			} else if (maxIndex == 2) {
				drawGLayer("chkSPAct", "sp_act_glayer");drawGLayer("chkSPIna", "sp_ina_glayer");
				enableDataTypeRadio(2);
			} else if (maxIndex == 3) {
				drawGLayer("chkATAct", "at_act_glayer");drawGLayer("chkATIna", "at_ina_glayer");
				enableDataTypeRadio(3);
			} else if (maxIndex == 4) {
				drawGLayer("chkOTAct", "ot_act_glayer");drawGLayer("chkOTIna", "ot_ina_glayer");
				enableDataTypeRadio(4);
			}
		}
}

function ZoomInSiteType(maxIndex) {
	// there are three cases when zooming in:
	//		selectable to selectable: s2s
	//		not selectable to selectable: n2s
	//		not selectable to not selectable: n2s

	// s2s - we used to do nothing, because selectable graphics would be a subset of
	// the current set. However, since the addition of the grid we have to requery
	// the web services when Zoomin in

	//new s2s so sites aren't requeried on zoom in.  just need to filter site grid
	if ((ZoomStart >= ClickLevelMax[maxIndex]) && (ZoomEnd >= ClickLevelMax[maxIndex])) {

		if (maxIndex == 0) {
			hideTLayer("sw_act");hideTLayer("sw_ina");
			drawGLayer("chkSWAct", "sw_act_glayer");drawGLayer("chkSWIna", "sw_ina_glayer");
			enableDataTypeRadio(0);
		} else if (maxIndex == 1) {
			hideTLayer("gw_act");hideTLayer("gw_ina");
			drawGLayer("chkGWAct", "gw_act_glayer");drawGLayer("chkGWIna", "gw_ina_glayer");
			enableDataTypeRadio(1);
		} else if (maxIndex == 2) {
			hideTLayer("sp_act");hideTLayer("sp_ina");
			drawGLayer("chkSPAct", "sp_act_glayer");drawGLayer("chkSPIna", "sp_ina_glayer");
			enableDataTypeRadio(2);
		} else if (maxIndex == 3) {
			hideTLayer("at_act");hideTLayer("at_ina");
			drawGLayer("chkATAct", "at_act_glayer");drawGLayer("chkATIna", "at_ina_glayer");
			enableDataTypeRadio(3);
		} else if (maxIndex == 4) {
			hideTLayer("ot_act");hideTLayer("ot_ina");
			drawGLayer("chkOTAct", "ot_act_glayer");drawGLayer("chkOTIna", "ot_ina_glayer");
			enableDataTypeRadio(4);
		}

		// var extent = map.extent;

		// //list of glayers and associated data stores to loop over
		// var typeList = [["sw_act_glayer",sitesSWActStore], ["sw_ina_glayer",sitesSWInaStore], ["gw_act_glayer",sitesGWActStore], ["gw_ina_glayer",sitesGWInaStore], ["sp_act_glayer",sitesSPActStore], ["sp_ina_glayer",sitesSPInaStore], ["at_act_glayer",sitesATActStore], ["at_ina_glayer",sitesATInaStore], ["ot_act_glayer",sitesOTActStore], ["ot_ina_glayer",sitesOTInaStore]];

		// //iterate thru all site types
		// for (var k=0;k<typeList.length;k++)
		// {
		// 	//loop thru glayer filter by current map extent
		// 	var glayer = map.getLayer(typeList[k][0]);
		// 	var results = [];

		// 	//get list of sites in current view
		// 	for(var j = 0; j < glayer.graphics.length; j++){
		// 		//get site number
		// 		if (glayer.graphics[j].getContent().split("<b>Site Number: </b>")[1] != null) {
		// 			var siteNo = glayer.graphics[j].getContent().split("<b>Site Number: </b>")[1].split("<br />")[0];
		// 		}

		// 		//for sites in view add to list
		// 		if (extent.contains(glayer.graphics[j].geometry)) {
		// 			results.push(siteNo);
		// 			continue;
		// 		}

		// 		//for sites out of view, fetch the store and delete the site from it
		// 		else {
		// 			typeList[k][1].fetch({onComplete: function(items){
		// 					for(var i = 0; i < items.length; i++){
		// 						if (items[i].grSiteNo.toString() == siteNo) {
		// 							typeList[k][1].deleteItem(items[i]);
		// 						}
		// 					}
		// 			}, queryOptions: {deep:true}});
		// 		}
		// 	}
		// 	//update status grid for site type
		// 	if (results.length == 0) {
		// 		var numSites = "None";
		// 	}
		// 	else {
		// 		var numSites = results.length.toString();
		// 	}
		// 	updateStatus(numSites, k);
		// }
	}

	// n2n
	if ((ZoomStart < ClickLevelMax[maxIndex]) && (ZoomEnd < ClickLevelMax[maxIndex])) {

		if (maxIndex == 0) {
			drawTLayer("chkSWAct", "sw_act");drawTLayer("chkSWIna", "sw_ina");
			disableDataTypeRadio(0);
		} else if (maxIndex == 1) {
			drawTLayer("chkGWAct", "gw_act");drawTLayer("chkGWIna", "gw_ina");
			disableDataTypeRadio(1);
		} else if (maxIndex == 2) {
			drawTLayer("chkSPAct", "sp_act");drawTLayer("chkSPIna", "sp_ina");
			disableDataTypeRadio(2);
		} else if (maxIndex == 3) {
			drawTLayer("chkATAct", "at_act");drawTLayer("chkATIna", "at_ina");
			disableDataTypeRadio(3);
		} else if (maxIndex == 4) {
			drawTLayer("chkOTAct", "ot_act");drawTLayer("chkOTIna", "ot_ina");
			disableDataTypeRadio(4);
		}
		return;
	}

	// n2s
	if ((ZoomStart < ClickLevelMax[maxIndex]) && (ZoomEnd >= ClickLevelMax[maxIndex])) {
		if (maxIndex == 0) {
			hideTLayer("sw_act");hideTLayer("sw_ina");
			drawGLayer("chkSWAct", "sw_act_glayer");drawGLayer("chkSWIna", "sw_ina_glayer");
			enableDataTypeRadio(0);
		} else if (maxIndex == 1) {
			hideTLayer("gw_act");hideTLayer("gw_ina");
			drawGLayer("chkGWAct", "gw_act_glayer");drawGLayer("chkGWIna", "gw_ina_glayer");
			enableDataTypeRadio(1);
		} else if (maxIndex == 2) {
			hideTLayer("sp_act");hideTLayer("sp_ina");
			drawGLayer("chkSPAct", "sp_act_glayer");drawGLayer("chkSPIna", "sp_ina_glayer");
			enableDataTypeRadio(2);
		} else if (maxIndex == 3) {
			hideTLayer("at_act");hideTLayer("at_ina");
			drawGLayer("chkATAct", "at_act_glayer");drawGLayer("chkATIna", "at_ina_glayer");
			enableDataTypeRadio(3);
		} else if (maxIndex == 4) {
			hideTLayer("ot_act");hideTLayer("ot_ina");
			drawGLayer("chkOTAct", "ot_act_glayer");drawGLayer("chkOTIna", "ot_ina_glayer");
			enableDataTypeRadio(4);
		}
	}
}

//Map functions here
function showCoordinates(evt) {
	//The map is in web mercator - modify the map point to display the results in geographic
	var mp = esri.geometry.webMercatorToGeographic(evt.mapPoint);
	//display mouse coordinates
	dojo.byId("latlong").innerHTML = mp.x.toFixed(3) + ", " + mp.y.toFixed(3);
}

function extentHistoryChangeHandler() {
	dijit.byId("zoomprev").disabled = navToolBar.isFirstExtent();
	dijit.byId("zoomnext").disabled = navToolBar.isLastExtent();
}

function centerAndZoomOut() {

	// calculate bounding box
	var bboxExtent = new esri.geometry.Extent(map.extent.xmin, map.extent.ymin, map.extent.xmax, map.extent.ymax, map.spatialReference);
	var mapCenter = new esri.geometry.Point(bboxExtent.getCenter());
	map.centerAndZoom(mapCenter, (ZoomEnd - 1));
}

function zoomToFirstExtent() {
	var geometry = new esri.geometry.Point(MapX, MapY);
	geometry = esri.geometry.geographicToWebMercator(geometry);
	map.centerAndZoom(geometry, MapZoom);
}

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

function setSliderZoom(zoomLevel) {
	var levelIcon = "images/zoomlevels/zoom" + zoomLevel + ".png"
	dojo.byId("zoomLevelIcon").style.backgroundImage = "url('" + levelIcon + "')";
}

function setStatusVisibility(chkBoxId, gridIndex) {
	if (statusGrid == "undefined") return;

	var item = statusGrid.getItem(gridIndex);
	if (item) {
		var statVisible = "No";
		if (dojo.byId(chkBoxId).checked) {
			statVisible = "Yes";
		}
		statusStore.setValue(item, 'grStatusVisible', statVisible);
		statusGrid.update();
	}
}

function setStatusSelectable(zoomClickLevel, gridIndex) {
	// zoomLevel is ClickLevelMax value for the site type
	var item = statusGrid.getItem(gridIndex);

	if (item) {
		var statSelect = "No";
		if (ZoomEnd >= zoomClickLevel) {
			statSelect = "Yes";
		} else {
			statusStore.setValue(item, 'grStatusNSites', "N/A");
		}
		statusStore.setValue(item, 'grStatusSelect', statSelect);
		statusGrid.update();
	}
}
/*
search.js
Functions for searching for placenames and addresses
*/

function resetLocSearch(srchCode) {

	if (srchCode == 2) {
		dojo.byId("srchBoxStreet").value = "";
		dojo.byId("srchBoxStreet").className = "srchBoxText";
		dojo.byId("srchBoxPlace").className = "srchBoxTextDis";
		dojo.byId("srchBoxPlace").value = "Enter Placename";
		dojo.byId("srchBoxSites").className = "srchBoxTextDis";
		dojo.byId("srchBoxSites").value = "Enter Site Number(s)";
		placesSelect.reset();
		hucsRegSelect.reset();
	} else if (srchCode == 1) {
		dojo.byId("srchBoxPlace").value = "";
		dojo.byId("srchBoxPlace").className = "srchBoxText";
		dojo.byId("srchBoxStreet").className = "srchBoxTextDis";
		dojo.byId("srchBoxStreet").value = "Enter Street Address";
		dojo.byId("srchBoxSites").className = "srchBoxTextDis";
		dojo.byId("srchBoxSites").value = "Enter Site Number(s)";
		placesSelect.reset();
		hucsRegSelect.reset();
	} else if (srchCode == 3) {
		dojo.byId("srchBoxSites").value = "";
		dojo.byId("srchBoxSites").className = "srchBoxText";
		dojo.byId("srchBoxStreet").className = "srchBoxTextDis";
		dojo.byId("srchBoxStreet").value = "Enter Street Address";
		dojo.byId("srchBoxPlace").className = "srchBoxTextDis";
		dojo.byId("srchBoxPlace").value = "Enter Placename";
		placesSelect.reset();
		hucsRegSelect.reset();
	} else if (srchCode == 4) {
		dojo.byId("srchBoxSites").className = "srchBoxText";
		dojo.byId("srchBoxStreet").className = "srchBoxTextDis";
		dojo.byId("srchBoxStreet").value = "Enter Street Address";
		dojo.byId("srchBoxPlace").className = "srchBoxTextDis";
		dojo.byId("srchBoxPlace").value = "Enter Placename";
		dojo.byId("srchBoxSites").className = "srchBoxTextDis";
		dojo.byId("srchBoxSites").value = "Enter Site Number(s)";
		hucsRegSelect.reset();
	} else if (srchCode == 5) {
		dojo.byId("srchBoxStreet").className = "srchBoxTextDis";
		dojo.byId("srchBoxStreet").value = "Enter Street Address";
		dojo.byId("srchBoxPlace").className = "srchBoxTextDis";
		dojo.byId("srchBoxPlace").value = "Enter Placename";
		dojo.byId("srchBoxSites").className = "srchBoxTextDis";
		dojo.byId("srchBoxSites").value = "Enter Site Number(s)";
		placesSelect.reset();
	}
}

function doSearchName(srchCode) {

	//scrchCode 1=Placename, 2=Street Address Search

	if (srchCode == 1){
		var srchText = dojo.byId("srchBoxPlace").value;
	} else {
		var srchText = dojo.byId("srchBoxStreet").value;
	}

	// return if blank
	if (srchText === "") {return;}

	var locator;

	// locators for placenames and street addresses are from ESRI
	if (srchCode == 1 ) {
		locator = new esri.tasks.Locator("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
		// pass the parameters to the geocoding callback
		var address = {
			'SingleLine': srchText
		};

		var options = {
			address:address,
			outFields:["*"]
		};

		srchPlacesStandby.show();
		locator.addressToLocations(options, placeNameCallBack);
	}
	else {
		locator = new esri.tasks.Locator("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
		// pass the parameters to the geocoding callback
		var address = {
			'SingleLine': srchText
		};

		var options = {
			address:address,
			outFields:["*"]
		};
		srchAddressStandby.show();
		locator.addressToLocations(options, streetAddCallBack);
	}
}

function streetAddCallBack(geocodeResults) {
	if (geocodeResults.length > 0) {
		var ptAttr = geocodeResults[0].attributes;
		var geometry = new esri.geometry.Point(ptAttr.X, ptAttr.Y);
		geometry = esri.geometry.geographicToWebMercator(geometry);
		map.centerAndZoom(geometry, 14);
	} else {
		showErrBox("Unable to Find Street Address");
	}
	srchAddressStandby.hide();
}


function placeNameCallBack(geocodeResults) {

	if (geocodeResults.length > 0) {
		var ptAttr = geocodeResults[0].attributes;
		var esriExtent = new esri.geometry.Extent(ptAttr.Xmin, ptAttr.Ymin, ptAttr.Xmax, ptAttr.Ymax, new esri.SpatialReference({wkid: 4326}));
		map.setExtent(esri.geometry.geographicToWebMercator(esriExtent));
	} else {
		showErrBox("Unable to Find Placename");
	}
	srchPlacesStandby.hide();
}

function doSearchSites(siteNoOrName){

	// get the sites from the search box
	if (siteNoOrName == "site_num") {
		var srchText = dojo.byId("srchBoxSites").value;
	} else {
		var srchText = dojo.byId("srchBoxStation").value;
	}

	// return if blank
	if (srchText === "") {return;}

	// trim spaces from ends
	//srchText = srchText.trim();
	srchText.replace(/\s/g, "");

	// for site numbers, search for spaces and convert to commas
	// for station names, search for spaces and convert to URL friendly
	if (siteNoOrName == "site_num") {
		if (srchText.indexOf(" ") > -1) {
			srchText = srchText.replace(/ /g,",");
		}
	} else {
		if (srchText.indexOf(" ") > -1) {
			srchText = srchText.replace(/ /g,"%2C");
		}
	}

	// build the web services request URL
	// var nwisWebURL = "./nwissitesmapper/nwis/inventory?format=sitefile_output"
	// + "&sitefile_output_format=xml&column_name=site_no"
	// + "&column_name=dec_long_va&column_name=dec_lat_va"
	// + "&column_name=site_active_fg&column_name=site_tp_cd&column_name=station_nm"
	var nwisWebURL = "https://nwis.waterdata.usgs.gov/nwis/inventory?format=sitefile_output"
	+ "&sitefile_output_format=xml&column_name=site_no"
	+ "&column_name=dec_long_va&column_name=dec_lat_va"
	+ "&column_name=site_active_fg&column_name=site_tp_cd&column_name=station_nm"

	if (siteNoOrName == "site_num") {
		nwisWebURL += "&site_no=" + srchText;
	} else {
		nwisWebURL += "&station_nm=" + srchText;
	}

	// set the xhrGet properties
	var urlObj = esri.urlToObject(nwisWebURL);

	var siteFileRequest = {
		url: urlObj.path,
		handleAs: "xml",
		headers: {
			"X-Requested-With": null,
			'Content-Type': 'text/plain'
		},
		content: urlObj.query,
		load: zoomToSites,
		error: errZoomToSites
	}

	srchSitesStandby.show();

	// AJAX call to fetch sites
	var deferred = dojo.xhrGet(siteFileRequest);
}

function zoomToSites(xml, ioargs) {

	var markers;
	var i;
	var search_sites = xml.getElementsByTagName("site");

	//stuff for zoom to selection
	var zoomsellayer = map.getLayer("zoom_sel_glayer");
	var icon = new esri.symbol.PictureMarkerSymbol("./images/selected_site_yellow.png", 64, 64);
	zoomsellayer.clear();

	// if no sites then return
	if (search_sites.length == 0 || xml == null){
		srchSitesStandby.hide();
		showErrBox("No Site(s) Found");
		return;
	}

	// keep a count of the markers
	var nsites = 0;
	var sitesAndStatus = "";

	// loop through the sites
	while (nsites < search_sites.length ) {

		// get the data
		var longDD = parseFloat(search_sites[nsites].getElementsByTagName("dec_long_va")[0].firstChild.nodeValue);
		var latDD = parseFloat(search_sites[nsites].getElementsByTagName("dec_lat_va")[0].firstChild.nodeValue);
		var cat_code = search_sites[nsites].getElementsByTagName("site_tp_cd")[0].firstChild.nodeValue;
		var activeCode = search_sites[nsites].getElementsByTagName("site_active_fg")[0].firstChild.nodeValue;

		//set agc_code based on new active definition
		if (activeCode == 1) { var agc_code = "A"; }
		else { var agc_code = "I"; }

		//create point
		var point = new esri.geometry.Point(longDD,latDD, new esri.SpatialReference({ wkid: 4326 }));

		// build a set of key pairs for each site type and status
		if (cat_code) {
			sitesAndStatus += cat_code + ",";
			if (agc_code) {
				sitesAndStatus += agc_code + ",";
			} else {
				sitesAndStatus += "I,";
			}
		}

		// if this is the first site build a small bounding box around the point
		if (nsites == 0) {
			var minX = parseFloat(point.x)
			var minY = parseFloat(point.y)
			var maxX = parseFloat(point.x)
			var maxY = parseFloat(point.y)
		} else {
			if (point.x < minX) { minX = point.x; }
			if (point.y < minY) { minY = point.y; }
			if (point.x > maxX) { maxX = point.x; }
			if (point.y > maxY) { maxY = point.y; }
		}
		nsites++;

		//SHOW HALO AROUND SEARCHED SITE
		var selGraphic = new esri.Graphic( point, icon);
		zoomsellayer.add(selGraphic);

	}

	// set the map extent
	minX = minX - 0.1;
	minY = minY - 0.1;
	maxX = maxX + 0.1;
	maxY = maxY + 0.1;
	var hullExtent = new esri.geometry.Extent(minX, minY, maxX, maxY, new esri.SpatialReference({wkid: 4326}));

	// remove orphaned comma from string
	if (sitesAndStatus.right(1) == ",") {
		sitesAndStatus = sitesAndStatus.left(sitesAndStatus.length - 1);
	}

	// split the string into tokens for the site types and status
	var sTokens = sitesAndStatus.split(",");

	// create a dojo.defer so that the checkbox is set before zooming map
	searchZoomDef = new dojo.Deferred();

	// zoom the map to the calculated extent
	zoomSearchSite(hullExtent);

	// after the map is done zooming, then set the checkboxes
	searchZoomDef.then(function() {

		for (i = 0; i < sTokens.length; i = i + 2) {
			setSiteType(sTokens[i], sTokens[i+1]);
		}
		srchSitesStandby.hide();

		/*
			//SHOW HALO AROUND SEARCHED SITE
			var zoomsellayer = map.getLayer("zoom_sel_glayer");

			// clear the selection layer
			zoomsellayer.clear();

			// create the selected icon
			var icon = new esri.symbol.PictureMarkerSymbol("./images/selected_site_yellow.png", 64, 64);

			// create a selection graphic
			var selGraphic = new esri.Graphic( point, icon);
			zoomsellayer.add(selGraphic);

		*/

		return;
	});
}

function errZoomToSites() {
	srchSitesStandby.hide();
	showErrBox("No Site(s) Found");
}

function zoomSearchSite(hull) {
	map.setExtent(esri.geometry.geographicToWebMercator(hull));
	searchZoomDef.resolve({called:true});
}

// error box
function showErrBox(errMessage) {
	var errBox = dijit.byId('errExpDialog');
	errBox.set("content", "<img src='./images/GenericWarning16.png'> &nbsp;" + errMessage + "&nbsp;&nbsp;");
	errBox.show();
}

function setSiteType(stc, site_status){

	var cb;
	if ((stc == 'ES') || (stc == 'LK') || (stc == 'ST') || (stc == 'ST-CA') || (stc == 'ST-DCH') || (stc == 'ST-TS') ||
		(stc == 'WE') || (stc == 'OC') || (stc == 'OC-CO')) {
			if (site_status == 'A' || site_status == 'L' || site_status == 'M') {
				cb = dijit.byId("chkSWAct");cb.set("checked",true);
			} else {
				cb = dijit.byId("chkSWIna");cb.set("checked",true);
			}
			return;
	}

	if ((stc == 'GW') || (stc == 'GW-CR') ||
		(stc == 'GW-EX') || (stc == 'GW-HZ') || (stc == 'GW-IW') ||
		(stc == 'GW-MW') || (stc == 'GW-TH') || (stc == 'SB') || (stc == 'SB-CV') || (stc == 'SB-GWD') ||
		(stc == 'SB-TSM') || (stc == 'SB-UZ')) {
			if (site_status == 'A' || site_status == 'L' || site_status == 'M') {
				cb = dijit.byId("chkGWAct");cb.set("checked",true);
			} else {
				cb = dijit.byId("chkGWIna");cb.set("checked",true);
			}
			return;
	}

	if (stc == 'SP') {
		if (site_status == 'A' || site_status == 'L' || site_status == 'M') {
			cb = dijit.byId("chkSPAct");cb.set("checked",true);
		} else {
			cb = dijit.byId("chkSPIna");cb.set("checked",true);
		}
		return;
	}

	if (stc == 'AT') {
		if (site_status == 'A' || site_status == 'L' || site_status == 'M') {
			cb = dijit.byId("chkATAct");cb.set("checked",true);
		} else {
			cb = dijit.byId("chkATIna");cb.set("checked",true);
		}
		return;
	}

	if ((stc == 'AG') || (stc == 'AS') || (stc == 'AW') ||
		(stc == 'FA-CI') || (stc == 'FA-CS') || (stc == 'FA-DV') || (stc == 'FA-FON') ||
		(stc == 'FA-GC') || (stc == 'FA-LF') || (stc == 'FA-OF') || (stc == 'FA-PV') ||
		(stc == 'FA-QC') || (stc == 'FA-SEW') || (stc == 'FA-SPS') || (stc == 'FA-STS') ||
		(stc == 'FA-WDS') || (stc == 'FA-WIW') || (stc == 'FA-WU') || (stc == 'FA-WWD') ||
		(stc == 'LA') || (stc == 'LA-EX') || (stc == 'LA-OU') || (stc == 'LA-SH') ||
		(stc == 'LA-SNK') || (stc == 'LA-SR') || (stc == 'GL')) {
			if (site_status == 'A' || site_status == 'L' || site_status == 'M') {
				cb = dijit.byId("chkOTAct");cb.set("checked",true);
			} else {
				cb = dijit.byId("chkOTIna");cb.set("checked",true);
			}
		return;
	}
}

/* formatters.js
	functions for formatting dojo grids
*/

function formatMapSymbol(iconName) {
	// formatter parameter is the grid cell value, in this case an icon filename
	return "<img src=images/" + iconName + " width='16' height='22' />";
}

function formatAgency(agency) {
	switch (agency) {
		case "USGS": return "<img src=images/usgs48green.png width='48' height='14' />";
		default: return agency;
	}
}

function formatSelect(gridValue) {
	if (gridValue == "No") {
		return "<font color='red'>No</font>";
	} else {
		return "<font color='green'>Yes</font>";
	}
}

function formatNWISUrl(baseUrl) {
	return "<a href=" + waterdataURL + "/nwis/inventory?agency_code=" + baseUrl + " target='_blank'>Access Data</a>";
}

function formatSiteType(siteAbb) {

	switch (siteAbb) {
		case "sw": return "<font color='black'>Surface-Water</font>"; break;
		case "gw": return "<font color='red'>Groundwater</font>"; break;
		case "sp": return "<font color='purple'>Spring</font>"; break;
		case "at": return "<font color='blue'>Atmospheric</font>"; break;
		case "ot": return "<font color='gray'>Other</font>"; break;
		default: return "<font color='red'>Unknown Site Type</font>"; break;
	}
}

function formatSiteStatus(siteStatus) {

	switch (siteStatus) {
		case "act": return "<font color='black'>Active</font>"; break;
		case "ina": return "<font color='gray'>Inactive</font>"; break;
		default: return "<font color='red'>Unknown Status</font>"; break;
	}
}
/* grids for data types
*/

function makeStatusGrid() {

	// datastore for status grid
	statusStore = new dojo.data.ItemFileWriteStore({
		url:"json/status.json",
		urlPreventCache:true
	});

	statusGrid = new dojox.grid.DataGrid({
		store:statusStore,
		structure:[
			{name:"Site Group", field:"grStatusType", width:"5%"},
			{name:"Site Status", field:"grStatusStatus", width:"5%"},
			{name:"Map Symbol", field:"grStatusSymbol", styles:"text-align:center;", formatter:formatMapSymbol, width:"5%"},
			{name:"Selectable Zoom Level", field:"grStatusLevel", width:"5%"},
			{name:"Visible", field:"grStatusVisible", width:"5%"},
			{name:"Selectable", field:"grStatusSelect", formatter:formatSelect, width:"5%"},
			{name:"# Sites on Map", field:"grStatusNSites", width:"10%"}
		]
	}, "statusGrid");
	statusGrid.startup();
}

function makeSiteGrids() {

//=======================================================================
	sitesSWActGrid = new dojox.grid.DataGrid({
		structure:[
			{name:"Site Number", field:"grSiteNo", width:"5%"},
			{name:"Site Name", field:"grSiteName", width:"10%"},
			//just remove formatter and change json string above in site loop
			//{name:"Site Group", field:"grSiteType", formatter:formatSiteType, width:"5%"},
			{name:"Site Type", field:"grSiteType", width:"5%"},
			{name:"Status", field:"grSiteStatus", formatter:formatSiteStatus, width:"5%"},
			{name:"Agency", field:"grSiteAgency", formatter:formatAgency, width:"5%"},
			{name:"Access Data", field:"grSiteUrl", formatter:formatNWISUrl, width:"5%"}
		]
	}, "sitesSWActGrid");
	sitesSWActGrid.startup();

	sitesSWInaGrid = new dojox.grid.DataGrid({
		structure:[
			{name:"Site Number", field:"grSiteNo", width:"5%"},
			{name:"Site Name", field:"grSiteName", width:"10%"},
			//just remove formatter and change json string above in site loop
			//{name:"Site Group", field:"grSiteType", formatter:formatSiteType, width:"5%"},
			{name:"Site Type", field:"grSiteType", width:"5%"},
			{name:"Status", field:"grSiteStatus", formatter:formatSiteStatus, width:"5%"},
			{name:"Agency", field:"grSiteAgency", formatter:formatAgency, width:"5%"},
			{name:"Access Data", field:"grSiteUrl", formatter:formatNWISUrl, width:"5%"}
		]
	}, "sitesSWInaGrid");
	sitesSWInaGrid.startup();

//=======================================================================
	sitesGWActGrid = new dojox.grid.DataGrid({
		structure:[
			{name:"Site Number", field:"grSiteNo", width:"5%"},
			{name:"Site Name", field:"grSiteName", width:"10%"},
			//just remove formatter and change json string above in site loop
			//{name:"Site Group", field:"grSiteType", formatter:formatSiteType, width:"5%"},
			{name:"Site Type", field:"grSiteType", width:"5%"},
			{name:"Status", field:"grSiteStatus", formatter:formatSiteStatus, width:"5%"},
			{name:"Agency", field:"grSiteAgency", formatter:formatAgency, width:"5%"},
			{name:"Access Data", field:"grSiteUrl", formatter:formatNWISUrl, width:"5%"}
		]
	}, "sitesGWActGrid");
	sitesGWActGrid.startup();

	sitesGWInaGrid = new dojox.grid.DataGrid({
		structure:[
			{name:"Site Number", field:"grSiteNo", width:"5%"},
			{name:"Site Name", field:"grSiteName", width:"10%"},
			//just remove formatter and change json string above in site loop
			//{name:"Site Group", field:"grSiteType", formatter:formatSiteType, width:"5%"},
			{name:"Site Type", field:"grSiteType", width:"5%"},
			{name:"Status", field:"grSiteStatus", formatter:formatSiteStatus, width:"5%"},
			{name:"Agency", field:"grSiteAgency", formatter:formatAgency, width:"5%"},
			{name:"Access Data", field:"grSiteUrl", formatter:formatNWISUrl, width:"5%"}
		]
	}, "sitesGWInaGrid");
	sitesGWInaGrid.startup();
//=======================================================================
	sitesSPActGrid = new dojox.grid.DataGrid({
		structure:[
			{name:"Site Number", field:"grSiteNo", width:"5%"},
			{name:"Site Name", field:"grSiteName", width:"10%"},
			//just remove formatter and change json string above in site loop
			//{name:"Site Group", field:"grSiteType", formatter:formatSiteType, width:"5%"},
			{name:"Site Type", field:"grSiteType", width:"5%"},
			{name:"Status", field:"grSiteStatus", formatter:formatSiteStatus, width:"5%"},
			{name:"Agency", field:"grSiteAgency", formatter:formatAgency, width:"5%"},
			{name:"Access Data", field:"grSiteUrl", formatter:formatNWISUrl, width:"5%"}
		]
	}, "sitesSPActGrid");
	sitesSPActGrid.startup();

	sitesSPInaGrid = new dojox.grid.DataGrid({
		structure:[
			{name:"Site Number", field:"grSiteNo", width:"5%"},
			{name:"Site Name", field:"grSiteName", width:"10%"},
			//just remove formatter and change json string above in site loop
			//{name:"Site Group", field:"grSiteType", formatter:formatSiteType, width:"5%"},
			{name:"Site Type", field:"grSiteType", width:"5%"},
			{name:"Status", field:"grSiteStatus", formatter:formatSiteStatus, width:"5%"},
			{name:"Agency", field:"grSiteAgency", formatter:formatAgency, width:"5%"},
			{name:"Access Data", field:"grSiteUrl", formatter:formatNWISUrl, width:"5%"}
		]
	}, "sitesSPInaGrid");
	sitesSPInaGrid.startup();
//=======================================================================
	sitesATActGrid = new dojox.grid.DataGrid({
		structure:[
			{name:"Site Number", field:"grSiteNo", width:"5%"},
			{name:"Site Name", field:"grSiteName", width:"10%"},
			//just remove formatter and change json string above in site loop
			//{name:"Site Group", field:"grSiteType", formatter:formatSiteType, width:"5%"},
			{name:"Site Type", field:"grSiteType", width:"5%"},
			{name:"Status", field:"grSiteStatus", formatter:formatSiteStatus, width:"5%"},
			{name:"Agency", field:"grSiteAgency", formatter:formatAgency, width:"5%"},
			{name:"Access Data", field:"grSiteUrl", formatter:formatNWISUrl, width:"5%"}
		]
	}, "sitesATActGrid");
	sitesATActGrid.startup();

	sitesATInaGrid = new dojox.grid.DataGrid({
		structure:[
			{name:"Site Number", field:"grSiteNo", width:"5%"},
			{name:"Site Name", field:"grSiteName", width:"10%"},
			//just remove formatter and change json string above in site loop
			//{name:"Site Group", field:"grSiteType", formatter:formatSiteType, width:"5%"},
			{name:"Site Type", field:"grSiteType", width:"5%"},
			{name:"Status", field:"grSiteStatus", formatter:formatSiteStatus, width:"5%"},
			{name:"Agency", field:"grSiteAgency", formatter:formatAgency, width:"5%"},
			{name:"Access Data", field:"grSiteUrl", formatter:formatNWISUrl, width:"5%"}
		]
	}, "sitesATInaGrid");
	sitesATInaGrid.startup();
//=======================================================================
	sitesOTActGrid = new dojox.grid.DataGrid({
		structure:[
			{name:"Site Number", field:"grSiteNo", width:"5%"},
			{name:"Site Name", field:"grSiteName", width:"10%"},
			//just remove formatter and change json string above in site loop
			//{name:"Site Group", field:"grSiteType", formatter:formatSiteType, width:"5%"},
			{name:"Site Type", field:"grSiteType", width:"5%"},
			{name:"Status", field:"grSiteStatus", formatter:formatSiteStatus, width:"5%"},
			{name:"Agency", field:"grSiteAgency", formatter:formatAgency, width:"5%"},
			{name:"Access Data", field:"grSiteUrl", formatter:formatNWISUrl, width:"5%"}
		]
	}, "sitesOTActGrid");
	sitesOTActGrid.startup();

	sitesOTInaGrid = new dojox.grid.DataGrid({
		structure:[
			{name:"Site Number", field:"grSiteNo", width:"5%"},
			{name:"Site Name", field:"grSiteName", width:"10%"},
			//just remove formatter and change json string above in site loop
			//{name:"Site Group", field:"grSiteType", formatter:formatSiteType, width:"5%"},
			{name:"Site Type", field:"grSiteType", width:"5%"},
			{name:"Status", field:"grSiteStatus", formatter:formatSiteStatus, width:"5%"},
			{name:"Agency", field:"grSiteAgency", formatter:formatAgency, width:"5%"},
			{name:"Access Data", field:"grSiteUrl", formatter:formatNWISUrl, width:"5%"}
		]
	}, "sitesOTInaGrid");
	sitesOTInaGrid.startup();

	// attach listeners to grids
	dojo.connect(sitesSWActGrid, "onRowMouseOver", sitesSWActGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesSWActStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectHalo("sw_act_glayer", rowValue);
		}
	});

	dojo.connect(sitesSWActGrid, "onRowClick", sitesSWActGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesSWActStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectPopup("sw_act_glayer", rowValue);
		}
	});

	dojo.connect(sitesSWInaGrid, "onRowMouseOver", sitesSWInaGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesSWInaStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectHalo("sw_ina_glayer", rowValue);
		}
	});
	dojo.connect(sitesSWInaGrid, "onRowClick", sitesSWInaGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesSWInaStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectPopup("sw_ina_glayer", rowValue);
		}
	});

	dojo.connect(sitesGWActGrid, "onRowMouseOver", sitesGWActGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesGWActStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectHalo("gw_act_glayer", rowValue);
		}
	});
	dojo.connect(sitesGWActGrid, "onRowClick", sitesGWActGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesGWActStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectPopup("gw_act_glayer", rowValue);
		}
	});

	dojo.connect(sitesGWInaGrid, "onRowMouseOver", sitesGWInaGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesGWInaStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectHalo("gw_ina_glayer", rowValue);
		}
	});
	dojo.connect(sitesGWInaGrid, "onRowClick", sitesGWInaGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesGWInaStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectPopup("gw_ina_glayer", rowValue);
		}
	});

	dojo.connect(sitesSPActGrid, "onRowMouseOver", sitesSPActGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesSPActStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectHalo("sp_act_glayer", rowValue);
		}
	});
	dojo.connect(sitesSPActGrid, "onRowClick", sitesSPActGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesSPActStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectPopup("sp_act_glayer", rowValue);
		}
	});

	dojo.connect(sitesSPInaGrid, "onRowMouseOver", sitesSPInaGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesSPInaStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectHalo("sp_ina_glayer", rowValue);
		}
	});
	dojo.connect(sitesSPInaGrid, "onRowClick", sitesSPInaGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesSPInaStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectPopup("sp_ina_glayer", rowValue);
		}
	});

	dojo.connect(sitesATActGrid, "onRowMouseOver", sitesATActGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesATActStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectHalo("at_act_glayer", rowValue);
		}
	});
	dojo.connect(sitesATActGrid, "onRowClick", sitesATActGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesATActStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectPopup("at_act_glayer", rowValue);
		}
	});

	dojo.connect(sitesATInaGrid, "onRowMouseOver", sitesATInaGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesATInaStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectHalo("at_ina_glayer", rowValue);
		}
	});
	dojo.connect(sitesATInaGrid, "onRowClick", sitesATInaGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesATInaStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectPopup("at_ina_glayer", rowValue);
		}
	});

	dojo.connect(sitesOTActGrid, "onRowMouseOver", sitesOTActGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesOTActStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectHalo("ot_act_glayer", rowValue);
		}
	});
	dojo.connect(sitesOTActGrid, "onRowClick", sitesOTActGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesOTActStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectPopup("ot_act_glayer", rowValue);
		}
	});

	dojo.connect(sitesOTInaGrid, "onRowMouseOver", sitesOTInaGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesOTInaStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectHalo("ot_ina_glayer", rowValue);
		}
	});
	dojo.connect(sitesOTInaGrid, "onRowClick", sitesOTInaGrid, function(evt) {
		var idx = evt.rowIndex;
		var item = this.getItem(idx);
		var rowValue = sitesOTInaStore.getValue(item, "grSiteNo");
		if (rowValue) {
			drawSelectPopup("ot_ina_glayer", rowValue);
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
			break;
		}
	}
}

/* Loading... divs - dojo calls them Standby's */

function makeStandbys() {

	swActStandby = new dojox.widget.Standby({
		target:"swActLoader",
		image:"images/loaders/swActLoader.gif",
		color: "#D0D0D0",
		zIndex:"auto"
	});
	document.body.appendChild(swActStandby.domNode);
	swActStandby.startup();

	swInaStandby = new dojox.widget.Standby({
		target:"swInaLoader",
		image:"images/loaders/swInaLoader.gif",
		color: "#D0D0D0",
		zIndex:"auto"
	});
	document.body.appendChild(swInaStandby.domNode);
	swInaStandby.startup();

	gwActStandby = new dojox.widget.Standby({
		target:"gwActLoader",
		image:"images/loaders/gwActLoader.gif",
		color: "#D0D0D0",
		zIndex:"auto"
	});
	document.body.appendChild(gwActStandby.domNode);
	gwActStandby.startup();

	gwInaStandby = new dojox.widget.Standby({
		target:"gwInaLoader",
		image:"images/loaders/gwInaLoader.gif",
		color: "#D0D0D0",
		zIndex:"auto"
	});
	document.body.appendChild(gwInaStandby.domNode);
	gwInaStandby.startup();

	spActStandby = new dojox.widget.Standby({
		target:"spActLoader",
		image:"images/loaders/spActLoader.gif",
		color: "#D0D0D0",
		zIndex:"auto"
	});
	document.body.appendChild(spActStandby.domNode);
	spActStandby.startup();

	spInaStandby = new dojox.widget.Standby({
		target:"spInaLoader",
		image:"images/loaders/spInaLoader.gif",
		color: "#D0D0D0",
		zIndex:"auto"
	});
	document.body.appendChild(spInaStandby.domNode);
	spInaStandby.startup();

	atActStandby = new dojox.widget.Standby({
		target:"atActLoader",
		image:"images/loaders/atActLoader.gif",
		color: "#D0D0D0",
		zIndex:"auto"
	});
	document.body.appendChild(atActStandby.domNode);
	atActStandby.startup();

	atInaStandby = new dojox.widget.Standby({
		target:"atInaLoader",
		image:"images/loaders/atInaLoader.gif",
		color: "#D0D0D0",
		zIndex:"auto"
	});
	document.body.appendChild(atInaStandby.domNode);
	atInaStandby.startup();

	otActStandby = new dojox.widget.Standby({
		target:"otActLoader",
		image:"images/loaders/otActLoader.gif",
		color: "#D0D0D0",
		zIndex:"auto"
	});
	document.body.appendChild(otActStandby.domNode);
	otActStandby.startup();

	otInaStandby = new dojox.widget.Standby({
		target:"otInaLoader",
		image:"images/loaders/otInaLoader.gif",
		color: "#D0D0D0",
		zIndex:"auto"
	});
	document.body.appendChild(otInaStandby.domNode);
	otInaStandby.startup();

	srchAddressStandby = new dojox.widget.Standby({
		target: "srchAddressBar",
		image:"images/loaders/otActLoader.gif",
		color: "#D0D0D0",
		zIndex:"auto"
	});
	document.body.appendChild(srchAddressStandby.domNode);
	srchAddressStandby.startup();

	srchPlacesStandby = new dojox.widget.Standby({
		target: "srchPlacesBar",
		image:"images/loaders/otActLoader.gif",
		color: "#D0D0D0",
		zIndex:"auto"
	});
	document.body.appendChild(srchPlacesStandby.domNode);
	srchPlacesStandby.startup();

	srchSitesStandby = new dojox.widget.Standby({
		target: "srchSitesBar",
		image:"images/loaders/otActLoader.gif",
		color: "#D0D0D0",
		zIndex:"auto"
	});
	document.body.appendChild(srchSitesStandby.domNode);
	srchSitesStandby.startup();

}
/* functions for searching */

function makeHucSearch() {

	// datastore for watershed regions
	hucsRegStore = new dojo.data.ItemFileWriteStore({
		url:"json/regions.json",
		urlPreventCache:true
	});

	hucsRegSelect = new dijit.form.FilteringSelect({
		store:hucsRegStore,
		name:"hucsRegSelect",
		placeHolder:"Select a Region",
		searchAttr:"Region",
		onChange: function(region) {getHucRegion(region);}
	}, "hucsRegSelect");
	hucsRegSelect.startup();

}

function getHucRegion(selRegion) {
	hucsRegStore.fetchItemByIdentity({identity:selRegion,
		onItem : function(region) {
			var west = hucsRegStore.getValue(region, 'MinX');
			var south = hucsRegStore.getValue(region, 'MinY');
			var east = hucsRegStore.getValue(region, 'MaxX');
			var north = hucsRegStore.getValue(region, 'MaxY');
			var esriExtent = new esri.geometry.Extent(west, south, east, north, new esri.SpatialReference({wkid: 4326}));
			map.setExtent(esri.geometry.geographicToWebMercator(esriExtent));
		}
	});
}

function makeUSGSLayer() {
	usgsStore = new dojo.data.ItemFileWriteStore({
		url:"json/usgs_water_offices.json",
		urlPreventCache:true
	});
}

function makeStateZoomStore() {
	stateZoomStore = new dojo.data.ItemFileWriteStore({
		url:"json/places_url.json",
		urlPreventCache:false
	});
}

function makePlacesSearch() {
	placesStore = new dojo.data.ItemFileWriteStore({
		url:"json/places.json",
		urlPreventCache:false
	});

	placesSelect = new dijit.form.FilteringSelect({
		store:placesStore,
		name:"placesSelect",
		placeHolder:"Select an Area",
		searchAttr:"Name",
		onChange: function(region) {getPlace(region);}
	}, "placesSelect");
	placesSelect.startup();
}

function getPlace(selRegion) {
	placesStore.fetchItemByIdentity({identity:selRegion,
		onItem : function(region) {
			var west = placesStore.getValue(region, 'MinX');
			var south = placesStore.getValue(region, 'MinY');
			var east = placesStore.getValue(region, 'MaxX');
			var north = placesStore.getValue(region, 'MaxY');
			var esriExtent = new esri.geometry.Extent(west, south, east, north, new esri.SpatialReference({wkid: 4326}));
			map.setExtent(esri.geometry.geographicToWebMercator(esriExtent));
		}
	});
}

function clearGrid(gLayer) {

	var emptySite = {"items":[]};

	if (gLayer == "sw_act") {
		sitesSWActStore = new dojo.data.ItemFileWriteStore({data:emptySite});
		sitesSWActStore.save();
		sitesSWActGrid.setStore(sitesSWActStore);
		updateStatus("None", 0);
		return;
	}

	if (gLayer == "sw_ina") {
		sitesSWInaStore = new dojo.data.ItemFileWriteStore({data:emptySite});
		sitesSWInaStore.save();
		sitesSWInaGrid.setStore(sitesSWInaStore);
		updateStatus("None", 1);
		return;
		}

	if (gLayer == "gw_act") {
		sitesGWActStore = new dojo.data.ItemFileWriteStore({data:emptySite});
		sitesGWActStore.save();
		sitesGWActGrid.setStore(sitesGWActStore);
		updateStatus("None", 2);
		return;
		}

	if (gLayer == "gw_ina") {
		sitesGWInaStore = new dojo.data.ItemFileWriteStore({data:emptySite});
		sitesGWInaStore.save();
		sitesGWInaGrid.setStore(sitesGWInaStore);
		updateStatus("None", 3);
		return;
		}

	if (gLayer == "sp_act") {
		sitesSPActStore = new dojo.data.ItemFileWriteStore({data:emptySite});
		sitesSPActStore.save();
		sitesSPActGrid.setStore(sitesSPActStore);
		updateStatus("None", 4);
		return;
		}

	if (gLayer == "sp_ina") {
		sitesSPInaStore = new dojo.data.ItemFileWriteStore({data:emptySite});
		sitesSPInaStore.save();
		sitesSPInaGrid.setStore(sitesSPInaStore);
		updateStatus("None", 5);
		return;
		}

	if (gLayer == "at_act") {
		sitesATActStore = new dojo.data.ItemFileWriteStore({data:emptySite});
		sitesATActStore.save();
		sitesATActGrid.setStore(sitesATActStore);
		updateStatus("None", 6);
		return;
		}

	if (gLayer == "at_ina") {
		sitesATInaStore = new dojo.data.ItemFileWriteStore({data:emptySite});
		sitesATInaStore.save();
		sitesATInaGrid.setStore(sitesATInaStore);
		updateStatus("None", 7);
		return;
	}

	if (gLayer == "ot_act") {
		sitesOTActStore = new dojo.data.ItemFileWriteStore({data:emptySite});
		sitesOTActStore.save();
		sitesOTActGrid.setStore(sitesOTActStore);
		updateStatus("None", 8);
		return;
	}

	if (gLayer == "ot_ina") {
		sitesOTInaStore = new dojo.data.ItemFileWriteStore({data:emptySite});
		sitesOTInaStore.save();
		sitesOTInaGrid.setStore(sitesOTInaStore);
		updateStatus("None", 9);
		return;
	}
}


function getAquifer(mapPoint) {

	// only query web service is the checkbox is checked
	// and the zoom level is between 4 and 12
	if (!dojo.byId("chkAQ").checked){
		return;
	}

	aqMapX = mapPoint.x.toFixed(1);
	aqMapY = mapPoint.y.toFixed(1);

	// build web service URL
	//aqURL = "./aquifers/?ptInfo=" +
	aqURL = "./tileRGB/" + 
	"?ptInfo=" +	map.getLevel() + "," + aqMapX + "," + aqMapY +
	"&tileURL=" + s3bucket + "s3.amazonaws.com/pr_aq" + 
	"&cacheInfo=aquifers,TMS,png"

	// set the xhrGet properties
	var urlObj = esri.urlToObject(aqURL);

	var aquiferRequest = {
		url: urlObj.path,
		handleAs: "xml",
		content: urlObj.query,
		load: showAquifer,
		error: noAquifer
	}

	// AJAX call to fetch sites
	var deferred = dojo.xhrGet(aquiferRequest);

	}

function showAquifer(xml, ioargs){

	// new point from mouse click
	var aqPoint = new esri.geometry.Point(aqMapX, aqMapY, new esri.SpatialReference({wkid:102100}));

	// parse the XML
	var aquifers = xml.getElementsByTagName("aquifers");
	if (aquifers.length == 0) {return;}

	//
	var aquifer = aquifers[0].getElementsByTagName("aquifer");
	var aqName = aquifer[0].getAttribute("name");
	var aqRed = aquifer[0].getAttribute("red");
	var aqGreen = aquifer[0].getAttribute("green");
	var aqBlue =  aquifer[0].getAttribute("blue");

	var aqDivStyle = '<span style="display:inline-block; width:20px; height:20px; background-color:rgb(' +
		aqRed + ',' + aqGreen + ',' + aqBlue + ');"></span>';

	var aqHTML = '<table border="0" width="290">' +
					'<thead>' +
						'<tr>' +
							'<th scope="col"><b>Aquifer</b></th>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr>' +
							'<td>&nbsp;&nbsp;' + aqName + '</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';


	map.infoWindow.setContent(aqHTML );
	map.infoWindow.setTitle("Principal Aquifers");
	popup.resize(305,100);
	if (popup.isShowing) {popup.hide();}
	popup.show(aqPoint);


}

function noAquifer(xml, ioargs){
	if (popup.isShowing) {popup.hide();}
	return;
}
/* export */

function setExport(tabCode) {

	// expCode gives us the Site Type Category, but we need to check
	// the active tab to get the Site Status category
	// 1 = SW and 1 = Active, 0 = Inactive
	// 2 = GW and 1 = Active, 0 = Inactive
	// 3 = SP and 1 = Active, 0 = Inactive
	// 4 = AT and 1 = Active, 0 = Inactive
	// 5 = OT and 1 = Active, 0 = Inactive
	// these codes correspond to the codes required for the exporter web service


	var statusTab;
	switch (tabCode) {
		case 1: statusTab = dijit.byId("mapSWContainer"); break;
		case 2: statusTab = dijit.byId("mapGWContainer"); break;
		case 3: statusTab = dijit.byId("mapSPContainer"); break;
		case 4: statusTab = dijit.byId("mapATContainer"); break;
		case 5: statusTab = dijit.byId("mapOTContainer"); break;
	}

	// build the exportCodes string for the URL.
	// exportCodes is a global variable because we need it in the export dialog
	exportCodes = tabCode.toString();

	// add a 1 or 0 to indicate status
	//if (statusTab.selectedChildWidget.title.trim() == "Inactive") {
	if (statusTab.selectedChildWidget.title.indexOf("Inactive") != -1)  {
		exportCodes += "0";
	} else {
		exportCodes += "1";
	}

	// now we need to add the hasDataType code
	// 1=all, 2=iv, 3=dv, 4=qw, 5=pk, 6=sv, 7=ad, 8=gw
	var hasData = "";
	switch (exportCodes) {
		case "11": hasData = getHasDataType("chkSWAct"); break;
		case "10": hasData = getHasDataType("chkSWIna"); break;
		case "21": hasData = getHasDataType("chkGWAct"); break;
		case "20": hasData = getHasDataType("chkGWIna"); break;
		case "31": hasData = getHasDataType("chkSPAct"); break;
		case "30": hasData = getHasDataType("chkSPIna"); break;
		case "41": hasData = getHasDataType("chkATAct"); break;
		case "40": hasData = getHasDataType("chkATIna"); break;
		case "51": hasData = getHasDataType("chkOTAct"); break;
		case "50": hasData = getHasDataType("chkOTIna"); break;
	}

	// before we export anything we need to make sure there are sites to export
	// gridIndex is just the row that holds the data
	var gridIndex = 0;
	switch (exportCodes) {
		case "11": gridIndex = 0; break;
		case "10": gridIndex = 1; break;
		case "21": gridIndex = 2; break;
		case "20": gridIndex = 3; break;
		case "31": gridIndex = 4; break;
		case "30": gridIndex = 5; break;
		case "41": gridIndex = 6; break;
		case "40": gridIndex = 7; break;
		case "51": gridIndex = 8; break;
		case "50": gridIndex = 9; break;
	}

	// check the statusgrid values
	var nSitesRow = statusGrid.getItem(gridIndex);
	var nSites = statusStore.getValue(nSitesRow,'grStatusNSites');

	// no sites to export!
	if (nSites == "N/A" || nSites == "None") {
		showErrBox("No Sites to Export");
		return;
	}

	// the exporter web service uses slighty different coding than the sitefile web service
	var dataCode = "";
	switch (hasData) {
		case "all": dataCode = "1";break;
		case "iv":  dataCode = "2";break;
		case "dv":  dataCode = "3";break;
		case "qw":  dataCode = "4";break;
		case "pk":  dataCode = "5";break;
		case "sv":  dataCode = "6";break;
		case "ad":  dataCode = "7";break;
		case "gw":  dataCode = "8";break;
	}

	// add the data type to format code
	exportCodes += dataCode;

	// show the export formats dialog
	dijit.byId('exportDialog').show();
}

function makeExportFile() {

	// need to build the URL for the exporter web service
	var expURL = "./export/?";

	// calculate bounding box for web service query
	var bboxExtent = new esri.geometry.Extent(map.extent.xmin, map.extent.ymin, map.extent.xmax, map.extent.ymax, map.spatialReference);
	bboxExtent = esri.geometry.webMercatorToGeographic(bboxExtent);

	// round the latitude and longitude values
	var xmin = Math.round(bboxExtent.xmin * 1000) / 1000;
	var ymin = Math.round(bboxExtent.ymin * 1000) / 1000;
	var xmax = Math.round(bboxExtent.xmax * 1000) / 1000;
	var ymax = Math.round(bboxExtent.ymax * 1000) / 1000;

	// add the bbox values to the URL
	expURL += "bbox=" + xmin + "," + ymin + "," + xmax +  ","  + ymax;

	// get data type codes - exportCodes is a global variable
	expURL += "&scodes=" + exportCodes;

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
	expURL += "&fformat=" + fmtCode;

	if (fmtCode == "1") {
		window.open(expURL);
	} else {
		// this causes the browser to "save as" a file.
		var dlframe = dojo.create("iframe", {src: expURL, style: "display: none"},  dojo.doc.body);
	}

}

/* gallery.js */

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

// Section: strings
// Returns the left x characters of the string
String.prototype.left = function(count) {
  if (this.length>count) {
	return this.substring(0, count);
  }
  else {
	return this;
  }
}

// Returns the right x characters of the string
String.prototype.right = function(count) {
  if (this.length>count) {
	return this.substring(this.length-count, this.length);
  }
  else {
	return this;
  }
}

// Returns true if the string begins with value
String.prototype.startsWith = function(value) {
  if (this.length<value.length) {
	return false;
  }
  else {
	return this.substring(0, value.length)===value;
  }
}

// Returns true if the string ends with value
String.prototype.endsWith = function(value) {
   if (this.length<value.length) {
	return false;
  }
  else {
	return this.substring(this.length-value.length, this.length)===value;
  }
}

// Returns a shortened version of the string
// suffixed with "..." if characters are truncated
// from the original string
String.prototype.shorten = function(maxLength) {
  if (!this) {
	result = null;
  }
  else if (this.length>maxLength) {
	preferredSize = maxLength-'...'.length;
	if (preferredSize>0) {
	  result = this.left(preferredSize) + '...';
	}
	else {
	  result = this.left(maxLength);
	}
  }
  else {
	result = this;
  }
  return result;
}
