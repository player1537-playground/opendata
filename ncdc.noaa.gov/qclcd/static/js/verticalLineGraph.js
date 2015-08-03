function verticalLineGraph() {
    var width = 100,
        height = 800,
        x = function(d, i) { return i; },
        y = function(d) { return d[0]; },
        xScale = d3.scale.linear(),
        yScale = d3.scale.linear(),
        line = d3.svg.line()
            .x(function(d, i) { return yScale(y(d, i)); })
            .y(function(d, i) { return xScale(x(d, i)); });

    function my(selection) {
        selection.each(function(data) {
            xScale
                .domain(d3.extent(data, x))
                .range([height, 0])
            yScale
                .domain(d3.extent(data, y))
                .range([0, width])

            var parent = d3.select(this).selectAll(".graph").data([data]);
            parent.enter().append("svg")
                .attr("class", "graph");
            parent
                .style("width", width + "px")
                .style("height", height + "px");

            var lineEl = parent.selectAll("path").data(function(d) { return [d]; });
            lineEl.enter().append("path")
                .attr("stroke", "black")
                .attr("stroke-width", "1px");
            lineEl
                .attr("d", line);

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

    my.x = function(_) {
        if (!arguments.length) return x;
        x = _;
        return my;
    };

    my.y = function(_) {
        if (!arguments.length) return y;
        y = _;
        return my;
    };

    my.xScale = function(_) {
        if (!arguments.length) return xScale;
        xScale = _;
        return my;
    };

    my.yScale = function(_) {
        if (!arguments.length) return yScale;
        yScale = _;
        return my;
    };

    my.line = function(_) {
        if (!arguments.length) return line;
        line = _;
        return my;
    };

    return my;
}
