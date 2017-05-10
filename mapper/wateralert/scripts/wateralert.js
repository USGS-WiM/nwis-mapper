// NWIS Mapper support functions:
// NWIS Mapper support functions:
// Sections:
//	layers
//	markers
//	strings

//Section: Geolocation
function getLocation() {

	//get IP data with AJAX call
	var request = esri.request({
	  // Location of the data
	  url: "https://freegeoip.net/json/",
	  // Data format
	  handleAs: "json",
	  timeout: 3000,
	  callbackParamName: "callback"
	});
	
	//handle the response
	request.then(
	  function (data) {
		//console.log("using esri.request",data);
		//Center and zoom map on geolocated point
		var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(data.longitude, data.latitude));
		//console.log(pt);
		map.centerAndZoom(pt, 9);
		
	  },
	  function (error) {
		console.log("IP Geolocation Error: ", error.message);
		
		//if an error, call regular zoom manager to draw tiled sites
		ZoomManager(0);
	  }
	);
}

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
		return;
	}
	if (maxIndex == 1) {
		sp = dojo.byId("sp_gw_act");DisAndGreyOut(sp);
		return;
	}
	if (maxIndex == 2) {
		sp = dojo.byId("sp_sp_act");DisAndGreyOut(sp);
		return;
	}
	if (maxIndex == 3) {
		sp = dojo.byId("sp_at_act");DisAndGreyOut(sp);
		return;
	}
	if (maxIndex == 4) {
		return;
	}
}

function enableDataTypeRadio(maxIndex) {

	var sp;
	if (maxIndex == 0) {
		sp = dojo.byId("sp_sw_act");EnableAndBlack(sp);
		return;
	}
	if (maxIndex == 1) {
		sp = dojo.byId("sp_gw_act");EnableAndBlack(sp);
		return;
	}
	if (maxIndex == 2) {
		sp = dojo.byId("sp_sp_act");EnableAndBlack(sp);
		return;
	}
	if (maxIndex == 3) {
		sp = dojo.byId("sp_at_act");EnableAndBlack(sp);
		return;
	}
	if (maxIndex == 4) {
		return;
	}
}

function EnableAndBlack(greySpan) {
	dojo.query('input', greySpan).forEach(
		function(inputElem) {
			inputElem.disabled = '';
		}
	);
	// make labels black
	greySpan.className="treeLevel3";
}

function DisAndGreyOut(greySpan) {
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
//	if (siteType.left(2) == "AG") return "ot";
}

