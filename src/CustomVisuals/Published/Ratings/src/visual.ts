/*
 *  Ratings custom visual
 *
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ''Software''), to deal
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
    import tooltip = powerbi.extensibility.utils.tooltip;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
    import createTooltipServiceWrapper = powerbi.extensibility.utils.tooltip.createTooltipServiceWrapper;
    export interface IStarsData {
        value: number;
        max: number;
        valueLabel: string;
        numStars: number;
        show: boolean;
        showStroke: boolean;
        starStroke: string;
        starFill: string;
        emptyStarFill: string;
        valueAsPercent: boolean;
        visualSymbol: string;
        fontSize: number;
        direction: string;
        fontColor: string;
        fontFamily: string;
        showAnimation: boolean;
        strokeWidth: number;
        tooltipData: ITooltipDataPoints[];
        showGradient: boolean;
        gradientStartColor: string;
        gradientEndColor: string;
    }
    export interface ISymbolColorConfig {
        fill: string;
        stroke: string;
    }
    export interface ITooltipDataPoints {
        name: string;
        value: string;
    }

    export class Ratings implements IVisual {
          // Convert a DataView into a view model
          public static converter(dataView: DataView): IStarsData {
            const data: IStarsData = {} as IStarsData;
            const valueFormatSymbol: string = "";
            if (dataView && dataView.categorical && dataView.categorical.values
                 && dataView.metadata && dataView.metadata.columns) {
                dataView.categorical.values.forEach((val: DataViewValueColumn) => {
                    if (val.source.roles.value) {
                        data.value = Number(val.values[0]);
                    } else if (val.source.roles.max) {
                        data.max = Number(val.values[0]);
                    }
                });
            } else {
                data.value = Ratings.defaultValues.value;
                data.max = undefined;
            }
            data.visualSymbol = Ratings.getVisualSymbol(dataView);
            data.numStars = Ratings.getNumStars(dataView);
            data.show = Ratings.getShowLabel(dataView);
            data.showStroke = Ratings.getShowStroke(dataView);
            data.starStroke = Ratings.getStarStroke(dataView).solid.color;
            data.starFill = Ratings.getStarFill(dataView).solid.color;
            data.emptyStarFill = Ratings.getEmptyStarFill(dataView).solid.color;
            data.fontSize = Ratings.getFontSize(dataView);
            data.direction = Ratings.getPosition(dataView);
            data.fontFamily = Ratings.getFontFamily(dataView);
            data.fontColor = Ratings.getFontColor(dataView).solid.color;
            data.valueAsPercent = valueFormatSymbol === "%" ? true : false;
            data.showAnimation = Ratings.getShowAnimation(dataView);
            data.strokeWidth = Ratings.getStrokeWidth(dataView);
            data.showGradient = Ratings.getShowGradient(dataView);
            data.gradientStartColor = Ratings.getGradientStartColor(dataView).solid.color;
            data.gradientEndColor = Ratings.getGradientEndColor(dataView).solid.color;
            let max: number = data.max || data.numStars;
            if (data.valueAsPercent) {
                max = data.max || 1;
                const percentLiteral: string = "%";
                data.valueLabel = (data.value * 100) + percentLiteral;
            } else {
                data.valueLabel = data.value.toFixed(1);
                data.value = Number(data.valueLabel);
            }
            const rangeSize: number = max;
            const scale: number = data.numStars / rangeSize;
            data.value = (data.value * scale);

            return data;
        }
        // star properties
        private static internalStarWidth: number = 62;
        private static starMarginRight: number = 8;
        private static starPolygonPoints: string = "30,8 38,31 62,34 45,47 52,70 30,57 8,70 16,47 -2,34 22,31 30,8";
        // triangle properties
        private static internalTriangleWidth: number = 62;
        private static triangleMarginRight: number = 5;
        private static trianglePathPoints: string = "2,62 32,12 62,62";
        // inverted triangle properties
        private static internalInvertedTriangleWidth: number = 62;
        private static invertedTriangleMarginRight: number = 5;
        private static invertedTrianglePathPoints: string = "2,12 32,62 62,12";
        // circle properties
        private static internalCircleWidth: number = 62;
        private static circleMarginRight: number = 5;
        private static internalSymbolHeight: number = 80;

        // tslint:disable-next-line:no-any
        private static defaultValues: any = {
            defaultFill: "#FBB040",
            defaultStroke: "#00000",
            direction: "down",
            emptyStarFill: "#E6E7E8",
            fontColor: "#00000",
            fontSize: 20,
            gradientEndColor: "#00FF00",
            gradientStartColor: "#FF0000",
            max: undefined,
            numStars: 5,
            show: true,
            showAnimation: true,
            showGradient: false,
            showStroke: false,
            starStroke: "#00000",
            strokeWidth: 2,
            value: 0,
            visualSymbol: "star"
        };
        // tslint:disable-next-line:no-any
        private static strokeWidthLimits: any = {
            max: 4,
            min: 1
        };
        // tslint:disable-next-line:no-any
        private static properties: any = {
            direction: { objectName: "dataLabel", propertyName: "direction" },
            emptyStarFill: { objectName: "starStyle", propertyName: "emptyStarFill" },
            fontColor: { objectName: "dataLabel", propertyName: "fontColor" },
            fontFamily: { objectName: "dataLabel", propertyName: "fontFamily" },
            fontSize: { objectName: "dataLabel", propertyName: "fontSize" },
            gradientEndColor: { objectName: "starStyle", propertyName: "gradientEndColor" },
            gradientStartColor: { objectName: "starStyle", propertyName: "gradientStartColor" },
            max: { objectName: "starproperties", propertyName: "max" },
            numStars: { objectName: "starproperties", propertyName: "numStars" },
            show: { objectName: "dataLabel", propertyName: "show" },
            showAnimation: { objectName: "starAnimation", propertyName: "show" },
            showGradient: { objectName: "starStyle", propertyName: "showGradient" },
            showStroke: { objectName: "stroke", propertyName: "show" },
            starFill: { objectName: "starStyle", propertyName: "starFill" },
            starStroke: { objectName: "stroke", propertyName: "starStroke" },
            strokeWidth: { objectName: "stroke", propertyName: "strokeWidth" },
            visualSymbol: { objectName: "starproperties", propertyName: "visualSymbol" }
        };
         private static getDefaultColors(visualSymbol: string): ISymbolColorConfig {
            const defaultColorConfig: ISymbolColorConfig = {} as ISymbolColorConfig;
            switch (visualSymbol) {
                case "star":
                    defaultColorConfig.fill = Ratings.defaultValues.defaultFill;
                    defaultColorConfig.stroke = Ratings.defaultValues.defaultStroke;
                    break;
                case "triangle":
                    defaultColorConfig.fill = Ratings.defaultValues.defaultFill;
                    defaultColorConfig.stroke = Ratings.defaultValues.defaultStroke;
                    break;
                case "invertedTriangle":
                    defaultColorConfig.fill = Ratings.defaultValues.defaultFill;
                    defaultColorConfig.stroke = Ratings.defaultValues.defaultStroke;
                    break;

                case "circle":
                    defaultColorConfig.fill = Ratings.defaultValues.defaultFill;
                    defaultColorConfig.stroke = Ratings.defaultValues.defaultStroke;
                    break;

                default:
                    defaultColorConfig.fill = Ratings.defaultValues.defaultFill;
                    defaultColorConfig.stroke = Ratings.defaultValues.defaultStroke;
                    break;
            }

            return defaultColorConfig;
        }

        // tslint:disable-next-line:no-any
        private static getValue<T>(objects: DataViewObjects, property: any, defaultValue?: T): T {
            if (!objects || !objects[property.objectName]) {
                return defaultValue;
            }
            const objectOrMap: DataViewObject = objects[property.objectName];
            const object: DataViewObject = objectOrMap as DataViewObject;
            const propertyValue: T = object[property.propertyName] as T;
            if (propertyValue === undefined) {
                return defaultValue;
            }

            return propertyValue;
        }

        private static getVisualSymbol(dataView: DataView): string {
            // tslint:disable-next-line:no-any
            const visualSymbol: any = dataView.metadata && Ratings.getValue(dataView.metadata.objects,
                                                                            Ratings.properties.visualSymbol,
                                                                            Ratings.defaultValues.visualSymbol);

            return visualSymbol;
        }

        private static getNumStars(dataView: DataView): number {
            return dataView.metadata && Ratings.getValue(dataView.metadata.objects,
                                                                         Ratings.properties.numStars,
                                                                          Ratings.defaultValues.numStars);
        }

        private static getShowLabel(dataView: DataView): boolean {
            return dataView.metadata && Ratings.getValue(dataView.metadata.objects,
                                                         Ratings.properties.show, Ratings.defaultValues.show);
        }

        private static getShowStroke(dataView: DataView): boolean {
            return dataView.metadata && Ratings.getValue(dataView.metadata.objects,
                                                         Ratings.properties.showStroke,
                                                          Ratings.defaultValues.showStroke);
        }

        private static getStarStroke(dataView: DataView): Fill {
            const visualSymbol: string = Ratings.getVisualSymbol(dataView);
            const defaultColorConfig: ISymbolColorConfig = Ratings.getDefaultColors(visualSymbol);

            return dataView.metadata && Ratings.getValue(dataView.metadata.objects, Ratings.properties.starStroke, {
                solid: {
                    color: defaultColorConfig.stroke
                }
            });
        }

        private static getStarFill(dataView: DataView): Fill {
            const visualSymbol: string = Ratings.getVisualSymbol(dataView);
            const defaultColorConfig: ISymbolColorConfig = Ratings.getDefaultColors(visualSymbol);

            return dataView.metadata && Ratings.getValue(dataView.metadata.objects, Ratings.properties.starFill, {
                solid: {
                    color: defaultColorConfig.fill
                }
            });
        }

        private static getEmptyStarFill(dataView: DataView): Fill {
            return dataView.metadata && Ratings.getValue(dataView.metadata.objects, Ratings.properties.emptyStarFill, {
                solid: {
                    color: Ratings.defaultValues.emptyStarFill
                }
            });
        }

        private static getFontSize(dataView: DataView): number {
            return dataView.metadata && Ratings.getValue(dataView.metadata.objects,
                                                         Ratings.properties.fontSize, Ratings.defaultValues.fontSize);
        }

        private static getPosition(dataView: DataView): string {
            return dataView.metadata && Ratings.getValue(dataView.metadata.objects,
                                                         Ratings.properties.direction, Ratings.defaultValues.direction);
        }
        private static getFontColor(dataView: DataView): Fill {
            return dataView.metadata && Ratings.getValue(dataView.metadata.objects,
                                                         Ratings.properties.fontColor,
                                                         { solid: { color: Ratings.defaultValues.fontColor } });
        }
        private static getFontFamily(dataView: DataView): string {
            return dataView.metadata && Ratings.getValue(dataView.metadata.objects,
                                                         Ratings.properties.fontFamily,
                                                         Ratings.defaultValues.fontColor);
        }

        private static getShowAnimation(dataView: DataView): boolean {
            return dataView.metadata && Ratings.getValue(dataView.metadata.objects,
                                                         Ratings.properties.showAnimation,
                                                         Ratings.defaultValues.showAnimation);
        }

        private static getStrokeWidth(dataView: DataView): number {
            let strokeWidth = dataView.metadata && Ratings.getValue(dataView.metadata.objects,
                                                                            Ratings.properties.strokeWidth,
                                                                            Ratings.defaultValues.strokeWidth);
            if (strokeWidth < Ratings.strokeWidthLimits.min) {
                strokeWidth = Ratings.strokeWidthLimits.min;
            } else if (strokeWidth > Ratings.strokeWidthLimits.max) {
                strokeWidth = Ratings.strokeWidthLimits.max;
            }

            return strokeWidth;
        }

        private static getShowGradient(dataView: DataView): boolean {
            return dataView.metadata && Ratings.getValue(dataView.metadata.objects,
                                                         Ratings.properties.showGradient,
                                                         Ratings.defaultValues.showGradient);
        }

        private static getGradientStartColor(dataView: DataView): Fill {
            return dataView.metadata && Ratings.getValue(dataView.metadata.objects,
                                                         Ratings.properties.gradientStartColor,
                                                         { solid:
                                                            { color: Ratings.defaultValues.gradientStartColor } });
        }

        private static getGradientEndColor(dataView: DataView): Fill {
            return dataView.metadata && Ratings.getValue(dataView.metadata.objects,
                                                         Ratings.properties.gradientEndColor,
                                                         { solid: { color: Ratings.defaultValues.gradientEndColor } });
        }

        private element: JQuery;
        private dataView: DataView;
        private data: IStarsData;
        private options: VisualUpdateOptions;
        private labelWidth: number;
        private labelHeight: number;
        private currentSymbolWidth: number;
        private currentSymbolMarginRight: number;
        private currentClipPath: string;
        private tranlateLiteral: string = "translate(";
        private closeBracketLiteral: string = ")";
        private pixelLiteral: string = "px";
        private xAxisLiteral: string = "translate(0,";
        private yAxisCoordinate: string = "80%";
        private viewBoxLiteral: string = "0 0 ";
        private spaceLiteral: string = " ";
        private delayTime: number = 150;
        private gradient: d3.Selection<SVGElement>;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private host: IVisualHost;
        private starsAndLabelGroup: d3.Selection<SVGElement>;
        private tooltipDataPoint: ITooltipDataPoints;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.element = $(options.element);
            this.tooltipServiceWrapper = tooltip.createTooltipServiceWrapper(
                this.host.tooltipService,
                options.element);
        }

        public update(options: VisualUpdateOptions): void {
            try {
            this.host.eventService.renderingStarted(options);
            const dataView: DataView = this.dataView = options.dataViews[0];
            // tslint:disable-next-line:no-any
            if (dataView) {
                this.data = Ratings.converter(dataView);
                this.options = options;

                this.labelWidth = 0; // reset to 0, will get update when/if label is added
                this.redraw();
                let len: number;
                len = this.dataView.categorical.values.length;
                this.data.tooltipData = [];
                for (let iCounter: number = 0; iCounter < len; iCounter++) {
                    this.tooltipDataPoint = {
                        name: dataView.categorical.values[iCounter].source.displayName,
                        value: dataView.categorical.values[iCounter].values !== null ?
                            (dataView.categorical.values[iCounter].values.toString()) : ""
                    };
                    this.data.tooltipData.push(this.tooltipDataPoint);
                }
                this.getTooltipData(this.data.tooltipData);
                this.tooltipServiceWrapper.addTooltip(this.starsAndLabelGroup.selectAll("#polygonId"),
                                                      (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(
                                                      this.data.tooltipData),
                                                      (tooltipEvent: TooltipEventArgs<number>) => null);
            }
            this.host.eventService.renderingFinished(options);
                   } catch (exeption) {
                            this.host.eventService.renderingFailed(options, exeption);
                       }
                     }

        public destroy(): void {
            this.element.empty();
            this.data = null;
            this.options = null;
            this.labelWidth = null;
            this.element = null;
            this.dataView = null;
        }

        /* tslint:disable: object-literal-sort-keys */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            const instances: VisualObjectInstance[] = [];
            // tslint:disable-next-line:switch-default
            switch (options.objectName) {
                case "starproperties": {
                    const starProp: VisualObjectInstance = {
                        displayName: "Indicator Configuration",
                        objectName: "starproperties",
                        properties: {
                            visualSymbol: Ratings.getVisualSymbol(this.dataView),
                            numStars: Ratings.getNumStars(this.dataView)
                        },
                        selector: null,
                        validValues: {
                            numStars: {
                                 numberRange: {
                                     max: 10,
                                     min: 3
                                 }
                             }
                         }
                    };
                    instances.push(starProp);
                    break;
                }
                case "starStyle":
                    let properties: any = {};
                    if (this.data.showGradient) {
                        properties = {
                            showGradient: Ratings.getShowGradient(this.dataView),
                            gradientStartColor: Ratings.getGradientStartColor(this.dataView),
                            gradientEndColor: Ratings.getGradientEndColor(this.dataView),
                            emptyStarFill: Ratings.getEmptyStarFill(this.dataView)
                        };
                    } else {
                        properties = {
                            showGradient: Ratings.getShowGradient(this.dataView),
                            starFill: Ratings.getStarFill(this.dataView),
                            emptyStarFill: Ratings.getEmptyStarFill(this.dataView)
                        };
                    }
                    const gradient: VisualObjectInstance = {
                        displayName: "Indicator style",
                        objectName: "starStyle",
                        properties,
                        selector: null
                    };
                    instances.push(gradient);
                    break;
                case "stroke":
                    properties = {
                        show: Ratings.getShowStroke(this.dataView)
                    };
                    if (this.data.showStroke) {

                        properties[`starStroke`] = Ratings.getStarStroke(this.dataView);
                        properties[`strokeWidth`] = Ratings.getStrokeWidth(this.dataView);
                    }
                    const stroke: VisualObjectInstance = {
                        displayName: "Border",
                        objectName: "stroke",
                        properties,
                        selector: null,
                    };
                    instances.push(stroke);
                    break;
                case "starAnimation":
                    const starAnimation: VisualObjectInstance = {
                        displayName: "Animation",
                        objectName: "starAnimation",
                        properties: {
                            show: Ratings.getShowAnimation(this.dataView)
                        },
                        selector: null
                    };
                    instances.push(starAnimation);
                    break;
                case "dataLabel":
                    const showdataLabel: VisualObjectInstance = {
                        displayName: "Data Label",
                        objectName: "dataLabel",
                        properties: {
                            show: Ratings.getShowLabel(this.dataView)
                        },
                        selector: null
                    };
                    instances.push(showdataLabel);
                    if (this.data.show) {
                        const dataLabel: VisualObjectInstance = {
                            displayName: "Data Label",
                            objectName: "dataLabel",
                            properties: {
                                direction: Ratings.getPosition(this.dataView),
                                fontColor: Ratings.getFontColor(this.dataView),
                                fontFamily: Ratings.getFontFamily(this.dataView),
                                fontSize: Ratings.getFontSize(this.dataView)
                            },
                            selector: null
                        };
                        instances.push(dataLabel);
                    }
                    break;
            }

            return instances;
        }
        /*tslint:enable*/

        private getTranslateXFromIndex(index: number): number {
            if (this.data.direction === "right") {
                return (index * (this.currentSymbolWidth + this.currentSymbolMarginRight));
            } else {
                return (index * (this.currentSymbolWidth + this.currentSymbolMarginRight)) + this.labelWidth;
            }
        }

        private setSymbolProps(symbol: string): void {
            switch (symbol) {
                case "star":
                    this.currentSymbolWidth = Ratings.internalStarWidth;
                    this.currentSymbolMarginRight = Ratings.starMarginRight;
                    this.currentClipPath = "#starClipPath";
                    break;
                case "triangle":
                    this.currentSymbolWidth = Ratings.internalTriangleWidth;
                    this.currentSymbolMarginRight = Ratings.triangleMarginRight;
                    this.currentClipPath = "#triangleClipPath";
                    break;
                case "invertedTriangle":
                    this.currentSymbolWidth = Ratings.internalInvertedTriangleWidth;
                    this.currentSymbolMarginRight = Ratings.invertedTriangleMarginRight;
                    this.currentClipPath = "#invertedTriangleClipPath";
                    break;
                case "circle":
                    this.currentSymbolWidth = Ratings.internalCircleWidth;
                    this.currentSymbolMarginRight = Ratings.circleMarginRight;
                    this.currentClipPath = "#circleClipPath";
                    break;
                default:
                    this.currentSymbolWidth = Ratings.internalStarWidth;
                    this.currentSymbolMarginRight = Ratings.starMarginRight;
                    this.currentClipPath = "#starClipPath";
            }
        }

        private addShape(percentFull: number, index: number, svg: d3.Selection<SVGElement>,
                         strokeOnly: boolean, translateXOveride: number,
                         start: string, end: string, polygonPoints: string): void {

            let fill: string;
            let strokeWidth: number;
            let translateX: number;
            if (this.data.showGradient) {
                fill = percentFull === 0 ? this.data.emptyStarFill : `url(#gradient${index})`,
                    strokeWidth = this.data.showStroke ? this.data.strokeWidth : 0,
                    translateX = translateXOveride !== undefined ? 0 : this.getTranslateXFromIndex(index);
                fill = strokeOnly ? "none" : fill;
                this.gradient.attr("id", `gradient${index}`)
                    .attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "100%")
                    .attr("y2", "0%");
                if (this.data.showAnimation) {
                    this.gradient.append("stop")
                        .attr("offset", "0%")
                        .attr("stop-color", this.data.emptyStarFill)
                        .transition()
                        .duration(1000)
                        .delay(index * this.delayTime)
                        .attr("stop-color", start)
                        .attr("stop-opacity", 1);

                    this.gradient.append("stop")
                        .attr("offset", "100%")
                        .attr("stop-color", this.data.emptyStarFill)
                        .transition()
                        .duration(1000)
                        .delay(index * this.delayTime)
                        .attr("stop-color", end)
                        .attr("stop-opacity", 1);
                } else {
                    this.gradient.append("stop")
                        .attr("offset", "0%")
                        .attr("stop-color", start)
                        .attr("stop-opacity", 1);

                    this.gradient.append("stop")
                        .attr("offset", "100%")
                        .attr("stop-color", end)
                        .attr("stop-opacity", 1);

                }
                svg.append("polygon")
                    .classed(`polygon-${index}`, true)
                    .attr({
                        "fill": fill,
                        "id": "polygonId",
                        "points": `${polygonPoints}`,
                        "stroke": this.data.starStroke,
                        "stroke-width": `${strokeWidth}`
                    })
                    .attr("transform", this.tranlateLiteral + translateX + this.closeBracketLiteral);
            } else {
                fill = percentFull === 0 ? this.data.emptyStarFill : this.data.starFill,
                    strokeWidth = this.data.showStroke ? this.data.strokeWidth : 0,
                    translateX = translateXOveride !== undefined ? 0 : this.getTranslateXFromIndex(index);
                fill = strokeOnly ? "none" : fill;
                if (this.data.showAnimation) {
                    svg.append("polygon")
                        .classed(`polygon-${index}`, true)
                        .attr({
                            "fill": this.data.emptyStarFill,
                            "id": "polygonId",
                            "points": `${polygonPoints}`,
                            "stroke": this.data.starStroke,
                            "stroke-width": `${strokeWidth}`
                        })
                        .attr("transform", this.tranlateLiteral + translateX + this.closeBracketLiteral)
                        .transition()
                        .duration(1000)
                        .delay(index * this.delayTime)
                        .attr("fill", fill);
                } else {
                    svg.append("polygon")
                        .classed(`polygon-${index}`, true)
                        .attr({
                            "fill": fill,
                            "id": "polygonId",
                            "points": `${polygonPoints}`,
                            "stroke": this.data.starStroke,
                            "stroke-width": `${strokeWidth}`
                        })
                        .attr("transform", this.tranlateLiteral + translateX + this.closeBracketLiteral);
                }
            }

        }

        private addCircle(percentFull: number, index: number, svg: d3.Selection<SVGElement>,
                          strokeOnly: boolean, translateXOveride: number, start: string, end: string): void {
            let fill: string;
            let strokeWidth: number;
            let translateX: number;
            if (this.data.showGradient) {
                fill = percentFull === 0 ? this.data.emptyStarFill : `url(#gradient${index})`,
                    strokeWidth = this.data.showStroke ? this.data.strokeWidth : 0,
                    translateX = translateXOveride !== undefined ? 0 : this.getTranslateXFromIndex(index);
                fill = strokeOnly ? "none" : fill;
                this.gradient.attr("id", `gradient${index}`)
                    .attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "100%")
                    .attr("y2", "0%");

                if (this.data.showAnimation) {
                    this.gradient.append("stop")
                        .attr("offset", "0%")
                        .attr("stop-color", this.data.emptyStarFill)
                        .transition()
                        .duration(1000)
                        .delay(index * this.delayTime)
                        .attr("stop-color", start)
                        .attr("stop-opacity", 1);
                    this.gradient.append("stop")
                        .attr("offset", "100%")
                        .attr("stop-color", this.data.emptyStarFill)
                        .transition()
                        .duration(1000)
                        .delay(index * this.delayTime)
                        .attr("stop-color", end)
                        .attr("stop-opacity", 1);
                } else {
                    this.gradient.append("stop")
                        .attr("offset", "0%")
                        .attr("stop-color", start)
                        .attr("stop-opacity", 1);
                    this.gradient.append("stop")
                        .attr("offset", "100%")
                        .attr("stop-color", end)
                        .attr("stop-opacity", 1);
                }
                svg.append("circle")
                    .attr({
                        "cx": 30,
                        "cy": 37,
                        "fill": fill,
                        "id": "polygonId",
                        "r": 30,
                        "stroke": this.data.starStroke,
                        "stroke-width": `${strokeWidth}`
                    })
                    .attr("transform", this.tranlateLiteral + translateX + this.closeBracketLiteral);
            } else {
                fill = percentFull === 0 ? this.data.emptyStarFill : this.data.starFill,
                    strokeWidth = this.data.showStroke ? this.data.strokeWidth : 0,
                    translateX = translateXOveride !== undefined ? 0 : this.getTranslateXFromIndex(index);
                fill = strokeOnly ? "none" : fill;
                if (this.data.showAnimation) {
                    svg.append("circle")
                        .classed(`circle-${index}`, true)
                        .attr({
                            "cx": 30,
                            "cy": 37,
                            "fill": this.data.emptyStarFill,
                            "id": "polygonId",
                            "r": 30,
                            "stroke": this.data.starStroke,
                            "stroke-width": `${strokeWidth}`
                        })
                        .attr("transform", this.tranlateLiteral + translateX + this.closeBracketLiteral)
                        .transition()
                        .duration(1000)
                        .delay(index * this.delayTime)
                        .attr("fill", fill);
                } else {
                    svg.append("circle")
                        .attr({
                            "cx": 30,
                            "cy": 37,
                            "fill": fill,
                            "id": "polygonId",
                            "r": 30,
                            "stroke": this.data.starStroke,
                            "stroke-width": `${strokeWidth}`
                        })
                        .attr("transform", this.tranlateLiteral + translateX + this.closeBracketLiteral);
                }
            }
        }

        private addSymbol(percentFull: number, index: number,
                          svg: d3.Selection<SVGElement>, start: string,
                          end: string, strokeOnly?: boolean, translateXOveride?: number): void {

            switch (this.data.visualSymbol) {
                case "star":
                    this.addShape(percentFull, index, svg, strokeOnly,
                        translateXOveride, start, end, Ratings.starPolygonPoints);
                    break;
                case "triangle":
                    this.addShape(percentFull, index, svg, strokeOnly,
                         translateXOveride, start, end, Ratings.trianglePathPoints);
                    break;
                case "invertedTriangle":
                    this.addShape(percentFull, index, svg, strokeOnly,
                        translateXOveride, start, end, Ratings.invertedTrianglePathPoints);
                    break;
                case "circle":
                    this.addCircle(percentFull, index, svg, strokeOnly,
                         translateXOveride, start, end);
                    break;

                default:
                    this.addShape(percentFull, index, svg, strokeOnly,
                         translateXOveride, start, end, Ratings.starPolygonPoints);
            }
        }

        private addLabel(svg: d3.Selection<SVGElement>): void {
            const value: string = this.data.value.toFixed(1);
            const labelProp: TextProperties = {
                fontFamily: "Segoe UI",
                fontSize: this.data.fontSize + this.pixelLiteral,
                text: value
            };
            const labelWid: number = textMeasurementService.measureSvgTextWidth(labelProp);
            const paddingRight: number = 10;
            const thisObj: this = this;
            switch (this.data.direction) {
                case "top":
                    svg.append("text")
                        .classed("labelText", true)
                        .style({
                            "fill": this.data.fontColor,
                            "font-family": this.data.fontFamily,
                            "font-size": `${this.data.fontSize}px`
                        })
                        .text(value)
                        .attr("x", (this.getTranslateXFromIndex(this.data.numStars) - labelWid) / 2)
                        .attr("y", "0");
                    break;
                case "down":
                    svg.append("text")
                        .classed("labelText", true)
                        .style({
                            "fill": this.data.fontColor,
                            "font-family": this.data.fontFamily,
                            "font-size": `${this.data.fontSize}px`
                        })
                        .text(value)
                        .attr("x", (this.getTranslateXFromIndex(this.data.numStars) - labelWid) / 2)
                        .attr("y", this.yAxisCoordinate);
                    break;
                case "left":
                    if (this.data.visualSymbol === "triangle" || this.data.visualSymbol === "invertedTriangle" ||
                        this.data.visualSymbol === "circle") {
                        svg.append("text")
                            .classed("labelText", true)
                            .style({
                                "fill": this.data.fontColor,
                                "font-family": this.data.fontFamily,
                                "font-size": `${this.data.fontSize}px`
                            })
                            .text(value)
                            .attr("transform", `translate(${this.getTranslateXFromIndex(0)},
                            ${Ratings.internalSymbolHeight / 2 + this.labelHeight / 4})`);

                        this.labelWidth = labelWid + paddingRight;
                    } else {
                        svg.append("text")
                            .classed("labelText", true)
                            .style({
                                "fill": this.data.fontColor,
                                "font-family": this.data.fontFamily,
                                "font-size": `${this.data.fontSize}px`
                            })
                            .text(value)
                            .attr("transform", this.xAxisLiteral +
                                ((Ratings.internalSymbolHeight * 2) / 3) + this.closeBracketLiteral);
                        this.labelWidth = labelWid + paddingRight;
                    }
                    break;
                case "right":
                    if (this.data.visualSymbol === "triangle" || this.data.visualSymbol === "invertedTriangle" ||
                        this.data.visualSymbol === "circle") {
                        const yAxisLiteral: string = ",35)";
                        svg.append("text")
                            .classed("labelText", true)
                            .style({
                                "fill": this.data.fontColor,
                                "font-family": this.data.fontFamily,
                                "font-size": `${this.data.fontSize}px`
                            })
                            .text(value)
                            .attr("x", ((this.getTranslateXFromIndex(this.data.numStars))))
                            .attr("y", Ratings.internalSymbolHeight / 2 + this.labelHeight / 4);
                        this.labelWidth = labelWid;
                    } else {
                        const yAxisLiteral: string = ",50)";
                        svg.append("text")
                            .classed("labelText", true)
                            .style({
                                "fill": this.data.fontColor,
                                "font-family": this.data.fontFamily,
                                "font-size": `${this.data.fontSize}px`
                            })
                            .text(value)
                            .attr("transform", this.tranlateLiteral +
                                ((this.getTranslateXFromIndex(this.data.numStars))) + yAxisLiteral);
                        this.labelWidth = labelWid;
                    }
                    break;
                default:
                    svg.append("text")
                        .classed("labelText", true)
                        .style({
                            "fill": this.data.fontColor,
                            "font-family": this.data.fontFamily,
                            "font-size": `${this.data.fontSize}px`
                        })
                        .text(value)
                        .attr("x", (this.getTranslateXFromIndex(this.data.numStars) - labelWid) / 2)
                        .attr("y", "0");
                    break;
            }
        }

        private addClipPathDefs(defs: d3.Selection<SVGElement>): void {
            defs.append("svg:clipPath")
                .attr("id", "starClipPath")
                .append("polygon")
                .attr("points", Ratings.starPolygonPoints);
            defs.append("svg:clipPath")
                .attr("id", "triangleClipPath")
                .append("polygon")
                .attr("points", Ratings.trianglePathPoints);
            defs.append("svg:clipPath")
                .attr("id", "invertedTriangleClipPath")
                .append("polygon")
                .attr("points", Ratings.invertedTrianglePathPoints);
            defs.append("svg:clipPath")
                .attr("id", "circleClipPath")
                .append("circle")
                .attr({
                    cx: 30,
                    cy: 37,
                    r: 30
                });
        }

        private redraw(): void {
            this.element.empty();
            this.setSymbolProps(this.data.visualSymbol);
            const value: string = this.data.value.toFixed(1);
            const labelProp: TextProperties = {
                fontFamily: "Segoe UI",
                fontSize: this.data.fontSize + this.pixelLiteral,
                text: value
            };
            const labelHeight: number = textMeasurementService.measureSvgTextHeight(labelProp);
            this.labelHeight = labelHeight;
            // tslint:disable-next-line:no-any
            const svg: d3.Selection<any> = d3.select(this.element.get(0)).append("svg")
                .attr({
                    height: `${this.options.viewport.height}px`,
                    width: `${this.options.viewport.width}px`
                });
            const viewBoxHeight: number = Ratings.internalSymbolHeight;
            const starsAndLabelOffsetY: number = 0;
            // tslint:disable-next-line:no-any
            this.starsAndLabelGroup = svg.append("g")
                .classed("starGroup", true)
                .attr("transform", this.xAxisLiteral + starsAndLabelOffsetY + this.closeBracketLiteral);
            // tslint:disable-next-line:no-any
            const defs: d3.Selection<any> = svg.append("defs");
            this.addClipPathDefs(defs);
            // tslint:disable-next-line:no-any
            const labelGroup: d3.Selection<any> = svg.append("g").classed("labelGroup", true)
                .attr("transform", this.xAxisLiteral + starsAndLabelOffsetY + this.closeBracketLiteral);
            svg.attr("viewBox", this.viewBoxLiteral + (this.getTranslateXFromIndex(this.data.numStars)) +
                this.spaceLiteral + viewBoxHeight);
            if (this.data.show) {
                this.addLabel(labelGroup);
                if (this.data.direction === "right") {
                    const viewBoxLiteral: string = "0 0 ";
                    svg.attr("viewBox", viewBoxLiteral + (this.labelWidth +
                        this.getTranslateXFromIndex(this.data.numStars)) + this.spaceLiteral + viewBoxHeight);
                } else if (this.data.direction === "top") {
                    const viewBoxLiteral: string = "0 -30 ";
                    svg.attr("viewBox", viewBoxLiteral + (this.getTranslateXFromIndex(this.data.numStars)) +
                        this.spaceLiteral + (Ratings.internalSymbolHeight + this.labelHeight));
                } else if (this.data.direction === "left") {
                    const viewBoxLiteral: string = "0 0 ";
                    svg.attr("viewBox", viewBoxLiteral +
                        (this.getTranslateXFromIndex(this.data.numStars)) + this.spaceLiteral + viewBoxHeight);
                } else {
                    svg.attr("viewBox", this.viewBoxLiteral +
                        (this.getTranslateXFromIndex(this.data.numStars)) + this.spaceLiteral +
                        (Ratings.internalSymbolHeight + this.labelHeight));
                }
            }
            // Gradient start and end for entire visual - user input
            const start: string = this.data.gradientStartColor;
            const end: string = this.data.gradientEndColor;

            // Hex to RGB conversion
            // tslint:disable-next-line:no-any
            function hexToRgb(hex: any): any {
                // Expand shorthand form (e.g. '03F') to full form (e.g. '0033FF')
                const shorthandRegex: RegExp = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
                hex = hex.replace(shorthandRegex, (r: number, g: number, b: number): number => {
                    return 2 * (r + g + b);
                });
                const result: RegExpExecArray = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

                return result ? {
                    b: parseInt(result[3], 16),
                    g: parseInt(result[2], 16),
                    r: parseInt(result[1], 16)
                } : null;
            }

            // tslint:disable-next-line:no-any
            function rgbToHex(rgb: any): string {
                const zeroLiteral: string = "0";
                let hex: string = Number(rgb).toString(16);
                if (hex.length < 2) {
                    hex = zeroLiteral + hex;
                }

                return hex;
            }
            // tslint:disable-next-line:no-any
            function fullColorHex(r: any, g: any, b: any): string {
                const hashtagLiteral: string = "#";
                const red: string = rgbToHex(r);
                const green: string = rgbToHex(g);
                const blue: string = rgbToHex(b);

                return hashtagLiteral + red + green + blue;
            }
            // tslint:disable-next-line:no-any
            const startRGB: any = hexToRgb(start);
            // tslint:disable-next-line:no-any
            const endRGB: any = hexToRgb(end);
            // Value for every star
            let startHex: string = start;
            let endHex: string;
            const filledStars: number = this.data.numStars;
            // draw symbols
            for (let iCounter: number = 0; iCounter < this.data.numStars; iCounter++) {
                // tslint:disable-next-line:no-any
                const interRGB: any = {
                    b: (startRGB.b + (endRGB.b - startRGB.b) * iCounter / filledStars).toFixed(0),
                    g: (startRGB.g + (endRGB.g - startRGB.g) * iCounter / filledStars).toFixed(0),
                    r: (startRGB.r + (endRGB.r - startRGB.r) * iCounter / filledStars).toFixed(0)
                };
                // Logic to break the color gradient
                if (iCounter !== 0) {
                    startHex = endHex;
                } else {
                    startHex = start;
                }
                if (iCounter === filledStars - 1) {
                    endHex = end;
                } else {
                    endHex = fullColorHex(interRGB.r, interRGB.g, interRGB.b);
                }
                let percentFull: number = 0;
                if ((iCounter + 1) <= this.data.value) {
                    percentFull = 1;
                } else if ((iCounter + 1) - this.data.value < 1) {
                    percentFull = this.data.value - Math.floor(this.data.value);
                }
                this.gradient = this.starsAndLabelGroup.append("linearGradient");
                // if percent is full or empty, we draw one star
                if (percentFull === 1 || percentFull === 0) {
                    this.addSymbol(percentFull, iCounter, this.starsAndLabelGroup, startHex, endHex);
                } else {
                    const urlLiteral: string = "url(";
                    // tslint:disable-next-line:no-any
                    const partialStarGroup: d3.Selection<any> = this.starsAndLabelGroup.append("g")
                        .attr("clip-path", urlLiteral + window.location.href
                        + this.currentClipPath + this.closeBracketLiteral)
                        .attr("transform", this.tranlateLiteral
                            + this.getTranslateXFromIndex(iCounter) + this.closeBracketLiteral);
                    this.addSymbol(1, iCounter, partialStarGroup, startHex, endHex, false, 0);
                    const rectWidth: number = ((1 - percentFull) * this.currentSymbolWidth);
                    partialStarGroup.append("rect")
                        .attr({
                            fill: this.data.emptyStarFill,
                            height: Ratings.internalSymbolHeight,
                            width: rectWidth
                        })
                        .attr("transform", this.tranlateLiteral +
                         (this.currentSymbolWidth - rectWidth) + this.closeBracketLiteral);
                    if (this.data.showStroke) {
                        this.addSymbol(1, iCounter, this.starsAndLabelGroup, startHex, endHex, true);
                    }
                }
            }
        }

        private countDecimals(inputValue: number): number {
            if (Math.floor(inputValue) === inputValue || inputValue.toString().indexOf(".") === -1) {
                return 0;
            }

            return inputValue.toString().split(".")[1].length || 0;
        }

        // tslint:disable-next-line:no-any
        private getTooltipData(value: any[]): VisualTooltipDataItem[] {
            const tooltipDataPointsFinal: VisualTooltipDataItem[] = [];
            for (const iCounter of value) {
                // tslint:disable-next-line:no-any
                const convertedValue: any = parseFloat(iCounter.value);
                const decimalPlaces: number = isNaN(convertedValue) ? 0 :
                    this.countDecimals((iCounter.value));
                tooltipDataPointsFinal.push({
                    displayName: iCounter.name,
                    value: decimalPlaces <= 2 ?
                    iCounter.value.toString() : convertedValue.toFixed(2)
                });
            }

            return tooltipDataPointsFinal;
        }
    }
}
