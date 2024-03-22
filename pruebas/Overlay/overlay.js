let map;
let coors = [];
let status = "";
let takeoffPoint = [];
let landingPoint = [];
let toffMarker = 'null';
let lndMarker = 'null';
let aoiPolygon = 'null';
let aoivert1 = [];
let aoivert1Marker;
let aoivert2 = [];
let aoistatus = 1;
let lngarray = []; let lngmin = []; let lngmax = [];
let latarray = []; let latmin = []; let latmax = [];
let bounds = [];
let wps = [];
let aoiSideDist = [];
let routeDirect = 0;
let height = 0;
let overlap = 0;
let sidelap = 0;
let passWidth = 0;
const sensorWidth = 35.8;
const focalLength = 20;
let heightFlag = false;
let overlapFlag = false;
let sidelapFlag = false;
let toffFlag = false;
let lndFlag = false;
let aoiFlag = false;
let uasPath = 'null';
var toffMarkerIcon = L.icon({
    iconUrl: 'iconos/toffMarkerIcon.png',
    iconSize: [55, 60],
    iconAnchor: [27.5, 53],
    popupAnchor: [27.5, 0],
    shadowUrl: 'iconos/lndMarkerIcon.png',
    shadowSize: [47, 47],
    shadowAnchor: [24, 47]
});
var lndMarkerIcon = L.icon({
    iconUrl: 'iconos/lndMarkerIcon.png',
    iconSize: [47, 47],
    iconAnchor: [23.5, 47],
    popupAnchor: [23.5, 0]
});
var geojsonFeature = {
    "type": "LineString",
    "coordinates":coors
};

function init(){
    map = L.map('map').setView([40.4405346, -3.7238251], 17);
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    generateListeners();

    map.on('click',function(e){
        if(uasPath!=='null'){
            map.removeLayer(uasPath);
        }
        wps = [];
        if(status=='TOFF'){
            if(toffMarker!=='null'){
                map.removeLayer(toffMarker);
            } 
            setToff(e);
            toffFlag = true;
        }
        if(status=='LANDING'){
            if(lndMarker!=='null'){
                map.removeLayer(lndMarker);
            }
            setLanding(e);
            lndFlag = true;
        }
        if(status=='AOI'){
            if(aoistatus==1){
                aoivert1 = e.latlng;
                setAOIvert1Marker(e);
                aoistatus = 2;
                document.getElementById("aoi1TrackIcon").style.opacity = 0.3;
                document.getElementById("aoi2TrackIcon").style.opacity = 1;
                aoiFlag = false;
                if(uasPath!=='null'){
                    map.removeLayer(uasPath);
                }
                wps = [];
            } else if(aoistatus==2){
                aoivert2 = e.latlng;
                plotaoi();
                aoistatus = 1;
                document.getElementById("aoi2TrackIcon").style.opacity = 0.3;
                document.getElementById("aoi1TrackIcon").style.opacity = 1;
                aoiFlag = true;
                if(uasPath!=='null'){
                    map.removeLayer(uasPath);
                }
                wps = [];
            }
        }
        if(heightFlag && overlapFlag && sidelapFlag && toffFlag && lndFlag && aoiFlag){
            calculateRoute();
        }  
    })
}

function changeStatus(_status){
    status = _status
    document.getElementById("toffTrackIcon").style.opacity = 0.3;
    document.getElementById("lndTrackIcon").style.opacity = 0.3;
    document.getElementById("aoi1TrackIcon").style.opacity = 0.3;
    document.getElementById("aoi2TrackIcon").style.opacity = 0.3;
    if (_status=='TOFF'){
        document.getElementById("toffTrackIcon").style.opacity = 1;
        toffFlag = false;
    } else if(_status=='LANDING'){
        document.getElementById("lndTrackIcon").style.opacity = 1;
        lndFlag = false;
    } else if(_status=='AOI'){
        document.getElementById("aoi1TrackIcon").style.opacity = 1;
        aoiFlag = false;
    }
}

function setLanding(e){
    console.log('Status Landing ' + e.latlng );
    landingPoint = e.latlng;
    lndMarker = L.marker(e.latlng, {icon: lndMarkerIcon}).addTo(map);
}

function setToff(e){
    console.log('Status Take off ' + e.latlng );
    takeoffPoint = e.latlng;
    toffMarker = L.marker(e.latlng, {icon: toffMarkerIcon}).addTo(map);
}

