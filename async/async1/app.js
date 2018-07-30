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
            // Add a `cities` field to the `country` obj and return it
            country.cities = cities.filter(function(city) {return city.countryCode === country.countryCode});
            return country;
        });

        var countryDivSelection = d3.select("body")
                                    .selectAll("div")
                                    .data(data)
                                    .enter()
                                    .append("div");

        // Append a `h3` inside the div
        countryDivSelection.append("h3")
                           .text(function(d) {return d.countryName});

        // Append a `ul` inside the div
        countryDivSelection.append("ul")
                           // Populate the `ul` with an inner html element consisting of all the `li`s
                           .html(function(d) { // d here is a single country obj
                                return d.cities.map(function(city) {
                                            var percentage = city.population / d.population * 100;
                                            return `<li>${city.cityName} - ${percentage.toFixed(2)}%</li>`
                                       }).join('');
                           });
  })

