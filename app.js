/*global
d3
_
moment
*/

var transientTector = {};

transientTector.timeParse = d3.timeParse("%Y-%m-%d %H:%M:%S");
transientTector.timeFormat = d3.timeFormat("%Y-%m-%d %H:%M");
transientTector.timePlot = function (directorEvents, dataKey) {
    "use strict";
    var dimensions = {width: 0, height: 0, parentWidth: 0, parentHeight: 0};
    var container;
    var data;
    var zoom;
    var scales = {
        xDisplayed: d3.scaleTime(),
        y: d3.scaleLinear()
    };
    var axes = {
        y: d3.axisLeft(scales.y)
    };
    var plotLine = d3.line()
        .x(function (d) {
            return scales.xDisplayed(d.timestamp);
        })
        .y(function (d) {
            return scales.y(d[dataKey]);
        })
        .defined(function (d) {
            return d;
        });
    var selectedTimespans = [];

    function hover(hoveredCoordinate, closestPoint) {
        container.select("line.hover")
            .attr("x1", hoveredCoordinate)
            .attr("y1", 0)
            .attr("x2", hoveredCoordinate)
            .attr("y2", dimensions.height * 0.8);

        if (closestPoint) {
            container.select("circle.hover")
                .attr("cx", scales.xDisplayed(closestPoint.timestamp))
                .attr("cy", scales.y(closestPoint[dataKey]))
                .attr("r", 2);
        }


    }

    function zoomed() {
        container.select("svg").select("path.plot-line")
            .data([data.raw])
            .attr("d", plotLine);
        var now = moment();
        var pointWidth = scales.xDisplayed(now) - scales.xDisplayed(now.subtract(10, 'minutes'));
        pointWidth = pointWidth > 1 ? pointWidth : 1;

        var labels = container
            .select("g.transient-labels")
            .selectAll("rect.transient-label")
            .data(data.labels);

        labels.enter()
            .append("rect")
            .attr("class", "transient-label")
            .merge(labels)
            .attr("x", function (d) {
                return scales.xDisplayed(moment(d.timestamp).subtract(5, 'minutes'));
            })
            .attr("y", dimensions.highlightHeight)
            .attr("width", pointWidth)
            .attr("height", dimensions.yHeight);

        labels.exit().remove();

        var selectedRanges = container
            .select("g.selected-timespans")
            .selectAll("rect.timespan")
            .data(selectedTimespans);

        selectedRanges.enter()
            .append("rect")
            .attr("class", "timespan")
            .merge(selectedRanges)
            .attr("x", function (d) {
                return scales.xDisplayed(moment(d[0]).subtract(5, 'minutes'));
            })
            .attr("y", 0)
            .attr("width", function (d) {
                var width = Math.abs(scales.xDisplayed(moment(d[1]).add(5, 'minutes')) -
                    scales.xDisplayed(moment(d[0]).subtract(5, 'minutes')));
                return width > 1 ? width : 1;
            })
            .attr("height", dimensions.plotHeight);

        selectedRanges.exit().remove();
    }

    function draw() {
        var yExtent = d3.extent(data.raw, function (d) {
            return d[dataKey];
        });
        scales.y.range([dimensions.plotHeight - dimensions.highlightHeight, dimensions.highlightHeight])
            .domain(yExtent);

        container.select("svg").select('rect.timeline-hover')
            .attr('width', dimensions.width)
            .attr('height', dimensions.plotHeight);
        //.call(zoom);

        container.select("svg")
            .attr("width", dimensions.width)
            .attr("height", dimensions.plotHeight);

        container.select("h5")
            .text(dataKey);

        container.select("svg").select("path.plot-line")
            .data([data.raw])
            .attr("d", simplify(plotLine, .5));

        var now = moment();
        var pointWidth = scales.xDisplayed(now) - scales.xDisplayed(now.subtract(10, 'minutes'));
        pointWidth = pointWidth > 1 ? pointWidth : 1;

        var labels = container
            .select("g.transient-labels")
            .selectAll("rect.transient-label")
            .data(data.labels);

        labels.enter()
            .append("rect")
            .attr("class", "transient-label")
            .merge(labels)
            .attr("x", function (d) {
                return scales.xDisplayed(moment(d.timestamp).subtract(5, 'minutes'));
            })
            .attr("y", dimensions.highlightHeight)
            .attr("width", pointWidth)
            .attr("height", dimensions.yHeight);

        labels.exit().remove();

        var selectedRanges = container
            .select("g.selected-timespans")
            .selectAll("rect.timespan")
            .data(selectedTimespans);

        selectedRanges.enter()
            .append("rect")
            .attr("class", "timespan")
            .merge(selectedRanges)
            .attr("x", function (d) {
                return scales.xDisplayed(moment(d[0]).subtract(5, 'minutes'));
            })
            .attr("y", 0)
            .attr("width", function (d) {
                var width = Math.abs(scales.xDisplayed(moment(d[1]).add(5, 'minutes')) -
                    scales.xDisplayed(moment(d[0]).subtract(5, 'minutes')));
                return width > 1 ? width : 1;
            })
            .attr("height", dimensions.plotHeight);

        selectedRanges.exit().remove();

        container.select("g.yaxis")
            .attr("transform", "translate(" + (dimensions.width * 0.05) + ",0)")
            .call(axes.y);

    }

    function constructor(selection) {
        selection.each(function (d) {
            container = d3.select(this);
            data = d;

            container.selectAll("svg").remove();
            container.selectAll("div").remove();

            container.append("div")
                .attr("class", "plot-title")
                .append("h5");

            var svg = container.append("svg");
            svg.append("defs").append("svg:clipPath")
                .attr("id", "clip")
                .append("svg:rect")
                .attr("width", dimensions.width)
                .attr("height", dimensions.plotHeight)
                .attr("x", 0)
                .attr("y", 0);

            svg.append('g')
                .attr("class", "selected-timespans");
            svg.append("g")
                .attr("class", "transient-labels");

            svg.append('g')
                .attr("class", "yaxis")
                .attr("fill", "none");

            var focused = svg.append('g')
                .attr("class", "focus")
                .attr("clip-path", "url(#clip)");

            focused.append("path")
                .attr("class", "plot-line")
                .attr("fill", "none");

            svg.append("line").attr("class", "hover");
            svg.append("circle").attr("class", "hover");

            svg.append('rect')
                .attr("class", "timeline-hover")
                .attr('fill-opacity', 0)
                .attr('stroke-opacity', 0);

            draw();
        });
    }

    constructor.dimensions = function (value) {
        if (!arguments.length) {
            return dimensions;
        }
        dimensions.width = value.width - 30;
        dimensions.height = value.height / 6;

        dimensions.titleHeight = dimensions.height * 0.2;
        dimensions.plotHeight = dimensions.height - dimensions.titleHeight;
        dimensions.yHeight = dimensions.plotHeight * 0.9;
        dimensions.highlightHeight = (dimensions.plotHeight - dimensions.yHeight) / 2;

        dimensions.parentWidth = value.width;
        dimensions.parentHeight = value.height;
        return constructor;
    };
    constructor.xScale = function (value) {
        if (!arguments.length) {
            return scales.xDisplayed;
        }
        scales.xDisplayed = value;
        // axes.x = d3.axisBottom(scales.xDisplayed);
        return constructor;
    };
    constructor.hover = function (coord, closestPoint) {
        hover(coord, closestPoint);
        return constructor;
    };
    constructor.zoom = function (value) {
        if (!arguments.length) {
            return zoom;
        }
        zoom = value;
        // axes.x = d3.axisBottom(scales.xDisplayed);
        return constructor;
    };
    constructor.zoomed = function () {
        zoomed();
        return constructor;
    };
    constructor.selectTimespans = function (value) {
        if (!arguments.length) {
            return selectedTimespans;
        }
        selectedTimespans = value;
        draw();

        return constructor;
    };
    return constructor;
};
transientTector.timeSeries = function (directorEvents) {
    "use strict";
    var dimensions = {width: 0, height: 0, parentWidth: 0, parentHeight: 0};
    var container;
    var data;
    var fieldOptions = [];
    var events = {};
    var rawPlots = {
        "perf_pow": transientTector.timePlot(events, "perf_pow"),
        "t5_5": transientTector.timePlot(events, "t5_5")
    };
    var eigenPlots = {
        "pca_eig0": transientTector.timePlot(events, "pca_eig0")
    };
    var scales = {
        xDisplayed: d3.scaleTime(),
        xFull: d3.scaleTime()
    };
    var selectedTimestamps = [];
    var selectedStreaks = [];


    function selectTimestamp(){
        var coord = d3.event.offsetX;
        var hoveredDate = scales.xDisplayed.invert(coord);

        var rawPoint = _.first(_.sortBy(data.raw, function (d) {
            return Math.abs(hoveredDate - d.timestamp);
        }));

        if(!rawPoint){
            return;
        }
        directorEvents.selectTimestamps([rawPoint.timestamp]);
    }

    function rawFeatureSelect(d) {
        if (rawPlots[d.field]) {
            d3.select(this).attr("class", "dropdown-item");
            delete rawPlots[d.field]
        } else {
            d3.select(this).attr("class", "dropdown-item active");
            rawPlots[d.field] = transientTector.timePlot(events, d.field);
        }
        draw();
    }

    function eigenvectorSelect(d) {
        if (eigenPlots[d.field]) {
            d3.select(this).attr("class", "dropdown-item");
            delete eigenPlots[d.field]
        } else {
            d3.select(this).attr("class", "dropdown-item active");
            eigenPlots[d.field] = transientTector.timePlot(events, d.field);
        }
        draw();
    }

    function hover(d, i) {
        var coord = d3.event.offsetX;
        var hoveredDate = scales.xDisplayed.invert(coord);

        var rawPoint = _.first(_.sortBy(data.raw, function (d) {
            return Math.abs(hoveredDate - d.timestamp);
        }));
        var eigenPoint = _.first(_.sortBy(data.pca, function (d) {
            return Math.abs(hoveredDate - d.timestamp);
        }));
        var labelPoint = _.find(data.mergedLabels, function (d) {
            return d.timestamp.getTime() === eigenPoint.timestamp.getTime();
        });

        for (var key in rawPlots) {
            rawPlots[key].hover(coord, rawPoint);
        }
        for (var key in eigenPlots) {
            eigenPlots[key].hover(coord, eigenPoint);
        }

        var labelDescription = "None";
        if (labelPoint) {
            labelDescription = "";
            labelDescription += labelPoint.kink ? "Kink Finder<br />" : "";
            labelDescription += labelPoint.powerStep ? "Power Jump<br />" : "";
            labelDescription += labelPoint.stepSize ? "Step Size<br />" : "";
            labelDescription += labelPoint.hdbscan ? "HDBScan<br />" : "";
        }

        var html = "<div class='popover-header'>" + transientTector.timeFormat(rawPoint.timestamp) + "</div>";
        html += "<table class='table table-sm'><tbody>";
        for (var plot in eigenPlots) {
            html += "<tr><td>" + plot + "</td><td>" + eigenPoint[plot] + "</td>";
        }
        for (var plot in rawPlots) {
            html += "<tr><td>" + plot + "</td><td>" + rawPoint[plot] + "</td>";
        }
        html += "</tbody></table>";
        html += "<div>" + labelDescription + "</div>";
        d3.select("#timeseries-hover")
            .html(html)
            .attr("style", "display:block;left:" + (d3.event.pageX + 30) + "px;top:" + (d3.event.pageY + 100) + "px;");

    }

    function zoom() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        scales.xDisplayed.domain(t.rescaleX(scales.xFull).domain());

        for (var key in rawPlots) {
            rawPlots[key].xScale(scales.xDisplayed).zoomed();
        }
        for (var key in eigenPlots) {
            eigenPlots[key].xScale(scales.xDisplayed).zoomed();
        }

        container.select("g.xaxis")
            .call(d3.axisBottom(scales.xDisplayed))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
    }

    function draw() {
        if (!data.raw && !data.pca) {
            return;
        }

        var xExtent = d3.extent(data.raw, function (d) {
            return d.timestamp;
        });
        scales.xDisplayed.range([(dimensions.width * 0.05), dimensions.width]);
        scales.xFull.range([(dimensions.width * 0.05), dimensions.width]);
        scales.xDisplayed.domain(xExtent);
        scales.xFull.domain(xExtent);

        var raw = container.select("#timeseries-plots-raw")
            .selectAll("div.raw-plot")
            .data(Object.keys(rawPlots));
        raw.enter()
            .append("div")
            .merge(raw)
            .attr("class", function (d) {
                return "text-center raw-plot " + d;
            });
        raw.exit().remove();

        var eigen = container.select("#timeseries-plots-eigen")
            .selectAll("div.eigen-plot")
            .data(Object.keys(eigenPlots));
        eigen.enter()
            .append("div")
            .merge(eigen)
            .attr("class", function (d) {
                return "text-center eigen-plot " + d;
            });
        eigen.exit().remove();

        var zoomer = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [dimensions.width, dimensions.height * 0.8]])
            .extent([[0, 0], [dimensions.width, dimensions.height * 0.8]])
            .on("zoom", zoom);

        container.select("#timeseries-overlay")
            .attr("style", "width:" + (dimensions.width - 30) + "px;height:" + dimensions.height + "px;")
            .on("mousemove", hover)
            .on("click", selectTimestamp)
            .call(zoomer);

        container.select("g.xaxis")
            .call(d3.axisBottom(scales.xDisplayed)
                .tickFormat(d3.timeFormat("%Y-%m-%d")))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        var menuOptions = container.select(".raw-feature-selector")
            .select(".dropdown-menu")
            .selectAll(".dropdown-item")
            .data(data.fields);

        menuOptions.enter()
            .append("a")
            .attr("class", function (d) {
                return rawPlots[d.field] ? "dropdown-item active" : "dropdown-item";
            })
            .attr("href", "#")
            .on("click", rawFeatureSelect)
            .merge(menuOptions)
            .text(function (d) {
                return d.field;
            });

        menuOptions.exit().remove();

        var menuOptions = container.select(".eigenvector-selector")
            .select(".dropdown-menu")
            .selectAll(".dropdown-item")
            .data(data.compositeFields);

        menuOptions.enter()
            .append("a")
            .attr("class", function (d) {
                return eigenPlots[d.field] ? "dropdown-item active" : "dropdown-item";
            })
            .attr("href", "#")
            .on("click", eigenvectorSelect)
            .merge(menuOptions)
            .text(function (d) {
                return d.name + " - " + d.variance_explained + "%";
            });

        menuOptions.exit().remove();

        for (var key in eigenPlots) {
            container.selectAll("div.eigen-plot." + key)
                .datum({
                    raw: data.pca,
                    labels: data.mergedLabels
                })
                .call(eigenPlots[key].xScale(scales.xDisplayed).dimensions(dimensions));
        }
        for (var key in rawPlots) {
            container.selectAll("div.raw-plot." + key)
                .datum({
                    raw: data.raw,
                    labels: data.mergedLabels
                })
                .call(rawPlots[key].xScale(scales.xDisplayed).dimensions(dimensions));
        }

    }

    function constructor(selection) {
        selection.each(function (d) {
            container = d3.select(this);
            data = d;
            var kinkDates = _.map(data.kinkLabels, function (d) {
                return d.timestamp.getTime();
            });
            var powerDates = _.map(data.powerStepLabels, function (d) {
                return d.timestamp.getTime();
            });
            var stepDates = _.map(data.stepSizeLabels, function (d) {
                return d.timestamp.getTime();
            });
            var dates = _.union(kinkDates, powerDates, stepDates);
            var timeParse = d3.timeParse("%Q");
            data.mergedLabels = _.map(dates, function (d) {
                var hasKink = _.contains(kinkDates, d) ? 1 : 0;
                var hasPower = _.contains(powerDates, d) ? 1 : 0;
                var hasStep = _.contains(stepDates, d) ? 1 : 0;
                return {
                    timestamp: timeParse(d),
                    kink: hasKink,
                    powerStep: hasPower,
                    stepSize: hasStep,
                    hdbscan: 0
                }
            });

            draw();
        });
    }

    constructor.dimensions = function (value) {
        if (!arguments.length) {
            return dimensions;
        }
        dimensions.width = (value.width / 2);
        dimensions.height = value.height;
        dimensions.parentWidth = value.width;
        dimensions.parentHeight = value.height;
        return constructor;
    };
    constructor.selectTimestamps = function (value) {
        if (!arguments.length) {
            return selectedTimestamps;
        }
        selectedTimestamps = value.sort();
        selectedStreaks = (function (selectedTimestamps) {
            if (selectedTimestamps.length == 0) {
                return [];
            }
            var streaks = [];
            var currentStreak = [selectedTimestamps[0]];
            for (var i = 1; i < selectedTimestamps.length; i++) {
                if (selectedTimestamps[i] - selectedTimestamps[i - 1] === 600000) {
                    currentStreak.push(selectedTimestamps[i]);
                }
                else {
                    streaks.push([_.min(currentStreak), _.max(currentStreak)]);
                    currentStreak = [selectedTimestamps[i]];
                }
            }
            streaks.push([_.min(currentStreak), _.max(currentStreak)]);

            return streaks;
        }(selectedTimestamps));

        for (var key in eigenPlots) {
            eigenPlots[key].selectTimespans(selectedStreaks);
        }
        for (var key in rawPlots) {
            rawPlots[key].selectTimespans(selectedStreaks);
        }

        return constructor;
    };
    return constructor;
};
transientTector.reducedSpace = function (directorEvents) {
    "use strict";
    var dimensions = {width: 0, height: 0, parentWidth: 0, parentHeight: 0};
    var container;
    var data;
    var selectedPsn = null;
    var scales = {
        xScale: d3.scaleLinear(),
        yScale: d3.scaleLinear()
    };
    var zoomK = 1;
    var selectedTimestamps = [];

    function filter(unfilteredData) {
        return _.filter(unfilteredData, function (d) {
            return d.psn === selectedPsn;
        });
    }

    function onSelect(d) {
        return d;
    }

    function zoom() {
        zoomK = d3.event.transform.k;
        var filteredData = filter(data);

        var color = d3.scaleSequential(d3.interpolateLab("white", "steelblue"))
            .domain([0, 50]);
        var hexbin = d3.hexbin()
            .x(function (d) {
                return scales.xScale(d.pca_eig0);
            })
            .y(function (d) {
                return scales.yScale(d.pca_eig1);
            })
            .radius(8 / zoomK);

        var points = container
            .select("svg.scatter")
            .selectAll("path")
            .data(hexbin(filteredData));

        points.enter()
            .append("path")
            .attr("class", "hexagon")
            .merge(points)
            .attr("d", function (d) {
                return "M" + d.x + "," + d.y + hexbin.hexagon();
            })
            .attr("fill", function (d) {
                return color(d.length);
            });
        points.exit().remove();
        container.selectAll(".hexagon")
            .attr("transform", d3.event.transform);

    }


    function draw() {
        var filteredData = filter(data);
        container.select("svg.scatter")
            .attr("height", dimensions.height)
            .attr("width", dimensions.width)
            .call(d3.zoom().scaleExtent([1, 10]).on("zoom", zoom));
        var yExtent = d3.extent(_.map(_.pluck(filteredData, "pca_eig1"), function (d) {
            return parseFloat(d);
        }));
        var xExtent = d3.extent(_.map(_.pluck(filteredData, "pca_eig0"), function (d) {
            return parseFloat(d);
        }));

        scales.xScale.domain(xExtent);
        scales.xScale.range([10, dimensions.width - 10]);

        scales.yScale.domain(yExtent);
        scales.yScale.range([dimensions.height - 10, 10]);
        var color = d3.scaleSequential(d3.interpolateLab("white", "steelblue"))
            .domain([0, 50]);
        var hexbin = d3.hexbin()
            .x(function (d) {
                return scales.xScale(d.pca_eig0);
            })
            .y(function (d) {
                return scales.yScale(d.pca_eig1);
            })
            .radius(8);

        var points = container
            .select("svg.scatter")
            .selectAll("path")
            .data(hexbin(filteredData));

        points.enter()
            .append("path")
            .attr("class", "hexagon")
            .merge(points)
            .attr("d", function (d) {
                return "M" + d.x + "," + d.y + hexbin.hexagon();
            })
            .attr("fill", function (d) {
                return color(d.length);
            });

        points.exit().remove();
    }

    function constructor(selection) {
        selection.each(function (d) {
            container = d3.select(this);
            data = d;
            draw();
        });
    }

    constructor.dimensions = function (value) {
        if (!arguments.length) {
            return dimensions;
        }
        dimensions.width = value.width / 2;
        dimensions.height = value.height / 2;
        dimensions.parentWidth = value.width;
        dimensions.parentHeight = value.height;
        return constructor;
    };

    constructor.psn = function (value) {
        if (!arguments.length) {
            return selectedPsn;
        }
        selectedPsn = value;
        return constructor;
    };
    constructor.selectTimestamps = function (value) {
        if (!arguments.length) {
            return selectedTimestamps;
        }
        selectedTimestamps = value;
        return constructor;
    };
    return constructor;
};
transientTector.stats = function (directorEvents) {
    "use strict";
    var dimensions = {width: 0, height: 0, parentWidth: 0, parentHeight: 0};
    var container;
    var data;
    var scales = {
        x: d3.scaleLinear(),
        y: d3.scaleLinear()
    };
    var selectedTimestamps = [];
    var selectedClusters = [];

    function draw() {
        var clusterData = getStatsForMembership(memberOf());
        if (!clusterData.length) {
            return;
        }
        clusterData = _.sortBy(clusterData, function (d) {
            var clusterDist = _.find(data.clusterDistributions, function (c) {
                return c.cluster_label == d.cluster_label
            });

            return clusterDist.minutes * -1;
        })

        var xExtent = [0, _.filter(Object.keys(clusterData[0]), function (d) {
            return d.indexOf("mean") > -1;
        }).length - 1];
        var yExtent = d3.extent(_.flatten(_.map(data.clusterStats, function (d) {
            var result = [];
            var keys = _.filter(Object.keys(d), function (d) {
                return d.indexOf("mean") > -1;
            });
            for (var i in keys) {
                result.push(d[keys[i]]);
            }
            return result;
        })));

        scales.x.domain(xExtent);
        scales.x.range([0, dimensions.height / 10]);
        scales.y.domain(yExtent);
        scales.y.range([(dimensions.height / 10) - 5, 5]);
        container.select("#cluster-breakdown")
            .selectAll("div.cluster").remove();
        var clusters = container.select("#cluster-breakdown")
            .selectAll("div.cluster")
            .data(clusterData);
        if (!clusters) {
            return;
        }
        var clusterWrappers = clusters.enter()
            .append("div")
            .attr("class", function(d){return selectedClusters.indexOf(d.cluster_label) > -1?"cluster active":"cluster";})
            .on("click", function (d) {
                var timestamps = _.map(_.unique(_.map(_.filter(data.clusterLabels, function (c) {
                    return c.cluster_label == d.cluster_label;
                }), function(d){return d.timestamp.getTime();})), function(d){ return new Date(d);});
                directorEvents.selectTimestamps(timestamps);
            });
        var clusterSvg = clusterWrappers.append("svg");
        var clusterUsage = clusterWrappers.append("div");

        clusterSvg.append("path").attr("class", "stdev");
        clusterSvg.append("path").attr("class", "mean");
        clusterSvg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", dimensions.height / 10)
            .attr("width", dimensions.height / 10)
            .attr("class", function (d) {
                return selectedClusters.indexOf(d.cluster_label) > -1? "cluster-border active" : "cluster-border";
            });
        var merged = clusterWrappers.merge(clusters);
        merged.select("svg")
            .attr("id", function (d) {
                return "cluster-" + d.cluster_label
            })
            .attr("height", dimensions.height / 10)
            .attr("width", dimensions.height / 10);

        merged.select("path.stdev")
            .attr("d", function (d) {
                var keys = _.filter(Object.keys(d), function (d) {
                    return d.indexOf("stdev") > -1;
                });

                var meanKeys = _.filter(Object.keys(d), function (d) {
                    return d.indexOf("mean") > -1;
                });
                var result = "M";
                for (var i in keys) {
                    var mean = d[meanKeys[i]];
                    result += scales.x(i) + " " + scales.y(mean + (d[keys[i]] * 2)) + " ";
                }

                for (var i = keys.length - 1; i >= 0; i--) {
                    var mean = d[meanKeys[i]];
                    result += scales.x(i) + " " + scales.y(mean - (d[keys[i]] * 2)) + " ";
                }

                return result;
            });

        merged.select("path.mean")
            .attr("d", function (d) {
                var keys = _.filter(Object.keys(d), function (d) {
                    return d.indexOf("mean") > -1;
                });
                var result = "M";
                for (var i in keys) {
                    result += scales.x(i) + " " + scales.y(d[keys[i]]) + " ";
                }


                return result;
            });

        clusterUsage.html(function (d) {
            var clusterDist = _.find(data.clusterDistributions, function (c) {
                return c.cluster_label == d.cluster_label
            });
            if (clusterDist) {
                var percent = d3.format('.2%')(clusterDist.percent);
                var minutes = d3.format(',')(clusterDist.minutes) + '<br />minutes';
                return percent + "<br />" + minutes;
            }
            else {
                return "";
            }
        })

    }

    function getStatsForMembership(clusters) {
        return _.filter(data.clusterStats, function (s) {
            return _.indexOf(clusters, s.cluster_label) > -1;
        })
    }

    function memberOf() {
        return _.unique(_.pluck(data.clusterDistributions, "cluster_label"));
    }

    function constructor(selection) {
        selection.each(function (d) {
            container = d3.select(this);
            data = d;
            draw();
        });
    }

    constructor.dimensions = function (value) {
        if (!arguments.length) {
            return dimensions;
        }
        dimensions.width = value.width;
        dimensions.height = value.height;
        dimensions.parentWidth = value.width;
        dimensions.parentHeight = value.height;
        return constructor;
    };
    constructor.selectTimestamps = function (value) {
        if (!arguments.length) {
            return selectedTimestamps;
        }
        selectedTimestamps = value;
        var milliStamps = _.map(selectedTimestamps, function(t){return t.getTime();});
        selectedClusters = _.unique(_.map(
            _.filter(data.clusterLabels,function(d){return milliStamps.indexOf(d.timestamp.getTime()) > -1;}),
            function(d){
               return +d.cluster_label;
            }));

        draw();
        return constructor;
    };
    return constructor;
};

