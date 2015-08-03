function id(d) { return d; }

function DataGetter() {
    var csvData = [];
    var chart = Graph().xProperty("DATE").yProperty("REGISTERED_VOTERS");

    function my(selection) {
	selection.each(function(data) {
	    var page = d3.select(this);
	    function redraw() {
		var graph = page.selectAll(".graph").data([csvData]);
		graph.enter().append("div")
		    .attr("class", "graph");
		graph
		    .call(chart);

		var dataTextbox = page.selectAll(".data-textbox").data([0]);
		dataTextbox.enter().append("textarea")
		    .attr("class", "data-textbox")
		    .attr("multiline", "true")
		    .attr("newlines", "pasteintact")
		    .attr("rows", 20)
		    .attr("cols", 100)
		    .attr("wrap", "off");
		dataTextbox
		    .on("input", function() {
			var raw = d3.select(this).node().value;
			console.log(raw);
			csvData = d3.csv.parse(raw);

			redraw();
		    });
	    }

	    redraw();
	});
    };

    return my;
};

function Graph() {
    var xProperty;
    var yProperty;
    var width = 800;
    var height = 400;
    var xScale = d3.time.scale();
    var yScale = d3.scale.linear();
    var dateFormat = d3.time.format("%Y-%m-%d");

    function my(selection) {
	selection.each(function(data) {
	    var columns = d3.keys(data);

	    xProperty = xProperty || columns[0];
	    yProperty = yProperty || columns[1];

	    function x(d) { return dateFormat.parse(d[xProperty]); }
	    function y(d) { return +d[yProperty]; }

	    console.log("x extent: ", d3.extent(data.map(x)));
	    console.log("y extent: ", d3.extent(data.map(y)));
	    xScale
		.domain(d3.extent(data.map(x)))
		.range([0, width]);
	    yScale
		.domain(d3.extent(data.map(y)))
		.range([height, 0]);

	    console.log("x scale domain and range: ", xScale.domain(), xScale.range());

        //console.log(data.map(function(d) { return [x(d), y(d)]; }));

	    var page = d3.select(this);

	    function redraw() {
		var svg = page.selectAll("svg").data([data]);
		svg.enter().append("svg")
		    .attr("width", width)
		    .attr("height", height);

		var circles = svg.selectAll("circle").data(id);
		circles.enter().append("circle")
		    .attr("fill", "black")
		    .attr("r", 5);
		circles
		    .attr("cx", function(d) { return xScale(x(d)); })
		    .attr("cy", function(d) { return yScale(y(d)); });
	    }

	    redraw();

	});
    };

    my.xProperty = function(_) {
	if (!arguments.length) { return xProperty; };
	xProperty = _;
	return my;
    };

    my.yProperty = function(_) {
	if (!arguments.length) { return yProperty; };
	yProperty = _;
	return my;
    };

    my.width = function(_) {
	if (!arguments.length) { return width; };
	width = _;
	return my;
    };

    my.height = function(_) {
	if (!arguments.length) { return height; };
	height = _;
	return my;
    };

    return my;
};

var ui = DataGetter();

d3.select("body")
    .call(ui);
