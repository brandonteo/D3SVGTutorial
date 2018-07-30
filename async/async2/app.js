// Formatter for csv files
function formatter(row) {
  // Invalid regions we want to skip from the csv files
  var invalidRows = [
    "Arab World", "Central Europe and the Baltics", "Caribbean small states", "East Asia & Pacific (excluding high income)",
    "Early-demographic dividend", "East Asia & Pacific", "Europe & Central Asia (excluding high income)", "Europe & Central Asia",
    "Euro area", "European Union", "Fragile and conflict affected situations", "High income", "Heavily indebted poor countries (HIPC)",
    "IBRD only", "IDA & IBRD total", "IDA total", "IDA blend", "IDA only", "Not classified", "Latin America & Caribbean (excluding high income)",
    "Latin America & Caribbean", "Least developed countries: UN classification", "Low income", "Lower middle income", "Low & middle income",
    "Late-demographic dividend", "Middle East & North Africa", "Middle income", "Middle East & North Africa (excluding high income)",
    "North America", "OECD members", "Other small states", "Pre-demographic dividend", "Pacific island small states", "Post-demographic dividend",
    "Sub-Saharan Africa (excluding high income)", "Sub-Saharan Africa", "Small states", "East Asia & Pacific (IDA & IBRD countries)",
    "Europe & Central Asia (IDA & IBRD countries)", "Latin America & the Caribbean (IDA & IBRD countries)", "Middle East & North Africa (IDA & IBRD countries)",
    "South Asia (IDA & IBRD)", "Sub-Saharan Africa (IDA & IBRD countries)", "Upper middle income", "World"
  ];

  // For each row, we only want 2 fields
  var obj = {
    region: row["Country Name"],
    indicator: row["Indicator Name"]
  }

  // Current row contains an invalid region, we discard it by returning nothing
  if (invalidRows.indexOf(obj.region) > -1) return;

  // For valid rows, we put back the other fields and return it
  for (var key in row) {
    if (parseInt(key)) obj[key] = Number(row[key]) || null;
  }
  return obj;
}

