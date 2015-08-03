var color = function(i) { return i === 3 ? 'red' : 'blue' };

queue()
    .defer(d3.json, "/api/link_points")
    .await(function(error, data) {
        d3.values(data).forEach(function(d) {
            console.log("" + d.map(function(dd) { return "[" + dd + "]" }));
        });

        var bounds = { south: Infinity, west: Infinity, north: -Infinity, east: -Infinity };
        d3.values(data).forEach(function(speedIdValues) {
            speedIdValues.forEach(function(d) {
                var lat = d[0];
                var lng = d[1];

                if (lat < bounds.south) bounds.south = lat;
                if (lat > bounds.north) bounds.north = lat;
                if (lng > bounds.east)  bounds.east  = lng;
                if (lng < bounds.west)  bounds.west  = lng;
            });
        });

        var mapBounds = L.latLngBounds(L.latLng(bounds.south, bounds.west),
                                       L.latLng(bounds.north, bounds.east));
        var mapCenter = L.latLng((bounds.north + bounds.south) / 2,
                                 (bounds.east  + bounds.west)  / 2);

        var parent = d3.select("#content");

        var mapEl = parent.selectAll(".map").data([0]);
        mapEl.enter().append("div")
            .attr("class", "map")
            .style("height", "600px");

        var map = L.map(mapEl.node()).fitBounds(mapBounds);

        L.tileLayer('https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.{format}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery Â© <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            mapid: 'mapbox.light',
            format: 'png',
            accessToken: 'pk.eyJ1IjoicGxheWVyMTUzNyIsImEiOiI1OWM0YzhiOTc4ZjIyNDNkZGU4OTYzN2JhMzVkYTM1NCJ9.13Xa8k0RPCfELN4v908Chg'
        }).addTo(map);

        d3.values(data).forEach(function(d, i) {
            L.polyline(d, { color: color(i) }).addTo(map);
        });
    });
