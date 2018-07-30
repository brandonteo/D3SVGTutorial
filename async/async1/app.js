d3.queue()
  .defer(d3.json, './countries.json')
  .defer(d3.csv, './simplemaps-worldcities-basic.csv', function(row, i, headers) { // Need to pass in formatter in defer
        if (Number(row.pop) < 10000) return; // Discard cities that are too small

        return {
            cityName: row.city,
            countryCode: row.iso2,
            population: Number(row.pop)
        };
  })
  .await(function(error, countries, cities) { // Callback for all the defers
        if (error) throw error;

        var data = countries.geonames.map(function(country) {
            country.cities = cities.filter(function(city) {return city.countryCode === country.countryCode});
            return country;
        });

        var countryDivSelection = d3.select("body")
                                    .selectAll("div")
                                    .data(data)
                                    .enter()
                                    .append("div");

        countryDivSelection.append("h3")
                           .text(function(d) {return d.countryName});

        countryDivSelection.append("ul")
                           .html(function(d) { // d here is a single country obj
                                return d.cities.map(function(city) {
                                            var percentage = city.population / d.population * 100;
                                            return `<li>${city.cityName} - ${percentage.toFixed(2)}%</li>`
                                       }).join('');
                           });

        
  })

