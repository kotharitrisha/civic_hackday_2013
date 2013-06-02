var app = {};

app.typeLookup = {
  "Robbery No Firearm": "violent",
  "Aggravated Assault Firearm": "violent",
  "Aggravated Assault No Firearm": "violent",
  "Robbery Firearm": "violent",
  "Homicide": "violent",
  "Rape": "violent",
  "Theft from Vehicle": "property",
  "Recovered Stolen Motor Vehicle":  "property",
  "Burglary Residential": "property",
  "Burglary Non-Residential": "property",
  "Thefts": "property",
  "Motor Vehicle Theft": "property"
};

app.order = [
  "Aggravated Assault Firearm",
  "Aggravated Assault No Firearm",
  "Homicide",
  "Rape",
  "Robbery Firearm",
  "Robbery No Firearm",
  "Burglary Residential",
  "Burglary Non-Residential",
  "Motor Vehicle Theft",
  "Recovered Stolen Motor Vehicle",
  "Thefts",
  "Theft from Vehicle"
];

app.legendItems = [
  {
    className: "decrease-four",
    range: "< -100%"
  },
  {
    className: "decrease-three",
    range: "< -50% "
  },
  {
    className: "decrease-two",
    range: "< -25%"
  },
  {
    className: "decrease-one",
    range: "< -5%"
  },
  {
    className: "no-change",
    range: "+- 5%"
  },
  {
    className: "increase-one",
    range: "> 5%"
  },
  {
    className: "increase-two",
    range: "> 25%"
  },
  {
    className: "increase-three",
    range: "> 50%"
  },
  {
    className: "increase-four",
    range: "> 100%"
  }
];

// Find your color
app.getColor = function(percentChange) {
  var color = '';
  switch(true) {
    case (percentChange < -1):
      color = "decrease-four";
      break;
    case ((percentChange >= -1) && (percentChange < -0.50)):
      color = "decrease-three";
      break;
    case ((percentChange >= -0.50) && (percentChange < -0.25)):
      color = "decrease-two";
      break;
    case ((percentChange >= -0.25) && (percentChange < -0.05)):
      color = "decrease-one";
      break;
    case ((percentChange >= -0.05) && (percentChange <= 0.05)):
      color = "no-change";
      break;
    case ((percentChange >= 0.05) && (percentChange <= 0.25)):
      color = "increase-one";
      break;
    case ((percentChange >= 0.25) && (percentChange <= 0.50)):
      color = "increase-two";
      break;
    case ((percentChange >= 0.50) && (percentChange <= 1)):
      color = "increase-three";
      break;
    case (percentChange > 1):
      color = "increase-four";
      break;
    default:
      color = "foo";
      break;
  }

  return color;
};

app.resize = function() {
  //map resizing
  d3.select(window)
    .on("resize", function(e) {
      var mapRatio = 400 / 435;

        if(window.innerWidth < 400) {
          d3.select("#map svg")
            .attr("width", window.innerWidth - 40)
            .attr("height", (window.innerWidth - 40) / mapRatio);
        } else {
          d3.select("#map svg")
            .attr("width", 400)
            .attr("height", 435);
        }

        if(window.innerWidth < 400) {
          d3.select("#legend svg")
            .attr("width", window.innerWidth - 20);
        } else {
          d3.select("#legend svg")
            .attr("height", 50)
            .attr("width", 400);
        }
    });
};

// Legend
app.legend = d3.select("#legend").append("svg")
    .attr("height", 50)
    .attr("width", 400)
    .attr("viewBox", "0 0 400 50")
    .attr("preserveAspectRatio", "xMidYMid")
  .selectAll("g")
    .data(app.legendItems)
  .enter().append("g");

app.legend.append("rect")
    .attr("height", 20)
    .attr("width", 45)
    .attr("x", function(d, i) { return i * 43; })
    .attr("class", function(d) { return d.className; });

app.legend.append("text")
    .text(function(d) { return d.range; })
    .attr("x", function(d, i) { return i * 43.5; })
    .attr("y", 35)
    .call(function() {

      if(window.innerWidth < 400) {
        d3.select("#legend svg").
          attr("width", window.innerWidth - 20);
      }
    });



// Charts
app.charts = {};

