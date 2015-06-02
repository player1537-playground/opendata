function sparseMatrix() {
    var width = 500,
        height = 500,
        blockWidth = 5,
        blockHeight = 5,
        x = function(d) { return d[1]; },
        y = function(d) { return d[0]; },
        z = function(d) { return d[2]; },
        color = d3.scale.linear().range(["rgb(50, 50, 50)", "rgb(255, 255, 255)"]);

    function my(selection) {
        selection.each(function(data) {
            color.domain([0, d3.max(data, function(d) { return z(d); })]);

            var parent = d3.select(this).selectAll(".matrix").data([data]);
            parent.enter().append("div")
                .attr("class", ".matrix")
                .style("position", "relative")
                .style("overflow", "scroll");
            parent
                .style("width", width + "px")
                .style("height", height + "px");

            var els = parent.selectAll(".element").data(function(d) { return d; });
            els.enter().append("div")
                .attr("class", "element")
                .style("position", "absolute");
            els
                .style("top", function(d) { return y(d) * blockHeight + "px"; })
                .style("left", function(d) { return x(d) * blockWidth + "px"; })
                .style("width", blockWidth + "px")
                .style("height", blockHeight + "px")
                .style("background-color", function(d) { return color(z(d)); });
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

    my.z = function(_) {
        if (!arguments.length) return z;
        z = _;
        return my;
    };

    return my;
}
