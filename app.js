//var svgWidth = 960;
//var svgHeight = 800;

var svgWidth = 1020;
var svgHeight = 900;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcareLow";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderAxes1(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    //.call(leftAxis);
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

//function renderCircles1(circlesGroup1, newYScale, chosenYaxis) {
function renderCircles1(circlesGroup, newYScale, chosenYaxis) {
 // circlesGroup1.transition()
  circlesGroup.transition()
    .duration(1000)
    //.attr("cx", d => newYScale(d[chosenYAxis]));
    .attr("cy", d => newYScale(d[chosenYAxis]));
    
  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = "% in poverty:";
  }
  else if (chosenXAxis === "age"){
    var label = "Age:";
  }
  else {
    var label = "Income:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.abbr}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data1) {
    toolTip.show(data1);
  })
    // onmouseout event
    .on("mouseout", function(data1, index) {
      toolTip.hide(data1);
    });

  return circlesGroup;
}

function updateToolTip1(chosenYAxis, circlesGroup) {

  if (chosenYAxis === "obese") {
    var label = "Obesity:";
  }
  else if (chosenYAxis === "smokers"){
    var label = "Smokers:";
  }
  else {
    var label = "No Healthcare:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  // circlesGroup1.on("mouseover", function(data1) {
  //   toolTip1.show(data1);
  // })
  //   // onmouseout event
  //   .on("mouseout", function(data1, index) {
  //     toolTip1.hide(data1);
  //   });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv", function(err, data) {
  if (err) throw err;

  // parse data
  data.forEach(function(data1) {
    data1.poverty = +data1.poverty;
    data1.healthcareLow = +data1.healthcareLow;
    data1.age = +data1.age;
    data1.smokers = +data1.smokers;
    data1.income = +data1.income;
    data1.obesity = +data1.obesity;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  // var yLinearScale = d3.scaleLinear()
  //   .domain([0, d3.max(data, d => d.healthcareLow)])
  //   .range([height, 0]);
  var yLinearScale = yScale(data, chosenYAxis);


  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", ".8");

  // Create group for  3 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

   var ageLabel = labelsGroup.append("text")
     .attr("x", 0)
     .attr("y", 40)
     .attr("value", "age") // value to grab for event listener
     .classed("inactive", true)
     .text("Age (Median)");

     var incomeLabel = labelsGroup.append("text")
     .attr("x", 0)
     .attr("y", 60)
     .attr("value", "income") // value to grab for event listener
     .classed("inactive", true)
     .text("Household Income (Median)");

// Create group for  3 y- axis labels --- may or may not need to change
var labelsGroup1 = chartGroup.append("g")
    .attr("transform", "rotate(-90)")
//.attr("transform", `translate(${width / 2}, ${height + 20})`);

  // append y axis
    var healthcareLabel = labelsGroup1.append("text")
    //.attr("transform", "rotate(-90)")
    .attr("y", 30 - margin.left)
    .attr("x", 0 - (height / 2))
    //.attr("dy", "1em")
    //.classed("axis-text", true)
    .attr("value", "healthcareLow") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

    var smokersLabel = labelsGroup1.append("text")
    //.attr("transform", "rotate(-90)")
    .attr("y", 50 - margin.left)
    .attr("x", 0 - (height / 2))
    //.attr("dy", "1em")
    //.classed("axis-text", true)
    .attr("value", "smokers") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokers (%)");

    var obeseLabel = labelsGroup1.append("text")
    //.attr("transform", "rotate(-90)")
    .attr("y", 70 - margin.left)
    .attr("x", 0 - (height / 2))
    //.attr("dy", "1em")
    //.classed("axis-text", true)
    .attr("value", "obese") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
  //var circlesGroup1 = updateToolTip1(circlesGroup1, chosenYAxis);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
        

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }

        else if (chosenXAxis === "income") {
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });

  // y axis labels event listener
  labelsGroup1.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // updates x axis with transition
        yAxis = renderAxes1(yLinearScale, yAxis);
        

        // updates circles with new x values
        //circlesGroup1 = renderCircles1(circlesGroup1, yLinearScale, chosenYAxis);
        circlesGroup = renderCircles1(circlesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        //circlesGroup1 = updateToolTip1(chosenYAxis, circlesGroup1);
        circlesGroup = updateToolTip1(chosenYAxis, circlesGroup);
        

        // changes classes to change bold text
        if (chosenYAxis === "healthcareLow") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokersLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        }

        else if (chosenYAxis === "smokers") {
            smokersLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        else {
          smokersLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });



    // chartGroup.selectAll("text")
    // .on("click", function() {
    //   // get value of selection
    //   var value = d3.select(this).attr("value");
    //   if (value !== chosenXAxis) {

    //     // replaces chosenXAxis with value
    //     chosenXAxis = value;

    //     // console.log(chosenXAxis)

    //     // functions here found above csv import
    //     // updates x scale for new data
    //     xLinearScale = xScale(data, chosenXAxis);

    //     // updates x axis with transition
    //     yAxis = renderAxes(yLinearScale, yAxis);

    //     // updates circles with new x values
    //     circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenXAxis);

    //     // updates tooltips with new info
    //     circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    //     // changes classes to change bold text
    //     if (chosenXAxis === "age") {
    //       ageLabel
    //         .classed("active", true)
    //         .classed("inactive", false);
    //       povertyLabel
    //         .classed("active", false)
    //         .classed("inactive", true);
    //       incomeLabel
    //         .classed("active", false)
    //         .classed("inactive", true);
    //     }

    //     else if (chosenXAxis === "income") {
    //         incomeLabel
    //           .classed("active", true)
    //           .classed("inactive", false);
    //         povertyLabel
    //           .classed("active", false)
    //           .classed("inactive", true);
    //         ageLabel
    //           .classed("active", false)
    //           .classed("inactive", true);
    //       }
    //     else {
    //       ageLabel
    //         .classed("active", false)
    //         .classed("inactive", true);
    //       povertyLabel
    //         .classed("active", true)
    //         .classed("inactive", false);
    //     }
    //   }
    // });



});
