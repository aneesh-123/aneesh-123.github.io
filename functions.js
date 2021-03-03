 var MAPBOX_PUBLIC_ACCESS_TOKEN = "pk.eyJ1IjoiZnJvZ2NhdCIsImEiOiJlYmE4ZTE4ZGEzMDAxNWQ5MWIyYmQ0MmFhN2Q5MDUyMCJ9.2jx0Hl7cJmXX4I7pZ-FtYA";
    var MAPBOX_TERRAIN_RGB = "https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=" + MAPBOX_PUBLIC_ACCESS_TOKEN;

////////////////////////////////////////  MAP COMMANDS  /////////////////////////////////////////
     var map = L.map('map', 
                            minZoom = 0,
                            maxZoom = 18).setView([40.5930, -74.6345], 17);
     
     L.esri.basemapLayer('Topographic').addTo(map);
    
    const colorpicker = L.tileLayer.colorPicker(MAPBOX_TERRAIN_RGB, {
          attribution: "© <a href='https://www.mapbox.com/map-feedback/'>Mapbox</a>" +
            " © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>" +
            " <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
          minZoom: 0,
          maxZoom: 19,
          maxNativeZoom: 19,
          opacity: 0.0
        }).addTo(map);

////////////////////////////////////FUNCTIONS AND SUCH///////////////////////////////
      var buildingCoords = [];
      var layerGroup = [];
      var stormDrain;
      var streetCoords;
      var centerCoords;
      var outcome;
      var badStreet;
      var pollutionPotential;
      var dist_on_road = [];
      var GallonsPerYear;
      var average;
      var layers = [];
      var control = null;

      function displayTable(pollution){
        document.querySelector('#PollutionStatement').style.display = "none";
        document.querySelector('#Low').style.display = "none";
        document.querySelector('#Medium').style.display = "none";
        document.querySelector('#High').style.display = "none";
        //Display distance on road
        document.querySelector('#runoffReport').style.display = "block";
        document.getElementById('B1').innerHTML = dist_on_road[0];
        document.getElementById('B2').innerHTML = dist_on_road[1];
        document.getElementById('B3').innerHTML = dist_on_road[2];
        document.getElementById('B4').innerHTML = dist_on_road[3];
        document.getElementById('B5').innerHTML = average;
        //Display Gallons per year on roads
        document.getElementById('C1').innerHTML = AddCommas(Math.round(dist_on_road[0] * GallonsPerYear));
        document.getElementById('C2').innerHTML = AddCommas(Math.round(dist_on_road[1] * GallonsPerYear));
        document.getElementById('C3').innerHTML = AddCommas(Math.round(dist_on_road[2] * GallonsPerYear));
        document.getElementById('C4').innerHTML = AddCommas(Math.round(dist_on_road[3] * GallonsPerYear));
        document.getElementById('C5').innerHTML = AddCommas(Math.round(average * GallonsPerYear));
        
      }

      function AddCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

      function ButtonClickStyle(reference){
          var button = document.querySelector(reference);
          button.style.backgroundColor = "#00FF00";
          button.value = 'mark the 4 corners of your building';
      }

      function markDrain(event){
        L.circle([event.latlng.lat, event.latlng.lng], {radius: 3}).addTo(map);
        stormDrain = event.latlng;
        L.polyline([buildingCoords[0],stormDrain], {color: 'green'}).addTo(map);
      }

      function findClosestPoint(building, last){
        document.querySelector('#SelectStormDrain').style.display = "none";
        document.querySelector('#Confirm2').style.display = "none";
        
        map.removeControl(badStreet);
        drawFlowPath(0, "green");
        drawFlowPath(1, "yellow");
        drawFlowPath(2, "red");
        drawFlowPath(3, "blue");
        average = (dist_on_road[0] + dist_on_road[1] + dist_on_road[2] + dist_on_road[3])/4.0;

        document.querySelector('#PollutionStatement').style.display = "block";
        document.querySelector('#Low').style.display = "block";
        document.querySelector('#Medium').style.display = "block";
        document.querySelector('#High').style.display = "block";
        document.querySelector('#RoofArea').style.display = "none";
        document.querySelector('#GallonsPerInch').style.display = "none";
        document.querySelector('#GallonsPerYear').style.display = "none";
        }

 function drawFlowPath(buildingPoint, col){
    var leading_distance = 100000000000;
    var closest_point_segment = 0;
    for(a = 0; a < streetCoords.length-1; a++){
      if(buildingCoords[buildingPoint].distanceTo(streetCoords[a]) < leading_distance){
          closest_point_segment = a;
          leading_distance = buildingCoords[buildingPoint].distanceTo(streetCoords[a]);
      }
    }
    //console.log("point " + closest_point_segment + " distance " + leading_distance);
    var streetCoords_copy = [];
    streetCoords_copy[0] = buildingCoords[buildingPoint];
    
    dist_on_road[buildingPoint] = 0;
    for(i = 0; i <= streetCoords.length-closest_point_segment-1; i++){
      streetCoords_copy[i+1] = streetCoords[i+closest_point_segment];
      if(i > 0){
        //console.log("Entered ");
        dist_on_road[buildingPoint] += streetCoords_copy[i].distanceTo(streetCoords_copy[i+1]);
      }
    }
    //console.log(streetCoords_copy);
    var line = L.motion.polyline([streetCoords_copy], {
          color: col
        }, {
          auto: true,
          duration: 4000,
        }, {
          removeOnEnd: true,
        }).addTo(map);

    layers.push(line);
    dist_on_road[buildingPoint] = Math.round(dist_on_road[buildingPoint]*1000.0)/1000.0;
    //console.log("ditance on road " + dist_on_road[buildingPoint]);

    }


 function appendBuildingPoint(e){
          var position = e.latlng;
           //layerGroup.push(L.circle(position, {radius: 3}).addTo(map));
           var circle = L.circle(position,{radius: 3}).addTo(map)
           layers.push(circle);
           buildingCoords.push(position);
           if(buildingCoords.length == 4){
              centerCoords = 
                            [(buildingCoords[0].lat + buildingCoords[2].lat) / 2, 
                             (buildingCoords[0].lng + buildingCoords[2].lng) / 2];
              polygonLayer = L.polygon(buildingCoords, {color: 'red'});
              layerGroup.push(polygonLayer.addTo(map));
              layers.push(polygonLayer);
              var button = document.querySelector('#SelectCoordsButton');
              button.style.background = "#FCBE03";
              button.value = "Is this correct?";
              document.querySelector('#Confirm').style.display = "block";
              document.querySelector('#NotCorrect').style.display = "block";
          }          
        }

      function determineRunoff(Coords){
        //convert to feet
        var width = map.distance(Coords[0], Coords[1]) * 3.28084;
        var length = map.distance(Coords[1], Coords[2]) * 3.28084;
        var areaFeet = length * width;
        var runoffPerInch = areaFeet * 0.62;
        var runoffPerYear = runoffPerInch * 46.3;
        //display everything
        document.querySelector('#RoofArea').style.display = "block";
        document.querySelector('#RoofArea').value = "Roof Area = " +(Math.round(100 * areaFeet)/100) + " square feet";
        document.querySelector('#GallonsPerInch').style.display = "block";
        document.querySelector('#GallonsPerInch').value = "Runoff Rate = " + (Math.round(100*runoffPerInch)/100) + " gallons / inch of rain";
        document.querySelector('#GallonsPerYear').style.display = "block";
        GallonsPerYear = (Math.round(100*runoffPerYear)/100);
        document.querySelector('#GallonsPerYear').value = "Annual Runoff = " + GallonsPerYear + " gallons per year";
        document.querySelector('#SelectStormDrain').style.display = "block";
        var stormCoords;
        map.on('click', function(e){
          stormCoords = e.latlng;
          drawStreet(centerCoords,stormCoords);
        });
      }
      
      function drawStreet(building, drain){
          control =  L.Routing.control({
          waypoints: [
            L.latLng(building),
            L.latLng(drain)
          ],
          waypointMode: 'snap',
        }).addTo(map);
        layers.push(control);
        badStreet = control;
        control.on('routeselected', function(e) {
          streetCoords = e.route.coordinates;
          outcome = checkFlowDirection(streetCoords);   
          if(outcome == false){
            document.querySelector('#SelectStormDrain').value = "Error, that is uphill. The water will not flow in that direction. Drag the marker to fix this"
            document.querySelector('#SelectStormDrain').style.backgroundColor = "#FF0000";
            //map.removeControl(control);
          }
          else{
            document.querySelector('#SelectStormDrain').value = "Great! Adjust the blue markers if the street that is drawn does not look as intended";
            document.querySelector('#SelectStormDrain').style.backgroundColor = '#03FCCA';
            document.querySelector('#Confirm2').style.display = "block";
          }
        });
      }

      function checkFlowDirection(line){
          var target = line.length;
          var correct = 0;
          var previous = 0;
          for(i = 0; i < target; i++){
              var elevation = ElevationFinder([line[i].lat, line[i].lng]);
              if(elevation == NaN){
                //console.log("Cant find this point " + i);
                target = target - 1;
              }
              else{
                if(elevation <= previous){
                  correct++;
                }
              previous = elevation;
              //console.log("Elevation of " + i + " " + elevation);
              }
          }
          if(correct > (target * 0.6)){
            return true;
          }
          else{
            return false;
          }
        }

      function ElevationFinder(Coords){
        var a = colorpicker.getColor(Coords);
        var h = NaN;
        if (a !== null){
          h = -10000 + ((a[0] * 256 * 256 + a[1] * 256 + a[2]) * 0.1);
        }
        return h.toFixed(1);
        }

      function Restart(){
        document.querySelector('#runoffReport').style.display = "none";
        document.querySelector('#Confirm').style.display = "none";
        document.querySelector('#NotCorrect').style.display = "none";
        document.querySelector('#RoofArea').style.display = "none";
        document.querySelector('#GallonsPerInch').style.display = "none";
        document.querySelector('#GallonsPerYear').style.display = "none";
        document.querySelector('#SelectStormDrain').style.display = "none";
        document.querySelector('#Confirm2').style.display = "none";
        document.querySelector('#PollutionStatement').style.display = "none";
        document.querySelector('#Low').style.display = "none";
        document.querySelector('#Medium').style.display = "none";
        document.querySelector('#High').style.display = "none";


        if(control != null){
        map.removeControl(control); 
        }
        control = null;
        for(j = 0; j < layers.length; j++){
          map.removeLayer(layers[j]); 
        }
        map.off('click', drawStreet(centerCoords, streetCoords));
        document.querySelector('#SelectStormDrain').value = "Mark the approximate location of the nearest Storm Drain in relation to the building by clicking on the map";
        document.querySelector('#SelectCoordsButton').style.display = "block";
        document.querySelector('#SelectCoordsButton').value = "click here to select your building";
        document.querySelector('#SelectCoordsButton').style.backgroundColor = "#7b38d8";
        buildingCoords = [];
      }
