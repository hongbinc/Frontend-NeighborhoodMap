﻿/**
 * Main JS file for NeighborhoodMap Application
 * Model and View Model
 */

// FourSquare data model
var venue = function(data) {
    this.placename = data.venue.name;
    this.id = data.venue.id;
    this.lat = data.venue.location.lat;
    this.lng = data.venue.location.lng;
    //this.marker = {};
    
};

function mapViewModel() {
    var self = this,
        map,
        service,
        mapOptions,
        lat,
        lng,
        infowindow,
        mapBounds;

    var defaultKeyword = "best nearby";
    var defaultNeighborhood = "New York";
    var placeMarkers = [];
    self.neighborhood = ko.observable(defaultNeighborhood); 
    self.keyword = ko.observable('');
    self.dataList = ko.observableArray([]);
    self.currentMarker = ko.observable('');
    
    // Load Foursquare data
    function LoadFourSquare() {
        var $APIError = $('#APIError');
        var url_prefix = 'https://api.foursquare.com/v2/venues/explore?client_id=';
        var client_id = '1I25VINMXH4AXMWCEUDLLBDD0LIWFSBVNXRCM3USQQOBCBSW';
        var client_secret = '&client_secret=MDMKL344UHNL4NDWGNN5HVQBZEDPWMIUOOGCODYQV5PFTE2R';
        var version = '&v=20130815&venuePhotos=1';
        var location = '&ll=' + lat + ',' + lng;
        var keyword = self.keyword();
        var search = '&query=' + keyword;
        var FourSquareURL = url_prefix + client_id + client_secret + version + location + search;
        //console.log(keyword);
        $.getJSON(FourSquareURL, function (data) {
           
            var FourSquareData = data.response.groups[0].items;

            FourSquareData.forEach(function (data) {

                self.dataList.push(new venue(data));
            });

            self.dataList().forEach(function (venueItem) {
                displayMarker(venueItem);
            });

            // set bounds to FourSqure suggested bounds for each items
            var bounds = data.response.suggestedBounds;
            if (bounds != undefined) {
                mapBounds = new google.maps.LatLngBounds(
                  new google.maps.LatLng(bounds.sw.lat, bounds.sw.lng),
                  new google.maps.LatLng(bounds.ne.lat, bounds.ne.lng));
                map.fitBounds(mapBounds);
            }
        
        }).error(function (e) {

            $APIError.text('Error: Data could not be load');
        });
    };

    function getMarkerContent(data) {

        var contentString = '<h1>faf</h1>';

        return contentString;
    };
    // create place marker
    function displayMarker(data) {
        
        var place = new google.maps.LatLng(data.lat, data.lng);

        // create a marker for selected place
        var marker = new google.maps.Marker({
            map: map,
            position: place,
            title: data.placename

        });
        // push marker to the array
        placeMarkers.push(marker);

        var markerContent = getMarkerContent(data);
        marker.addListener('click', function () {
            infowindow.open(map, marker);
            infowindow.setContent(markerContent);
        });
    };
    
    // Removes the markers from the map and array
    function removeMarker() {
       // self.currentMarker.setMap(null);

        placeMarkers.forEach(function (place) {
            place.setMap(null);

        });
        placeMarkers = [];
    }



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
        infowindow = new google.maps.InfoWindow();
    };

    // Map bounds get updated on page resize
    window.addEventListener('resize', function (e) {
        map.fitBounds(mapBounds);
        $("#map").height($(window).height());
    });

    self.computedNeighborhood = function () {

        if (self.neighborhood() != '') {
            removeMarker();
            self.dataList([]);
            getNeighborhood(self.neighborhood());
           // removeMarker();
           // self.dataList([]);
        }
       // console.log(self.keyword());
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

        // Load FourSquare data
        LoadFourSquare();
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