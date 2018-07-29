var svg_width = 500;
var svg_height = 500;
var padding = 40;

// SCALES
var yScale = d3.scaleLinear()
               .domain(d3.extent(birthData2011, function(d) {
                   return d.lifeExpectancy;
               }))
               .range([svg_height - padding, padding]);

var xScale = d3.scaleLinear()
               .domain(d3.extent(birthData2011, function(d) {
                   return d.births / d.population;
               }))
               .range([padding, svg_width - padding]);

var colorScale = d3.scaleLinear()
                   .domain(d3.extent(birthData2011, function(d) {
                       return d.population / d.area;
                   }))
                   .range(['pink', 'black']);

var radiusScale = d3.scaleLinear()
                    .domain(d3.extent(birthData2011, function(d) {
                       return d.births;
                    }))
                    .range([3, 40]);


// Basic routine here is to:
// 1. Set attributes for svg
// 2. Select all not yet existent elements
// 3. Bind data
// 4. Select `enter()` and append individual elements
// 5. Set attributes for individual elements
d3.select("svg")
      .attr("width", svg_width)
      .attr("height", svg_height)
    .selectAll("circle")
    .data(birthData2011)
    .enter()
    .append("circle")
      .attr("cx", function(d) {
        return xScale(d.births / d.population);
      })
      .attr("cy", function(d) {
        return yScale(d.lifeExpectancy);
      })
      .attr("r", function(d) {
        return radiusScale(d.births);
      })
      .attr("fill", function(d) {
        return colorScale(d.population / d.area);
      });


// AXES
var xAxis = d3.axisBottom(xScale)
              .tickSize(-svg_height + 2 * padding) // To account for the padding we added to the yScale
              .tickSizeOuter(0); // To account for the padding we added to the yScale
var yAxis = d3.axisLeft(yScale)
              .tickSize(-svg_width + 2 * padding) // To account for the padding we added to the xScale
              .tickSizeOuter(0); // To account for the padding we added to the xScale

d3.select("svg")
    .append("g")
      .attr("transform", "translate(0, " + (svg_height - padding) + ")")
    .call(xAxis)
d3.select("svg")
    .append("g")
      .attr("transform", "translate(" + (padding) + ", 0)")
    .call(yAxis)


// AXES LABELS & TITLE
d3.select("svg")
      .append("text")
         .attr("x", svg_width / 2)
         .attr("y", svg_height - padding)
         .attr("dy", "2em")
         .style("text-anchor", "middle")
         .text("Births per Capita")

d3.select("svg")
      .append("text")
         .attr("transform", "rotate(-90)")
         .attr("x", -(svg_height / 2))
         .attr("y", padding)
         .attr("dy", "-1.8em")
         .style("text-anchor", "middle")
         .text("Life Expectancy")

d3.select("svg")
      .append("text")
         .attr("x", svg_width / 2)
         .attr("y", padding)
         .attr("dy", "-0.5em")
         .attr("font-size", "1.3em")
         .style("text-anchor", "middle")
         .text("Data on Births by Country in 2011")


