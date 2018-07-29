// SVG layout variables
var svgWidth = 800;
var svgHeight = 600;
var svgPadding = 60;
var barPadding = 1;
var initialCount = 16;

// Weed out invalid data points
var dataset = regionData.filter(function(d) {return d.medianAge !== null});

// Setup SVG static components
var histogram = d3.select("svg")
                  .attr("width", svgWidth)
                  .attr("height", svgHeight)

// Add axes and axis labels
histogram.append("g")
           .attr("transform", "translate(0, " + (svgHeight - svgPadding) + ")")
         .classed("x-axis", true);

histogram.append("g")
           .attr("transform", "translate(" + (svgPadding) + ", 0)")
         .classed("y-axis", true);

histogram.append("text") // X axis label
           .attr("x", svgWidth / 2)
           .attr("y", svgHeight - svgPadding)
           .attr("dy", "3em")
           .attr("text-anchor", "middle")
         .text("Median Age");

histogram.append("text") // Y axis label
           .attr("transform", "rotate(-90)")
           .attr("x", -svgHeight / 2)
           .attr("y", svgPadding)
           .attr("dy", "-2.5em")
           .attr("text-anchor", "middle")
         .text("Frequency");

         
// Function to update SVG dynamic components
function updateHistogram(targetBinCount) {
    var xScale = d3.scaleLinear()
                   .domain(d3.extent(dataset, function(d) {
                       return d.medianAge;
                   }))
                   .rangeRound([svgPadding, svgWidth - svgPadding]);

    var binGenerator = d3.histogram()
                         .domain(xScale.domain())
                         .thresholds(xScale.ticks(targetBinCount))
                         .value(function(d) {return d.medianAge;});

    var bins = binGenerator(dataset);

    var yScale = d3.scaleLinear()
                   .domain([0, d3.max(bins, function(d) {
                        return d.length;
                   })])
                   .range([svgHeight - svgPadding, svgPadding])

    // Attach axes and axis labels
    d3.select(".y-axis").call(d3.axisLeft(yScale));
    d3.select(".x-axis").call(d3.axisBottom(xScale).ticks(targetBinCount))
                        .selectAll("text")
                          .attr("transform", "rotate(90)")
                          .attr("text-anchor", "start")
                          .attr("x", 10)
                          .attr("y", -4)
    
    // Update histogram bars
    // Step 1
    var bars = histogram.selectAll("rect")
                        .data(bins);
    
    // Step 2
    bars.exit()
        .remove()

    // Step 3
    bars.enter()
          .append("rect")
        .merge(bars) // Step 4
          .attr("x", function(d) {return xScale(d.x0);})
          .attr("y", function(d) {return yScale(d.length);})
          .attr("width", function(d) {return xScale(d.x1) - xScale(d.x0) - barPadding;})
          .attr("height", function(d) {return svgHeight - svgPadding - yScale(d.length);})
          .attr("fill", "red");

    d3.select(".bin-count")
      .text("Number of bins: " + bins.length);
}

// Initialize slider with update function
d3.select("input")
    .property("value", initialCount)
  .on("input", function() {
      updateHistogram(Number(d3.event.target.value));
  });

// Call update function for initial slider value
updateHistogram(initialCount);
