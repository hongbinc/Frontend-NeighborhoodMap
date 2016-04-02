/**
 * Main JS file for NeighborhoodMap Application
 * Model and View Model
 */
function mapViewModel() {
    var self = this,
        map,
        service,
        mapOptions;
        
    var defaultNeighborhood = "New York";
    self.neighborhood = ko.observable(defaultNeighborhood); 

    // Load Foursquare data
    function LoadFourSquare() {


    };
    // initializing the Google Map
    function initializeMap() {

        mapOptions = {
            zoom: 15,
            disableDefaultUI: true,
           // center: { lat: -42.40, lng: 73.45 },
        };

        if (typeof google == 'undefined') {
            $('#googleMap-API-error').html('<h2>There are errors when retrieving map data.</h2><h2>Please try refresh page later.</h2>');
            return;
        }
 
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        //infowindow = new google.maps.InfoWindow();
        $('#map').height($(window).height());

    };
    window.addEventListener('resize', function (e) {
  
       //////////////////
    });

    self.computedNeighborhood = function () {

        if(self.neighborhood() != ''){
           getNeighborhood(self.neighborhood());
        }
    };
    self.neighborhood.subscribe(self.computedNeighborhood);

    // request neighborhood location data from PlaceService
    function getNeighborhood(neighborhood) {
    
        var request = {
            query: neighborhood
        };
        service = new google.maps.places.PlacesService(map);
        service.textSearch(request, neighborhoodCallback);
    };

    // Checks that the PlacesServiceStatus is OK, and pass the place data
    function neighborhoodCallback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            mapCenter(results[0]);
        }
    };

    function mapCenter(neighborhoodPlace) {

        var lat = neighborhoodPlace.geometry.location.lat();
        var lng = neighborhoodPlace.geometry.location.lng();
        var neighborhoodShowOnMap = new google.maps.LatLng(lat, lng);

        map.setCenter(neighborhoodShowOnMap);
    };

    function initNeighborhood(neighborhood) {
        getNeighborhood(neighborhood);
    };
    
    initializeMap();
    initNeighborhood(defaultNeighborhood);

};

// initialize mapViewModel 
$(function () {

    ko.applyBindings(new mapViewModel());

});