transientTector.psnSelector = function (directorEvents) {
    "use strict";
    var dimensions = {width: 0, height: 0, parentWidth: 0, parentHeight: 0};
    var container;
    var data;

    function onSelect(d) {
        directorEvents.selectPsn(d.psn);
        container.selectAll(".dropdown-item").attr("class", "dropdown-item");
        d3.select(this).attr("class", "dropdown-item active");
        container.select(".dropdown-toggle").text("PSN " + d.psn);
    }

    function draw() {
        var menuOptions = container
            .select(".dropdown-menu")
            .selectAll(".dropdown-item")
            .data(data);

        menuOptions.enter()
            .append("a")
            .attr("class", "dropdown-item")
            .attr("href", "#")
            .on("click", onSelect)
            .merge(menuOptions)
            .text(function (d) {
                return d.psn;
            });

        menuOptions.exit().remove();
    }

    function constructor(selection) {
        selection.each(function (d) {
            container = d3.select(this);
            data = d;
            draw();
        });
    }

    constructor.dimensions = function (value) {
        if (!arguments.length) {
            return dimensions;
        }
        dimensions.width = value.width;
        dimensions.height = value.height;
        dimensions.parentWidth = value.width;
        dimensions.parentHeight = value.height;
        return constructor;
    };
    return constructor;
};

