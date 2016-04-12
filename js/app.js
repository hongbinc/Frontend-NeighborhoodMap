/**
 * Main JS file for NeighborhoodMap Application
 * Model and View Model
 */

// FourSquare data model
var venue = function (data) {
    // define Foursquare API data variable
    this.placename = data.venue.name;
    this.id = data.venue.id;
    this.lat = data.venue.location.lat;
    this.lng = data.venue.location.lng;
    this.foursquareURL = "https://foursquare.com/v/" + this.id;
    this.category = data.venue.categories[0].name;
    this.formattedPhone = this.getFormattedPhone(data);
    this.formattedAddress = data.venue.location.formattedAddress;
    this.tips = this.getTips(data);
    this.url = this.getUrl(data);
    this.rating = this.getRating(data);
    //Not using it right now, save for later
    //this.featuredPhoto = this.getFeaturedPhoto(data);

};

// venue data error handlings and formmatting
venue.prototype = {

    getPhotoAlbumnURL: function (data, foursquareID) {
        return this.basePhotoAlbumnURL + this.id + '/photos?' + foursquareID + '&v=20130815';
    },

    getFormattedPhone: function (data) {
        if (!data.venue.contact.formattedPhone)
            return 'Contact Not Available';
        else
            return data.venue.contact.formattedPhone;
    },

    getTips: function (data) {
        if (!data.tips)
            return 'Tips Not Available';
        else
            return data.tips[0].text;
    },

    getUrl: function (data) {
        if (!data.venue.url)
            return 'Website Not Available';
        else
            return data.venue.url;
    },

    getRating: function (data) {
        if (!data.venue.rating)
            return '0.0';
        else
            return data.venue.rating;
    },
    /*  // Not using it right now, save for later
        getFeaturedPhoto: function (data) {
            if (!data.venue.featuredPhotos)
                return this.photoPlaceHolder;
            else {
                this.photoSuffix = data.venue.featuredPhotos.items[0].suffix;
                return this.photoPrefix + 'width100' + this.photoSuffix;
            }
        }
    */
}

/*
 * Neighborhood Map View Model.
 */
