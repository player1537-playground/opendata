queue()
    .defer(d3.json, "/approximate/5")
    .await(function(error, data) {
        var W = data.W,
            H = data.H,
            locations = data.locations;

        var feature = 1;

        var heatmapChart = heatmap()
            .z(function(d) { return d[feature]; })
            .lat(function(d, i) { return locations[i][0]; })
            .lng(function(d, i) { return locations[i][1]; })
            .width(978)
            .height(600)
            .maxZoom(10)
            .byZoom(true)
            .radius(5000);

        d3.select("#content").append("div")
            .datum(data.W)
            .call(heatmapChart);

    });
