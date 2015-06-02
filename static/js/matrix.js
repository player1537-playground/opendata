function matrix() {
    var width = 500,
    height = 500,
    blockWidth = 5,
    blockHeight = 5,
    color = d3.scale.linear().range(["lightblue", "steelblue"]);

    function my(selection) {
        selection.each(function(data) {
            color.domain([0, d3.max(data, function(d) { return d3.max(d); })]);

            var table = d3.select(this).selectAll(".matrix").data([data]);
            table.enter().append("table")
                .attr("class", ".matrix");

            var rows = table.selectAll("tr").data(function(d) { return d; });
            rows.enter().append("tr");

            var els = rows.selectAll("td").data(function(d) { return d; });
            els.enter().append("td");
            els
                .style("width", blockWidth + "px")
                .style("height", blockHeight + "px")
                .style("background-color", color);
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

    return my;
}
