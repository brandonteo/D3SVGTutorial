var svg_width = 600;
var svg_height = 600;
var padding = 3;

var minYear = d3.min(birthData, function(d) {return d.year;});
var maxYear = d3.max(birthData, function(d) {return d.year;});
var yearData = birthData.filter(function(d) {return d.year === minYear});

d3.select("input")
    .property("min", minYear)
    .property("max", maxYear)
    .property("value", minYear);

var xScale = d3.scaleLinear()
               .domain([0, d3.max(yearData, function(d) {
                   return d.births;
               })])
               .rangeRound([20, svg_width - 20]); // Add padding so that text labels don't get cropped

// Initialize histogram generator
var bin_generator = d3.histogram()
                      .domain(xScale.domain())
                      .thresholds(xScale.ticks())
                      .value(function(d) {return d.births;});

// Create histogram bins
var bins = bin_generator(yearData);

var yScale = d3.scaleLinear()
               .domain([0, d3.max(bins, function(d) {
                   return d.length;
               })])
               .range([svg_height, 0]);

// Place histogram to SVG
var histogram = d3.select("svg")
                    .attr("width", svg_width)
                    .attr("height", svg_height)
                  .selectAll(".bar")
                  .data(bins)
                  .enter()
                  .append("g")
                    .classed("bar", true);

// Nest a `rect` within each `g`
// `bins` is being binded which means that each individual `rect` corresponds to an bin array
histogram.append("rect")
           .attr("x", function(d) {
               return xScale(d.x0);
           })
           .attr("y", function(d) {
               return yScale(d.length);
           })
           .attr("width", function(d) {
               return xScale(d.x1) - xScale(d.x0) - padding;
           })
           .attr("height", function(d) {
               return svg_height - yScale(d.length);
           })
           .attr("fill", "red")

// Nest a `text` within each `g`
histogram.append("text")
         .text(function(d) {
             return d.x0 + " - " + d.x1 + " (bar height: " + d.length + ")"
         })
         .attr("transform", "rotate(-90)")
         .attr("x", -svg_height + 10)
         .attr("y", function(d) {
             return (xScale(d.x1) + xScale(d.x0)) / 2
         })

// Configure slider
d3.select("input").on("input", function() {
    // Get slider year input and dataset
    var year = Number(d3.event.target.value);
    yearData = birthData.filter(function(d) {return d.year === year;});

    // Update xScale
    xScale.domain([0, d3.max(yearData, function(d) {return d.births;})]);

    // Update bin_generator
    bin_generator.domain(xScale.domain())
                 .thresholds(xScale.ticks());

    // Re-generate bins
    bins = bin_generator(yearData);

    // Update yScale
    yScale.domain([0, d3.max(bins, function(d) {return d.length})]);

    // D3 Update Pattern
    histogram = d3.select("svg")
                    .selectAll(".bar")
                    .data(bins);
    
    histogram.exit()
             .remove();

    var gElem = histogram.enter()
                         .append("g")
                           .classed("bar", true);

    gElem.append("rect");
    gElem.append("text");

    gElem.merge(histogram)
           .select("rect")
           .attr("x", function(d) {
               return xScale(d.x0);
           })
           .attr("y", function(d) {
               return yScale(d.length);
           })
           .attr("width", function(d) {
               return Math.max((xScale(d.x1) - xScale(d.x0) - padding), 0);
           })
           .attr("height", function(d) {
               return svg_height - yScale(d.length);
           })
           .attr("fill", "red");

    gElem.merge(histogram)
           .select("text")
           .text(function(d) {
               return d.x0 + " - " + d.x1 + " (bar height: " + d.length + ")"
           })
           .attr("transform", "rotate(-90)")
           .attr("x", -svg_height + 10)
           .attr("y", function(d) {
               return (xScale(d.x1) + xScale(d.x0)) / 2
           })

});

