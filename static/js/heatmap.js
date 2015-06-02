function heatmap() {
    var width = 500,
        height = 500,
        lat = function(d) { return d[d.length - 2]; },
        lng = function(d) { return d[d.length - 1]; },
        z = function(d) { return d[0]; },
        center = L.latLng(39.833333, -98.583333),
        zoom = 2,
        minZoom = 1,
        maxZoom = 5,
        maxBounds = L.latLngBounds(L.latLng(-44.25, -176.67),
                                   L.latLng(68.09, 144.83)),
        radius = 25,
        byZoom = false;

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
            if (width == null) {
                width = window.innerWidth
                    || document.documentElement.clientWidth
                    || document.body.clientWidth;
            }

            if (height == null) {
                height = window.innerHeight
                    || document.documentElement.clientHeight
                    || document.body.clientHeight;
            }

            var parent = d3.select(this).selectAll(".map").data([data]);
            parent.enter().append("div")
                .attr("class", "map");
            parent
                .style("width", width + "px")
                .style("height", height + "px");

            var map = L.map(parent.node(),
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

            var latLngs = data.map(function(d) {
                return [lat(d), lng(d), z(d)];
            });

            var maxValue = d3.max(latLngs, function(d) { return d[2]; });

            console.log(maxValue);

            var heat = L.heatLayer(latLngs,
                                   { radius: getRadius(map, radius),
                                     max: maxValue
                                   }).addTo(map);

            map.on("zoomend", function() {
                heat.setOptions({ radius: getRadius(map, radius) });
                heat.redraw();
            });
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

    my.z = function(_) {
        if (!arguments.length) return z;
        z = _;
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

    return my;
}
