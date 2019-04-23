module powerbi.extensibility.visual.BrickChart1454871868044  {
    let legendValues: {};
    legendValues = {};
    let legendValuesTorender: {};
    legendValuesTorender = {};
    let brickChartDefaultLegendFontSize: number;
    brickChartDefaultLegendFontSize = 8;
    let brickChartDefaultLegendShow: boolean;
    brickChartDefaultLegendShow = true;
    let brickChartDefaultAnimationShow: boolean;
    brickChartDefaultAnimationShow = true;
    let brickChartDefaultGradientShow: boolean;
    brickChartDefaultGradientShow = true;
    let brickChartLegendShowProp: DataViewObjectPropertyIdentifier;
    brickChartLegendShowProp = { objectName: 'legend', propertyName: 'show' };
    let brickChartAnimationShowProp: DataViewObjectPropertyIdentifier;
    brickChartAnimationShowProp = { objectName: 'AnimationType', propertyName: 'show' };
    let brickChartGeneralFormatStringProp: DataViewObjectPropertyIdentifier;
    brickChartGeneralFormatStringProp = { objectName: 'general', propertyName: 'formatString' };
    let brickChartGradientShowProp: DataViewObjectPropertyIdentifier;
    brickChartGradientShowProp = { objectName: 'gradientValue', propertyName: 'show' };
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import legendPosition = powerbi.extensibility.utils.chart.legend.position;
    import legend = powerbi.extensibility.utils.chart.legend;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import legendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import SelectionId = powerbi.visuals.ISelectionId;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    import DataViewObjects = powerbi.DataViewObjects;
    import ISelectionManager = powerbi.extensibility.ISelectionManager;
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import tooltip = powerbi.extensibility.utils.tooltip;
    import dataLabelUtils = powerbi.extensibility.utils.chart.dataLabel.utils;
    import IColorPalette = powerbi.extensibility.IColorPalette;
    const colonLiteral: string = ':';
    const custLegIndLiteral: string = 'cust_leg_ind';
    const custLegNameLiteral: string = 'cust_leg_name';
    const custLegValLiteral: string = 'cust_leg_val';
    const nullLiteral: string = '';
    let x: number;
    let y: number;
    let m: number;
    let n: number;
    let flag: number = 0;

    //property to show or hide legend
    interface IBrickChartPlotSettings {
        showLegend: boolean;
        showAnimation: boolean;
    }

    //Data points for legend generation
    interface IComponentShapeDataPoint {
        shape: string;
        Bricks: string;
    }

    interface IAnimationTypeDataPoint {
        sqDot: string;
    }

    interface ITooltipService {
        enabled(): boolean;
        show(options: TooltipShowOptions): void;
        move(options: TooltipMoveOptions): void;
        hide(options: TooltipHideOptions): void;
    }

    interface ITooltipDataItem {
        displayName: string;
        value: string;
        selector: ISelectionId;
    }

    interface IBrickChartData {
        categories: {};
        borderColor: string;
        randColor: {};
        toolTipInfo: ITooltipDataItem[];
        dataPoints: IBrickChartDataPoint[];
        legendData: LegendData;
        valueFormatter: IValueFormatter;
        settings: IBrickChartPlotSettings;
        gradientValue: IBrickChartGradient;
        ComponentShape: IComponentShapeDataPoint;
        AnimationType: IAnimationTypeDataPoint;
    }

    interface IBrickChartGradient {
        showGradient: boolean;
    }

    interface IBrickChartDataPoint {
        color: string;
        label: string;
        value: number;
        selector: powerbi.visuals.ISelectionId;
        tooltipInfo: ITooltipDataItem[];
    }

    enum boxShape {
        square,
        rectangle
    }

    enum brickType {
        circle,
        Box,
        Diamond
    }

    function getCategoricalObjectValue<T>(category: DataViewCategoryColumn, index: number,
                                          objectName: string, propertyName: string, defaultValue: T): T {
        let categoryObjects: DataViewObjects[];
        categoryObjects = category.objects;
        if (categoryObjects) {
            const categoryObject: DataViewObject = categoryObjects[index];
            if (categoryObject) {
                // tslint:disable-next-line:no-any
                let object: any;
                object = categoryObject[objectName];
                if (object) {
                    const property: T = object[propertyName];
                    if (property !== undefined) {
                        return property;
                    }
                }
            }
        }

        return defaultValue;
    }
    /**
     * export class BrickChart implements IVisual
     */
    export class BrickChart implements IVisual {
        private tooltipServiceWrapper: ITooltipServiceWrapper;

        public host: IVisualHost;
        private svg: d3.Selection<SVGElement>;
        public data: IBrickChartData;
        public dataView: DataView;
        private brickChartPoints: IBrickChartDataPoint[];
        public groupLegends: d3.Selection<SVGElement>;
        public matrix: d3.Selection<SVGElement>;
        public root: d3.Selection<SVGElement>;
        public rootElement: d3.Selection<SVGElement>;
        public errorDiv: d3.Selection<SVGElement>;
        private gradient: d3.Selection<SVGElement>;
        public svgs: {};
        // tslint:disable-next-line:no-any
        public zoom: any;
        // tslint:disable-next-line:no-any
        public toolTipInfo: any = {};
        public myStyles: d3.Selection<SVGElement>;
        public randColor: [string];
        private currentViewport: IViewport;
        private legend: ILegend;
        private legendObjectProperties: DataViewObject;
        private selectionManager: ISelectionManager;
        public static getDefaultData(): IBrickChartData {
            return {
                categories: {},
                borderColor: '#555',
                randColor: [''],
                dataPoints: null,
                toolTipInfo: [],
                legendData: null,
                settings: {
                    showLegend: brickChartDefaultLegendShow,
                    showAnimation: brickChartDefaultAnimationShow
                },
                valueFormatter: null,
                gradientValue: { showGradient: brickChartDefaultGradientShow },
                ComponentShape: {
                    shape: boxShape[0],
                    Bricks: brickType[1]
                },
                AnimationType: {
                    sqDot: 'Animation 5'
                }
            };
        }

        /** This is called once when the visual is initialially created */
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.tooltipServiceWrapper = tooltip.createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.root = d3.select(options.element);
            this.rootElement = d3.select(options.element)
                .append('div')
                .classed('brickchart_topContainer', true);
            let oElement: JQuery;
            oElement = $('div');
            this.legend = createLegend(oElement, false, null, true);
            this.initMatrix(options);
            this.toolTipInfo = [{ displayName: '', value: '' }];

        }

        public initMatrix(options: VisualConstructorOptions): void {
            //Making the div for Square grid
            this.matrix = this.rootElement
                .append('div')
                .classed('matrix', true);
            this.svg = this.matrix
                .append('svg')
                .classed('svg', true)
                .attr('width', 200)
                .attr('height', 200);
        }

        // tslint:disable-next-line:no-any
        public static numberWithCommas(num: any): string {
            let numeric: number;
            numeric = parseInt(num, 10);
            let decimal: string;
            decimal = (num + nullLiteral).split('.')[1];
            if (decimal) {
                return `${numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decimal.slice(0, 2)}`;
            } else {
                return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
        }

        public updateStyleColor(): void {
            if (!this.myStyles) {
                this.myStyles = this.rootElement
                    .append('style')
                    .attr('id', 'legends_clr');
            }

            //  setting the boxes color
            let style: string;
            style = '';
            let index: number;
            for (index = 1; index <= this.data.dataPoints.length; index++) {
                let color: string;
                color = this.data.dataPoints[index - 1].color;
                if (this.data.gradientValue.showGradient) {
                    this.gradient = this.svg.append('svg:linearGradient');
                    this.gradient.attr('id', `gradient${index}`)
                        .attr('x1', '100%')
                        .attr('y1', '0%')
                        .attr('x2', '100%')
                        .attr('y2', '100%')
                        .attr('spreadMethod', 'pad');
                    this.gradient.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 1);
                    const rColor: string = this.getDarkShade(color, 0.6);
                    this.gradient.append('stop').attr('offset', '100%').attr('stop-color', rColor).attr('stop-opacity', 1);
                    style += `.brickchart_topContainer .category-clr${index}{fill:url(#gradient${index});background:${rColor};}`;
                } else {
                    style += `.brickchart_topContainer .category-clr${index}{fill:${color};background:${color};}`;
                }
            }
            //setting the stroke color
            style += '.brickchart_topContainer svg>rect+{stroke:' + '#555' + ' ;}';
            this.myStyles.html(style);
        }

        public getDarkShade(colorHEX: string, opacity: number): string {
            colorHEX = String(colorHEX).replace(/[^0-9a-f]/gi, '');
            if (colorHEX.length < 6) {
                colorHEX = colorHEX[0] + colorHEX[0] + colorHEX[1] + colorHEX[1] + colorHEX[2] + colorHEX[2];
            }
            opacity = opacity || 0;
            let rgb: string = '#';
            // tslint:disable-next-line:no-any
            let c: any;
            let iCounter: number;
            for (iCounter = 0; iCounter < 3; iCounter++) {
                c = parseInt(colorHEX.substr(iCounter * 2, 2), 16);
                c = Math.round(Math.min(Math.max(0, c + (c * opacity)), 255)).toString(16);
                rgb += (`00${c}`).substr(c.length);
            }

            return rgb;
        }

        // Calculate and return the sums
        // tslint:disable-next-line:no-any
        public calculateSum(dataSet: any): number {
            let sum: number;
            let index: number;
            sum = 0, index = 1;
            let sDataSetKey: string;
            for (sDataSetKey in dataSet) {
                if (parseFloat(dataSet[sDataSetKey].value) > 0) {
                    sum += dataSet[sDataSetKey].value;
                }
            }

            return sum;
        }
        //Convertor Function
        public static converter(dataView: DataView, host: IVisualHost): IBrickChartData {
            let data: IBrickChartData;
            data = BrickChart.getDefaultData();
            data.dataPoints = [];
            if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.values) {
                // tslint:disable-next-line:no-any
                const legends: any = dataView.categorical.categories[0].values;
                // tslint:disable-next-line:no-any
                const values: any = dataView.categorical.values[0].values;
                //creating colorePalette object
                const colorPalette: powerbi.extensibility.IColorPalette = host.colorPalette;
                const categorySourceFormatString: string = valueFormatter.getFormatString(
                    dataView.categorical.categories[0].source, brickChartGeneralFormatStringProp);
                let dataSet: {};
                dataSet = {};
                // add random color
                // tslint:disable-next-line:no-any
                const categorical: any = dataView.categorical;
                // tslint:disable-next-line:no-any
                const category: any = categorical.categories[0];
                let formatter: IValueFormatter;
                formatter = ValueFormatter.create({ format: 'dddd\, MMMM %d\, yyyy' });
                let iCounter: number;
                for (iCounter = 0; iCounter < legends.length; iCounter++) {
                    if (values[iCounter] <= 0) {
                        continue;
                    }
                    const defaultColor: Fill = {
                        solid: {
                            color: colorPalette.getColor(<string>category.values[iCounter]).value
                        }
                    };
                    dataSet[legends[iCounter]] = {};
                    const valueLiteral: string = 'value';
                    dataSet[legends[iCounter]][valueLiteral] = values[iCounter];
                    let tooltipInfo: ITooltipDataItem[];
                    tooltipInfo = [];
                    if (Date.parse(legends[iCounter]) && (formatter.format(legends[iCounter]) !== 'dddd MMMM %d yyyy')) {
                        data.dataPoints.push(
                            {
                                label: legends[iCounter] === '' ? '(Blank)' : legends[iCounter],
                                value: values[iCounter],
                                color: getCategoricalObjectValue<Fill>(
                                    category, iCounter, 'colorSelector', 'fill', defaultColor).solid.color,
                                selector: host.createSelectionIdBuilder().withCategory(
                                    dataView.categorical.categories[0], iCounter).createSelectionId(),
                                tooltipInfo: tooltipInfo
                            });
                    } else {
                        data.dataPoints.push({
                            label: legends[iCounter] === '' ? '(Blank)' : legends[iCounter],
                            value: values[iCounter],
                            color: getCategoricalObjectValue<Fill>(category, iCounter, 'colorSelector', 'fill', defaultColor).solid.color,
                            selector: host.createSelectionIdBuilder().withCategory(
                                dataView.categorical.categories[0], iCounter).createSelectionId(),
                            tooltipInfo: tooltipInfo
                        });
                    }
                }
                data.categories = dataSet;
            }
            data.legendData = BrickChart.getLegendData(dataView, data.dataPoints, host);
            data.settings = BrickChart.parseLegendSettings(dataView);
            data.gradientValue = BrickChart.getGradientValue(dataView);

            return data;
        }

        private static getLegendData(dataView: DataView, brickChartDataPoints: IBrickChartDataPoint[], host: IVisualHost): LegendData {
            let sTitle: string;
            sTitle = '';
            if (dataView && dataView.categorical && dataView.categorical.categories
                && dataView.categorical.categories[0] && dataView.categorical.categories[0].source) {
                sTitle = dataView.categorical.categories[0].source.displayName;
            }
            let legendData: LegendData;
            legendData = {
                fontSize: brickChartDefaultLegendFontSize,
                dataPoints: [],
                title: sTitle
            };
            let iCount: number;
            for (iCount = 0; iCount < brickChartDataPoints.length; ++iCount) {
                if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.categories[0]) {
                    if (brickChartDataPoints[iCount].label === null) {
                        brickChartDataPoints[iCount].label = '(Blank)';
                    }
                    legendData.dataPoints.push(
                        {
                            label: brickChartDataPoints[iCount].label,
                            color: brickChartDataPoints[iCount].color,
                            icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                            selected: true,
                            identity: host.createSelectionIdBuilder().withCategory(
                                dataView.categorical.categories[0], iCount).createSelectionId()

                        });
                }
                legendValues[iCount] = brickChartDataPoints[iCount].value;
            }

            return legendData;
        }

        private static parseLegendSettings(dataView: DataView): IBrickChartPlotSettings {
            let objects: DataViewObjects;
            if (!dataView) {
                objects = null;
            } else if (dataView && dataView.metadata) {
                objects = dataView.metadata.objects;
            }

            return {
                showLegend: powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                    objects, brickChartLegendShowProp, brickChartDefaultLegendShow),
                showAnimation: powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                    objects, brickChartAnimationShowProp, brickChartDefaultAnimationShow)
            };
        }

        private static getGradientValue(dataView: DataView): IBrickChartGradient {
            let objects: DataViewObjects;
            if (!dataView) {
                objects = null;
            } else if (dataView && dataView.metadata) {
                objects = dataView.metadata.objects;
            }

            return {
                showGradient: powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                    objects, brickChartGradientShowProp, brickChartDefaultGradientShow)
            };
        }

        // tslint:disable-next-line:no-any
        public updateZoom(options: any): void {
            let WIDTH: number;
            let HEIGHT: number;
            if (flag === 0) {
                WIDTH = 200;
            } else {
                WIDTH = 400;
            }
            HEIGHT = 200;
            let viewport: IViewport;
            viewport = options.viewport;
            let orient: legend.LegendPosition;
            orient = this.legend.getOrientation();
            let legendHeight: number;
            let legendWidth: number;
            legendHeight = this.legend.getMargins().height;
            legendWidth = this.legend.getMargins().width;
            let legendHeightForZoom: number;
            let legendWidthForZoom: number;
            legendHeightForZoom = ((this.legend.getMargins().height) * HEIGHT) / viewport.height;
            legendWidthForZoom = (this.legend.getMargins().width) * WIDTH / viewport.width;
            switch (orient) {
                case 0:
                case 5:
                case 1:
                case 4:
                case 6: {
                    this.rootElement.style('width', '98%');
                    break;
                }
                case 7:
                case 8:
                case 2:
                case 3: {
                    let customWidth: number;
                    customWidth = viewport.width - legendWidth;
                    let pxLiteral: string;
                    pxLiteral = 'px';
                    this.rootElement.style('width', customWidth + pxLiteral);
                    WIDTH += legendWidthForZoom + 45;
                    break;
                }
                default:
                    break;
            }
            let height: number;
            let width: number;
            height = viewport.height - legendHeight;
            width = viewport.width - legendHeight;
            this.zoom = Math.min(width / WIDTH, height / HEIGHT) - 0.03;
            if (navigator.userAgent.indexOf('Firefox/') > 0) {
                this.matrix.style('transform', `Scale(${this.zoom})`);
            }
            if (navigator.userAgent.indexOf('Edge/') > 0) {
                this.matrix.style('transform', `Scale(${this.zoom})`);
                if (this.zoom < 1) {
                    this.matrix.style('zoom', this.zoom);
                }
            } else {
                this.matrix.style('zoom', this.zoom);
            }
            if (this.zoom < 0.1) {
                this.root.select('.legend').style('display', 'none');
            } else {
                this.root.select('.legend').style('display', 'inherit');
            }
            if (this.zoom < 0.06) {
                this.root.select('.matrix').style('display', 'none');
            } else {
                this.root.select('.matrix').style('display', 'inline-block');
            }

        }

        public circleAnimation(sqDot: string, svg: d3.Selection<SVGElement>, iRow: number, iColumn: number): void {
            switch (sqDot) {
                case 'Animation 1': {
                    svg.attr('cx', 0)
                        .attr('cy', 20 * iRow)
                        .attr('r', 0)
                        .attr('width', 20)
                        .attr('height', 20)
                        .attr('fill', 'none');
                }
                                    break;
                case 'Animation 2': {
                    svg.attr('cx', 20)
                        .attr('cy', 0)
                        .attr('r', 0)
                        .attr('width', 20)
                        .attr('height', 20)
                        .attr('fill', 'none');
                }
                                    break;
                case 'Animation 3': {

                    svg.attr('cx', (20 * iRow))
                        .attr('cy', 0)
                        .attr('r', 0)
                        .attr('width', 20)
                        .attr('height', 20)
                        .attr('fill', 'none');
                }
                                    break;
                case 'Animation 4': {
                    svg.attr('cx', 20 * iRow)
                        .attr('cy', (20 * iColumn))
                        .attr('r', 0)
                        .attr('width', 20)
                        .attr('height', 20)
                        .attr('fill', 'none');
                }
                                    break;
                case 'Animation 5': {
                    svg.attr('cx', ((400 * (iColumn)) + (50 * iRow)))
                        .attr('r', 0)
                        .attr('width', 20)
                        .attr('height', 20)
                        .attr('fill', 'none');
                }
                                    break;
                default: break;
            }
            svg.transition().duration(2000)
                .attr('cx', (20 * iColumn))
                .attr('cy', (20 * iRow))
                .attr('r', 9)
                .attr('fill', 'none');
            const custIdLiteral: string = 'cust_id';
            svg[0][0][custIdLiteral] = iRow + colonLiteral + iColumn;
            this.svgs[iRow + colonLiteral + iColumn] = svg[0][0];
            this.svgs[iRow + colonLiteral + iColumn].setAttribute('class', 'linearSVG category-clr');
            this.svgs[iRow + colonLiteral + iColumn][custLegIndLiteral] = '';
            this.svgs[iRow + colonLiteral + iColumn][custLegNameLiteral] = '';
            this.svgs[iRow + colonLiteral + iColumn][custLegValLiteral] = '';
        }

        public boxAnimation(sqDot: string, svg: d3.Selection<SVGElement>, iRow: number, iColumn: number): void {
            switch (sqDot) {
                case 'Animation 1': {
                    svg.attr('x', 0)
                        .attr('y', (21 * iRow))
                        .attr('width', 21)
                        .attr('height', 21)
                        .attr('fill', 'none')
                        .attr('stroke', 'black');
                }
                                    break;
                case 'Animation 2': {
                    svg.attr('x', 21)
                        .attr('y', 0)
                        .attr('width', 21)
                        .attr('height', 21)
                        .attr('fill', 'none');
                }
                                    break;
                case 'Animation 3': {
                    svg.attr('x', (20 * iRow))
                        .attr('y', 0)
                        .attr('width', 21)
                        .attr('height', 21)
                        .attr('fill', 'none');
                }
                                    break;
                case 'Animation 4': {
                    svg.attr('x', 21 * iRow)
                        .attr('y', (21 * iColumn))
                        .attr('width', 21)
                        .attr('height', 21)
                        .attr('fill', 'none');
                }
                                    break;
                case 'Animation 5': {
                    svg.attr('transform', 'translate(0,0)')
                        .attr('height', 21)
                        .attr('width', 21)
                        .attr('x', ((400 * (iColumn)) + (50 * iRow)))
                        .attr('width', 21);
                }
                                    break;
                default: break;
            }
            svg.transition().duration(2000)
                .attr('stroke-dashoffset', 0)
                .attr('x', (20 * iColumn))
                .attr('y', (20 * iRow))
                .attr('width', 20)
                .attr('height', 20)
                .attr('fill', 'none')
                .attr('stroke', 'black');
            const custIdLiteral: string = 'cust_id';
            svg[0][0][custIdLiteral] = iRow + colonLiteral + iColumn;
            this.svgs[iRow + colonLiteral + iColumn] = svg[0][0];
            this.svgs[iRow + colonLiteral + iColumn].setAttribute('class', 'linearSVG category-clr');
            this.svgs[iRow + colonLiteral + iColumn][custLegIndLiteral] = ' ';
            this.svgs[iRow + colonLiteral + iColumn][custLegNameLiteral] = ' ';
            this.svgs[iRow + colonLiteral + iColumn][custLegValLiteral] = ' ';
        }

        public diamondAnimation(sqDot: string, svg: d3.Selection<SVGElement>, iRow: number, iColumn: number): void {
            switch (sqDot) {
                case 'Animation 1': {
                    svg.attr('x', 0)
                        .attr('y', 20 * iRow)
                        .attr('width', 20)
                        .attr('height', 20)
                        .attr('fill', 'none');
                }
                                    break;
                case 'Animation 2': {
                    svg.attr('x', 0)
                        .attr('y', 0)
                        .attr('width', 0)
                        .attr('height', 0)
                        .attr('fill', 'none');
                }
                                    break;
                case 'Animation 3': {
                    svg.attr('x', (20 * iRow))
                        .attr('y', 0)
                        .attr('width', 20)
                        .attr('height', 20)
                        .attr('fill', 'none');
                }
                                    break;
                case 'Animation 4': {
                    svg.attr('x', 20 * iRow)
                        .attr('y', (20 * iColumn))
                        .attr('width', 20)
                        .attr('height', 20)
                        .attr('fill', 'none');
                }
                                    break;
                case 'Animation 5': {
                    svg.attr('transform', 'translate(0,0)')
                        .attr('height', 20)
                        .attr('width', 0)
                        .attr('x', ((400 * (iColumn)) + (50 * iRow)))
                        .attr('width', 20);
                }
                                    break;
                default: break;
            }
            svg.attr('transform', `rotate(45, ${20 * iColumn}, ${20 * iRow})`);
            svg.transition().duration(2000)
                .attr('x', (20 * iColumn))
                .attr('y', (20 * iRow))
                .attr('width', 11)
                .attr('height', 11)
                .attr('fill', 'none');
            const custIdLiteral: string = 'cust_id';
            svg[0][0][custIdLiteral] = iRow + colonLiteral + iColumn;
            this.svgs[iRow + colonLiteral + iColumn] = svg[0][0];
            this.svgs[iRow + colonLiteral + iColumn].setAttribute('class', 'linearSVG category-clr');
            this.svgs[iRow + colonLiteral + iColumn][custLegIndLiteral] = '';
            this.svgs[iRow + colonLiteral + iColumn][custLegNameLiteral] = '';
            this.svgs[iRow + colonLiteral + iColumn][custLegValLiteral] = '';
        }

        /** Update is called for data updates, resizes & formatting changes */
        // tslint:disable-next-line:cyclomatic-complexity
        public update(options: VisualUpdateOptions): void {
            d3.selectAll('.matrix svg > *').remove();
            d3.selectAll('.legend #legendGroup').selectAll('*').remove();
            const THIS: this = this;
            this.svgs = {};
            this.root.select('.MAQChartsSvgRoot').remove();
            d3.select(`.bc_ErrorMessage`).remove();
            d3.select(`.bc_ErrorMsg`).remove();
            let dataView: DataView;
            dataView = this.dataView = options.dataViews[0];
            this.data = BrickChart.converter(this.dataView, this.host);
            let format: string;
            format = '0';
            let formatter: IValueFormatter;
            if (this.data.dataPoints.length === 0 &&  dataView.categorical.categories === undefined) {
                d3.selectAll('.legend #legendGroup').selectAll('*').style('visibility', 'hidden');
                const message: string = 'Please insert data in Category field';
                this.root
                    .append('div')
                    .classed('bc_ErrorMessage', true)
                    .text(message)
                    .attr('title', message);

                return;
            }
            if (this.data.dataPoints.length === 0 && dataView.categorical.values === undefined) {
                d3.selectAll('.legend #legendGroup').selectAll('*').style('visibility', 'hidden');
                const message: string = 'Please insert data in Value field';
                this.root
                    .append('div')
                    .classed('bc_ErrorMessage', true)
                    .text(message)
                    .attr('title', message);

                return;
            }
            if (dataView && dataView.categorical && dataView.categorical.values &&
                dataView.categorical.values[0] && dataView.categorical.values[0].source) {
                format = dataView.categorical.values[0].source.format;
                formatter = valueFormatter.create({ format: format, precision: 2, allowFormatBeautification: true });
            } else {
                formatter = valueFormatter.create({ value: 0, precision: 2, allowFormatBeautification: true });
            }

            let dataSet: {};
            dataSet = {};
            dataSet = this.data.categories;
            let sum: number;
            sum = this.calculateSum(dataSet);
            this.currentViewport = {
                height: Math.max(0, options.viewport.height),
                width: Math.max(0, options.viewport.width)
            };
            this.svg.selectAll('rect').remove();
            this.svgs = {};
            let iRow: number;
            let iColumn: number;

            if (options.dataViews && options.dataViews[0] && options.dataViews[0].metadata) {
                let objects: DataViewObjects = options.dataViews[0].metadata.objects;
                this.data.ComponentShape.shape = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                    objects, { objectName: 'ComponentShape', propertyName: 'shape' }, this.data.ComponentShape.shape);
                this.data.ComponentShape.Bricks = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                    objects, { objectName: 'ComponentShape', propertyName: 'Bricks' }, this.data.ComponentShape.Bricks);
                this.data.AnimationType.sqDot = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                    objects, { objectName: 'AnimationType', propertyName: 'sqDot' }, this.data.AnimationType.sqDot);

                //Code For Animation
                if (!this.data.settings.showAnimation) {
                    this.data.AnimationType.sqDot = '';
                }
                if (this.data.ComponentShape.shape === boxShape[0]) {
                    flag = 0;
                    this.svg.attr('width', 200);
                } else if (this.data.ComponentShape.shape === boxShape[1]) {
                    flag = 1;
                    this.svg.attr('width', 400);
                }

                if (this.data.ComponentShape.Bricks === brickType[0]) {
                    if (flag === 1) {
                        let svg: d3.Selection<SVGElement>;
                        for (iRow = 0; iRow < 10; iRow++) {
                            for (iColumn = 0; iColumn < 20; iColumn++) {
                                svg = this.svg
                                    .append('circle')
                                    .classed('linearSVG', true)
                                    .attr('id', `brick${iRow}-${iColumn}`);
                                this.circleAnimation(this.data.AnimationType.sqDot, svg, iRow, iColumn);
                            }
                        }
                    } else if (flag === 0) {
                        if (this.data.dataPoints.length > 100) { //Code for values > 100
                            m = this.data.dataPoints.length;
                            n = Math.sqrt(m);
                            n = Math.ceil(n);
                            let svg: d3.Selection<SVGElement>;
                            for (iRow = 0; iRow < n; iRow++) {
                                for (iColumn = 0; iColumn < n; iColumn++) {
                                    svg = this.svg
                                        .append('circle')
                                        .classed('linearSVG', true)
                                        .attr('id', `brick${iRow}-${iColumn}`);
                                    this.circleAnimation(this.data.AnimationType.sqDot, svg, iRow, iColumn);
                                }
                            }
                        } else {
                            let svg: d3.Selection<SVGElement>;
                            for (iRow = 0; iRow < 10; iRow++) {
                                for (iColumn = 0; iColumn < 10; iColumn++) {
                                    svg = this.svg
                                        .append('circle')
                                        .classed('linearSVG', true)
                                        .attr('id', `brick${iRow}-${iColumn}`);
                                    this.circleAnimation(this.data.AnimationType.sqDot, svg, iRow, iColumn);
                                }
                            }
                        }
                    }
                    d3.select('svg').style('margin-left', '10px').style('margin-top', '10px').style('overflow', 'visible');

                } else if (this.data.ComponentShape.Bricks === brickType[1]) {
                    if (flag === 1) {
                        let svg: d3.Selection<SVGElement>;
                        for (iRow = 0; iRow < 10; iRow++) {
                            for (iColumn = 0; iColumn < 20; iColumn++) {
                                svg = this.svg
                                    .append('rect')
                                    .classed('linearSVG', true)
                                    .attr('id', `brick${iRow}-${iColumn}`);
                                this.boxAnimation(this.data.AnimationType.sqDot, svg, iRow, iColumn);
                            }
                        }
                    } else if (flag === 0) {
                        if (this.data.dataPoints.length > 100) { //Code for values > 100
                            m = this.data.dataPoints.length;
                            n = Math.sqrt(m);
                            n = Math.ceil(n);
                            for (iRow = 0; iRow < n; iRow++) {
                                for (iColumn = 0; iColumn < n; iColumn++) {
                                    let svg: d3.Selection<SVGElement>;
                                    svg = this.svg
                                        .append('rect')
                                        .classed('linearSVG', true)
                                        .attr('id', `brick${iRow}-${iColumn}`);
                                    this.boxAnimation(this.data.AnimationType.sqDot, svg, iRow, iColumn);
                                }
                            }
                        } else {
                            for (iRow = 0; iRow < 10; iRow++) {
                                for (iColumn = 0; iColumn < 10; iColumn++) {
                                    let svg: d3.Selection<SVGElement>;
                                    svg = this.svg
                                        .append('rect')
                                        .classed('linearSVG', true)
                                        .attr('id', `brick${iRow}-${iColumn}`);
                                    this.boxAnimation(this.data.AnimationType.sqDot, svg, iRow, iColumn);
                                }
                            }
                        }
                    }
                    d3.select('svg').style('margin-left', '0px').style('margin-top', '0px').style('overflow', 'visible');

                } else if (this.data.ComponentShape.Bricks === brickType[2]) {
                    if (flag === 1) {
                        for (iRow = 0; iRow < 10; iRow++) {
                            for (iColumn = 0; iColumn < 20; iColumn++) {
                                let svg: d3.Selection<SVGElement>;
                                svg = this.svg
                                    .append('rect')
                                    .classed('linearSVG', true)
                                    .attr('id', `brick${iRow}-${iColumn}`);
                                this.diamondAnimation(this.data.AnimationType.sqDot, svg, iRow, iColumn);
                            }
                        }
                    } else if (flag === 0) {
                        if (this.data.dataPoints.length > 100) { //Code for values > 100
                            m = this.data.dataPoints.length;
                            n = Math.sqrt(m);
                            n = Math.ceil(n);
                            for (iRow = 0; iRow < n; iRow++) {
                                for (iColumn = 0; iColumn < n; iColumn++) {
                                    let svg: d3.Selection<SVGElement>;
                                    svg = this.svg
                                        .append('rect')
                                        .classed('linearSVG', true)
                                        .attr('id', `brick${iRow}-${iColumn}`);
                                    this.diamondAnimation(this.data.AnimationType.sqDot, svg, iRow, iColumn);
                                }
                            }
                        } else {
                            for (iRow = 0; iRow < 10; iRow++) {
                                for (iColumn = 0; iColumn < 10; iColumn++) {
                                    let svg: d3.Selection<SVGElement>;
                                    svg = this.svg
                                        .append('rect');
                                    svg.classed('linearSVG', true)
                                    .attr('id', `brick${iRow}-${iColumn}`);
                                    this.diamondAnimation(this.data.AnimationType.sqDot, svg, iRow, iColumn);
                                }
                            }
                        }
                    }
                    d3.select('svg').style('margin-left', '10px').style('margin-top', '0px').style('overflow', 'visible');
                }
                if (this.data.ComponentShape.shape === boxShape[1]) {
                    d3.select('.brickchart_topContainer').style('width', '80%');
                }
                x = iRow;
                y = iColumn;
                let last: number;
                let category: number;
                last = 0, category = 0;
                if (flag === 1) {
                    //Assigning css color class to the squares and tooltip service
                    const bricksArray: number[] = [];
                    let totalSum: number = 0;
                    for (let iCount: number = 0; iCount < this.data.dataPoints.length; iCount++) {
                        bricksArray[iCount] = Math.round(200 * (this.data.dataPoints[iCount].value / sum)) === 0 ?
                            1 : Math.round(200 * (this.data.dataPoints[iCount].value / sum));
                        totalSum += bricksArray[iCount];
                    }
                    if (totalSum > 200) {
                        const max: number = Math.max.apply(null, bricksArray);
                        const index: number = bricksArray.indexOf(max);
                        const difference: number = totalSum - 200;
                        bricksArray[index] = bricksArray[index] - difference;
                    }
                    if (this.data.dataPoints.length < 1000) {
                        let counter: number;
                        for (counter = 0; counter < this.data.dataPoints.length; counter++) {
                            const data: IBrickChartDataPoint[] = [];
                            data.push(this.data.dataPoints[counter]);
                            if (this.data.dataPoints[counter].value > 0) {
                                let cnt: number;
                                cnt = bricksArray[counter];
                                if (cnt > 0) {
                                    category++;
                                    let index: number;
                                    for (index = 0; index < cnt; index++) {
                                        if (index >= 200) {
                                            break;
                                        }
                                        let row: number;
                                        let col: number;
                                        row = Math.floor((last + index) / 10);
                                        col = (last + index) % 10;
                                        if (!this.svgs[col + colonLiteral + row]) {
                                            break;
                                        }
                                        this.svgs[col + colonLiteral + row].setAttribute('class', `linearSVG category-clr${category}`);
                                        this.root.select(`#brick${col}-${row}`).data(data);
                                        this.svgs[col + colonLiteral + row][custLegIndLiteral] = category;
                                        this.svgs[col + colonLiteral + row][custLegNameLiteral] = this.data.dataPoints[counter].label;
                                        this.svgs[col + colonLiteral + row][custLegValLiteral] = this.data.dataPoints[counter].value;
                                        let toolTipInfo: ITooltipDataItem[];
                                        toolTipInfo = [];
                                        toolTipInfo.push(
                                            {
                                                displayName: dataView.categorical.categories[0].source.displayName,
                                                value: this.data.dataPoints[counter].label + nullLiteral,
                                                selector: this.data.dataPoints[counter].selector
                                            });
                                        toolTipInfo.push(
                                            {
                                                displayName: dataView.categorical.values[0].source.displayName,
                                                value: formatter.format(this.data.dataPoints[counter].value),
                                                selector: this.data.dataPoints[counter].selector
                                            });
                                        this.svgs[col + colonLiteral + row]['cust-tooltip'] = toolTipInfo;
                                        this.toolTipInfo[counter] = toolTipInfo;
                                    }
                                    last += cnt;
                                }
                            }
                        }
                    } else {
                        const msg: string = 'Length of categories should be less than 1000';
                        this.root
                            .append('div')
                            .classed('bc_ErrorMsg', true)
                            .text(msg)
                            .attr('title', msg);

                        return;
                    }
                } else {
                    const bricksArray: number[] = [];
                    let totalSum: number = 0;
                    for (let iCount: number = 0; iCount < this.data.dataPoints.length; iCount++) {
                        bricksArray[iCount] = Math.round(100 * (this.data.dataPoints[iCount].value / sum)) === 0 ?
                            1 : Math.round(100 * (this.data.dataPoints[iCount].value / sum));
                        totalSum += bricksArray[iCount];
                    }
                    if (totalSum > 100) {
                        const max: number = Math.max.apply(null, bricksArray);
                        const index: number = bricksArray.indexOf(max);
                        const difference: number = totalSum - 100;
                        bricksArray[index] = bricksArray[index] - difference;
                    }
                    if (this.data.dataPoints.length < 1000) {
                        let counter: number;
                        for (counter = 0; counter < this.data.dataPoints.length; counter++) {
                            const data: IBrickChartDataPoint[] = [];
                            data.push(this.data.dataPoints[counter]);
                            if (this.data.dataPoints[counter].value > 0) {
                                let cnt: number;
                                cnt = bricksArray[counter];
                                if (cnt > 0) {
                                    category++;
                                    let index: number;
                                    for (index = 0; index < cnt; index++) {
                                        if (index >= 100) {
                                            break;
                                        }
                                        let row: number;
                                        let col: number;
                                        if (this.data.dataPoints.length > 100) {
                                            row = Math.floor((last + index) / n);
                                            col = (last + index) % n;
                                        } else {
                                            row = Math.floor((last + index) / 10);
                                            col = (last + index) % 10;
                                        }
                                        if (!this.svgs[col + colonLiteral + row]) {
                                            break;
                                        }
                                        this.svgs[col + colonLiteral + row].setAttribute('class', `linearSVG category-clr${category}`);
                                        this.root.select(`#brick${col}-${row}`).data(data);
                                        this.svgs[col + colonLiteral + row][custLegIndLiteral] = category;
                                        this.svgs[col + colonLiteral + row][custLegNameLiteral] = this.data.dataPoints[counter].label;
                                        this.svgs[col + colonLiteral + row][custLegValLiteral] = this.data.dataPoints[counter].value;
                                        let toolTipInfo: ITooltipDataItem[];
                                        toolTipInfo = [];
                                        toolTipInfo.push(
                                            {
                                                displayName: dataView.categorical.categories[0].source.displayName,
                                                value: this.data.dataPoints[counter].label + nullLiteral,
                                                selector: this.data.dataPoints[counter].selector
                                            });
                                        toolTipInfo.push(
                                            {
                                                displayName: dataView.categorical.values[0].source.displayName,
                                                value: formatter.format(this.data.dataPoints[counter].value),
                                                selector: this.data.dataPoints[counter].selector
                                            });
                                        this.svgs[col + colonLiteral + row]['cust-tooltip'] = toolTipInfo;
                                        this.toolTipInfo[counter] = toolTipInfo;
                                    }
                                    last += cnt;
                                }
                            }
                        }
                    } else {
                        d3.selectAll('.legend #legendGroup').selectAll('*').style('visibility', 'hidden');
                        const msg: string = 'Length of categories should be less than 1000';
                        this.root.append('div')
                            .classed('bc_ErrorMsg', true)
                            .text(msg)
                            .attr('title', msg);

                        return;
                    }
                }
                objects = null;
                if (options.dataViews && options.dataViews[0] && options.dataViews[0].metadata && options.dataViews[0].metadata.objects) {
                    objects = options.dataViews[0].metadata.objects;
                    this.data.settings.showLegend = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                        objects, { objectName: 'legend', propertyName: 'show' }, this.data.settings.showLegend);
                    this.data.settings.showAnimation = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                        objects, { objectName: 'AnimationType', propertyName: 'show' }, this.data.settings.showAnimation);
                    this.data.borderColor = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(
                        objects, { objectName: 'general', propertyName: 'borderColor' }, this.data.borderColor);
                    this.data.legendData.title = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                        objects, { objectName: 'legend', propertyName: 'titleText' }, this.data.legendData.title);
                    this.rootElement.select('svg.svg')
                        .selectAll('rect, circle')
                        .style('stroke', this.data.borderColor);
                    let ind: number;
                    ind = 0;
                    let k1: number;
                    for (k1 = 0; k1 < _.keys(this.data.categories).length; k1++) {
                        let clr: string;
                        clr = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(
                            objects,
                            { objectName: `dataPoint_${ind}`, propertyName: _.keys(this.data.categories)[k1] }, '');
                        ind++;
                    }
                }
                this.renderLegend(this.data, sum);
                this.updateStyleColor();
                this.tooltipServiceWrapper.addTooltip(
                    d3.selectAll('.linearSVG'), (tooltipEvent: tooltip.TooltipEventArgs<IBrickChartDataPoint>) => {
                        return tooltipEvent.context['cust-tooltip'];
                    },
                    // tslint:disable-next-line:max-line-length
                    (tooltipEvent: tooltip.TooltipEventArgs<IBrickChartDataPoint>) => tooltipEvent.context['cust-tooltip'][0].selector, true);
                this.updateZoom(options);
                this.addBrickSelection();
                this.addLegendSelection();
                // tslint:disable-next-line:no-any
                $(document).on('click.load', '.navArrow', function (): void {
                    THIS.addLegendSelection();
                });
                d3.select('html').on('click', function (): void {
                    THIS.selectionManager.clear();
                    // tslint:disable-next-line:no-any
                    const rect: any = THIS.root.selectAll('.linearSVG');
                    rect.attr('fill-opacity', 1)
                        .attr('opacity', 1);
                    THIS.root.selectAll('.legendItem').attr('fill-opacity', 1);
                     });
            }
            this.svg.on('contextmenu', () => {
                const mouseEvent: MouseEvent = d3.event as MouseEvent;
                const eventTarget: EventTarget = mouseEvent.target;
                // tslint:disable-next-line:no-any
                const dataPoint : any = d3.select(eventTarget).datum();
                if (dataPoint !== undefined) {
                    this.selectionManager.showContextMenu(dataPoint ? dataPoint.selector : {}, {
                        x: mouseEvent.clientX,
                        y: mouseEvent.clientY
                    });
                    mouseEvent.preventDefault();
                }
            });
        }

        private addLegendSelection(): void {
            const THIS: this = this;
            // tslint:disable-next-line:no-any
            let legends: any;
            legends = this.root.selectAll('.legend .legendItem');
            // tslint:disable-next-line:no-any
            let bricks: any;
            bricks = THIS.root.selectAll('.linearSVG');
            let selectionManager: ISelectionManager;
            selectionManager = this.selectionManager;

            // tslint:disable-next-line:no-any
            legends.on('click', function (d: any): void {
                // tslint:disable-next-line:no-any
                selectionManager.select(d.identity).then((ids: any[]) => {
                    const len: number = bricks[0].length - 1;
                    for (let v: number = 0; v <= len; v++) {
                        if (d.tooltip === bricks[0][v].cust_leg_name) {
                            bricks[0][v].setAttribute('fill-opacity', 1);
                        } else {
                            bricks[0][v].setAttribute('fill-opacity', 0.5);
                        }
                    }
                    const arraylen: number = legends[0].length;
                    for (let l: number = 0; l < arraylen; l++) {
                        legends['0'][l].setAttribute('fill-opacity', 1);
                    }
                    legends.attr({
                        'fill-opacity': ids.length > 0 ? 0.5 : 1
                    });
                    d3.select(this).attr({
                        'fill-opacity': 1
                    });
                    if (ids.length < 1) {
                        for (let v: number = 0; v <= len; v++) {
                            bricks[0][v].setAttribute('fill-opacity', 1);
                        }
                    }
                });
                (<Event>d3.event).stopPropagation();
            });
        }

        private addBrickSelection(): void {
            let THIS: this;
            THIS = this;
            // tslint:disable-next-line:no-any
            let bricks: any;
            bricks = this.root.selectAll('.linearSVG');
            let selectionManager: ISelectionManager;
            selectionManager = this.selectionManager;
            // tslint:disable-next-line:no-any
            bricks.on('click', function (d: any): void {
                // tslint:disable-next-line:no-any
                let legends: any;
                legends = THIS.root.selectAll('.legend .legendItem');
                legends.attr({
                    'fill-opacity': 1
                });
                // tslint:disable-next-line:no-any
                selectionManager.select(d.selector).then((ids: any[]) => {
                    const len: number = bricks[0].length - 1;
                    for (let v: number = 0; v <= len; v++) {
                        if (this.cust_leg_name === bricks[0][v].cust_leg_name) {
                            bricks[0][v].setAttribute('fill-opacity', 1);
                        } else {
                            bricks[0][v].setAttribute('fill-opacity', 0.5);
                        }
                    }
                    if (ids.length < 1) {
                        for (let v: number = 0; v <= len; v++) {
                            bricks[0][v].setAttribute('fill-opacity', 1);
                        }
                    }
                });
                (<Event>d3.event).stopPropagation();

            });
        }

        private renderLegend(brickChartData: IBrickChartData, sum: number): void {
            if (!brickChartData || !brickChartData.legendData) {
                return;
            }
            if (this.dataView && this.dataView.metadata) {
                this.legendObjectProperties = powerbi.extensibility.utils.dataview.DataViewObjects.getObject(
                    this.dataView.metadata.objects, 'legend', {});
            }
            d3.selectAll('.legend #legendGroup').selectAll('*').style('visibility', 'visible');
            let legendData: LegendData;
            legendData = brickChartData.legendData;

            let legendDataTorender: LegendData;
            legendDataTorender = {
                fontSize: brickChartDefaultLegendFontSize,
                dataPoints: [],
                title: legendData.title
            };

            let j: number;
            for (j = 0; j < legendData.dataPoints.length; j++) {
                let cnt: number;
                if (flag === 0) {
                    cnt = Math.round(100 * ((legendValues[j]) / sum));
                } else {
                    cnt = Math.round(100 * ((legendValues[j]) / sum));
                }
                if (cnt >= 0) {
                    if (legendData.dataPoints[j].label === null) {
                        legendData.dataPoints[j].label = '(Blank)';
                    }
                    legendDataTorender.dataPoints.push({
                        label: legendData.dataPoints[j].label,
                        color: legendData.dataPoints[j].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        selected: false,
                        identity: legendData.dataPoints[j].identity
                    });
                    legendValuesTorender[j] = legendValues[j];
                }
            }
            let iIterator: number;
            iIterator = 0;
            legendDataTorender.dataPoints.forEach(function (ele: legend.LegendDataPoint): void {
                ele.color = brickChartData.dataPoints[iIterator++].color;
            });
            if (this.legendObjectProperties) {
                powerbi.extensibility.utils.chart.legend.data.update(legendDataTorender, this.legendObjectProperties);
                let position: string;
                position = <string>this.legendObjectProperties[powerbi.extensibility.utils.chart.legend.legendProps.position];

                if (position) {
                    this.legend.changeOrientation(LegendPosition[position]);
                }
            }
            this.legend.drawLegend(legendDataTorender, this.currentViewport);
            powerbi.extensibility.utils.chart.legend.positionChartArea(this.rootElement, this.legend);
        }
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName: string;
            objectName = options.objectName;
            let enumeration: VisualObjectInstance[];
            enumeration = [];
            if (!this.data) {
                this.data = BrickChart.getDefaultData();
            }
            switch (objectName) {
                case 'general':
                    enumeration.push({
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            borderColor: this.data.borderColor
                        }
                    });
                    break;
                case 'ComponentShape':
                    enumeration.push({
                        objectName: 'ComponentShape',
                        selector: null,
                        properties: {
                            shape: this.data.ComponentShape.shape,
                            Bricks: this.data.ComponentShape.Bricks
                        }
                    });
                    break;
                case 'gradientValue':
                    enumeration.push({
                        objectName: 'gradientValue',
                        selector: null,
                        properties: {
                            show: this.data.gradientValue.showGradient
                        }
                    });
                    break;
                case 'AnimationType':
                    enumeration.push({
                        objectName: 'AnimationType',
                        selector: null,
                        properties: {
                            show: this.data.settings.showAnimation,
                            sqDot: this.data.AnimationType.sqDot
                        }
                    });
                    break;
                case 'legend':
                    enumeration.push({
                        objectName: 'legend',
                        displayName: 'Legend',
                        selector: null,
                        properties: {
                            show: this.data.settings.showLegend,
                            position: LegendPosition[this.legend.getOrientation()],
                            showTitle: powerbi.extensibility.utils.dataview.DataViewObject.getValue(
                                this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.showTitle, true),
                            titleText: this.data.legendData ? this.data.legendData.title : '',
                            labelColor: powerbi.extensibility.utils.dataview.DataViewObject.getValue(
                                this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.labelColor, null),
                            fontSize: powerbi.extensibility.utils.dataview.DataViewObject.getValue(
                                this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.fontSize,
                                brickChartDefaultLegendFontSize)
                        }
                    });
                    break;
                case 'colorSelector':
                    for (const dataPoints of this.data.dataPoints) {
                        if (dataPoints.value > 0) {
                            enumeration.push({
                                objectName: 'Color',
                                displayName: dataPoints.label,
                                properties: {
                                    fill: {
                                        solid: {
                                            color: dataPoints.color
                                        }
                                    }
                                },
                                selector: dataPoints.selector.getSelector()
                            });
                        }
                    }
                    break;
                default:
            }

            return enumeration;
        }
    }
}
