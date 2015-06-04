queue()
    .defer(d3.json, "/approximate/5")
    .await(function(error, data) {
        var content = d3.select("#content");

        var featHeatChart = featureHeatmap()
            .featureSize(25);

        content.append("div")
            .datum(data)
            .call(featHeatChart);
    });