function plotaoi(){
    map.removeLayer(aoivert1Marker);
    lngarray = [aoivert1.lng, aoivert2.lng];
    latarray = [aoivert1.lat, aoivert2.lat];
    lngmin = Math.min.apply(null,lngarray);
    lngmax = Math.max.apply(null,lngarray);
    latmin = Math.min.apply(null,latarray);
    latmax = Math.max.apply(null,latarray);
    bounds = [[latmin,lngmin], [latmax,lngmin], [latmax,lngmax], [latmin,lngmax], [latmin,lngmin]];
    aoiPolygon = L.polygon(bounds, {color: 'red', weight: 3, fill: true}).addTo(map);
}

function setAOIvert1Marker(e){
    if(aoiPolygon!=='null'){
        map.removeLayer(aoiPolygon);
    }
    aoivert1Marker = L.marker(e.latlng).addTo(map);
}

function generateListeners(){
    document.getElementById("heightInput").addEventListener('input',function(){
        let heightstr = document.getElementById("heightInput").value;
        let heightaux = parseFloat(heightstr);
        if(heightaux!=NaN){
            height = heightaux;
            heightFlag = true;
            console.log(height)
        } else{
            heightFlag = false;
        }
        if(heightFlag && overlapFlag && sidelapFlag && toffFlag && lndFlag && aoiFlag){
            calculateRoute();
        }
    });
    
    document.getElementById("overlapInput").addEventListener('input',function(){
        let overlapstr = document.getElementById("overlapInput").value;
        let overlapaux = parseFloat(overlapstr);
        if(overlapaux!=NaN && overlapaux <= 100 && overlapaux >= 0){
            overlap = overlapaux;
            overlapFlag = true;
            console.log(overlap)
        } else{
            overlapFlag = false;
        }
        if(heightFlag && overlapFlag && sidelapFlag && toffFlag && lndFlag && aoiFlag){
            calculateRoute();
        }
    });

    document.getElementById("sidelapInput").addEventListener('input',function(){
        let sidelapstr = document.getElementById("sidelapInput").value;
        let sidelapaux = parseFloat(sidelapstr);
        if(sidelapaux!=NaN  && sidelapaux <= 100 && sidelapaux >= 0){
            sidelap = sidelapaux;
            sidelapFlag = true;
            console.log(sidelap)
        } else{
            sidelapFlag = false;
        }
        if(heightFlag && overlapFlag && sidelapFlag && toffFlag && lndFlag && aoiFlag){
            calculateRoute();
        }
    });
}

function calculateRoute(){
    if(uasPath!=='null'){
        map.removeLayer(uasPath);
    }
    wps = [];
    let imageWidth = getImageWidth(height);
    passWidth = getPassWidth(sidelap,imageWidth);
    console.log(passWidth)
    let minvert = ltlng2met([latmin, lngmin, 0]);
    let maxvert = ltlng2met([latmax, lngmax, 0]);
    let toffmet = ltlng2met([takeoffPoint.lat,takeoffPoint.lng,0]);
    let toffdist = [];
    toffdist[0] = calcDist2points(toffmet,minvert);
    let aux1 = calcDist2points(toffmet,[maxvert[0], minvert[1], 0]);
    toffdist[1] = aux1;
    aux1 = calcDist2points(toffmet,maxvert);
    toffdist[2] = aux1;
    aux1 = calcDist2points(toffmet,[minvert[0], maxvert[1], 0]);
    toffdist[3] = aux1;
    let mintoffdist = Math.min.apply(null,toffdist);
    let startingvert = [];
    if(mintoffdist==toffdist[0]){
        startingvert = minvert;
    }else if(mintoffdist==toffdist[1]){
        startingvert = [maxvert[0], minvert[1], 0];
    }else if(mintoffdist==toffdist[2]){
        startingvert = maxvert;
    }else if(mintoffdist==toffdist[3]){
        startingvert = [minvert[0], maxvert[1], 0];
    }
    let sides = [];
    sides[0] = maxvert[0] - minvert[0];
    sides[1] = maxvert[1] - minvert[1];
    let maxside = Math.max.apply(null,sides);
    let passDirection = 0;
    if(sides[1]==maxside){
        passDirection = 1;
    }
    let crossDirection = 0;
    if(passDirection==0){
        crossDirection = 1;
    }
    let passWise = 1;
    let crossWise = 1;
    if(startingvert[0] > minvert[0]){
        if(passDirection==0){
            passWise = -1;
        } else{
            crossWise = -1;
        }
    }
    if(startingvert[1] > minvert[1]){
        if(passDirection==1){
            passWise = -1;
        } else{
            crossWise = -1;
        }
    }
    wps[0] = toffmet;
    let inc = [0, 0, 0];
    inc[crossDirection] = crossWise*imageWidth/2;
    let sum = [];
    sum = sumpoints(startingvert,inc);
    wps[wps.length] = sum;
    let crossPass = 'PASS';
    let whileFlag = true;
    while(whileFlag){
        inc = [0, 0, 0];
        let newwpt = wps[wps.length - 1];
        if(crossPass=='PASS'){
            inc[passDirection] = passWise*maxside;
            newwpt = sumpoints(newwpt, inc);
            wps[wps.length] = newwpt;
            passWise = -1*passWise;
            crossPass = 'CROSS';
        } else if(crossPass=='CROSS'){
            inc[crossDirection] = crossWise*passWidth;
            newwpt = sumpoints(newwpt, inc);
            wps[wps.length] = newwpt;
            if(crossWise==1){
                if(newwpt[crossDirection]>maxvert[crossDirection]){
                    whileFlag = false;
                }
            } else if(crossWise==-1){
                if(newwpt[crossDirection]<minvert[crossDirection]){
                    whileFlag = false;
                }
            }
            crossPass = 'PASS';
        }
    }
    let lndmet = ltlng2met([landingPoint.lat,landingPoint.lng,0]);
    wps[wps.length] = lndmet;
    let route = [];
    for(var i = 0; i < wps.length; i++){
        let aux = met2ltlng(wps[i]);
        route[route.length] = aux;
    }
    let path = [];
    let dims = [0, 1];
    for(var j = 0; j < route.length; j++){
        let element = route[j];
        let selectedElement = [];
        for(var k = 0; k < dims.length; k++){
            selectedElement[selectedElement.length] = element[dims[k]];
        } 
        path[path.length] = selectedElement;
    }
    uasPath = L.polyline(path, {color: 'blue'}).addTo(map);
}

