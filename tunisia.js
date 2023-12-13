// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiaG91c3NlbWJvIiwiYSI6ImNqNnFkZ2cyNzA4anYyd28ya2k1NjIyZWUifQ.bMvUPWoUgW_eCPuIxeHoGA';

// Initialize the map
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [9.5375, 33.8869],
    zoom: 6
});

// Load GeoJSON for governorate areas
map.on('load', function () {
    map.addSource('governorates', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/HBODKR/Event_web/master/delegation_area.geojson'
    });

    map.addLayer({
        id: 'governorates-layer',
        type: 'fill',
        source: 'governorates',
        paint: {
            'fill-color': 'green',
            'fill-opacity': 0.5,
            'fill-outline-color': 'black'
        }
    });

    // Load GeoJSON for schools
    map.addSource('schools', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/HBODKR/tunisian_schools_map/master/all_schtn.geojson'
    });

    // Add a layer for schools with pins
    map.addLayer({
        id: 'schools-layer',
        type: 'symbol',
        source: 'schools',
        layout: {
            'icon-image': 'marker-15',
            'icon-allow-overlap': true,
            'icon-size': 1.5
        }
    });

    // Keep track of the clicked feature ID
    var clickedFeatureId = null;

// Add click event for governorate areas
map.on('click', 'governorates-layer', function (e) {
    var clickedFeature = e.features[0];
    var governorateId = clickedFeature.id;

    // Filter schools based on the clicked governorate
    var filteredSchools = map.querySourceFeatures('schools', {
        filter: ['==', 'NAME_2', clickedFeature.properties.NAME_2]
    });

    // Use a Set to store unique school identifiers
    var uniqueSchoolIdentifiers = new Set();

    // Filter and store unique schools based on identifiers
    filteredSchools.forEach(function (school) {
        var schoolIdentifier = school.properties.identifier;
        uniqueSchoolIdentifiers.add(schoolIdentifier);
    });

    // Display schools information with colored circles in the info panel
    var governorateName = clickedFeature.properties.NAME_1;
    var delegationName = clickedFeature.properties.NAME_2;
    var schoolsInfoHTML = '<h5>' + governorateName+', '+ delegationName + '</h5>';
    schoolsInfoHTML += '<ul>';
    uniqueSchoolIdentifiers.forEach(function (schoolIdentifier) {
        // Find the corresponding school based on the identifier
        var uniqueSchool = filteredSchools.find(function (school) {
            return school.properties.identifier === schoolIdentifier;
        });

        var schoolName = uniqueSchool.properties.School;
        var region = uniqueSchool.properties.region;
        var ecosystem1 = uniqueSchool.properties['Ecosystem 1'];
        var circleColor = getCircleColor(ecosystem1);

        schoolsInfoHTML += '<li>';
        schoolsInfoHTML += '<span class="circle" style="background-color: ' + circleColor + ';"></span>';
        schoolsInfoHTML += '<strong>' + schoolName + '</strong>';

        // Display school details
        schoolsInfoHTML += '<div class="school-details">';
        schoolsInfoHTML += 'Region: ' + region + '<br>';
        schoolsInfoHTML += 'Students: ' + uniqueSchool.properties.students + '<br>';
        schoolsInfoHTML += 'Total Classes: ' + uniqueSchool.properties.total_class + '<br>';
        // Add more details as needed
        schoolsInfoHTML += '</div>';

        schoolsInfoHTML += '</li>';
        schoolsInfoHTML += '<hr>'; // Add a line separator between schools
    });
    schoolsInfoHTML += '</ul>';

    // Update the schools info panel
    document.getElementById('schools-info').innerHTML = schoolsInfoHTML;
});

// Function to get circle color based on ecosystem1
function getCircleColor(ecosystem1) {
    switch (ecosystem1) {
        case 'Agriculture':
            return 'green';
        case 'Urban':
            return 'brown';
        case 'Sea':
            return 'blue';
        case 'Desert':
            return 'yellow';
        default:
            return 'orange';
    }
}
});
