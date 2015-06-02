queue()
    .defer(d3.json, "/approximate/5")
    .await(function(error, data) {
        var feature = 2;

        var heatmapChart = heatmap()
            .z(function(d) { return d[feature]; })
            .width(978)
            .height(600)
            .maxZoom(10)
            .byZoom(true)
            .radius(5000);

        d3.select("#content").append("div")
            .datum(data.W)
            .call(heatmapChart);

        var graph = verticalLineGraph()
                .width(300)
                .height(600)
                .yScale(d3.scale.log())
                .y(function(d) { return d[feature]; });
        var oldY = graph.y();
        graph.y(function(d, i) { return oldY(d, i) + 1; });

        d3.select("#control").append("div")
            .datum(data.HT)
            .call(graph);
    });
