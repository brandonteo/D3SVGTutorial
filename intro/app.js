var svg_width = 400;
var svg_height = 200;
var bar_padding = 10;

var svg = d3.select("svg").attr("width", svg_width)
                          .attr("height", svg_height);

function getFrequencies(word) {
    var dict = []
    var sortedSplits = word.split("").sort();

    // The loop below utilizes the fact that `sortedSplits` is sorted
    for (var i = 0; i < sortedSplits.length; i++) {
        var last_elem = dict[dict.length - 1];
        if (last_elem && last_elem.character === sortedSplits[i]) {
            last_elem.count += 1;
        } else { // This is a newly seen character
            dict.push({character: sortedSplits[i], count: 1});
        }
    }

    return dict
}

// Deal with submit button -- essentially our update function
d3.select("form").on("submit", function() {
    // Prevent actually submitting the form
    d3.event.preventDefault();

    var input = d3.select("input").property("value");
    var formatted_input = getFrequencies(input);

    var bar_width = svg_width/formatted_input.length - bar_padding;
    
    var updates = svg.selectAll(".letter")
                     .data(formatted_input, function(d) {
                         return d.character;
                     });
                              
    // Step 1 & 2 of update pattern
    updates
        .classed("new", false)
        .exit()
        .remove();
    
    var enters = updates
                    .enter() // Step 3 of update pattern
                    .append("g")
                    .classed("letter", true)
                    .classed("new", true)
    
    // To nest elements, we'll need to save the parent to a variable and append
    // (!!) enters.append("rect").append("text") will append `text` within `rect`
    enters.append("rect")
    enters.append("text");

    enters.merge(updates)
          .select("text")
          .attr("text-anchor", "middle")
          .attr("color", "black")
          .attr("x", function(d, i) {
            return (bar_width + bar_padding) * i + bar_width/2;
          })
          .attr("y", function(d) {
            return svg_height - d.count * 20 - 10;
          })
          .text(function(d) {
            return d.character;
          });

    enters.merge(updates) // Step 4 of update pattern
          .select("rect")
          .attr("width", bar_width)
          .attr("height", function(d) {
             return (d.count * 20);
          })
          .attr("x", function(d, i) {
              return (bar_width + bar_padding) * i;
          })
          .attr("y", function(d) {
              return svg_height - d.count * 20;
          });

    d3.select("#phrase").text("Analysis of: " + input);
    d3.select("#count").text("(new chars: " + updates.enter().nodes().length + ")");
    d3.select("input").property("value", "");
});

d3.select("#reset").on("click", function() {
    d3.selectAll(".letter").remove();
    d3.selectAll("#phrase").text("");
    d3.selectAll("#count").text("");
});
