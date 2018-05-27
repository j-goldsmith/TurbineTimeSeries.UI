/*global
d3
_
moment
*/

var transientTector = {};

transientTector.timeParse = d3.timeParse("%Y-%m-%d %H:%M:%S");
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
    var selectedIndices = [];

    function hover(hoveredCoordinate) {
        container.select("line.hover")
            .attr("x1", hoveredCoordinate)
            .attr("y1", 0)
            .attr("x2", hoveredCoordinate)
            .attr("y2", dimensions.height * 0.8);
    }

    function zoomed() {
        container.select("svg").select("path.plot-line")
            .data([data.raw])
            .attr("d", plotLine);
        var now = moment();
        var pointWidth = scales.xDisplayed(now) - scales.xDisplayed(now.subtract(10, 'minutes'));
        pointWidth = pointWidth > 1 ? pointWidth : 1;

        var labels = container.select("g.transient-labels").selectAll("rect.transient-label")
            .data(data.labels);
        labels.enter()
            .append("rect")
            .attr("class", "transient-label")
            .merge(labels)
            .attr("x", function (d) {
                return scales.xDisplayed(moment(d.timestamp).subtract(5, 'minutes'));
            })
            .attr("y", 0)
            .attr("width", pointWidth)
            .attr("height", dimensions.height * 0.8)
            .attr("fill", "blue")
            //.attr("stroke-width", pointWidth)
            .attr("opacity", 0.2);

        var powerStepLabels = container.select("g.powerstep-labels").selectAll("rect.powerstep-label")
            .data(data.powerStepLabels);
        powerStepLabels.enter()
            .append("rect")
            .attr("class", "powerstep-label")
            .merge(powerStepLabels)
            .attr("x", function (d) {
                return scales.xDisplayed(moment(d.timestamp).subtract(5, 'minutes'));
            })
            .attr("y", 0)
            .attr("width", pointWidth)
            .attr("height", dimensions.height * 0.8)
            .attr("fill", "green")
            .attr("opacity", 0.2);

        var stepSizeLabels = container.select("g.stepsize-labels").selectAll("rect.stepsize-label")
            .data(data.stepSizeLabels);
        stepSizeLabels.enter()
            .append("rect")
            .attr("class", "stepsize-label")
            .merge(stepSizeLabels)
            .attr("x", function (d) {
                return scales.xDisplayed(moment(d.timestamp).subtract(5, 'minutes'));
            })
            .attr("y", 0)
            .attr("width", pointWidth)
            .attr("height", dimensions.height * 0.8)
            .attr("fill", "orange")
            .attr("opacity", 0.2);
    }

    function draw() {
        var yExtent = d3.extent(data.raw, function (d) {
            return d[dataKey];
        });
        scales.y.range([dimensions.height * 0.8, 0])
            .domain(yExtent);

        container.select("svg").select('rect.timeline-hover')
            .attr('width', dimensions.width)
            .attr('height', dimensions.height * 0.8);
        //.call(zoom);

        container.select("svg")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height * 0.8);

        container.select("h4")
            .text(dataKey);

        container.select("svg").select("path.plot-line")
            .data([data.raw])
            .attr("d", plotLine);

        var now = moment();
        var pointWidth = scales.xDisplayed(now) - scales.xDisplayed(now.subtract(10, 'minutes'));
        pointWidth = pointWidth > 1 ? pointWidth : 1;


        var labels = container.select("g.transient-labels").selectAll("rect.transient-label")
            .data(data.labels);
        labels.enter()
            .append("rect")
            .attr("class", "transient-label")
            .merge(labels)
            .attr("x", function (d) {
                return scales.xDisplayed(moment(d.timestamp).subtract(5, 'minutes'));
            })
            .attr("y", 0)
            .attr("width", pointWidth)
            .attr("height", dimensions.height * 0.8)
            .attr("fill", "blue")
            //.attr("stroke-width", pointWidth)
            .attr("opacity", 0.3);

        var powerStepLabels = container.select("g.powerstep-labels").selectAll("rect.powerstep-label")
            .data(data.powerStepLabels);
        powerStepLabels.enter()
            .append("rect")
            .attr("class", "powerstep-label")
            .merge(powerStepLabels)
            .attr("x", function (d) {
                return scales.xDisplayed(moment(d.timestamp).subtract(5, 'minutes'));
            })
            .attr("y", 0)
            .attr("width", pointWidth)
            .attr("height", dimensions.height * 0.8)
            .attr("fill", "green")
            .attr("opacity", 0.3);

        var stepSizeLabels = container.select("g.stepsize-labels").selectAll("rect.stepsize-label")
            .data(data.stepSizeLabels);
        stepSizeLabels.enter()
            .append("rect")
            .attr("class", "stepsize-label")
            .merge(stepSizeLabels)
            .attr("x", function (d) {
                return scales.xDisplayed(moment(d.timestamp).subtract(5, 'minutes'));
            })
            .attr("y", 0)
            .attr("width", pointWidth)
            .attr("height", dimensions.height * 0.8)
            .attr("fill", "orange")
            .attr("opacity", 0.3);

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
                .append("h4");

            var svg = container.append("svg");
            svg.append("defs").append("svg:clipPath")
                .attr("id", "clip")
                .append("svg:rect")
                .attr("width", dimensions.width)
                .attr("height", dimensions.height)
                .attr("x", 0)
                .attr("y", 0);

            svg.append('rect')
                .attr("class", "selected-range");
            svg.append("g")
                .attr("class", "transient-labels");
            svg.append("g")
                .attr("class", "powerstep-labels");
            svg.append("g")
                .attr("class", "stepsize-labels");
            svg.append('g')
                .attr("class", "xaxis");

            svg.append('g')
                .attr("class", "yaxis")
                .attr("stroke", "lightgrey")
                .attr("stroke-width", ".3")
                .attr("fill", "none");

            var focused = svg.append('g')
                .attr("class", "focus")
                .attr("clip-path", "url(#clip)");

            focused.append("path")
                .attr("class", "plot-line")
                .attr("stroke", "lightgrey")
                .attr("stroke-width", ".3")
                .attr("fill", "none");

            svg.append("line").attr("class", "hover").attr("stroke", "red");


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
        dimensions.width = value.width * 0.8333333;
        dimensions.height = value.height / 4;
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
    constructor.hover = function (value) {
        hover(value);
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
    ;
    var scales = {
        xDisplayed: d3.scaleTime(),
        xFull: d3.scaleTime()
    };

    function hover(d, i) {
        var coord = d3.event.offsetX;
        for (var key in rawPlots) {
            rawPlots[key].hover(coord)
        }
        for (var key in eigenPlots) {
            eigenPlots[key].hover(coord)
        }

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
            .attr("style", "width:" + dimensions.width + "px;height:" + dimensions.height + "px;")
            .on("mousemove", hover)
            .call(zoomer);

        for (var key in eigenPlots) {
            container.selectAll("div.eigen-plot." + key)
                .datum({
                    raw: data.pca,
                    labels: data.labels,
                    powerStepLabels: data.powerStepLabels,
                    stepSizeLabels: data.stepSizeLabels
                })
                .call(eigenPlots[key].xScale(scales.xDisplayed).dimensions(dimensions));
        }
        for (var key in rawPlots) {
            container.selectAll("div.raw-plot." + key)
                .datum({
                    raw: data.raw,
                    labels: data.labels,
                    powerStepLabels: data.powerStepLabels,
                    stepSizeLabels: data.stepSizeLabels
                })
                .call(rawPlots[key].xScale(scales.xDisplayed).dimensions(dimensions));
        }

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
        dimensions.height = value.height;
        dimensions.parentWidth = value.width;
        dimensions.parentHeight = value.height;
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

    function filter(unfilteredData) {
        return _.filter(unfilteredData, function (d) {
            return d.psn === selectedPsn;
        });
    }

    function onSelect(d) {
        return d;
    }

    function draw() {
        var filteredData = filter(data);
        container.select("svg.scatter")
            .attr("height", dimensions.height)
            .attr("width", dimensions.width);
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
            }).radius(8);

        var points = container
            .select("svg.scatter")
            .selectAll("path")
            .data(hexbin(filteredData));

        points.enter()
            .append("path")
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

    function draw() {
        var clusterData = getStatsForMembership(memberOf());
        if (!clusterData.length) {
            return;
        }

        var xExtent = [0, _.filter(Object.keys(clusterData[0]), function (d) {
            return d.indexOf("mean") > -1;
        }).length - 1];
        var yExtent = d3.extent(_.flatten(_.map(clusterData, function (d) {
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
        scales.x.range([0, dimensions.width / 10]);
        scales.y.domain(yExtent);
        scales.y.range([dimensions.height / 10, 0]);

        var clusters = container.select("#cluster-breakdown")
            .selectAll("div.cluster")
            .data(clusterData);
        if (!clusters) {
            return;
        }
        var clusterWrappers = clusters.enter().append("div").attr("class", "cluster");
        var clusterSvg = clusterWrappers.append("svg");

        clusterSvg.append("path").attr("class", "stdev").attr("fill", "blue");
        clusterSvg.append("path").attr("class", "mean").attr("stroke", "red").attr("stroke-width", 1);
        clusterSvg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", dimensions.height / 10)
            .attr("width", dimensions.width / 10)
            .style("stroke", "white")
            .style("fill", "none")
            .style("stroke-width", 1);
        var merged = clusterWrappers.merge(clusters);
        merged.select("svg")
            .attr("id", function (d) {
                return "cluster-" + d.cluster_label
            })
            .attr("height", dimensions.height / 10)
            .attr("width", dimensions.width / 10);

        /*merged.selectAll("path.stdev")
            .attr("d", d3.area()
                .x(function(d) { return x(d.date); })
                .y0(height)
                .y1(function(d) { return y(d.close); })
            );
*/
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
    }

    function getStatsForMembership(clusters) {
        return _.filter(data.clusterStats, function (s) {
            return s.cluster_label in clusters;
        })
    }

    function memberOf() {
        return _.unique(_.pluck(data.clusterLabels, "cluster_label"));
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
                clusterLabels: data.clusterLabels
            })
            .call(components.stats);
        container.select("#psn-selector").datum(data.psn).call(components.psnSelector);
        container.select("#reduced-space").datum(data.pca).call(components.reducedSpace);
        container.select("#timeseries").datum({
            pca: data.pca,
            raw: data.raw,
            labels: data.labels,
            powerStepLabels: data.powerStepLabels,
            stepSizeLabels: data.stepSizeLabels
        }).call(components.timeSeries);
    }

    function deferredDraw(error, raw, pca, labels, clusterLabels, powerStepLabels, stepSizeLabels) {
        data.raw = raw;
        data.pca = pca;
        data.labels = labels;
        data.clusterLabels = clusterLabels;
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
        data.labels.forEach(function (d) {
            d.timestamp = transientTector.timeParse(d.timestamp);
            var labelCols = ["kink_finder_labels"]
            for (var i in labelCols) {
                d[labelCols[i]] = +d[labelCols[i]];
            }
        });
        data.stepSizeLabels.forEach(function (d) {
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
        draw();
    }

    events.selectPsn = function (psn) {
        components.reducedSpace.psn(psn);
        d3.queue()
            .defer(d3.csv, "data/model2_preprocessed_data_psn" + psn + ".csv")
            .defer(d3.csv, "data/model2_pca_ncomponents5_psn" + psn + ".csv")
            .defer(d3.csv, "data/model2_20min_kinkfinder_psn" + psn + ".csv")
            .defer(d3.csv, "data/model2_20min_kmeans_labels_psn" + psn + ".csv")
            .defer(d3.csv, "data/model2_powerstepsize_psn" + psn + ".csv")
            .defer(d3.csv, "data/model2_pca_stepsize_psn" + psn + ".csv")
            .await(deferredDraw);

        return psn;
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
