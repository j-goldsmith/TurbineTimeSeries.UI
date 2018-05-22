/*global
d3
_
*/

var transientTector = {};

transientTector.timeParse = d3.timeParse("%Y-%m-%d %H:%M:%S.%f");
transientTector.timeShiftButton = function (directorEvents) {
    "use strict";
    var dimensions = {width: 0, height: 0, parentWidth: 0, parentHeight: 0};
    var container;
    var data;

    function draw() {
        return;
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
transientTector.timeZoomInButton = function (directorEvents) {
    "use strict";
    var dimensions = {width: 0, height: 0, parentWidth: 0, parentHeight: 0};
    var container;
    var data;

    function draw() {
        return;
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
transientTector.timeZoomOutButton = function (directorEvents) {
    "use strict";
    var dimensions = {width: 0, height: 0, parentWidth: 0, parentHeight: 0};
    var container;
    var data;

    function draw() {
        return;
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
transientTector.timePlot = function (directorEvents, dataKey) {
    "use strict";
    var dimensions = {width: 0, height: 0, parentWidth: 0, parentHeight: 0};
    var container;
    var data;
    var scales = {
        x: d3.scaleTime(),
        y: d3.scaleLinear()
    };
    var selectedIndices = [];
    var dragStartX, dragEndX;

    function hover(hoveredCoordinate) {
        container.select("line.hover")
            .attr("x1", hoveredCoordinate)
            .attr("y1", 0)
            .attr("x2", hoveredCoordinate)
            .attr("y2", dimensions.height * 0.8);
    }

    function dragStart() {
        selectedIndices = [];
        dragStartX = d3.event.x;
        dragEndX = d3.event.x;
    }

    function dragging() {
        var current = d3.event.x;
        if (dragStartX > current) {
            dragStartX = current
        }
        else if (current > dragEndX) {
            dragEndX = current
        }
        else if (current < dragEndX) {
            dragStartX = current
        }

        container.select('rect.selected-range')
            .attr('width', dragEndX - dragStartX)
            .attr('height', dimensions.height)
            .attr('fill', 'lightgrey')
            .attr('fill-opacity', .6)
            .attr('x', dragStartX)
            .attr('y', 0);
    }

    function dragEnd() {
        selectedIndices = [];
        var plotSpacing = (dimensions.width) / data.length;

        var current = d3.event.x;
        if (dragStartX > current) {
            dragStartX = current
        }
        else if (current > dragEndX) {
            dragEndX = current
        }
        else if (current < dragEndX) {
            dragStartX = current
        }

        container.select('rect.selected-range')
            .attr('width', dragEndX - dragStartX)
            .attr('height', dimensions.height * 0.8)
            .attr('fill', 'lightgrey')
            .attr('fill-opacity', .6)
            .attr('x', dragStartX)
            .attr('y', 0);

        var startI = scales.x.invert(dragStartX);
        var endI = scales.x.invert(dragEndX);

        selectedIndices = _.filter(data, function (d) {
            return d.timestamp >= startI && d.timestamp <= endI;
        });

        //draw();
        //onUpdateHovered();
    }

    function draw() {
        var yExtent = d3.extent(data, function (d) {
            return d[dataKey];
        });
        var xExtent = d3.extent(data, function (d) {
            return d.timestamp;
        });
        scales.x.range([(dimensions.width * 0.05), dimensions.width]);
        scales.y.range([dimensions.height * 0.8, 0]);
        scales.x.domain(xExtent);
        scales.y.domain(yExtent);

        var plotLine = d3.line()
            .x(function (d) {
                return scales.x(d.timestamp);
            })
            .y(function (d) {
                return scales.y(d[dataKey]);
            });


        var drag_behavior = d3.drag()
            .on("start", dragStart)
            .on("drag", dragging)
            .on("end", dragEnd);

        container.select("svg").select('rect.timeline-hover')
            .attr('width', dimensions.width)
            .attr('height', dimensions.height * 0.8)
            .call(drag_behavior);

        container.select("svg")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height * 0.8);

        container.select("h4")
            .text(dataKey);

        container.select("svg").select("path.plot-line")
            .data([data])
            .attr("d", plotLine);

        // Add the X Axis
        container.select("g.xaxis")
            .attr("transform", "translate(0," + (dimensions.height) + ")")
            .call(d3.axisBottom(scales.x));

        // Add the Y Axis
        container.select("g.yaxis")
            .attr("transform", "translate(" + (dimensions.width * 0.05) + ",0)")
            .call(d3.axisLeft(scales.y));


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
            svg.append('rect')
                .attr("class", "selected-range");
            svg.append('g')
                .attr("class", "xaxis");

            svg.append('g')
                .attr("class", "yaxis")
                .attr("stroke", "lightgrey")
                .attr("stroke-width", ".3")
                .attr("fill", "none");

            svg.append("path")
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
    constructor.hover = function (value) {
        hover(value);
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
    var rawPlots = {
        "perf_pow": transientTector.timePlot(directorEvents, "perf_pow"),
        "t5_5": transientTector.timePlot(directorEvents, "t5_5")
    };
    var eigenPlots = [];

    function hover(d, i) {
        var coord = d3.event.offsetX;
        for (var key in rawPlots) {
            rawPlots[key].hover(coord)
        }
    }

    function draw() {
        if (!data.raw && !data.pca) {
            return;
        }
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

        for (var key in rawPlots) {
            container.selectAll("div.raw-plot." + key)
                .on("mousemove", hover)
                .datum(data.raw)
                .call(rawPlots[key].dimensions(dimensions));
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
transientTector.reducedZoomInButton = function (directorEvents) {
    "use strict";
    var dimensions = {width: 0, height: 0, parentWidth: 0, parentHeight: 0};
    var container;
    var data;

    function draw() {
        return;
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
transientTector.reducedZoomOutButton = function (directorEvents) {
    "use strict";
    var dimensions = {width: 0, height: 0, parentWidth: 0, parentHeight: 0};
    var container;
    var data;

    function draw() {
        return;
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

    function draw() {
        return;
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
transientTector.metricSelector = function (directorEvents) {
    "use strict";
    var dimensions = {width: 0, height: 0, parentWidth: 0, parentHeight: 0};
    var container;
    var data;

    function onSelect(d) {
        directorEvents.selectMetric(d.id);
        container.selectAll(".dropdown-item").attr("class", "dropdown-item");
        d3.select(this).attr("class", "dropdown-item active");
        container.select(".dropdown-toggle").text(d.name);
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
                return d.name;
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
        psnSelector: this.psnSelector(events),
        metricSelector: this.metricSelector(events),
        stats: this.stats(events),
        reducedSpace: this.reducedSpace(events),
        timeSeries: this.timeSeries(events)
    };

    function draw() {
        //setDimensions();
        //setFilters();
        container.select("#stats").call(components.stats);
        container.select("#psn-selector").datum(data.psn).call(components.psnSelector);
        container.select("#metric-selector").datum(data.metrics).call(components.metricSelector);
        container.select("#reduced-space").datum(data.pca).call(components.reducedSpace);
        container.select("#timeseries").datum({pca: data.pca, raw: data.raw}).call(components.timeSeries);
    }

    function deferredDraw(error, raw, pca) {
        data.raw = raw;
        data.pca = pca;
        data.raw.forEach(function (d) {
            d.timestamp = transientTector.timeParse(d.timestamp);
            for (var i in data.fields) {
                d[data.fields[i].field] = +d[data.fields[i].field];
            }
        });
        data.pca.forEach(function (d) {
            d.timestamp = transientTector.timeParse(d.timestamp);
        });
        draw();
    }

    events.selectPsn = function (psn) {
        components.reducedSpace.psn(psn);
        d3.queue()
            .defer(d3.csv, "data/model2_preprocessed_data_psn" + psn + ".csv")
            .defer(d3.csv, "data/model2_pca_ncomponents5_psn" + psn + ".csv")
            .await(deferredDraw);

        return psn;
    };
    events.selectMetric = function (metric) {
        return metric;
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
