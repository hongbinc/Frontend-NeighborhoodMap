/**
 * Main JS file for NeighborhoodMap Application
 * Model and View Model
 */
function mapViewModel() {
    var self = this,
        map,
        service,
        mapOptions,
        lat,
        lng;
    var defaultKeyword = "";
    var defaultNeighborhood = "New York";
    self.neighborhood = ko.observable(defaultNeighborhood); 
    self.keyword = ko.observable('');
    // Load Foursquare data
    function LoadFourSquare() {
        var url_prefix = 'https://api.foursquare.com/v2/venues/search?client_id=';
        var client_id = '1I25VINMXH4AXMWCEUDLLBDD0LIWFSBVNXRCM3USQQOBCBSW';
        var client_secret = '&client_secret=MDMKL344UHNL4NDWGNN5HVQBZEDPWMIUOOGCODYQV5PFTE2R';
        var version = '&v=20130815&venuePhotos=1';
        var location = '&ll' + lat + ',' + lng;
        var keyword = self.keyword();
        var search = '&query' + keyword;
        var FourSquareURL = url_prefix + client_id + client_secret + version + location + search;


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
        console.log(self.keyword());
    };
    self.neighborhood.subscribe(self.computedNeighborhood);
    self.keyword.subscribe(self.computedNeighborhood);
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

    // Get neighborhood's real lat and lng, set up map center 
    function mapCenter(neighborhoodPlace) {

        lat = neighborhoodPlace.geometry.location.lat();
        lng = neighborhoodPlace.geometry.location.lng();
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