function mapViewModel() {
    var self = this,
        map,
        service,
        mapOptions,
        lat,
        lng,
        infowindow,
        mapBounds;

    var defaultNeighborhood = "New York";
    var placeMarkers = [];
    self.neighborhood = ko.observable(defaultNeighborhood); // neighborhood location
    self.keyword = ko.observable(''); // searched keyword
    self.filterword = ko.observable(''); // Filter by this word
    self.dataList = ko.observableArray([]); // most popular place Foursquare picks base on neighborhood and input keyword
    self.filterList = ko.observableArray(self.dataList());
    self.formattedAddress = ko.observable(''); // city address

    /**
     * Get best nearby neighborhood venues data from foursquare API,
     * create venues markers on map
     */
    function LoadFourSquare() {
        // Create Foursquare API data URL
        var $APIError = $('#APIError');
        var url_prefix = 'https://api.foursquare.com/v2/venues/explore?client_id=';
        var client_id = '1I25VINMXH4AXMWCEUDLLBDD0LIWFSBVNXRCM3USQQOBCBSW';
        var client_secret = '&client_secret=MDMKL344UHNL4NDWGNN5HVQBZEDPWMIUOOGCODYQV5PFTE2R';
        var version = '&v=20130815&venuePhotos=1';
        var location = '&ll=' + lat + ',' + lng;
        var keyword = self.keyword();
        var search = '&query=' + keyword;
        var FourSquareURL = url_prefix + client_id + client_secret + version + location + search;
        
        $.getJSON(FourSquareURL, function (data) {

            var FourSquareData = data.response.groups[0].items;

            FourSquareData.forEach(function (data) {
                self.dataList.push(new venue(data));
            });
           // self.filterList(self.dataList());
           // console.log("haha",self.filterList());
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
         //   console.log(self.filterList());
         //   console.log(self.dataList());
        }).error(function (e) {

            $APIError.text('Error: Data could not be load');
        });
    };

    /**
 	 * Set place marker infowindow
 	 */
    function getMarkerContent(data) {
        // set venue info window string
        var contentString = '<div class="venue-infowindow">'
							+ '<div class="venue-name">'
							+ '<a href ="' + data.foursquareURL + '">'
							+ data.placename
							+ '</a>'
                            + '<div class="rate_position">'
							+ '<span class="venue-rating badge ">'
							+ data.rating
							+ '</span>'
                            + '</div>'
							+ '</div>'
							+ '<div class="venue-category">'
							+ data.category
							+ '</div>'
							+ '<div class="venue-address">'
							+ data.formattedAddress
							+ '</div>'
							+ '<div class="venue-contact">'
							+ data.formattedPhone
							+ '</div>'
							+ '<div class="venue-url">'
							+ data.url
							+ '</div>'
							+ '</div>';

        return contentString;
    };
    /**
 	 * Create a place marker on map.
 	 * When the place marker is clicked on map, 
 	 * open marker infowindow, set marker bounce animation
 	 */
    function displayMarker(data) {

        var place = new google.maps.LatLng(data.lat, data.lng);

        // create a marker for selected place
        var marker = new google.maps.Marker({
            map: map,
            position: place,
            title: data.placename,
            marker_id: data.id
        });
        // push marker to the array
        placeMarkers.push(marker);

        var markerContent = getMarkerContent(data);
        // marker event Listener
        marker.addListener('click', function () {
            // stop all other marker bounce animation 
            for (var i in placeMarkers) {
                placeMarkers[i].setAnimation(null);
            }
            marker.setAnimation(google.maps.Animation.BOUNCE);
            // open infowindow if this marker is clicked
            infowindow.open(map, marker);
            // set the content of infowindow 
            infowindow.setContent(markerContent);
            // pan to this place's position on map when the marker is clicked
            map.panTo(place);
        });
    };

    /**
 	 * When place details is clicked in place list,
 	 * panto the venue marker on map, display infowindow, 
 	 * and start marker bounce animation
 	 */
    self.clickMarker = function (data) {

        var markerContent = getMarkerContent(data);
        var place = new google.maps.LatLng(data.lat, data.lng);
      //  var currentMarker;

        for (var i in placeMarkers) {
            // stop all other marker bounce animation 
            placeMarkers[i].setAnimation(null);
            if (placeMarkers[i].marker_id === data.id) {
                placeMarkers[i].setAnimation(google.maps.Animation.BOUNCE);
                // currentMarker = placeMarkers[i];
                infowindow.open(map, placeMarkers[i]);
                infowindow.setContent(markerContent);
            }
        }
        map.panTo(place);
    };
    // Removes the markers from the map and array
    function removeMarker() {
        
        placeMarkers.forEach(function (place) {
            place.setMap(null);

        });
        placeMarkers = [];
    }

    // initializing the Google Map
    function initializeMap() {

        mapOptions = {
            zoom: 15,
            disableDefaultUI: true
        };

        if (typeof google == 'undefined') {
            $('#googleMap-API-error').html('<h2>There are Errors when retrieving map data.');
            return;
        }

        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        $('#map').height($(window).height());
        infowindow = new google.maps.InfoWindow({ maxWidth: 170 });
        // disable marker animation when infowindow is closed
        google.maps.event.addListener(infowindow, 'closeclick', function () {
            for (var i in placeMarkers) {
                placeMarkers[i].setAnimation(null);
            }
        });
    };

    // Map bounds get updated on page resize
    window.addEventListener('resize', function (e) {
      //  map.fitBounds(mapBounds);
        $("#map").height($(window).height());
    });

    self.computedNeighborhood = function () {

        if (self.neighborhood() != '') {
            removeMarker();
            self.dataList([]);
            getNeighborhood(self.neighborhood());
            self.filterword('');
           // console.log(self.dataList());
        }
    };

    self.computedFilterList = function () {
        // console.log(self.dataList()[0].placename);
        //$('.switchList').attr("data-bind", "foreach: filterList");
        var list = [];
        var filterword = self.filterword().toLowerCase();
        for (var i in self.dataList()) {
            if (self.dataList()[i].placename.toLowerCase().indexOf(filterword) != -1 ||
                self.dataList()[i].category.toLowerCase().indexOf(filterword) != -1) {
                list.push(self.dataList()[i]);
            }
        }
        removeMarker();
        self.filterList(list);
        self.filterList().forEach(function (venueItem) {
            displayMarker(venueItem);
        });
        console.log("fileterlist:", self.filterList());
    }
   /* when user update neighborhood address or keyword in input bar,
    * update displays for the map
    */
    self.neighborhood.subscribe(self.computedNeighborhood);
    self.keyword.subscribe(self.computedNeighborhood);
    self.filterword.subscribe(self.computedFilterList);

    // request neighborhood location data from PlaceService
    function getNeighborhood(neighborhood) {

        // the search request object
        var request = {
            query: neighborhood
        };

        // creates a Google place search service object. 
        // PlacesService does the work of searching for location data.
        service = new google.maps.places.PlacesService(map);
        // searches the Google Maps API for location data and runs the callback 
        // function with the search results after each search.
        service.textSearch(request, neighborhoodCallback);
    };

    // Checks that the PlacesServiceStatus is OK, and pass the place data
    function neighborhoodCallback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            // results[0] contain lat and lng info
            mapCenter(results[0]);
        }
    };

    // Get neighborhood's real lat and lng, set up map center 
    function mapCenter(neighborhoodPlace) {

        lat = neighborhoodPlace.geometry.location.lat();
        lng = neighborhoodPlace.geometry.location.lng();
        self.formattedAddress(neighborhoodPlace.formatted_address);
        var neighborhoodShowOnMap = new google.maps.LatLng(lat, lng);

        map.setCenter(neighborhoodShowOnMap);

        // Load FourSquare data
        LoadFourSquare();
    };

    function initNeighborhood(neighborhood) {
        getNeighborhood(neighborhood);
    };

    // initialize map
    initializeMap();

    // initialize neighborhood with default neighborhood
    initNeighborhood(defaultNeighborhood);

};

// initialize mapViewModel 
function InitMapViewModel() {
    if (typeof google !== 'undefined') {
        ko.applyBindings(new mapViewModel());
    }
    else {
        googleError();
    }
};

function googleError() {
    alert('Google Maps can not be load, Please refresh the page.');
};
// Click to hide and show place list
function toggle(id) {
    $('.' + id).toggle();
};
