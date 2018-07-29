var svgWidth = 400;
var svgHeight = 400;
var minYear = d3.min(birthData, function(d) {return d.year;});
var maxYear = d3.max(birthData, function(d) {return d.year;});

d3.select("input")
    .property("min", minYear)
    .property("max", maxYear)
    .property("value", minYear);

var months = ["January", "February", "March", "April", "May", "June", 
              "July", "August", "September", "October", "November", "December"]

var quarterColors = ["#1f77b4", "#2ca02c", "#d62728", "#ff7f0e"]

var colorScale = d3.scaleOrdinal()
                   .domain(months)
                   .range(d3.schemeCategory20)

var pieChart = d3.select("svg")
                   .attr("width", svgWidth)
                   .attr("height", svgHeight)
                 
var outerChart = pieChart.append("g")
                         .attr("transform", "translate(" + (svgWidth / 2) + ", " + (svgHeight / 2) + ")")

var innerChart = pieChart.append("g")
                         .attr("transform", "translate(" + (svgWidth / 2) + ", " + (svgHeight / 2) + ")")

var outerArcsGenerator = d3.pie()
                           .value(function(d) {return d.births;})
                           .sort(function(a,b) {
                               return months.indexOf(a.month) - months.indexOf(b.month);
                           });

var innerArcsGenerator = d3.pie()
                           .value(function(d) {return d.births;})
                           .sort(function(a,b) {
                               return a.quarter - b.quarter;
                           });


function updatePieChart(targetYear) {
    var dataset = birthData.filter(function(d) {
        return d.year === targetYear;
    })

    var outerArcs = outerArcsGenerator(dataset);
    var innerArcs = innerArcsGenerator(getDataByQuarter(dataset));

    var outerPath = d3.arc()
                      .outerRadius(svgWidth / 2 - 10)
                      .innerRadius(svgWidth / 4);

    var innerPath = d3.arc()
                      .outerRadius(svgWidth / 4)
                      .innerRadius(0);
    
    // Update pattern
    var outerUpdates = outerChart.selectAll(".arc")
                                 .data(outerArcs);

    var innerUpdates = innerChart.selectAll(".arc")
                                 .data(innerArcs);

    outerUpdates.exit()
                .remove();

    innerUpdates.exit()
                .remove();

    outerUpdates.enter()
                .append("path")
                  .classed("arc", true)
                .merge(outerUpdates)
                  .attr("fill", function(d) {return colorScale(d.data.month);})
                  .attr("stroke", "black")
                  .attr("d", outerPath);

    innerUpdates.enter()
                .append("path")
                  .classed("arc", true)
                .merge(innerUpdates)
                  .attr("fill", function(d, i) {return quarterColors[i];})
                  .attr("stroke", "black")
                  .attr("d", innerPath);

    d3.select(".year-display")
        .text("Births by month in year " + targetYear);
}

function getDataByQuarter(yearlyData) {
    var quarterTallies = [0, 1, 2, 3].map(function(n) {return {"quarter": n, "births": 0};})
    for (var i = 0; i < yearlyData.length; i++) {
        var row = yearlyData[i]
        var corrQuarter = Math.floor(months.indexOf(row.month) / 3);
        quarterTallies[corrQuarter].births += row.births;
    }
    return quarterTallies;
}

d3.select("input").on("input", function() {
    updatePieChart(Number(d3.event.target.value));
});

updatePieChart(minYear);
