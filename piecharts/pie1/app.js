var svgWidth = 600;
var svgHeight = 600;
var minYear = d3.min(birthData, function(d) {return d.year;});
var maxYear = d3.max(birthData, function(d) {return d.year;});

d3.select("input")
    .property("min", minYear)
    .property("max", maxYear)
    .property("value", minYear);

// Get the set of continents from `birthData`
var continents = []
for (var i = 0; i < birthData.length; i++) {
    var cont = birthData[i].continent;
    if (continents.indexOf(cont) === -1) {
        continents.push(cont);
    }
}

// Maps discrete values to another range of discrete values, in this case colors.
var colorScale = d3.scaleOrdinal()
                   .domain(continents)
                   .range(d3.schemeCategory10);

// Refer to the `g` element inside `svg` as `pieChart`
var pieChart = d3.select("svg")
                   .attr("width", svgWidth)
                   .attr("height", svgHeight)
                 .append("g")
                   .attr("transform", "translate(" + (svgWidth / 2) + ", " + (svgHeight / 2) + ")");

var arcsGenerator = d3.pie()
                      .value(function(d) {return d.births;})
                      .sort(function(a, b) {
                          if (a.continent < b.continent) {return -1;}
                          else if (b.continent < a.continent) {return 1;}
                          else {return a.births - b.births;}
                      });


function updatePieChart(targetYear) {
    var dataset = birthData.filter(function(d) {return d.year === targetYear;});

    var arcs = arcsGenerator(dataset);

    // `path` here is like a `rect` in a histogram, but here we need to define it beforehand
    var path = d3.arc()
                 .outerRadius(svgWidth / 2 - 10)
                 .innerRadius(0)
    
    // Update pattern
    var updates = pieChart.selectAll(".arc")
                          .data(arcs)
    
    updates.exit()
           .remove()

    updates.enter()
           .append("path")
              .classed("arc", true)
           .merge(updates)
              .attr("fill", function(d) {return colorScale(d.data.continent);})
              .attr("stroke", "black")
              .attr("d", path);

}

d3.select("input").on("input", function() {
    return updatePieChart(Number(d3.event.target.value));
});

updatePieChart(minYear);
