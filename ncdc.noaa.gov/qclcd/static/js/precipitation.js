queue()
    .defer(d3.json, "/precipitation")
    .await(function(error, data) {
        d3.select("#parent").append("div")
            .datum(data.precip)
            .call(sparseMatrix())

    });