d3.queue()
  .defer(d3.csv, './data/co2/API_EN.ATM.CO2E.KT_DS2_en_csv_v2.csv', formatter)
  .defer(d3.csv, './data/methane/API_EN.ATM.METH.KT.CE_DS2_en_csv_v2.csv', formatter)
  .defer(d3.csv, './data/renewable/API_EG.FEC.RNEW.ZS_DS2_en_csv_v2.csv', formatter)
  .defer(d3.csv, './data/population/API_SP.POP.TOTL_DS2_en_csv_v2.csv', formatter)
  .defer(d3.csv, './data/urban_population/API_SP.URB.TOTL_DS2_en_csv_v2.csv', formatter)
  .awaitAll(function(error, data) { // Script to utilize the extracted csv data
    if (error) throw error;

    // UTILITY FUNCTIONS ----------------------------------------------------------------
    function showTooltip(d) {
      var tooltip = d3.select('.tooltip');
      tooltip.style('opacity', 1)
             .style('left', ( d3.event.pageX - tooltip.node().offsetWidth / 2 ) + 'px' )
             .style('top', ( d3.event.pageY - tooltip.node().offsetHeight - 10 ) + 'px')
             .html(`
                <p>Region: ${d.region}</p>
                <p>Methane per capita: ${(d.methane / d.population).toFixed(4)}</p>
                <p>CO2 per capita: ${(d.co2 / d.population).toFixed(4)}</p>
                <p>Renewable energy: ${d.renewable.toFixed(2)}%</p>
                <p>Urban population: ${(d.urban / d.population * 100).toFixed(2)}%</p>
             `)
    }

    function hideTooltip(d) {
      d3.select('.tooltip')
          .style('opacity', 0);
    }

    // Function to weed out entries with null fields
    function validRegion(d) {
        for (var key in d) {
            if (d[key] === null) return false;
        }
        return true;
    }

    // Function to process the combined csv data `data` from awaitAll
    function formatAllData(data) {
        var yearObj = {};
        data.forEach(function(arr) {
            // Get the indicator and format the key
            var indicator = arr[0].indicator.split(" ")[0].replace(",","").toLowerCase();

            arr.forEach(function(obj) {
                // Grab the current region
                var region = obj.region;

                // Parse through every year and add that region's data to that year array
                for (var year in obj) {
                    if (parseInt(year)) {
                        if (!yearObj[year]) yearObj[year] = [];

                        var yearArr = yearObj[year];
                        var regionObj = yearArr.find(el => el.region === region);

                        if (regionObj) regionObj[indicator] = obj[year];
                        else {
                            var newObj = {region: region};
                            newObj[indicator] = obj[year];
                            yearArr.push(newObj);
                        }
                    }
                }
            })
        });
        // Remove years that don't have complete data sets for any region
        for (var year in yearObj) {
            yearObj[year] = yearObj[year].filter(validRegion);
            if (yearObj[year].length === 0) delete yearObj[year];
        }
        return yearObj;
    }
    // ------------------------------------------------------------------------------


    // SVG CANVAS SETUP -------------------------------------------------------------
    var width = 700;
    var height = 700;
    var padding = 100;
    var yearObj = formatAllData(data);
    var yearRange = d3.extent(Object.keys(yearObj).map(function(year) {return Number(year)}));

    d3.select('input')
        .property('min', yearRange[0])
        .property('max', yearRange[1])
        .property('value', yearRange[0])
    
    // Setup svg canvas
    var svg = d3.select('svg')
                .attr('width', width)
                .attr('height', height);

    // Attach x-axis to scatter plot
    svg.append('g')
        .attr('transform', 'translate(0, ' + (width - padding + 30) + ')')
        .classed('x-axis', true);

    // Attach y-axis to scatter plot
    svg.append('g')
        .attr('transform', 'translate(' + (padding - 30) + ',0)')
        .classed('y-axis', true);

    // Attach x-axis label
    svg.append('text')
        .text('CO2 Emissions (kt per person)')
        .attr('x', width / 2)
        .attr('y', height)
        .attr('dy', '-1.5em')
        .attr('text-anchor', 'middle');

    // Attach y-axis label
    svg.append('text')
        .text('Methane Emissions (kt of CO2 equivalent per person)')
        .attr('transform', 'rotate(-90)')
        .attr('x', - width / 2)
        .attr('y', '1.5em')
        .attr('text-anchor', 'middle');

    // Attach scatter plot title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', '2em')
        .attr('text-anchor', 'middle')
        .style('font-size', '1.5em')
        .classed('title', true);
    // ------------------------------------------------------------------------------


    // Updates the scatter plot according to input year
    function updatePlot(year) {
      // Grab the data associated to input `year`
      var data = yearObj[year];

      // Create scales
      var xScale = d3.scaleLinear()
                     .domain(d3.extent(data, function(d) {return d.co2 / d.population;}))
                     .range([padding, width - padding]);

      var yScale = d3.scaleLinear()
                     .domain(d3.extent(data, function(d) {return d.methane / d.population;}))
                     .range([height - padding, padding]);

      var colorScale = d3.scaleLinear()
                         .domain([0, 100])
                         .range(['brown', 'pink']);

      var radiusScale = d3.scaleLinear()
                          .domain([0, 1])
                          .range([5, 30]);

      // Execute the plot axes
      d3.select('.x-axis').call(d3.axisBottom(xScale));
      d3.select('.y-axis').call(d3.axisLeft(yScale));

      // Update title with correct input `year`
      d3.select('.title').text('Methane vs. CO2 emissions per capita (' + year + ')');

      // Standard update routine
      var updates = svg.selectAll('circle') // Step 1
                      .data(data, function(d) {return d.region;});
                      
      // Step 2
      updates
        .exit()
        .transition()
          .duration(350)
          .attr('r', 0)
        .remove();

      // Step 3
      updates
        .enter()
        .append('circle')
          // Attach tooltip events for data points
          .on('mousemove touchmove', showTooltip)
          .on('mouseout touchend', hideTooltip)
          .attr('cx', function(d) {return xScale(d.co2 / d.population);})
          .attr('cy', function(d) {return yScale(d.methane / d.population);})
          .attr('stroke', 'white')
          .attr('stroke-width', 1)
        // Step 4
        .merge(updates)
          .transition()
          .duration(350)
          .delay(function(d, i) {return i * 5;})
            .attr('cx', function(d) {return xScale(d.co2 / d.population);})
            .attr('cy', function(d) {return yScale(d.methane / d.population);})
            .attr('fill', function(d) {return colorScale(d.renewable);})
            .attr('r', function(d) {return radiusScale(d.urban / d.population);});
    }

    // Attach input listener 
    d3.select('input').on('input', function() {return updatePlot(Number(d3.event.target.value))});

    // Initialize svg canvas first input
    updatePlot(yearRange[0]);
  });