transientTector.director = function () {
    "use strict";
    var container;
    var data;
    var dimensions = {width: 0, height: 0};
    var events = {};

    var components = {
        psnSelector: transientTector.psnSelector(events),
        // metricSelector: transientTector.metricSelector(events),
        stats: transientTector.stats(events),
        reducedSpace: transientTector.reducedSpace(events),
        timeSeries: transientTector.timeSeries(events)
    };

    function draw() {
        container.select("#stats")
            .datum({
                clusterStats: data.clusterStats,
                clusterDistributions: data.clusterDistributions,
                clusterLabels: data.clusterLabels
            })
            .call(components.stats);
        container.select("#psn-selector").datum(data.psn).call(components.psnSelector);
        container.select("#reduced-space").datum(data.pca).call(components.reducedSpace);
        container.select("#timeseries").datum({
            pca: data.pca,
            raw: data.raw,
            kinkLabels: data.kinkLabels,
            powerStepLabels: data.powerStepLabels,
            stepSizeLabels: data.stepSizeLabels,
            fields: data.fields,
            compositeFields: data.compositeFields
        }).call(components.timeSeries);
    }

    function deferredDraw(error,
                          raw,
                          pca,
                          kinkLabels,
                          clusterLabels,
                          powerStepLabels,
                          stepSizeLabels,
                          clusterDistributions,
                          hdbscan) {
        data.raw = raw;
        data.pca = pca;
        data.kinkLabels = kinkLabels;
        data.clusterLabels = clusterLabels;
        data.clusterDistributions = clusterDistributions;

        data.powerStepLabels = powerStepLabels;
        data.stepSizeLabels = stepSizeLabels;

        data.raw.forEach(function (d) {
            d.timestamp = transientTector.timeParse(d.timestamp);
            for (var i in data.fields) {
                d[data.fields[i].field] = +d[data.fields[i].field];
            }
        });
        data.pca.forEach(function (d) {
            d.timestamp = transientTector.timeParse(d.timestamp);
            var numericCols = ["pca_eig0", "pca_eig1", "pca_eig2", "pca_eig3", "pca_eig4"]
            for (var i in numericCols) {
                d[numericCols[i]] = +d[numericCols[i]];
            }
        });
        data.kinkLabels.forEach(function (d) {
            d.timestamp = transientTector.timeParse(d.timestamp);
            var labelCols = ["kink_finder_labels"]
            for (var i in labelCols) {
                d[labelCols[i]] = +d[labelCols[i]];
            }
        });
        data.stepSizeLabels.forEach(function (d) {
            d.timestamp = transientTector.timeParse(d.timestamp);
        });
        data.clusterLabels.forEach(function (d) {
            d.timestamp = transientTector.timeParse(d.timestamp);
        });
        data.powerStepLabels.forEach(function (d) {
            d.timestamp = transientTector.timeParse(d.timestamp);
        });
        data.clusterStats.forEach(function (d) {
            if (data.clusterStats.length == 0) {
                return;
            }
            var labelCols = Object.keys(data.clusterStats[0]);
            for (var i in labelCols) {
                d[labelCols[i]] = +d[labelCols[i]];
            }
        });
        data.clusterDistributions.forEach(function (d) {
            var labelCols = ["percent", "minutes", "cluster_label"];
            for (var i in labelCols) {
                d[labelCols[i]] = +d[labelCols[i]];
            }
        });
        draw();
    }

    events.selectPsn = function (psn) {
        components.reducedSpace.psn(psn);
        d3.queue()
            .defer(d3.csv, "data/model2_preprocessed_data_psn" + psn + ".csv")
            .defer(d3.csv, "data/model2_pca_ncomponents5_psn" + psn + ".csv")
            .defer(d3.csv, "data/model2_kinkfinder_psn" + psn + ".csv")
            .defer(d3.csv, "data/model2_20min_kmeans_labels_psn" + psn + ".csv")
            .defer(d3.csv, "data/model2_powerstepsize_psn" + psn + ".csv")
            .defer(d3.csv, "data/model2_pca_stepsize_psn" + psn + ".csv")
            .defer(d3.csv, "data/model2_20min_cluster_distributions_psn" + psn + ".csv")
            .defer(d3.csv, "data/model2_hdbscan_psn" + psn + ".csv")
            .await(deferredDraw);

        return psn;
    };
    events.selectTimestamps = function (timestamps) {
        components.reducedSpace.selectTimestamps(timestamps);
        components.timeSeries.selectTimestamps(timestamps);
        components.stats.selectTimestamps(timestamps);
    };

    function constructor(selection) {
        selection.each(function (d) {
            container = d3.select(this);
            data = d;
            draw();
        });
    }

    constructor.dimensions = function (value) {
        if (!arguments.length) {
            return dimensions;
        }
        dimensions = value;
        for (var k in components) {
            components[k].dimensions(dimensions);
        }
        return constructor;
    };

    return constructor;

};
