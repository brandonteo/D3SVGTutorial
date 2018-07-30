function csvFormatter(row) {
    return {
      country: row.country,
      countryCode: row.countryCode,
      population: Number(row.population),
      medianAge: Number(row.medianAge),
      fertilityRate: Number(row.fertilityRate),
      populationDensity: Number(row.population) / Number(row.landArea)
    }
}

d3.queue()
  .defer(d3.json, '//unpkg.com/world-atlas@1.1.4/world/50m.json')
  .defer(d3.csv, './country_data.csv', csvFormatter)
  .await(function(error, mapData, populationData) {
    if (error) throw error;

    // Convert from topoJson -> geoJson
    var geoData = topojson.feature(mapData, mapData.objects.countries).features;

    // Attach populationData rows to each of their corr. country
    populationData.forEach(function(row) {
      var countries = geoData.filter(function(d) {return d.id === row.countryCode;});
      countries.forEach(function(country) {country.properties = row;});
    });

    // Setup SVG canvas
    var width = 960;
    var height = 600;

    // Initialize projection for geopath
    var projection = d3.geoMercator()
                       .scale(125)
                       .translate([width / 2, height / 1.4]);

    var path = d3.geoPath()
                 .projection(projection);

    // Place map onto SVG canvas
    d3.select("svg")
        .attr("width", width)
        .attr("height", height)
      .selectAll(".country")
      .data(geoData)
      .enter()
        .append("path")
        .classed("country", true)
        .attr("d", path);

    // Update function whenever different `select` option is chosen
    function updateMap(option) {
        // Transition colors
        var colorRanges = {
          population: ["white", "purple"],
          populationDensity: ["white", "red"],
          medianAge: ["white", "blue"],
          fertilityRate: ["brown", "yellow"]
        };

        var scale = d3.scaleLinear()
                      .domain([0, d3.max(populationData, function(d) {return d[option];})])
                      .range(colorRanges[option]);

        // Update colors based on input `option`
        d3.selectAll(".country")
          .transition()
          .duration(400)
          .ease(d3.easeBackIn)
          .attr("fill", function(d) {
            var data = d.properties[option];
            return data ? scale(data) : "#ccc";
          });
    }

    // Grab the `select` element
    var select = d3.select("select");

    // Add change listener to `select` element
    select.on("change", function(d) {updateMap(d3.event.target.value);});

    // Initialize first map on load
    updateMap(select.property("value"));
  });

















