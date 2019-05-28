/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {

    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import IColorPalette = powerbi.extensibility.IColorPalette;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import tooltip = powerbi.extensibility.utils.tooltip;
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
    import createTooltipServiceWrapper = powerbi.extensibility.utils.tooltip.createTooltipServiceWrapper;
    // tooltip
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;

    export module DataViewObjects {
        /** Gets the value of the given object/property pair. */
        // tslint:disable-next-line:no-shadowed-variable
        export function getValue<T>(objects:
             DataViewObjects,       propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T {

            if (!objects) {

                return defaultValue;
            }

            let objectOrMap: DataViewObject;
            objectOrMap = objects[propertyId.objectName];

            let object: DataViewObject;
            object = objectOrMap as DataViewObject;

            return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
        }
        /** Gets the solid color from a fill property. */
        export function getFillColor(objects: DataViewObjects,
                                     propertyId: DataViewObjectPropertyIdentifier, defaultColor?: string): string {
            let value: Fill;
            value = getValue(objects, propertyId);
            if (!value || !value.solid) {
                return defaultColor;
            }

            return value.solid.color;
        }
    }
    export module DataViewObject {
        // tslint:disable-next-line:no-shadowed-variable
        export function getValue<T>(object: DataViewObject, propertyName: string, defaultValue?: T): T {

            if (!object) {
                return defaultValue;
            }

            let propertyValue: T;
            propertyValue = object[propertyName] as T;
            if (propertyValue === undefined) {
                return defaultValue;
            }

            return propertyValue;
        }
    }

    interface IRotatingChartViewModel {
        dataPoints: IRotatingChartDataPoint[];
        dataMax: number;
        name: string;
        dataMin: number;
    }
    interface IRotatingChartDataPoint {
        value: number;
        category: string;
        format: string;
        color: string;
        selectionId: powerbi.visuals.ISelectionId;
    }
    export interface IMeasureTitle {
        fontSize: number;
        color: string;
    }
    export interface ILabelSettings {
        fontSize: number;
        color: string;
        displayUnits: number;
        strokeWidth: number;
    }
    export interface IAnimationSettings {
        show: boolean;
        duration: number;
    }

    // tslint:disable-next-line:typedef
    let props;
    props = {
        animationSettings: {
            duration: { objectName: "animationSettings", propertyName: "duration" } as DataViewObjectPropertyIdentifier,
            show: { objectName: "animationSettings", propertyName: "show" } as DataViewObjectPropertyIdentifier
        },
        labelSettings: {
            color: { objectName:
                 "labelSettings", propertyName: "color" } as DataViewObjectPropertyIdentifier,
            displayUnits: { objectName:
                "labelSettings", propertyName: "displayUnits" } as DataViewObjectPropertyIdentifier,
            fontSize: { objectName: "labelSettings", propertyName: "fontSize" } as DataViewObjectPropertyIdentifier,
            strokeWidth: { objectName:
                 "labelSettings", propertyName: "strokeWidth" } as DataViewObjectPropertyIdentifier
        },
        measureTitle: {
            color: { objectName: "measureTitle", propertyName: "color" } as DataViewObjectPropertyIdentifier,
            fontSize: { objectName: "measureTitle", propertyName: "fontSize" } as DataViewObjectPropertyIdentifier
        }
    };

    function getValue<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T {
        if (objects) {
            let object: DataViewObject;
            object = objects[objectName];
            if (object) {
                let property: T;
                property = object[propertyName] as T;
                if (property !== undefined) {
                    return property;
                }
            }
        }

        return defaultValue;
    }

    function getCategoricalObjectValue<T>(category: DataViewCategoryColumn,
                                          index: number, objectName: string, propertyName: string, defaultValue: T): T {
        let categoryObjects: DataViewObjects[];
        categoryObjects = category.objects;

        if (categoryObjects) {
            let categoryObject: DataViewObject;
            categoryObject = categoryObjects[index];
            if (categoryObject) {
                let object: DataViewPropertyValue;
                object = categoryObject[objectName];
                if (object) {
                    let property: T;
                    property = object[propertyName];
                    if (property !== undefined) {
                        return property;
                    }
                }
            }
        }

        return defaultValue;
    }

    function visualTransform(options: VisualUpdateOptions,
                             host: IVisualHost, measureIndex: number): IRotatingChartViewModel {
        let dataViews: DataView[];
        dataViews = options.dataViews;

        let viewModel: IRotatingChartViewModel;
        viewModel = {
            dataMax: 0,
            dataMin: 0,
            dataPoints: [],
            name: ""
        };

        if (!dataViews || !dataViews[0] || !dataViews[0].categorical ||
            !dataViews[0].categorical.categories ||
             !dataViews[0].categorical.categories[0].source || !dataViews[0].categorical.values) {
            return viewModel;
        }

        if (measureIndex > options.dataViews[0].categorical.values.length - 1) {
            measureIndex = 0;
        }
        let categorical: DataViewCategorical;
        categorical = dataViews[0].categorical;
        // tslint:disable-next-line:no-any
        let category: any;
        category = categorical.categories[0];
        // tslint:disable-next-line:no-any
        let dataValue: any;
        dataValue = categorical.values[measureIndex];
        let dataMax: number;
        // tslint:disable-next-line:no-any
        let mName: any;
        mName = categorical.values[measureIndex].source.displayName;

        let rotatingChartDataPoints: IRotatingChartDataPoint[];
        rotatingChartDataPoints = [];
        // let dataMax: number;
        let dataMin: number;
        let colorPalette: powerbi.extensibility.IColorPalette;
        colorPalette = host.colorPalette;
        let objects: DataViewObjects;
        objects = dataViews[0].metadata.objects;
        let len: number;
        len = Math.max(category.values.length, dataValue.values.length);

        for (let i: number = 0; i < len; i++) {
            let defaultColor: Fill;
            defaultColor = {
                solid: {
                    color: colorPalette.getColor(category.values[i] as string).value
                }
            };

            rotatingChartDataPoints.push({
                category: category.values[i] as string === "" ? "(Blank)" : category.values[i] as string,
                color: getCategoricalObjectValue<Fill>(category, i, "colorSelector", "fill", defaultColor).solid.color,
                format: dataValue.source.format,
                selectionId: host.createSelectionIdBuilder()
                    .withCategory(category, i)
                    .createSelectionId(),
                value: dataValue.values[i] as number
            });
        }
        dataMax = dataValue.maxLocal as number;

        dataMin = dataValue.minLocal;

        return {
            dataMax,
            dataMin,
            dataPoints: rotatingChartDataPoints,
            name: mName,
        };
    }
        /**
         * Main class
         */

    export class RotatingChart implements IVisual {
        // tslint:disable-next-line:typedef
        public static statConfig = {
            margins: {
                bottom: 25,
                left: 20,
                right: 20,
                top: 0,
            },
            solidOpacity: 1,
            transparentOpacity: 0.5,
            xScalePadding: 0.1
        };
        /*
        * Get tooltip data
        * */
        // tslint:disable-next-line:no-any
        private static getTooltipData(value: any): VisualTooltipDataItem[] {
            return [{
                color: value.color,
                displayName: value.category,
                value: value.value.toString()
            }];
        }
        private eventService: IVisualEventService ;
        private target: HTMLElement;
        private updateCount: number;
        private svg: d3.Selection<SVGElement>;
        private divRoot: d3.Selection<SVGElement>;
        private divBase: d3.Selection<SVGElement>;
        private errormsg: d3.Selection<SVGElement>;
        private host: IVisualHost;
        private horizBarChartContainer: d3.Selection<SVGElement>;
        private horizBarContainer: d3.Selection<SVGElement>;
        private measureTitle: d3.Selection<SVGElement>;
        private horizBars: d3.Selection<SVGElement>;
        private selectionManager: ISelectionManager;
        private rotatingDataPoints: IRotatingChartDataPoint[];
        private yAxis: d3.Selection<SVGElement>;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private yAxisMeasures: d3.Selection<SVGElement>;
        private rotationId: number;
        private frameId: number;
        private measureUpdateCounter: number;
        private viewModel: IRotatingChartViewModel;
        private width: number;
        private height: number;
        private margin: number;
        // tslint:disable-next-line:typedef
        private xScale;
        private rotationCount: number;
        // tslint:disable-next-line:typedef
        private horizBarChart;
        private options: VisualUpdateOptions;
        private measureCount: number;
        private dataviews: DataView;
        private rootElement: d3.Selection<SVGElement>;
        private maxData: number;
        private minData: number;

        constructor(options: VisualConstructorOptions) {
            this.eventService = options.host.eventService;
            this.measureUpdateCounter = 0;
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.rootElement = d3.select(options.element);
            this.divRoot = this.rootElement.append("div")
                .classed("rootDiv", true).style("xoverflow", "visible");
            this.divBase = this.divRoot.append("div")
                .classed("baseDiv", true);

            this.errormsg = this.divRoot.append("div")
            .classed("ErrorMessage", true);

            this.svg = this.divBase
                .append("svg")
                .classed("horizBarChart", true);

            this.measureTitle = this.svg.append("text")
                .classed("measureTitle", true);

            this.horizBarContainer = this.svg.append("g")
                .classed("horizBarContainer", true);

            this.yAxis = this.svg.append("g")
                .classed("yAxis", true);

            this.yAxisMeasures = this.svg.append("g")
                .classed("yAxisMeasures", true);

        }

        public update(options: VisualUpdateOptions): void {
            try {
            this.eventService.renderingStarted(options);
            this.options = options;
            this.dataviews = options.dataViews[0];
            const errorMessageLiteral: string = "Please insert data in ";
            const fieldLiteral: string = " field";
            clearInterval(this.frameId);
            clearInterval(this.rotationId);
            this.removeAll();

            this.viewModel = visualTransform(options, this.host, this.measureUpdateCounter);
            this.rotatingDataPoints = this.viewModel.dataPoints;
            if (this.rotatingDataPoints.length === 0 &&  this.dataviews.categorical.categories === undefined) {
                this.errorMessage(options, errorMessageLiteral, fieldLiteral, "Category Data");

                return;
            } else if (this.rotatingDataPoints.length === 0 && this.dataviews.categorical.values === undefined) {
                this.errorMessage(options, errorMessageLiteral, fieldLiteral, "Measure Data");

                return;
            } else {
                this.errormsg.text("").classed("errorMessage", true);
                this.svg.classed("divHeight", false);
                this.divBase.classed("divHeight", false);
            }
            let measureTitle: IMeasureTitle;
            measureTitle = this.getMeasureTitle(this.dataviews);
            let animationSettings: IAnimationSettings;
            animationSettings = this.getAnimationSettings(this.dataviews);
            let labelSettings: ILabelSettings;
            labelSettings = this.getLabelSettings(this.dataviews);

            this.svg.attr({
                height: options.viewport.height,
                width: options.viewport.width
            });

            this.horizBarChart = $(".horizBarChart");
            this.horizBarChart.css("transform", `rotateX(0deg)`);
            this.width = options.viewport.width;
            this.height = options.viewport.height;

            this.yAxis.style({
                "fill": labelSettings.color,
                "font-size": `${labelSettings.fontSize}px`
            });
            this.yAxisMeasures.style({
                "fill": labelSettings.color,
                "font-size": `${labelSettings.fontSize}px`
            });

            let titleProperties: TextProperties;
            titleProperties = {
                fontFamily: "Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif",
                fontSize: `${measureTitle.fontSize}px`,
                text: this.viewModel.name
            };
            // measure title
            this.svg.select(".measureTitle")
                .attr("transform", `translate(20,${(measureTitle.fontSize)})`)
                .attr("font-size", `${measureTitle.fontSize}px`)
                .attr("fill", measureTitle.color);

            let textHeight: number;
            textHeight = textMeasurementService.measureSvgTextHeight(titleProperties);

            this.rootElement.select(".rootDiv").style("height", `${options.viewport.height}px`);
            this.rootElement.select(".baseDiv").style("width", "100%");

            this.margin = 15 / 100;

            this.xScale = d3.scale.ordinal()
                // tslint:disable-next-line:typedef
                .domain(this.viewModel.dataPoints.map((d) => d.category))
                .rangeBands([RotatingChart.statConfig.margins.top + textHeight, this.height], 0.2, 0.3);

            let barHeight: number;
            barHeight = this.xScale.rangeBand();

            if (barHeight < 20) {
                this.height = options.viewport.height + (this.viewModel.dataPoints.length * (20 - barHeight));
                this.width = options.viewport.width - 20;
                this.xScale.rangeBands([RotatingChart.statConfig.margins.top + textHeight, this.height], 0.2, 0.3);
                this.divRoot.select(".baseDiv").style("height", `${this.height}px`);
                this.divRoot.select(".horizBarChart").style("height", `${this.height}px`);
            } else {
                this.height = options.viewport.height;
                this.width = options.viewport.width;
                this.xScale.rangeBands([RotatingChart.statConfig.margins.top + textHeight, this.height], 0.2, 0.3);
                this.divRoot.select(".baseDiv").style("height", `${this.height}px`);
                this.divRoot.select(".horizBarChart").style("height", `${this.height}px`);
            }

            let yAxis: d3.svg.Axis;
            yAxis = d3.svg.axis()
                .scale(this.xScale)
                .orient("left");

            this.yAxis.attr("transform", `translate(${this.margin * this.width},0)`)
                .call(yAxis);

            this.measureCount = options.dataViews[0].categorical.values.length;
            this.renderVisual();

            if (this.measureCount > 1) {
                if (animationSettings.show) {
                    clearInterval(this.rotationId);
                    this.rotationId = setInterval(() => this.rotation(), animationSettings.duration * 1000);
                }
                // Click functionality
                $(".horizBarChart").on("click", () => {
                    clearInterval(this.rotationId);
                    this.rotation();
                });
            }
            this.svg.on("contextmenu", () => {
                const mouseEvent: MouseEvent = d3.event as MouseEvent;
                const eventTarget: EventTarget = mouseEvent.target;
                // tslint:disable-next-line:no-any
                const dataPoint: any = d3.select(eventTarget).datum();
                if (dataPoint !== undefined) {
                    this.selectionManager.showContextMenu(dataPoint.selectionId, {
                        x: mouseEvent.clientX,
                        y: mouseEvent.clientY
                    });
                    mouseEvent.preventDefault();
                }
            });
            this.eventService.renderingFinished(options);
        } catch (exeption) {
                 this.eventService.renderingFailed(options, exeption);
            }

}
        public getDefaultAnimationSettings(): IAnimationSettings {
            return {
                duration: 6,
                show: false
            };
        }
        public rotation(): void {
            this.rotationCount = 1;
            clearInterval(this.frameId);
            this.frameId = setInterval(() => this.frame(), 5);
        }
        public removeAll(): void {
            this.horizBarContainer.selectAll("*").remove();
            this.yAxis.selectAll("*").remove();
            this.yAxisMeasures.selectAll("*").remove();
        }
        // tslint:disable-next-line:no-any
        public errorMessage(options:
             any,           errorMessageLiteral: string , fieldLiteral: string , fieldName: string): void {
            // this.svg.style("height", 0);
            // this.divBase.style("height", 0);
            this.svg.classed("divHeight", true);
            this.divBase.classed("divHeight", true);
            const viewWidth: number = options.viewport.width / 4;
            const viewHeight: number = options.viewport.height / 2;
            const message: string = errorMessageLiteral + fieldName + fieldLiteral;
            this.errormsg
                .text(message)
                .attr("title", message)
                .classed("errorMessage", false)
                .style({ "margin-left": `${viewWidth}px`, "margin-top": `${viewHeight}px` });
        }
        public frame(): void {
            if (this.rotationCount === 90) {
                this.measureUpdateCounter++;
                if (this.measureUpdateCounter >= this.measureCount) {
                    this.measureUpdateCounter = 0;
                }

                this.rotationCount = -90;
                this.viewModel = visualTransform(this.options, this.host, this.measureUpdateCounter);
                this.renderVisual();
            } else if (this.rotationCount === 0) {
                clearInterval(this.frameId);
            } else {
                this.rotationCount++;
                this.horizBarChart.css("transform", `rotateX(${-this.rotationCount}deg)`);
            }
        }
        /*
        * Renders the visual
        * */
        public renderVisual(): void {
            let THIS: this;
            THIS = this;
            let width: number;
            width = this.width;
            // tslint:disable-next-line
            const availableWidth: any = width / 9;
            let measureTitle: IMeasureTitle;
            measureTitle = this.getMeasureTitle(this.dataviews);
            let labelSettings: ILabelSettings;
            labelSettings = this.getLabelSettings(this.dataviews);
            let yScale: d3.scale.Linear<number, number>;
            if (this.viewModel.dataMin < 0) {
                yScale = d3.scale.linear()
                    .domain([0, Math.abs(this.viewModel.dataMax) + Math.abs(this.viewModel.dataMin)])
                    .range([this.width, (this.margin * this.width * 2)]);
            } else {
                yScale = d3.scale.linear()
                    .domain([0, Math.abs(this.viewModel.dataMax)])
                    .range([this.width, (this.margin * this.width * 2)]);

            }

            let titleProperties: TextProperties;
            titleProperties = {
                fontFamily: "Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif",
                fontSize: `${measureTitle.fontSize}px`,
                text: this.viewModel.name
            };

            $(".measureTitle").text(textMeasurementService.getTailoredTextOrDefault(titleProperties, this.width - 30));

            let add: number;
            if ((this.viewModel.dataMax > 0 && this.viewModel.dataMin < 0)
                || ((this.viewModel.dataMax < 0 && this.viewModel.dataMin < 0))) {

                add = (this.width - yScale(Math.abs(this.viewModel.dataMin)));
            } else {
                add = 0;
            }
            let bars: d3.selection.Update<IRotatingChartDataPoint>;
            bars = this.horizBarContainer.selectAll(".bar").data(this.viewModel.dataPoints);
            bars.enter()
                .append("rect")
                .classed("bar", true);
            // bars
            bars.attr({
                // tslint:disable-next-line:typedef
                "fill": (d) => d.color,
                "fill-opacity": RotatingChart.statConfig.solidOpacity,
                "height": this.xScale.rangeBand(),
                // tslint:disable-next-line:typedef
                "width": (d) => (this.width -
                     yScale(parseFloat(`${d.value}`))) < 0 ? (this.width - yScale(d.value * -1))
                    : (this.width - yScale(d.value)),
                // tslint:disable-next-line:typedef
                "x": (d) => (this.width - yScale(parseFloat(`${d.value}`))) < 0 ?
                    (d.value === this.viewModel.dataMin ?
                         (this.width * this.margin) : (this.width * this.margin) + Math.abs(add)
                        - ((this.width - yScale(parseFloat(`${d.value}`))) < 0 ? (this.width - yScale(d.value * -1))
                            : (this.width - yScale(d.value)))) :
                    (this.width * this.margin) + Math.abs(add),
                // tslint:disable-next-line:typedef
                "y": (d) => this.xScale(d.category)
            });

            let barHeight: number;
            barHeight = +bars.attr("height");
            if (this.width > 90) {
                this.yAxisMeasures.selectAll("text").remove();
                let measureValue: d3.selection.Update<IRotatingChartDataPoint>;
                measureValue = this.yAxisMeasures.selectAll("text").data(this.viewModel.dataPoints);
                let measureLabel: d3.Selection<IRotatingChartDataPoint>;

                const format: string = THIS.viewModel.dataPoints[0].format;
                // tslint:disable-next-line:typedef
                let formatter;
                let tempMeasureData;
                tempMeasureData = Math.round(THIS.viewModel.dataMax).toString();
                let displayVal: number = 0;
                if (labelSettings.displayUnits === 0) {
                    let valLen: number;
                    valLen = tempMeasureData.length;
                    if (valLen > 9) {
                        displayVal = 1e9;
                    } else if (valLen <= 9 && valLen > 6) {
                        displayVal = 1e6;
                    } else if (valLen <= 6 && valLen >= 4) {
                        displayVal = 1e3;
                    } else {
                        displayVal = 10;
                    }
                }
                if (format && format.indexOf("%") !== -1) {
                    formatter = ValueFormatter.create({
                        format,
                        precision: labelSettings.strokeWidth,
                        value: labelSettings.displayUnits === 0 ? 0 : labelSettings.displayUnits
                    });
                } else {
                    formatter = ValueFormatter.create({
                        format,
                        precision: labelSettings.strokeWidth,
                        value: labelSettings.displayUnits === 0 ? displayVal : labelSettings.displayUnits
                    });
                }
                measureLabel = measureValue.enter()
                    .append("text")
                    .classed("measureValue", true);
                // measure value
                measureLabel.attr({
                    dy: "0.40em",
                    // tslint:disable-next-line:typedef
                    x: (d) => this.width - (this.margin * this.width) + 10,
                    // tslint:disable-next-line:typedef
                    y: (d) => this.xScale(d.category) + (barHeight * 0.5)
                })
                .text((d: IRotatingChartDataPoint): string => {
                    const value: string =
                     THIS.applyEllipsis(d.value, formatter, labelSettings, availableWidth, measureValue);

                    return value;
                })
                .append("title").text((d: IRotatingChartDataPoint): string => {
                    return formatter.format(d.value);
                });
            }

            // Changing the text to ellipsis if the width of the window is small
            for (let i: number = 0; i < this.viewModel.dataPoints.length; i++) {
                let newDataLabel: string;
                newDataLabel = THIS.applyEllipsis(this.viewModel.dataPoints[i].category,
                     null, labelSettings, availableWidth, null);
                if ($(".tick text") && $(".tick text")[i]) {
                    $(".tick text")[i].textContent = newDataLabel;
                    d3.select($(".tick text")[i]).append("title").text(this.viewModel.dataPoints[i].category);
                    d3.select($(".tick text")[i]).attr("line-height", "10px");
                }
            }

            this.tooltipServiceWrapper.addTooltip(this.horizBarContainer.selectAll(".bar"),
                                                  (tooltipEvent: TooltipEventArgs<IRotatingChartDataPoint>) =>
                                                  RotatingChart.getTooltipData(tooltipEvent.data),
                                                  (tooltipEvent: TooltipEventArgs<IRotatingChartDataPoint>) =>
                                                   tooltipEvent.data.selectionId);

            let selectionManager: ISelectionManager;
            selectionManager = this.selectionManager;
            bars.exit()
                .remove();
        }
        /*
        * Applies ellipses
        * */
        // tslint:disable-next-line:no-any
        public applyEllipsis(d: any, formatter: any,
                             labelSettings: ILabelSettings, width: any, measureValue: any): string {
            let measureProperties: TextProperties;
            measureProperties = {
                fontFamily: "sans-serif",
                fontSize: `${labelSettings.fontSize}px`,
                text: formatter === null ? d : formatter.format(d)
            };

            return textMeasurementService.getTailoredTextOrDefault(measureProperties, width);
        }
/*
        * Get animation settings
        * */
       public getAnimationSettings(dataView: DataView): IAnimationSettings {
        let objects: DataViewObjects = null;
        let settings: IAnimationSettings;
        settings = this.getDefaultAnimationSettings();
        if (!dataView.metadata || !dataView.metadata.objects) {
            return settings;
        }
        objects = dataView.metadata.objects;
        // tslint:disable-next-line:typedef
        let properties;
        properties = props;
        settings.show = DataViewObjects.getValue(objects, properties.animationSettings.show, settings.show);
        settings.duration = DataViewObjects.getValue(objects,
             properties.animationSettings.duration, settings.duration);
        settings.duration = settings.duration < 2 ? 2 : settings.duration > 20 ? 20 : settings.duration;

        return settings;
    }
// tslint:disable: object-literal-sort-keys
    public enumerateObjectInstances(options:
         EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        let objectName;
        objectName = options.objectName;
        let objectEnumeration: VisualObjectInstance[];
        objectEnumeration = [];
        let animationSettings: IAnimationSettings;
        animationSettings = this.getAnimationSettings(this.dataviews);
        let measureTitle: IMeasureTitle;
        measureTitle = this.getMeasureTitle(this.dataviews);
        let labels: ILabelSettings;
        labels = this.getLabelSettings(this.dataviews);

        switch (objectName) {
            case "animationSettings":
                objectEnumeration.push({
                    objectName,
                    displayName: "Delay (seconds)",
                    selector: null,
                    properties: {
                        show: animationSettings.show,
                        duration: Math.round(animationSettings.duration)
                    }
                });
                break;
            case "labelSettings":
                objectEnumeration.push({
                    objectName,
                    properties: {
                        color: labels.color,
                        displayUnits: labels.displayUnits,
                        fontSize: labels.fontSize,
                        strokeWidth: labels.strokeWidth
                    },
                    selector: null
                });
                break;
            case "measureTitle":
                objectEnumeration.push({
                    objectName,
                    properties: {
                        color: measureTitle.color,
                        fontSize: measureTitle.fontSize
                    },
                    selector: null
                });
                break;
            case "colorSelector":
                let barDataPoint: IRotatingChartDataPoint;
                for (barDataPoint of this.rotatingDataPoints) {
                    objectEnumeration.push({
                        objectName,
                        displayName: barDataPoint.category,
                        properties: {
                            fill: {
                                solid: {
                                    color: barDataPoint.color
                                }
                            }
                        },
                        selector: barDataPoint.selectionId.getSelector()

                    });
                }
                break;
            default:
                break;
        }

        return objectEnumeration;
    }
    // tslint:enable
        private getDefaultMeasureTitle(): IMeasureTitle {
            return {
                color: "#666666",
                fontSize: 20
            };
        }

        private getDefaultLabelSettings(): ILabelSettings {
            return {
                color: "#000",
                displayUnits: 0,
                fontSize: 12,
                strokeWidth: 0
            };
        }
        /*
        * Get measure title
        * */
        private getMeasureTitle(dataView: DataView): IMeasureTitle {
            let objects: DataViewObjects = null;
            let title: IMeasureTitle;
            title = this.getDefaultMeasureTitle();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return title;
            }
            objects = dataView.metadata.objects;
            // tslint:disable-next-line:typedef
            const currentmeasurelabelprop = props;
            title.color = DataViewObjects.getFillColor(objects,
                 currentmeasurelabelprop.measureTitle.color, title.color);
            title.fontSize = DataViewObjects.getValue(objects,
                 currentmeasurelabelprop.measureTitle.fontSize, title.fontSize);

            return title;
        }
        /*
        * Get label settings
        * */
        private getLabelSettings(dataView: DataView): ILabelSettings {
            let objects: DataViewObjects = null;
            let labelSettings: ILabelSettings;
            labelSettings = this.getDefaultLabelSettings();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return labelSettings;
            }
            objects = dataView.metadata.objects;
            // tslint:disable-next-line:typedef
            const labelProps = props;
            labelSettings.color = DataViewObjects.getFillColor(objects,
                 labelProps.labelSettings.color, labelSettings.color);
            labelSettings.fontSize = DataViewObjects.getValue(objects,
                 labelProps.labelSettings.fontSize, labelSettings.fontSize);
            labelSettings.fontSize = labelSettings.fontSize > 25 ? 25 : labelSettings.fontSize;
            labelSettings.displayUnits = DataViewObjects.getValue(objects,
                    labelProps.labelSettings.displayUnits, labelSettings.displayUnits);
            labelSettings.strokeWidth = DataViewObjects.getValue(objects,
                    labelProps.labelSettings.strokeWidth, labelSettings.strokeWidth);
            if (labelSettings.strokeWidth > 4) {
                labelSettings.strokeWidth = 4;
            }

            return labelSettings;
        }
    }
}
