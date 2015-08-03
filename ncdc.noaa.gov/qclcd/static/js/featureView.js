function horizontalFeatures() {
    var width = 500,
        featureSize = 5,
        xScale = d3.scale.linear(),
        color = d3.scale.log().clamp(true).range(["white", "black"]),
        intensity = function(feat) { return function(d) { return d[feat]; }; },
        dispatch = d3.dispatch("featureChange");

    function my(selection) {
        selection.each(function(H) {
            var numFeatures = H.length;
            var height = featureSize * numFeatures;

            var maxValue = d3.max(H, function(d) { return d3.max(d); });
            if (maxValue > color.domain()[1]) {
                color.domain([0.1, maxValue]);
            }

            xScale
                .domain([0, H[0].length])
                .range([0, width]);

            var parent = d3.select(this).selectAll(".h-features").data([H]);
            parent.enter().append("svg")
                .attr("class", "h-features");
            parent
                .style("width", width + "px")
                .style("height", height + "px");

            var features = parent.selectAll(".feature").data(function(d) { return d; });
            features.enter().append("g")
                .attr("class", "feature");
            features
                .attr("data-feature-number", function(d, i) { return i; })
                .attr("transform", function(d, i) {
                    return "translate(0, " + (i * featureSize) + ")";
                }).on("mouseover", function() {
                    var feat = d3.select(this).attr("data-feature-number");

                    dispatch.featureChange.apply(this, [feat]);
                });

            var bars = features.selectAll("rect").data(function(d) { return d; });
            bars.enter().append("rect");
            bars
                .attr("x", function(d, i) { return xScale(i); })
                .attr("y", 0)
                .attr("height", featureSize)
                .attr("width", 1)
                .style("fill", color);
        });
    }

    my.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return my;
    };

    my.featureSize = function(_) {
        if (!arguments.length) return featureSize;
        featureSize = _;
        return my;
    };

    my.color = function(_) {
        if (!arguments.length) return color;
        color = _;
        return my;
    };

    my.intensity = function(_) {
        if (!arguments.length) return intensity;
        intensity = _;
        return my;
    };

    return d3.rebind(my, dispatch, "on");
}

function verticalFeatures() {
    var height = 500,
        featureSize = 5,
        yScale = d3.scale.linear(),
        color = d3.scale.log().clamp(true).range(["white", "black"]),
        dispatch = d3.dispatch("featureChange");

    function my(selection) {
        selection.each(function(W) {
            var numFeatures = W[0].length;
            var width = featureSize * numFeatures;

            var maxValue = d3.max(W, function(d) { return d3.max(d); });
            if (maxValue > color.domain()[1]) {
                color.domain([0.1, maxValue]);
            }

            yScale
                .domain([0, W.length])
                .range([0, height]);

            var parent = d3.select(this).selectAll(".w-features").data([d3.range(numFeatures)]);
            parent.enter().append("svg")
                .attr("class", "w-features");
            parent
                .style("width", width + "px")
                .style("height", height + "px");

            var wByFeatures = function(d) {
                return d.map(function(feat) {
                    return W.map(function(dd) { return dd[feat]; });
                });
            };

            var features = parent.selectAll(".feature").data(wByFeatures);
            features.enter().append("g")
                .attr(".feature");
            features
                .attr("data-feature-number", function(d, i) { return i; })
                .attr("transform", function(d, i) {
                    return "translate(" + (i * featureSize) + ", 0)";
                }).on("mouseover", function() {
                    var feat = d3.select(this).attr("data-feature-number");

                    dispatch.featureChange.apply(this, [feat]);
                });

            var bars = features.selectAll("rect").data(function(d) { return d; });
            bars.enter().append("rect");
            bars
                .attr("y", function(d, i) { return yScale(i); })
                .attr("x", 0)
                .attr("height", 1)
                .attr("width", featureSize)
                .style("fill", color);
        });
    }

    my.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return my;
    };

    my.featureSize = function(_) {
        if (!arguments.length) return featureSize;
        featureSize = _;
        return my;
    };

    my.color = function(_) {
        if (!arguments.length) return color;
        color = _;
        return my;
    };

    my.intensity = function(_) {
        if (!arguments.length) return intensity;
        intensity = _;
        return my;
    };

    return d3.rebind(my, dispatch, "on");
}


function featureHeatmap() {
    var height = 500,
        width = 1000,
        featureSize = 5,
        color = d3.scale.log().clamp(true).range(["white", "black"]);

    function my(selection) {
        selection.each(function(data) {
            var W = data.W,
                H = data.H,
                locations = data.locations,
                numFeatures = H.length;

            var feature = 0;

            var maxW = d3.max(W, function(d) { return d3.max(d); }),
                maxH = d3.max(H, function(d) { return d3.max(d); }),
                maxValue = d3.max([maxW, maxH]);

            color.domain([0.1, maxValue]);

            var wVisualizer = verticalFeatures()
                .color(color)
                .height(height)
                .featureSize(featureSize)
                .on("featureChange", function(feat) {
                    console.log("W feature", feat);

                    feature = feat;
                    update();
                });

            var hVisualizer = horizontalFeatures()
                .color(color)
                .width(width)
                .featureSize(featureSize)
                .on("featureChange", function(feat) {
                    console.log("H feature", feat);

                    feature = feat;
                    update();
                });

            var heatVisualizer = heatmap()
                .z(function(d) { return d[feature]; })
                .lat(function(d, i) { return locations[i][0]; })
                .lng(function(d, i) { return locations[i][1]; })
                .width(width - featureSize * numFeatures)
                .height(height - featureSize * numFeatures)
                .maxZoom(10)
                .zoom(4)
                .byZoom(true)
                .radius(5000);

            var thisEl = d3.select(this);

            function update() {
                var parent = thisEl.selectAll(".feature-heatmap").data([0]);
                parent.enter().append("div")
                    .attr("class", "feature-heatmap")
                    .style("position", "relative")
                    .style("display", "block")
                    .style("width", width + "px")
                    .style("height", height + "px");

                var hDiv = parent.selectAll("span.h").data([H]);
                hDiv.enter().append("span")
                    .attr("class", "h");
                hDiv
                    .style("position", "absolute")
                    .style("left", (featureSize * numFeatures) + "px")
                    .style("height", (featureSize * numFeatures) + "px")
                    .style("display", "block")
                    .call(hVisualizer);

                var wDiv = parent.selectAll("span.w").data([W]);
                wDiv.enter().append("span")
                    .attr("class", "w");
                wDiv
                    .style("position", "absolute")
                    .style("top", (featureSize * numFeatures) + "px")
                    .style("width", (featureSize * numFeatures) + "px")
                    .style("display", "block")
                    .call(wVisualizer);

                var heatDiv = parent.selectAll("span.heat").data([W]);
                heatDiv.enter().append("span")
                    .attr("class", "heat");
                heatDiv
                    .style("position", "absolute")
                    .style("top", (featureSize * numFeatures) + "px")
                    .style("left", (featureSize * numFeatures) + "px")
                    .call(heatVisualizer);
            }

            update();
        });
    }

    my.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return my;
    };

    my.featureSize = function(_) {
        if (!arguments.length) return featureSize;
        featureSize = _;
        return my;
    };

    my.color = function(_) {
        if (!arguments.length) return color;
        color = _;
        return my;
    };

    my.intensity = function(_) {
        if (!arguments.length) return intensity;
        intensity = _;
        return my;
    };

    return my;
}
