  // Fetch the URL to retrive the data request
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

//Set the size of markers: magnitute of earthquake * 30000
function size(mag) {
    return mag * 30000;
}

// Assign function which sets colours of markers depending on the magnitutde 
function circleColour(mag) {
    if (mag <= 1) {
        return "##F2D7D5";
    } else if (mag <= 2) {
        return "#E6B0AA";
    } else if (mag <= 3) {
        return "#D98880";
    } else if (mag <= 4) {
        return "#CD6155";
    } else if (mag <= 5) {
        return "#C0392B ";
    } else {
        return "#A93226";
    };
  }

// Request the JSON data from the queryURL 
d3.json(queryURL, function(data) {
//console.log(data.features);
// Send 'data.features' object to a function called 'layerCharacteristics':
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    var earthquakes = L.geoJSON(earthquakeData, {

    })
    // Define a function which will lopp for each feature in the data.features
    // Give each feature a popup describing location and magnitude of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3> Location: " + feature.properties.place + 
        "</h3><hr><p> Date:" + new Date(feature.properties.time) + "</p>" +
        "</h3><hr><p> Magnitude: " + feature.properties.mag + "</p>")
    }
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,

        // Add the circular markers to the layer:
        pointToLayer: function (feature, coordinates) {
            var earthquakeMarkers = {
                radius: size(feature.properties.mag),
                fillColor: circleColour(feature.properties.mag),
                fillOpacity: 0.40,
                stroke: true,
                strokeStyle: "#F9E79F",
                weight: 0.75
            }
            return L.circle(coordinates, earthquakeMarkers);
        }
    });

    // Add earthquakes layer to the createMap
    createMap(earthquakes);
}

// Create a function for earthquake map
function createMap(earthquakes) {

// Define light map layer:
    var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
    });

    var smoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
    });

  // Define satellite map layer:
    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
    });

    //Define a baseMap to bind to base layer earthquake
    var baseMaps = {
        "Light Map": light,
        "Smooth Dark" : smoothDark,
        "Satellite view" : satellite
    };


    //Create overlayer which will be the earthquakes
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates" : tectonicPlates

    };

    //Now create the map, to load the streetmap which will be display when loading html
    var myMap = L.map("map", {
        center: [31.63, -7.99],
        zoom: 2,
    // add the tectonic Plates to the layers in myMap
        layers: [light, smoothDark, satellite, earthquakes, tectonicPlates]
    });

    //Create layer control and add it to baseMaps and overlayMaps
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    //Create a legend:
    var legend = L.control({
        position: 'bottomright'
    });


  legend.onAdd = function () {
  
      var div = L.DomUtil.create('div', 'info legend'),
          magnitude = [0, 1, 2, 3, 4, 5];
  
      for (var i = 0; i < magnitude.length; i++) {
          div.innerHTML +=
              '<i style="background:' + circleColour(magnitude[i] + 1) + '"></i> ' + 
      + magnitude[i] + (magnitude[i + 1] ? ' - ' + magnitude[i + 1] + '<br>' : ' + ');
      }
  
      return div;
  };
  
  legend.addTo(myMap);

}

// -----------------------------------------------------------------------------
// ----------------------- PART 2: Tectonic plates -----------------------------
// -----------------------------------------------------------------------------
//Create a new layer for tectonic plates
var tectonicPlates = new L.LayerGroup();

    //Connect to (geo?)JSON file with tectonic plates boundries
    d3.json("Data/PB2002_plates.json", function(plates) {

        function onEachFeature(feature, layer) {
            layer.bindPopup(
                "<h3> Tectonic plate: " + feature.properties.PlateName + "/<h3>"
            )
            console.log(feature.properties.PlateName)
        }
        
        
        //Assing the data form file to a layerGroup
        L.geoJson(plates, {

            onEachFeature: onEachFeature,
            
            style: function () {
                return {
                    color: "#F4D03F",
                    weight: 3,
                    fillOpacity: 0
                }
            }
            
        }).addTo(tectonicPlates);

        tectonicPlates.addTo(myMap);
    });

   


// -----------------------------------------------------------------------------
// ----------------------- END of PART 2: Tectonic plates ----------------------
// -----------------------------------------------------------------------------