function ltlng2met(point){
    let source = new proj4.Proj('EPSG:4326');  //(wgs84) https://epsg.io/4326
    let dest = new proj4.Proj('EPSG:3857');   //(pseudo mercator) https://epsg.io/3857
    return proj4(source, dest, point);
}

function met2ltlng(point){
    let dest = new proj4.Proj('EPSG:4326');  //(wgs84) https://epsg.io/4326
    let source = new proj4.Proj('EPSG:3857');   //(pseudo mercator) https://epsg.io/3857
    return proj4(source, dest, point);
}

function getPassWidth(_sidelap,_imageWidth){
    return _imageWidth * (100 - _sidelap)/100;
}

function getImageWidth(_height){
    return _height * sensorWidth/focalLength;
}

function calcDist2points(_point1,_point2){
    let x = _point2[1] - _point1[1];
    let y = _point2[0] - _point1[0];
    x = x ** 2;
    y = y ** 2;
    return Math.sqrt(x + y);
}

function sumpoints(_point1,_point2){
    let x = _point1[1] + _point2[1];
    let y = _point1[0] + _point2[0];
    let z = _point1[2] + _point2[2];
    let sum = [y, x, z];
    return sum;
}

function clearMission(){
    status = "IDLE";
    takeoffPoint = [];
    landingPoint = [];
    aoivert1 = [];
    aoivert1Marker;
    aoivert2 = [];
    aoistatus = 1;
    lngarray = []; lngmin = []; lngmax = [];
    latarray = []; latmin = []; latmax = [];
    bounds = [];
    wps = [];
    aoiSideDist = [];
    routeDirect = 0;
    height = 0;
    overlap = 0;
    sidelap = 0;
    passWidth = 0;
    heightFlag = false;
    overlapFlag = false;
    sidelapFlag = false;
    toffFlag = false;
    lndFlag = false;
    aoiFlag = false;
    document.getElementById("heightInput").value = "";
    document.getElementById("overlapInput").value = "";
    document.getElementById("sidelapInput").value = "";
    if(toffMarker!=='null'){
        map.removeLayer(toffMarker);
        toffMarker = 'null';
    } 
    if(lndMarker!=='null'){
        map.removeLayer(lndMarker);
        lndMarker = 'null';
    } 
    if(aoiPolygon!=='null'){
        map.removeLayer(aoiPolygon);
        aoiPolygon = 'null';
    }
    if(uasPath!=='null'){
        map.removeLayer(uasPath);
        uasPath = 'null';
    }  
}