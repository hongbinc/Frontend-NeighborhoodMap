/**
 * Main JS file for NeighborhoodMap Application
 * Model and View Model
 */

var map;
// initializing the Google Map
function initializeMap() {

    mapOptions = {
        zoom: 15,
        disableDefaultUI: true,
        center: { lat: -34.397, lng: 150.644 },
    };

    /*
    if (typeof google == 'undefined') {
        $('#googleMap-API-error').html('<h2>There are errors when retrieving map data.</h2><h2>Please try refresh page later.</h2>');
        return;
    }
    */

    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    $('#map').height($(window).height());

};


initializeMap();