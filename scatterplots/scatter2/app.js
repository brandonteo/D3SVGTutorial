var svg_width = 600
var svg_height = 600
var padding = 50

function hasKeys(obj) {
    var keys = [
        "subscribersPer100",
        "adultLiteracyRate",
        "urbanPopulationRate",
        "medianAge"
    ]
    for (var i = 0; i < keys.length; i++) {
        if (obj[keys[i]] === null) return false;
    }
    return true;
}

// Filter data set
var dataset = regionData.filter(hasKeys);

//SCALES
var colorScale = d3.scaleLinear()
                   .domain(d3.extent(dataset, function(d) {
                       return d.urbanPopulationRate;
                   }))
                   .range(['lightgreen', 'black']);

var radiusScale = d3.scaleLinear()
                    .domain(d3.extent(dataset, function(d) {
                        return d.medianAge;
                    }))
                    .range([3, 40]);

var xScale = d3.scaleLinear()
               .domain(d3.extent(dataset, function(d) {
                   return d.adultLiteracyRate;
               }))
               .range([padding, svg_width - padding]);

var yScale = d3.scaleLinear()
               .domain(d3.extent(dataset, function(d) {
                   return d.subscribersPer100;
               }))
               .range([svg_height - padding, padding]);


// Add data points to SVG
d3.select("svg")
      .attr("width", svg_width)
      .attr("height", svg_height)
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
      .attr("cx", function(d) {
          return xScale(d.adultLiteracyRate);
      })
      .attr("cy", function(d) {
          return yScale(d.subscribersPer100);
      })
      .attr("fill", function(d) {
          return colorScale(d.urbanPopulationRate);
      })
      .attr("r", function(d) {
          return radiusScale(d.medianAge);
      })
      .attr("stroke", "black");


// AXES, LABELS & TITLE
var xAxis = d3.axisBottom(xScale)
              .tickSize(-svg_height + 2 * padding)
              .tickSizeOuter(0);
var yAxis = d3.axisLeft(yScale)
              .tickSize(-svg_width + 2 * padding)
              .tickSizeOuter(0);

// Attach axes to SVG
d3.select("svg")
    .append("g")
      .attr("transform", "translate(0, " + (svg_height - padding) + ")")
    .call(xAxis);

d3.select("svg")
    .append("g")
      .attr("transform", "translate(" + (padding) + ", 0)")
    .call(yAxis);

// Put labels on SVG
d3.select("svg")
    .append("text")
      .attr("x", svg_width / 2)
      .attr("y", svg_height - padding)
      .attr("dy", "2em")
      .attr("text-anchor", "middle")
      .text("Adult Literacy Rate");

d3.select("svg")
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -svg_height / 2)
      .attr("y", padding)
      .attr("dy", "-2em")
      .attr("text-anchor", "middle")
      .text("Subscribers per 100");

// Put title on SVG
d3.select("svg")
    .append("text")
      .attr("x", svg_width / 2)
      .attr("y", padding)
      .attr("dy", "-1.1em")
      .attr("text-anchor", "middle")
      .attr("font-size", "1.5em")
      .text("Cellular Subscriptions vs Adult Literacy Rate");