d3.json("/static/data/summary.json", function(error, data){

  var margin = {top: 20, right: 10, bottom: 20, left: 30},
      width = 85 - margin.left - margin.right,
      height = 80 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], -0.5);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .tickValues(["'07", "'08", "'09", "'10", "'11", "'12"])
      .orient("bottom");

  x.domain(["2007", "2008", "2009", "2010", "2011", "2012"]);

  // Make the summary charts and the mini-charts
  app.makeCharts = function(id) {
    var districtData;

    // Find data for district
    for(var x=0; x<data.length; x++) {
      if(data[x].MAPNAME === id) {
        districtData = data[x];
        break;
      }
    }

    // Clear out existing charts
    d3.select("#violent-charts").html("");
    d3.select("#property-charts").html("");

    // Add mini-charts in order they are listed in app.order
    for(var i=0; i<app.order.length; i++) {
      var crimeData = districtData.crimes[app.order[i]] || [];

      app.makeMiniChart(crimeData, app.order[i], i);
    }
  };

  // Create individual chart
  app.makeMiniChart = function(data, label, index) {
    // Create new span for chart
    var chartType = app.typeLookup[label];

    // Add div for chart
    var div = d3.select("#" + chartType + "-charts").append("div")
      .attr("class", "chart-container chart-" + index);

    //if (label === 'Homicide') { label = 'Homicide*'; }

    // Label span
    div.html("<span>" + label + "</span>");

    // Add svg for chart
    app.charts.svg = d3.select(".chart-" + index).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // set up appropriate y scale
    y.domain([0, d3.max(data, function(d) { return d.count; })]);

    var yAxis = d3.svg.axis()
      .scale(y)
      .ticks(2)
      .orient("left");

    // Add axes to chart
    app.charts.svg.append("g")
        .attr("class", "y axis")
        .attr("width", 68)
        .attr("transform", "translate(1, 0)")
        .call(yAxis)
      .append("text")
        .attr("dy", ".71em");

    app.charts.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, 40)")
        .call(xAxis);

    app.charts.svg.selectAll('.x.axis text')
        .attr("y", -6)
        .attr("x", -10)
        .attr("transform", "rotate(-90)");

    // Add data to chart
    app.charts.svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.year); })
        .attr("width", 7)
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return height - y(d.count); });
  };

  // Updates neighborhood name and table
  app.updateDisplay = function(id) {
    d3.select('#neighborhood span').html(id);

    for(var i=0; i<data.length; i++) {
      if(data[i].MAPNAME === id) {
        var crimeData = data[i];

        for(var stat in crimeData.stats.change) {
          d3.select('#' + stat)
            .attr("class", app.getColor(crimeData.stats.change[stat]) + ' stat')
            .html(function(){
              if (crimeData.stats.change[stat] !== 'N/A') {
                return (crimeData.stats.change[stat] * 100).toFixed(0) + '%';
              } else {
                return "N/A";
              }
          });
        }

        break;
      }
    }
  };

  // Map
  app.map = {};

  d3.json("/static/data/philly.json", function(error, topology) {
  app.map.path = d3.geo.path()
    .projection(d3.geo.mercator([-75.118,40.0020])
    .scale(438635)
    .translate([91727, 53480]));

  app.map.svg = d3.select("#map").append("svg")
    .attr("viewBox", "0 0 400 435")
    .attr("preserveAspectRatio", "xMidYMid")
    .attr("width", 400)
    .attr("height", 435);

  app.map.svg.selectAll("path")
      .data(topojson.object(topology, topology.objects.neighborhoods).geometries)
    .enter().append("path")
      .attr("d", app.map.path)
      .attr("class", function(d) {
        var percentChange;

        for(var i=0; i<data.length; i++) {
          if(data[i].MAPNAME === d.id) {
            percentChange = data[i].stats.change.percentChangeTotal0712;
          }
        }
        
        var color = app.getColor(percentChange);
        return color;
      })
      .on("mouseover", function(d){
        if(window.innerWidth >= 768) {
          app.updateDisplay(d.id);
          app.makeCharts(d.id);
        }
      })
      .on("click", function(d) {
        if(window.innerWidth < 768) {
          app.updateDisplay(d.id);
          app.makeCharts(d.id);
        }
      })
      .call(function(){
        app.resize();

        var ratio = 400 / 435;

        if(window.innerWidth < 400) {
          d3.select("#map svg")
            .attr("width", window.innerWidth - 40)
            .attr("height", (window.innerWidth - 40) / ratio);
        }
      });
  });

  // Map switching
  d3.select('#map-select')
    .on("change", function() {

      var selectedIndex = d3.event.target.options.selectedIndex,
          current = d3.event.target.options[selectedIndex].value,
          currentClass = d3.event.target.options[selectedIndex].className;

      //show relevant table row
      d3.selectAll('.stat-line').classed('hidden', true);
      d3.select('#' + currentClass).classed('hidden', false);

      app.map.svg.selectAll("path")
        .attr("class", function(d) {
          var percentChange;

          for(var i=0; i<data.length; i++) {
            if(data[i].MAPNAME === d.id) {
              percentChange = data[i].stats.change[current];
            }
          }

          var color = app.getColor(percentChange);
          return color;
        });
    });

});