function getSiteStatus(siteType) {

	// siteType is a checkboxID, so get right three characters, for example chkOTAct
	var primaryStatus = siteType.substr(5,3)
	switch (primaryStatus) {
		case "Act": return "active"; break;
//		case "Ina": return "inactive"; break;
	}
}
function getNWISdataType() {

	var sp;
	switch ("chkSWAct") {
		case "chkSWAct": sp = dojo.byId("sp_sw_act"); break;
		case "chkGWAct": sp = dojo.byId("sp_gw_act"); break;
		case "chkSPAct": sp = dojo.byId("sp_sp_act"); break;
		case "chkATAct": sp = dojo.byId("sp_at_act"); break;
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
	
	if (hasDataCode == "w1") {
		nwisDataType = "uv";
	}	
	
	if (hasDataCode == "w2") {
		nwisDataType = "uv";
	}	
	
	if (hasDataCode == "ll" || hasDataCode == "ad") {
		nwisDataType = "inventory";
	}

	if (hasDataCode == "iv") {
		nwisDataType = "uv";
	}

	if (hasDataCode == "rt") {
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
	
	return nwisDataType;

}

function siteGroupLookup(siteTypeText) {

	//get site type for each site
	switch(siteTypeText)
		{
			//SW SITES
			case "Estuary": return "sw"; break;
			case "Lake": return "sw"; break;
			case "Ocean": return "sw"; break;
			case "Stream": return "sw";	break;
			case "Wetland": return "sw"; break;
			case "Glacier": return "sw"; break;
			//GW SITES
			case "Well": return "gw"; break;
			case "Subsurface": return "gw"; break;
			//SP SITES
			case "Spring": return "sp"; break;
			//AT SITES
			case "Atmospheric": return "at"; break;
			//other
			case "Other": return "sw"; break;
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
			case "GL": return "Glacier"; break;
			//GW SITES
			case "GW":  return "Well"; break;
			case "SB": return "Subsurface"; break;
			//SP SITES
			case "SP": return "Spring"; break;
			//AT SITES
			case "AT": return "Atmospheric"; break;
			//OT SITES
//			case "AG": return "Aggregate groundwater use"; break;
//			case "AS": return "Aggregate surface-water-use"; break;
//			case "AW": return "Aggregate water-use establishment"; break;
//			case "FA": return "Facility"; break;
//			case "LA": return "Land"; break;
			default: return "Other";
		}
}

function getSiteTypeUrl(siteType) {

	// siteType is a checkboxID, so get chars 4&5
	var siteTypeUrl = "";
	var siteGroup = siteType.substr(3,2)
	switch (siteGroup) {
		case "SW": siteTypeUrl = "ST,LK,WE,ES,OC"; break;
		case "GW": siteTypeUrl = "GW,SB"; break;
		case "SP": siteTypeUrl = "SP"; break;
		case "AT": siteTypeUrl = "AT"; break;
//		case "OT": siteTypeUrl = "AG,AS,FA,LA"; break
	}
	return siteTypeUrl;
}

function getHasDataType(siteType) {

	var sp;
	switch (siteType) {
		case "chkSWAct": sp = dojo.byId("sp_sw_act"); break;
		case "chkGWAct": sp = dojo.byId("sp_gw_act"); break;
		case "chkSPAct": sp = dojo.byId("sp_sp_act"); break;
		case "chkATAct": sp = dojo.byId("sp_at_act"); break;
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

function getIVdata(siteGroup) {

	//get graphics layer
	var glayer = map.getLayer(siteGroup + "_act_glayer");	
	var graphics = glayer.graphics;
	var parmlist = "";
	
	switch (siteGroup) {
      case "sw": parmlist = rt_parms_sw; break;
      case "gw": parmlist = rt_parms_gw; break;
      case "sp": parmlist = rt_parms_sp; break;
      case "at": parmlist = rt_parms_at; break;
    } 
    
    //modify if for water-quality data
	if (hasDataCode == "w2") {parmlist = rt_parms_qw;}	
	
     // loop over set of graphics for this site type
	for (var i = 0; i < graphics.length; i++) {
		
		//get IV data with AJAX call
		var request = esri.request({
		  // Location of the data
		  url: "/mapper/wamapper/?",
		  // Service parameters if required, sent with URL as key/value pairs
		  
		  content: {
			site: graphics[i].attributes.site_no,
			format: "nwjson",
			parameterCd: parmlist
		  },
		  // Data format
		  handleAs: "json"
		});
		
		//handle the response
		request.then(
		  function (data) {
			//console.log("IV data for site: ", data.site.site_no, data);

			//get graphics layer again
		  	var glayer2 = map.getLayer(siteGroup + "_act_glayer");	
			var graphics2 = glayer2.graphics;

			//loop over graphics inside of IV service request 
			for (var f = 0; f < graphics.length; f++) {

				//get graphic matching currently requested site
				if (graphics2[f].attributes.site_no == data.site.site_no) {

					//set up new variable to store real time data
					var waterAlertDataNew = "<hr>";
					
					//get each data descriptor and values
					for (var g = 0; g < data.data.length; g++) {

						//set units
						var parm_unit;
						var parm_nm;
						var parm_cd = data.data[g].parameter_cd;
						switch(parm_cd)
						  {
							case "00060": parm_unit=" ft&sup3;/sec"; parm_nm = "Streamflow"; break;
							case "00065": parm_unit=" ft"; parm_nm = "Stage"; break;
							case "00062": parm_unit=" ft"; parm_nm = "Elevation above datum"; break;
							case "00055": parm_unit=" ft/sec"; parm_nm = "Stream velocity"; break;
							case "62614": parm_unit=" ft"; parm_nm = "Lake elevation above NVGD 1929"; break;
							case "62615": parm_unit=" ft"; parm_nm = "Lake or reservoir water surface elevation above NAVD 1988"; break;
							case "62616": parm_unit=" m"; parm_nm = "Lake elevation above NVGD 1929"; break;
							case "62619": parm_unit=" m"; parm_nm = "Estuary or ocean water surface elevation above NGVD 1929"; break;
							case "63158": parm_unit=" m"; parm_nm = "Stream water level elevation above NGVD 1929"; break;
							case "63160": parm_unit=" ft"; parm_nm = "Water-surface elevation above NAVD 1988"; break;
							case "72020": parm_unit=" ft"; parm_nm = "Elevation above NGVD 1929"; break;
							case "72147": parm_unit=" ft"; parm_nm = "Depth of sensor below water surface"; break;
							case "62610": parm_unit=" ft"; parm_nm = "Water level above NGVD 1929"; break;
							case "62611": parm_unit=" ft"; parm_nm = "Water level above NAVD 1988"; break;
							case "72019": parm_unit=" ft"; parm_nm = "Depth to water level"; break;
							case "72150": parm_unit=" ft, MSL"; parm_nm = "Water level above MSL"; break;
							case "00045": parm_unit=" in."; parm_nm = "Precipitation"; break;
							case "00010": parm_unit=" &deg;C"; parm_nm = "Water temperature"; break;
							case "00011": parm_unit=" &deg;F"; parm_nm = "Water temperature"; break;
							case "00095": parm_unit=" &micro;S"; parm_nm = "Specific conductance @ 25 &deg;C"; break;
							case "00300": parm_unit=" mg/L"; parm_nm = "Dissolved oxygen"; break;
							case "00400": parm_unit=" units"; parm_nm = "pH"; break;
							case "00480": parm_unit=" ppt"; parm_nm = "Salinity"; break;
							case "00630": parm_unit=" mg/L as N"; parm_nm = "Nitrate + nitrite"; break;
							case "00665": parm_unit=" mg/L"; parm_nm = "Phosphorus"; break;
							case "63680": parm_unit=" FNU"; parm_nm = "Turbidity"; break;
							case "99133": parm_unit=" mg/L as N"; parm_nm = "Nitrate + nitrite"; break;
							case "99064": parm_unit=" ft"; parm_nm = "Water surface elevation difference between two locations"; break;
							case "99067": parm_unit=" ft"; parm_nm = "Difference between observed and predicted water surface elevation"; break;
							
						  }

						if (data.data[g].most_recent_value) {
							waterAlertDataNew += "<b>" + parm_nm + ":</b> " + data.data[g].most_recent_value.split(" ")[0] + parm_unit + "<br/>&nbsp;&nbsp;on " + data.data[g].most_recent_value.split(" ")[2] + " at " + data.data[g].most_recent_value.split(" ")[4] + " " + data.data[g].most_recent_value.split(" ")[5] + "&nbsp;(TSID " + data.data[g].ts_id + ")<br />";	
						}

					}
					
					//set subscription data type
					var subscribeType= siteGroup;
					if (hasDataCode == "w2") {subscribeType = "qw";}
						
					//add water alert subscribe button				
					waterAlertDataNew += "<br /><button data-dojo-type='dijit/form/Button' style='font-size:small;' onClick='window.open(\"" + "https://water.usgs.gov/wateralert/subscribe2/index.html?site_no=" + graphics2[f].attributes.site_no + "&type_cd=" + subscribeType + "\")' type='button'>Subscribe to WaterAlert</button>";
					
					//update site template
					graphics2[f].setAttributes( {"site_no":graphics[f].attributes.site_no, "site_name":graphics[f].attributes.site_name, "siteTypeText":graphics[f].attributes.siteTypeText, "agency":graphics[f].attributes.agency, "waterAlertData":waterAlertDataNew });
				}
			
			}
		  },
		  function (error) {
			console.log("Wateralert Retrieval Error: ", error.message);
		  }
		);
	}
}

function getIVdata_singlesite(siteNo, siteGroup) {

	//get graphics layer
	var glayer = map.getLayer(siteGroup + "_act_glayer");	
	var graphics = glayer.graphics;
	var parmlist = "";
	
	switch (siteGroup) {
      case "sw": parmlist = rt_parms_sw; break;
      case "gw": parmlist = rt_parms_gw; break;
      case "sp": parmlist = rt_parms_sp; break;
      case "at": parmlist = rt_parms_at; break;
    } 
    
    //modify if for water-quality data
	if (hasDataCode == "w2") {parmlist = rt_parms_qw;}	
	
     // loop over set of graphics for this site type
	for (var i = 0; i < graphics.length; i++) {
	
		if (graphics[i].attributes.site_no == siteNo) {
		
			//get IV data with AJAX call
			var request = esri.request({
			  // Location of the data
			  url: "/mapper/wamapper/?",
			  // Service parameters if required, sent with URL as key/value pairs
			  
			  content: {
				site: graphics[i].attributes.site_no,
				format: "nwjson",
				parameterCd: parmlist
			  },
			  // Data format
			  handleAs: "json"
			});
			
			//handle the response
			request.then(
			  function (data) {
				console.log("IV data for site: ", data.site.site_no, data);

			/*
				//set up new variable to store real time data
				var waterAlertDataNew = "<hr>";
				
				//get each data descriptor and values
				for (var g = 0; g < data.data.length; g++) {

					//set units
					var parm_unit;
					var parm_nm;
					var parm_cd = data.data[g].parameter_cd;
					switch(parm_cd)
					  {
						case "00060": parm_unit=" ft&sup3;/sec"; parm_nm = "Streamflow"; break;
						case "00065": parm_unit=" ft"; parm_nm = "Stage"; break;
						case "00062": parm_unit=" ft"; parm_nm = "Elevation above datum"; break;
						case "00055": parm_unit=" ft/sec"; parm_nm = "Stream velocity"; break;
						case "62614": parm_unit=" ft"; parm_nm = "Lake elevation above NVGD 1929"; break;
						case "62616": parm_unit=" m"; parm_nm = "Lake elevation above NVGD 1929"; break;
						case "63160": parm_unit=" ft"; parm_nm = "Water-surface elevation above NAVD 1988"; break;
						case "72020": parm_unit=" ft"; parm_nm = "Elevation above NGVD 1929"; break;
						case "72147": parm_unit=" ft"; parm_nm = "Depth of sensor below water surface"; break;
						case "62611": parm_unit=" ft"; parm_nm = "Water level above NAVD 1988"; break;
						case "72019": parm_unit=" ft"; parm_nm = "Depth to water level"; break;
						case "72150": parm_unit=" ft, MSL"; parm_nm = "Water level above MSL"; break;
						case "00045": parm_unit=" in."; parm_nm = "Precipitation"; break;
						case "00010": parm_unit=" &deg;C"; parm_nm = "Water temperature"; break;
						case "00011": parm_unit=" &deg;F"; parm_nm = "Water temperature"; break;
						case "00095": parm_unit=" &micro;S"; parm_nm = "Specific conductance @ 25 &deg;C"; break;
						case "00300": parm_unit=" mg/L"; parm_nm = "Dissolved oxygen"; break;
						case "00400": parm_unit=" units"; parm_nm = "pH"; break;
						case "00480": parm_unit=" ppt"; parm_nm = "Salinity"; break;
						case "00630": parm_unit=" mg/L as N"; parm_nm = "Nitrate + nitrite"; break;
						case "00665": parm_unit=" mg/L"; parm_nm = "Phosphorus"; break;
						case "63680": parm_unit=" FNU"; parm_nm = "Turbidity"; break;
						case "99133": parm_unit=" mg/L as N"; parm_nm = "Nitrate + nitrite"; break;
						case "99064": parm_unit=" ft"; parm_nm = "Observed elevation difference"; break;
						
					  }

					waterAlertDataNew += "<b>" + parm_nm + ":</b> " + data.data[g].most_recent_value.split(" ")[0] + parm_unit + "<br/>&nbsp;&nbsp;on " + data.data[g].most_recent_value.split(" ")[2] + " at " + data.data[g].most_recent_value.split(" ")[4] + " " + data.data[g].most_recent_value.split(" ")[5] + "&nbsp;(DD " + data.data[g].dd_no + ")<br />";	

				}
				
				//set subscription data type
				var subscribeType= siteGroup;
				if (hasDataCode == "w2") {subscribeType = "qw";}
					
				//add water alert subscribe button				
				waterAlertDataNew += "<br /><button data-dojo-type='dijit/form/Button' style='font-size:small;' onClick='window.open(\"" + "https://water.usgs.gov/wateralert/subscribe2/index.html?site_no=" + graphics2[f].attributes.site_no + "&type_cd=" + subscribeType + "\")' type='button'>Subscribe to WaterAlert</button>";
				
				//update site template
				graphics2[f].setAttributes( {"site_no":graphics[f].attributes.site_no, "site_name":graphics[f].attributes.site_name, "siteTypeText":graphics[f].attributes.siteTypeText, "agency":graphics[f].attributes.agency, "waterAlertData":waterAlertDataNew });
			*/

			  },
			  function (error) {
				console.log("Wateralert Retrieval Error: ", error.message);
			  }
			);
		}
	}
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
	var nwisWebURL = "/mapper/nwis/site/?";
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
	nwisWebURL += "&hasDataTypeCd=uv";

    // set the period for current conditions (real time) data
   	nwisWebURL += "&period=P" + rt_days + "D";

    // set parameters based on site type 
    // if non-qw data are requested
	var pcodes;
	switch (siteType) {
		case "chkSWAct": pcodes = rt_parms_sw; break;
		case "chkGWAct": pcodes = rt_parms_gw; break;
		case "chkSPAct": pcodes = rt_parms_sp; break;
		case "chkATAct": pcodes = rt_parms_at; break;
	}    
       	   
    // set the parameters if non-qw data are requested
    hasDataCode = getHasDataType(siteType);
    if (hasDataCode == "w1") {
      nwisWebURL += "&parameterCd=" + pcodes;
     }
    
    // set the parameters if qw data are requested
    if (hasDataCode == "w2") {
    	nwisWebURL += "&parameterCd=" + rt_parms_qw;
    }
	
	//console.log(nwisWebURL);
     	
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
		case "chkGWAct":gwActStandby.show(); break;
		case "chkSPAct":spActStandby.show(); break;
		case "chkATAct":atActStandby.show(); break;
	}

	// AJAX call to fetch sites
	var deferred = dojo.xhrGet(siteFileRequest);
}

function setMarkers_chkSWAct(xml, ioargs) {
	var site_no = "";
	var site_name = "";
	var cat_code = "";
	var agency = "";
	var siteTypeText = "";
	var nwisDataType = "";
	var emptySite = {"items":[]};
	var siteGroup = "sw";
	var siteStatus = "act";
	var glayer = map.getLayer(siteGroup + "_" + siteStatus + "_glayer");	

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

			// get the icon from the siteType and status - this could be a global icon
			// object for each site type, but we will leave this code and build the icon
			// on the fly in case we need to do scale dependent rendering
			var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/" + siteGroup + "_" + siteStatus + icon_postfix + ".png", icon_width, icon_height);
		
			// loop through the marker elements
			var nmarkers = 0;
			while( nmarkers < markers.length) {
		
				// get attributes
				site_no = markers[nmarkers].getAttribute("sno");
				site_name = markers[nmarkers].getAttribute("sna");
				cat_code = markers[nmarkers].getAttribute("cat");
				agency =  markers[nmarkers].getAttribute("agc");
				siteTypeText = getSiteTypeText(cat_code);
				nwisDataType = getNWISdataType();
				
                //set subscription data type
                var subscribeType="sw"
				var hasDataCode = getHasDataType(siteGroup);
				if (hasDataCode == "w2") {subscribeType = "qw";}
				
				//setup subscribe button in the event the getIVdata function fails
				var waterAlertData = "<hr><button data-dojo-type='dijit/form/Button' style='font-size:small;' onClick='window.open(\"" + "https://water.usgs.gov/wateralert/subscribe2/index.html?site_no=" + site_no  + "&type_cd=" + subscribeType + "\")' type='button'>Subscribe to WaterAlert</button>";

				// build the symbol
				var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(parseFloat(markers[nmarkers].getAttribute("lng")), parseFloat(markers[nmarkers].getAttribute("lat")),  new esri.SpatialReference({ wkid: 4326 })));
				var attr = {"site_no":site_no, "site_name":site_name, "siteTypeText":siteTypeText, "agency":agency, "waterAlertData":waterAlertData };										
				var siteTemplate = new esri.InfoTemplate("Site Information","<b>Site Number: </b>${site_no}<br /><b>Site Name: </b> ${site_name}<br /><b>Site Type: </b> ${siteTypeText}<br /><b>Agency: </b>${agency}<br /><a href=" + waterdataURL + "/nwis/" + nwisDataType + "?agency_code=${agency}&site_no=${site_no} target='_blank'>Access Data</a><br />${waterAlertData}");						
				var marker = new esri.Graphic(point, icon, attr, siteTemplate);
				
				// add symbol to graphics layer
				glayer.add(marker);
				
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
	}

	// hide the loading icon
	swActStandby.hide();
	
	//update the popups with IV data
	getIVdata(siteGroup);
		
}

function setMarkers_chkGWAct(xml, ioargs) {

	var site_no = "";
	var site_name = "";
	var cat_code = "";
	var agency = "";
	var siteTypeText = "";
	var nwisDataType = "";
	var emptySite = {"items":[]};
	var siteGroup = "gw";
	var siteStatus = "act";
	var glayer = map.getLayer(siteGroup + "_" + siteStatus + "_glayer");	
	
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

			// get the icon from the siteType and status - this could be a global icon
			// object for each site type, but we will leave this code and build the icon
			// on the fly in case we need to do scale dependent rendering
			var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/" + siteGroup + "_" + siteStatus + icon_postfix + ".png", icon_width, icon_height);
		
			// loop through the marker elements
			var nmarkers = 0;
			while( nmarkers < markers.length) {
		
				// get attributes
				site_no = markers[nmarkers].getAttribute("sno");
				site_name = markers[nmarkers].getAttribute("sna");
				cat_code = markers[nmarkers].getAttribute("cat");
				agency =  markers[nmarkers].getAttribute("agc");
				siteTypeText = getSiteTypeText(cat_code);
				nwisDataType = getNWISdataType();
				
                //set subscription data type
                var subscribeType="gw"
				var hasDataCode = getHasDataType(siteGroup);
				if (hasDataCode == "w2") {subscribeType = "qw";}

				//setup subscribe button in the event the getIVdata function fails
				var waterAlertData = "<hr><button data-dojo-type='dijit/form/Button' style='font-size:small;' onClick='window.open(\"" + "https://water.usgs.gov/wateralert/subscribe2/index.html?site_no=" + site_no + "&site_name=" + site_name + "&type_cd=" + subscribeType + "\")' type='button'>Subscribe to WaterAlert</button>";

				// build the symbol
				var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(parseFloat(markers[nmarkers].getAttribute("lng")), parseFloat(markers[nmarkers].getAttribute("lat")),  new esri.SpatialReference({ wkid: 4326 })));
				var attr = {"site_no":site_no, "site_name":site_name, "siteTypeText":siteTypeText, "agency":agency, "waterAlertData":waterAlertData };										
				var siteTemplate = new esri.InfoTemplate("Site Information","<b>Site Number: </b>${site_no}<br /><b>Site Name: </b> ${site_name}<br /><b>Site Type: </b> ${siteTypeText}<br /><b>Agency: </b>${agency}<br /><a href=" + waterdataURL + "/nwis/" + nwisDataType + "?agency_code=${agency}&site_no=${site_no} target='_blank'>Access Data</a><br />${waterAlertData}");	
				var marker = new esri.Graphic(point, icon, attr, siteTemplate);
		
				// add symbol to graphics layer
				glayer.add(marker);
		
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
	}

	// hide the loading icon
	gwActStandby.hide();
	
	//update the popups with IV data
	getIVdata(siteGroup);
}

function setMarkers_chkSPAct(xml, ioargs) {

	var site_no = "";
	var site_name = "";
	var cat_code = "";
	var agency = "";
	var siteTypeText = "";
	var nwisDataType = "";
	var emptySite = {"items":[]};
	var siteGroup = "sp";
	var siteStatus = "act";
	var glayer = map.getLayer(siteGroup + "_" + siteStatus + "_glayer");	

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

			// get the icon from the siteType and status - this could be a global icon
			// object for each site type, but we will leave this code and build the icon
			// on the fly in case we need to do scale dependent rendering
			var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/" + siteGroup + "_" + siteStatus + icon_postfix + ".png", icon_width, icon_height);
		
			// loop through the marker elements
			var nmarkers = 0;
			while( nmarkers < markers.length) {
		
				// get attributes
				site_no = markers[nmarkers].getAttribute("sno");
				site_name = markers[nmarkers].getAttribute("sna");
				cat_code = markers[nmarkers].getAttribute("cat");
				agency =  markers[nmarkers].getAttribute("agc");
				siteTypeText = getSiteTypeText(cat_code);
				nwisDataType = getNWISdataType();
				
                //set subscription data type
                var subscribeType="sp"
				var hasDataCode = getHasDataType(siteGroup);
				if (hasDataCode == "w2") {subscribeType = "qw";}	
							
				//setup subscribe button in the event the getIVdata function fails
				var waterAlertData = "<hr><button data-dojo-type='dijit/form/Button' style='font-size:small;' onClick='window.open(\"" + "https://water.usgs.gov/wateralert/subscribe2/index.html?site_no=" + site_no + "&site_name=" + site_name + "&type_cd=" + subscribeType + "\")' type='button'>Subscribe to WaterAlert</button>";

				// build the symbol
				var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(parseFloat(markers[nmarkers].getAttribute("lng")), parseFloat(markers[nmarkers].getAttribute("lat")),  new esri.SpatialReference({ wkid: 4326 })));
				var attr = {"site_no":site_no, "site_name":site_name, "siteTypeText":siteTypeText, "agency":agency, "waterAlertData":waterAlertData };										
				var siteTemplate = new esri.InfoTemplate("Site Information","<b>Site Number: </b>${site_no}<br /><b>Site Name: </b> ${site_name}<br /><b>Site Type: </b> ${siteTypeText}<br /><b>Agency: </b>${agency}<br /><a href=" + waterdataURL + "/nwis/" + nwisDataType + "?agency_code=${agency}&site_no=${site_no} target='_blank'>Access Data</a><br />${waterAlertData}");	
				var marker = new esri.Graphic(point, icon, attr, siteTemplate);
		
				// add symbol to graphics layer
				glayer.add(marker);
		
				// single quotes in site names are being interpreted as JSON strings and
				// causing a problem for the grid, so replace them with double-quotes
				if (site_name.indexOf("'") > -1) {
					site_name = site_name.replace(/'/g," ");
				}
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
	}

	// hide the loading icon
	spActStandby.hide();	
	
	//update the popups with IV data
	getIVdata(siteGroup);
}

function setMarkers_chkATAct(xml, ioargs) {

	var site_no = "";
	var site_name = "";
	var cat_code = "";
	var agency = "";
	var siteTypeText = "";
	var nwisDataType = "";
	var emptySite = {"items":[]};
	var siteGroup = "at";
	var siteStatus = "act";
	var glayer = map.getLayer(siteGroup + "_" + siteStatus + "_glayer");	

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

			// get the icon from the siteType and status - this could be a global icon
			// object for each site type, but we will leave this code and build the icon
			// on the fly in case we need to do scale dependent rendering
			var icon = new esri.symbol.PictureMarkerSymbol("./images/" + siteStatus + "/" + siteGroup + "_" + siteStatus + icon_postfix + ".png", icon_width, icon_height);
		
			// loop through the marker elements
			var nmarkers = 0;
			while( nmarkers < markers.length) {
		
				// get attributes
				site_no = markers[nmarkers].getAttribute("sno");
				site_name = markers[nmarkers].getAttribute("sna");
				cat_code = markers[nmarkers].getAttribute("cat");
				agency =  markers[nmarkers].getAttribute("agc");
				siteTypeText = getSiteTypeText(cat_code);
				nwisDataType = getNWISdataType();
				
                //set subscription data type
                var subscribeType="at"
				var hasDataCode = getHasDataType(siteGroup);
				if (hasDataCode == "w2") {subscribeType = "qw";}				
				
				//setup subscribe button in the event the getIVdata function fails
				var waterAlertData = "<hr><button data-dojo-type='dijit/form/Button' style='font-size:small;' onClick='window.open(\"" + "https://water.usgs.gov/wateralert/subscribe2/index.html?site_no=" + site_no + "&site_name=" + site_name + "&type_cd=" + subscribeType + "\")' type='button'>Subscribe to WaterAlert</button>";
		
				// build the symbol
				var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(parseFloat(markers[nmarkers].getAttribute("lng")), parseFloat(markers[nmarkers].getAttribute("lat")),  new esri.SpatialReference({ wkid: 4326 })));
				var attr = {"site_no":site_no, "site_name":site_name, "siteTypeText":siteTypeText, "agency":agency, "waterAlertData":waterAlertData };										
				var siteTemplate = new esri.InfoTemplate("Site Information","<b>Site Number: </b>${site_no}<br /><b>Site Name: </b> ${site_name}<br /><b>Site Type: </b> ${siteTypeText}<br /><b>Agency: </b>${agency}<br /><a href=" + waterdataURL + "/nwis/" + nwisDataType + "?agency_code=${agency}&site_no=${site_no} target='_blank'>Access Data</a><br />${waterAlertData}");		
				var marker = new esri.Graphic(point, icon, attr, siteTemplate);
		
				// add symbol to graphics layer
				glayer.add(marker);
		
				// single quotes in site names are being interpreted as JSON strings and
				// causing a problem for the grid, so replace them with double-quotes
				if (site_name.indexOf("'") > -1) {
					site_name = site_name.replace(/'/g," ");
				}
		
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
	}

	// hide the loading icon
	atActStandby.hide();	
	
	//update the popups with IV data
	getIVdata(siteGroup);
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
function errGet_chkSWAct(error, ioargs) {swActStandby.hide();}
function errGet_chkSWIna(error, ioargs) {swInaStandby.hide();}
function errGet_chkGWAct(error, ioargs) {gwActStandby.hide();}
function errGet_chkGWIna(error, ioargs) {gwInaStandby.hide();}
function errGet_chkSPAct(error, ioargs) {spActStandby.hide();}
function errGet_chkSPIna(error, ioargs) {spInaStandby.hide();}
function errGet_chkATAct(error, ioargs) {atActStandby.hide();}
function errGet_chkATIna(error, ioargs) {atInaStandby.hide();}
function errGet_chkOTAct(error, ioargs) {otActStandby.hide();}
function errGet_chkOTIna(error, ioargs) {otInaStandby.hide();}


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

	// overview map
	var ovMap = new esri.dijit.OverviewMap({
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

	ZoomManager(0);
}

function zoomURLState(selRegion) {
	stateZoomStore.fetchItemByIdentity({identity:selRegion,
		onItem : function(region) {
			var west = stateZoomStore.getValue(region, 'MinX');
			var south = stateZoomStore.getValue(region, 'MinY');
			var east = stateZoomStore.getValue(region, 'MaxX');
			var north = stateZoomStore.getValue(region, 'MaxY');
			var esriExtent = new esri.geometry.Extent(west, south, east, north, new esri.SpatialReference({wkid: 4326}));
			map.setExtent(esri.geometry.geographicToWebMercator(esriExtent));
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

		return;
	}

	// user zoomed out
	if (ZoomEnd < ZoomStart) {
		ZoomOutManager();
	} else {
		ZoomInManager();
	}
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
			clearGLayer("sw_act_glayer");drawTLayer("chkSWAct", "sw_act");disableDataTypeRadio(0);
		} else if (maxIndex == 1) {
			clearGLayer("gw_act_glayer");drawTLayer("chkGWAct", "gw_act");disableDataTypeRadio(1);
		} else if (maxIndex == 2) {
			clearGLayer("sp_act_glayer");drawTLayer("chkSPAct", "sp_act");disableDataTypeRadio(2);
		} else if (maxIndex == 3) {
			clearGLayer("at_act_glayer");drawTLayer("chkATAct", "at_act");disableDataTypeRadio(3);
		} else if (maxIndex == 4) {
			disableDataTypeRadio(4);
		}
		return;
	}

		// s2s
		if ((ZoomStart >= ClickLevelMax[maxIndex]) && (ZoomEnd >= ClickLevelMax[maxIndex])) {

			if (maxIndex == 0) {
				drawGLayer("chkSWAct", "sw_act_glayer");enableDataTypeRadio(0);
			} else if (maxIndex == 1) {
				drawGLayer("chkGWAct", "gw_act_glayer");enableDataTypeRadio(1);
			} else if (maxIndex == 2) {
				drawGLayer("chkSPAct", "sp_act_glayer");enableDataTypeRadio(2);
			} else if (maxIndex == 3) {
				drawGLayer("chkATAct", "at_act_glayer");enableDataTypeRadio(3);
			} else if (maxIndex == 4) {
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

	//new s2s so sites aren't requeried on zoom in.
	if ((ZoomStart >= ClickLevelMax[maxIndex]) && (ZoomEnd >= ClickLevelMax[maxIndex])) {
	}

	// n2n
	if ((ZoomStart < ClickLevelMax[maxIndex]) && (ZoomEnd < ClickLevelMax[maxIndex])) {

		if (maxIndex == 0) {
			drawTLayer("chkSWAct", "sw_act");disableDataTypeRadio(0);
		} else if (maxIndex == 1) {
			drawTLayer("chkGWAct", "gw_act");disableDataTypeRadio(1);
		} else if (maxIndex == 2) {
			drawTLayer("chkSPAct", "sp_act");disableDataTypeRadio(2);
		} else if (maxIndex == 3) {
			drawTLayer("chkATAct", "at_act");disableDataTypeRadio(3);
		} else if (maxIndex == 4) {
		}
		return;
	}

	// n2s
	if ((ZoomStart < ClickLevelMax[maxIndex]) && (ZoomEnd >= ClickLevelMax[maxIndex])) {
		if (maxIndex == 0) {
			hideTLayer("sw_act");drawGLayer("chkSWAct", "sw_act_glayer");enableDataTypeRadio(0);
		} else if (maxIndex == 1) {
			hideTLayer("gw_act");drawGLayer("chkGWAct", "gw_act_glayer");enableDataTypeRadio(1);
		} else if (maxIndex == 2) {
			hideTLayer("sp_act");drawGLayer("chkSPAct", "sp_act_glayer");enableDataTypeRadio(2);
		} else if (maxIndex == 3) {
			hideTLayer("at_act");drawGLayer("chkATAct", "at_act_glayer");enableDataTypeRadio(3);
		} else if (maxIndex == 4) {
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
	dijit.byId("zoomprev").disabled = navToolbar.isFirstExtent();
	dijit.byId("zoomnext").disabled = navToolbar.isLastExtent();
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
	navToolbar.activate(esri.toolbars.Navigation.ZOOM_IN);
}

function zoomOutTool() {
	if (dojo.isIE) {
		map.setMapCursor("url(images/nav_zoomout.png)");
	} else {
		map.setMapCursor("url(images/nav_zoomout.png),auto");
	}

	navToolbar.activate(esri.toolbars.Navigation.ZOOM_OUT);
}

function setSliderZoom(zoomLevel) {
	var levelIcon = "images/zoomlevels/zoom" + zoomLevel + ".png"
	dojo.byId("zoomLevelIcon").style.backgroundImage = "url('" + levelIcon + "')";
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
		var agc_code = search_sites[nsites].getElementsByTagName("agency_use_cd")[0].firstChild.nodeValue;
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
		
		//Refresh sites only after deferred is resolved
		setTimeout("ZoomManager(0)",1000);  
		
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

function getAquifer(mapPoint) {

	// only query web service is the checkbox is checked
	// and the zoom level is between 4 and 12
	if (!dojo.byId("chkAQ").checked){
		return;
	}

	aqMapX = mapPoint.x.toFixed(1);
	aqMapY = mapPoint.y.toFixed(1);

	// build web service URL
	aqURL = "./aquifers/?ptInfo=" +
	map.getLevel() + "," + aqMapX + "," + aqMapY

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
				'</table>'	


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
	// 1=all, 2=iv, 3=dv, 4=qw, 5=pk, 6=sv, 7=ad
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

