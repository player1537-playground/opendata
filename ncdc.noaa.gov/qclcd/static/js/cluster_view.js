function clusterView() {
    var width = 500,
        height = 500,
        lat = function(d, i) { return d[d.length - 2]; },
        lng = function(d, i) { return d[d.length - 1]; },
        cluster = function(d, i) { return d; },
        color = d3.scale.category10(),
        center = L.latLng(39.833333, -98.583333),
        zoom = 2,
        minZoom = 1,
        maxZoom = 5,
        maxBounds = L.latLngBounds(L.latLng(24.7433195, -124.7844079),
                                   L.latLng(49.3457868, -66.9513812)),
        radius = 25,
        byZoom = false,
        init = false,
        map = null,
        circles = [];


    function getRadius(map, radiusInMeters) {
        var pointC = map.latLngToContainerPoint([width/2, height/2]);
        var pointX = [pointC.x + 1, pointC.y];

        // convert containerpoints to latlng's
        var latLngC = map.containerPointToLatLng(pointC);
        var latLngX = map.containerPointToLatLng(pointX);

        // Assuming distance only depends on latitude
        var distanceX = latLngC.distanceTo(latLngX);
        // 100 meters is the fixed distance here
        var pixels = radiusInMeters / distanceX;

        console.log('radius', pixels);

        return pixels;
    }

    function my(selection) {
        selection.each(function(data) {
            var thisEl = d3.select(this);

            function update() {
                var parent = thisEl.selectAll(".map").data([data]);
                parent.enter().append("div")
                    .attr("class", "map");
                parent
                    .style("width", width + "px")
                    .style("height", height + "px");

                if (!init) {
                    map = L.map(parent.node(),
                                { center: center,
                                  zoom: zoom,
                                  minZoom: minZoom,
                                  maxZoom: maxZoom,
                                  maxBounds: maxBounds,
                                  byZoom: byZoom
                                });

                    L.tileLayer('http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.{format}?access_token={accessToken}', {
                        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery Â© <a href="http://mapbox.com">Mapbox</a>',
                        maxZoom: maxZoom,
                        mapid: 'mapbox.light',
                        format: 'png',
                        accessToken: 'pk.eyJ1IjoicGxheWVyMTUzNyIsImEiOiI1OWM0YzhiOTc4ZjIyNDNkZGU4OTYzN2JhMzVkYTM1NCJ9.13Xa8k0RPCfELN4v908Chg'
                    }).addTo(map);

                    layerGroup = L.layerGroup().addTo(map);

                    var transformed = data.map(function(d, i) {
                        return [lat(d, i), lng(d, i), color(cluster(d, i))];
                    });

                    var layerGroup = L.layerGroup(transformed.map(function(d) {
                        return L.circle([d[0], d[1]],
                                        radius,
                                        { color: d[2],
                                          fill: true,
                                          fillOpacity: 1.0,
                                          opacity: 1.0
                                        });
                    })).addTo(map);

                    map.on("zoomend", function() {
                        update();
                    });

                    init = true;
                }
            }

            update();
        });
    }

    my.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return my;
    };

    my.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return my;
    };

    my.blockWidth = function(_) {
        if (!arguments.length) return blockWidth;
        blockWidth = _;
        return my;
    };

    my.blockHeight = function(_) {
        if (!arguments.length) return blockHeight;
        blockHeight = _;
        return my;
    };

    my.color = function(_) {
        if (!arguments.length) return color;
        color = _;
        return my;
    };

    my.lat = function(_) {
        if (!arguments.length) return lat;
        lat = _;
        return my;
    };

    my.lng = function(_) {
        if (!arguments.length) return lng;
        lng = _;
        return my;
    };

    my.center = function(_) {
        if (!arguments.length) return center;
        center = _;
        return my;
    };

    my.zoom = function(_) {
        if (!arguments.length) return zoom;
        zoom = _;
        return my;
    };

    my.minZoom = function(_) {
        if (!arguments.length) return minZoom;
        minZoom = _;
        return my;
    };

    my.maxZoom = function(_) {
        if (!arguments.length) return maxZoom;
        maxZoom = _;
        return my;
    };

    my.maxBounds = function(_) {
        if (!arguments.length) return maxBounds;
        maxBounds = _;
        return my;
    };

    my.radius = function(_) {
        if (!arguments.length) return radius;
        radius = _;
        return my;
    };

    my.byZoom = function(_) {
        if (!arguments.length) return byZoom;
        byZoom = _;
        return my;
    };

    my.cluster = function(_) {
        if (!arguments.length) return cluster;
        cluster = _;
        return my;
    };

    return my;
}

queue()
    .defer(d3.json, "/clusters/201505/3")
    .defer(d3.json, "/approximate/3")
    .await(function(error, clusters, data) {
        var clusters = clusters.clusters,
            W = data.W,
            H = data.H,
            locations = data.locations;

        var view = clusterView()
            .lat(function(d, i) { return locations[i][0]; })
            .lng(function(d, i) { return locations[i][1]; })
            .cluster(function(d, i) { return d; })
            .width(978)
            .height(600)
            .maxZoom(10)
            .byZoom(true)
            .radius(1500);

        d3.select("#content").append("div")
            .datum(clusters)
            .call(view);
    });
