var myLat = 0;
var myLng = 0;
var me = new google.maps.LatLng(myLat, myLng);
var map;
var marker;
var infowindow = new google.maps.InfoWindow();
	
var myOptions = {
	zoom: 15, // The larger the zoom number, the bigger the zoom
	center: me,
	mapTypeId: google.maps.MapTypeId.ROADMAP
};

//renders map
function init()
{
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	getMyLocation();
}
	
//gets my location via navigator
function getMyLocation() {
	if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
		navigator.geolocation.getCurrentPosition(function(position) {
			myLat = position.coords.latitude;
			myLng = position.coords.longitude;
			changeMap()
		});
	}
	else {
		alert("Geolocation is not supported by your web browser.  What a shame!");
	}
}
	
//grabs data from API
function changeMap(){
var request = new XMLHttpRequest();
var params = "login=uxHHQ3nT&lat=" + myLat + "&lng=" + myLng;
var url = 'https://shielded-plains-68496.herokuapp.com/sendLocation';
request.open('POST', url, true);
request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
request.onreadystatechange = function(){
		if(request.readyState == 4 && request.status == 200){
			rawData = request.responseText;
			messages = JSON.parse(rawData);
			addLandmarks(messages);
			}
		}
request.send(params);
}
	
//adds landmarks to map and updates closest landmark
function addLandmarks (messages) {
	nearest_landmark;
	var landmark = messages.landmarks[0];
	var nearest_landmark_cord = new google.maps.LatLng(landmark.geometry.coordinates[1], landmark.geometry.coordinates[0]);
	my_cordinates = new google.maps.LatLng(myLat, myLng);
	var nearest_landmark = messages.landmarks[0];
	var nearest_distance = google.maps.geometry.spherical.computeDistanceBetween(my_cordinates, nearest_landmark_cord)/1609.34;
	for(i = 0; i < messages.landmarks.length; i++){
		
				landmark = messages.landmarks[i];
		
				landmark_cord = new google.maps.LatLng(landmark.geometry.coordinates[1], landmark.geometry.coordinates[0]);
				if(google.maps.geometry.spherical.computeDistanceBetween(my_cordinates, landmark_cord)/1609.34 < nearest_distance) {
					nearest_landmark = landmark;
					nearest_distance = google.maps.geometry.spherical.computeDistanceBetween(my_cordinates, landmark_cord)/1609.34
					nearest_landmark_cord = landmark_cord;
				}
		
				var image = 'images/british-museum-512.png';
				marker_landmark = new google.maps.Marker({
				position: landmark_cord,
				content: landmark.properties.Details,
				icon: image
				});
				
				marker_landmark.setMap(map);
				
				//callback resource: https://stackoverflow.com/questions/3059044/google-maps-js-api-v3-simple-multiple-marker-example
				(function(marker_landmark, landmark){
				
				google.maps.event.addListener(marker_landmark, 'click', function(e) {
				infowindow.setContent(marker_landmark.content);
				infowindow.open(map, marker_landmark);
				});
				})(marker_landmark, landmark);
	
	}
	addMeToMap(nearest_landmark, nearest_distance);
	addPeopleToMap(messages);
}

//adds me to map and renders polyline to closest landmark
function addMeToMap(nearest_landmark, nearest_distance)
{
	me = new google.maps.LatLng(myLat, myLng);
	
	// Update map and go there...
	map.panTo(me);
	
	// Create a marker
	marker = new google.maps.Marker({
		position: me,
		content: "Here I Am!" + '</br><b>' + "Nearest Landmark Name: </b>" + nearest_landmark.properties.Location_Name + '</br><b>' + "Miles away: </b>" + nearest_distance.toFixed(3)
	});
	marker.setMap(map);
		
	// Open info window on click of marker
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(this.content);
		infowindow.open(map, this);
	});
	
	//polymap resource: https://developers.google.com/maps/documentation/javascript/examples/polyline-simple
	var pathCoordinates = [
		{lat: myLat, lng: myLng},
		{lat: nearest_landmark.geometry.coordinates[1], lng: nearest_landmark.geometry.coordinates[0]}
        ];
	
        var path = new google.maps.Polyline({
          path: pathCoordinates,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });

        path.setMap(map);
}

//adds people to the map and calculates distance between me and people
function addPeopleToMap(messages)
{
	my_cordinates = new google.maps.LatLng(myLat, myLng);
	for(i = 0; i < messages.people.length; i++){
		
				person = messages.people[i];
		
				person_cord = new google.maps.LatLng(person.lat, person.lng);
		
				//computes distance between me and different people
				person_distance = google.maps.geometry.spherical.computeDistanceBetween(my_cordinates, person_cord)/1609.34
				
				var image = 'images/person-icon-red-4.png';
				marker_person = new google.maps.Marker({
				position: person_cord,
				content: "<b>Login: </b>" + person.login + "</br><b>Miles away: </b>" + person_distance.toFixed(3),
				icon: image
				});
				
				marker_person.setMap(map);
		
				(function(marker_person, person){
				
				google.maps.event.addListener(marker_person, 'click', function(e) {
				infowindow.setContent(marker_person.content);
				infowindow.open(map, marker_person);
				});
				})(marker_person, person);
	
	}	
}
