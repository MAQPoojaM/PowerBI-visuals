/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
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
    let legendValues: {};
    legendValues = {};
    let legendValuesTorender: {};
    legendValuesTorender = {};
    // tslint:disable-next-line:no-any
    let colorval: any[];
    colorval = [];
    import IColorPalette = powerbi.extensibility.IColorPalette;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import legendPosition = powerbi.extensibility.utils.chart.legend.position;
    import legend = powerbi.extensibility.utils.chart.legend;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import legendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    export module DataViewObjects {
        /** Gets the value of the given object/property pair. */
        export function getValue<T>(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T {
            if (!objects) {
                return defaultValue;
            }
            let objectOrMap: DataViewObject;
            objectOrMap = objects[propertyId.objectName];

            let object: DataViewObject;
            object = <DataViewObject>objectOrMap;

            return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
        }

        /** Gets an object from objects. */
        export function getObject(objects: DataViewObjects, objectName: string, defaultValue?: DataViewObject): DataViewObject {
            if (objects && objects[objectName]) {
                let object: DataViewObject;
                object = <DataViewObject>objects[objectName];

                return object;
            } else {
                return defaultValue;
            }
        }

        /** Gets a map of user-defined objects. */
        export function getUserDefinedObjects(objects: DataViewObjects, objectName: string): DataViewObjectMap {
            if (objects && objects[objectName]) {
                let map: DataViewObjectMap;
                map = <DataViewObjectMap>objects[objectName];

                return map;
            }
        }

        /** Gets the solid color from a fill property. */
        export function getFillColor(objects: DataViewObjects,
            // tslint:disable-next-line:align
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
        export function getValue<T>(object: DataViewObject, propertyName: string, defaultValue?: T): T {
            if (!object) {
                return defaultValue;
            }
            let propertyValue: T;
            propertyValue = <T>object[propertyName];
            if (propertyValue === undefined) {
                return defaultValue;
            }

            return propertyValue;
        }
        /** Gets the solid color from a fill property using only a propertyName */
        export function getFillColorByPropertyName(objects: DataViewObjects, propertyName: string, defaultColor?: string): string {
            let value: Fill;
            value = DataViewObject.getValue(objects, propertyName);
            if (!value || !value.solid) {
                return defaultColor;
            }

            return value.solid.color;
        }
    }

    export let visualProperties: {
        labelSettings: {
            color: DataViewObjectPropertyIdentifier;
            displayUnits: DataViewObjectPropertyIdentifier;
            fontSize: DataViewObjectPropertyIdentifier;
            show: DataViewObjectPropertyIdentifier;
            textPrecision: DataViewObjectPropertyIdentifier
        },
        legend: {
            decimalPlaces: DataViewObjectPropertyIdentifier;
            displayUnits: DataViewObjectPropertyIdentifier;
            show: DataViewObjectPropertyIdentifier;
            showPrimary: DataViewObjectPropertyIdentifier;
            titleText: DataViewObjectPropertyIdentifier
        },
        opacity: {
            externalArc: DataViewObjectPropertyIdentifier;
            internalArc: DataViewObjectPropertyIdentifier;
        }
    };
    visualProperties = {
        labelSettings: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'color' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'displayUnits' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'fontSize' },
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'show' },
            textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'textPrecision' }
        },
        legend: {
            decimalPlaces: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelPrecision' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelDisplayUnits' },
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'show' },
            showPrimary: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'showPrimary' },
            titleText: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'titleText' }
        },
        opacity: {
            externalArc: <DataViewObjectPropertyIdentifier>{ objectName: 'opacity', propertyName: 'external' },
            internalArc: <DataViewObjectPropertyIdentifier>{ objectName: 'opacity', propertyName: 'internal' }
        }
    };

    export interface ILegendSetting {
        show: boolean;
        titleText: string;
        displayUnits: number;
        decimalPlaces: number;
        showPrimary: boolean;
    }

    export interface ILabelSettings {
        show: boolean;
        color: string;
        fontSize: number;
        displayUnits: number;
        textPrecision: number;
    }

    export interface IOpacitySettings {
        externalArc: number;
        internalArc: number;
    }

    let numberOfObjects: number;
    numberOfObjects = 0;
    // tslint:disable-next-line:no-any
    let finalSingleObjects: any;
    // tslint:disable-next-line:no-any
    let finalSingleObjectsValues: any;

    interface IVennViewModel {
        legendData: LegendData;
        dataPoints: IVennDataPoint[];
    }

    interface IVennDataPoint {
        category: string;
        value: number;
        color: string;
        selectionId: {};
    }
    // tslint:disable-next-line:no-any
    function objectSort(objProperty: any): any {
        let sortOrder: number;
        sortOrder = 1;
        if (objProperty[0] === '-') {
            sortOrder = -1;
            objProperty = objProperty.substr(1);
        }

        // tslint:disable-next-line:no-any
        return function (a: any, b: any): any {
            let result: number;
            result = (a[objProperty] < b[objProperty]) ? -1 : (a[objProperty] > b[objProperty]) ? 1 : 0;

            return result * sortOrder;
        };
    }
    // tslint:disable-next-line:no-any
    function visualTransform(options: VisualUpdateOptions, host: IVisualHost, context: any): IVennViewModel {
        if (!options.dataViews) {
            return;
        }
        if (!options.dataViews[0]) {
            return;
        }
        if (!options.dataViews[0].categorical) {
            return;
        }
        let dataViews: DataView;
        dataViews = options.dataViews[0];
        let colorPalette: IColorPalette;
        colorPalette = host.colorPalette;
        let vennDataPoints: IVennDataPoint[];
        vennDataPoints = [];
        // tslint:disable-next-line:no-any
        let categorical: any;
        categorical = options.dataViews[0].categorical;
        // tslint:disable-next-line:no-any
        let category: any;
        category = categorical.categories;
        let i: number;
        i = 0;
        for (let iIterator: number = 0; iIterator < dataViews.metadata.columns.length; iIterator++) {
            if (dataViews.metadata.columns[iIterator].roles[`category`]) {
                let defaultColor: Fill;
                defaultColor = {
                    solid: {
                        color: colorPalette.getColor(dataViews.metadata.columns[iIterator].displayName).value
                    }
                };
                let defaultColors: {
                    solid: {
                        color: string;
                    };
                }[];
                defaultColors = [{
                    solid: {
                         color: '#01B8AA' }
                         },
                         {
                    solid: {
                        color: '#374649' }
                         },
                         {
                    solid: {
                        color: '#FD625E' }
                         },
                         {
                    solid: {
                        color: '#F2C80F' }
                         }];
                for (let iCounter: number = 0; iCounter < categorical.categories.length; iCounter++) {
                    // tslint:disable-next-line:no-any
                    const dataViewsMetaDataColumns: any = dataViews.metadata.columns[iIterator];
                    // tslint:disable-next-line:no-any
                    const dataViewOptions: any = options.dataViews[0];
                    if (dataViewOptions.categorical.categories[iCounter].source.displayName === dataViewsMetaDataColumns.displayName) {
                    vennDataPoints.push({
                        category: dataViewsMetaDataColumns.displayName,
                        value: iIterator,
                        color: getValue<Fill>(dataViewsMetaDataColumns.objects,
                                              'colors', 'colorToFill', defaultColors[i]).solid.color,
                        selectionId: { metadata: dataViewsMetaDataColumns.queryName }
                    });
                    i++;
                    break;
                }

            }
        }
    }

        return {
                dataPoints: vennDataPoints,
                legendData: context.getLegendData(dataViews, vennDataPoints, host)
            };
        }

    export class VennDiagram implements IVisual {
            public host: IVisualHost;

            public circles: {} = {};

            public rectangle: {} = {};
            public texts: {} = {};
            public legendtext: {} = {};
            public checkbox: {} = {};
            public svgpaths: {} = {};
            public paths: {} = {};
            public dataView: DataView;
            public numberOfObjects: number = 0;
            // tslint:disable-next-line:no-any
            public singleTemp: any = [];
            // tslint:disable-next-line:no-any
            public singleTempValue: any = [];
            // tslint:disable-next-line:no-any
            public finalSingleObjects: any = [];
            // tslint:disable-next-line:no-any
            public dataModified: any = [];
            // tslint:disable-next-line:no-any
            public finalSingleObjectsValues: any = [];
            // tslint:disable-next-line:no-any
            public finalOtherObjects: any = [];
            // tslint:disable-next-line:no-any
            public finalOtherObjectsValues: any = [];
            // tslint:disable-next-line:no-any
            public finalUpdatedSingleObjectsValues: any = [];
            // tslint:disable-next-line:no-any
            public finalUpdatedOtherObjectsValues: any = [];
            // tslint:disable-next-line:no-any
            public finalPercentIndicator: any = [];
            // tslint:disable-next-line:no-any
            public percentIndicator: any = [];
            // tslint:disable-next-line:no-any
            public combinations: any = [];
            // tslint:disable-next-line:no-any
            public radius: any = [];
            public margin: number = 10;
            // tslint:disable-next-line:no-any
            public finalDataSet: any = [];
            // tslint:disable-next-line:no-any
            public countOfOverlapping: any = [];
            // tslint:disable-next-line:no-any
            public dataSet: any;
            public options: VisualUpdateOptions;
            // tslint:disable-next-line:no-any
            public width: any;
            // tslint:disable-next-line:no-any
            public height: any;
            public viewModel: IVennViewModel;
            public groupLegends: d3.Selection<SVGElement>;
            // tslint:disable-next-line:no-any
            public formatter: any;

            private tooltipServiceWrapper: ITooltipServiceWrapper;
            private dataViews: DataView;
            // tslint:disable-next-line:no-any
            private settings: any;
            private svg: d3.Selection<SVGElement>;
            // tslint:disable-next-line:no-any
            private rootElement: any;
            private currentViewport: IViewport;
            private target: HTMLElement;
            private vennPoints: IVennDataPoint[];
            private selectionManager: ISelectionManager;
            // tslint:disable-next-line:no-any
            private prevDataViewObjects: any = {};
            // tslint:disable-next-line:no-any
            private mainGroup: any = {};
            private text: d3.Selection<SVGElement>;
            private legend: ILegend;
            private legendObjectProperties: DataViewObject;
            // tslint:disable-next-line:no-any
            private legendData: any;

            public static getValue<T>(dataView: DataView, key: string, defaultValue: T): T {

                if (dataView) {
                    let objects: DataViewObjects;
                    objects = dataView.metadata.objects;
                    if (objects) {
                        let config: DataViewObject;
                        config = objects[`config`];
                        if (config) {
                            let size: T;
                            size = <T>config[key];
                            if (size != null) {
                                return size;
                            }
                        }
                    }
                }

                return defaultValue;
            }

            // tslint:disable-next-line:no-any
            public getLegendData(dataView: DataView, vennDataPoint: any, host: IVisualHost): LegendData {
                const legendSetting: ILegendSetting = this.getLegendSettings(this.dataViews);
                const measureSum: number = 0;
                const legendData: LegendData = {
                    dataPoints: [],
                    fontSize: 8,
                    title: legendSetting.titleText,
                    showPrimary: legendSetting.showPrimary
                };
                // tslint:disable-next-line:no-any
                const legendDataValue: any[] = [];
                let valuesArr: PrimitiveValue[];
                // tslint:disable-next-line:no-any
                const dataViewsCategorical: any = this.dataViews.categorical;
                valuesArr = this.dataViews
                    && dataViewsCategorical
                    && dataViewsCategorical.values
                    && dataViewsCategorical.values[0] ? dataViewsCategorical.values[0].values : [];
                const categories: DataViewCategoryColumn[] = this.dataViews
                    && dataViewsCategorical
                    && dataViewsCategorical.categories ? dataViewsCategorical.categories : [];
                const categoriesLen: number = categories.length;
                const sumObj: {} = {};

                // logic to calculate value of each legend item

                for (let kDataPoint: number = 0; kDataPoint < vennDataPoint.length; kDataPoint++) {
                    // tslint:disable-next-line:no-any
                    const currentDataPoint: any = vennDataPoint[kDataPoint].category;
                    for (let iLegend: number = 0; iLegend < categoriesLen; iLegend++) {
                        const currentCatName: string = categories[iLegend].source.displayName;
                        const currentCat: DataViewCategoryColumn = categories[iLegend];
                        if (currentDataPoint === currentCatName) {
                            const currentCatValues: PrimitiveValue[] = currentCat.values;
                            sumObj[currentCatName] = this.calculateLegendValue(currentCatValues, valuesArr);
                        }
                    }
                }

                for (let iCounter: number = 0; iCounter < vennDataPoint.length; iCounter++) {
                    // tslint:disable-next-line:no-any
                    const labelName: any = this.finalSingleObjects[iCounter];
                    if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.categories[0]) {
                        legendData.dataPoints.push({
                            color: vennDataPoint[iCounter].color,
                            icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                            identity: host.createSelectionIdBuilder()
                                .withMeasure(vennDataPoint[iCounter].category)
                                .createSelectionId(),
                            label: labelName,
                            measure: sumObj[labelName] ? sumObj[labelName] : 0,
                            selected: false
                        });
                    }
                }
                legendData.measureSum = this.sumMeasure(valuesArr);

                return legendData;
            }

                public sumMeasure( valuesArr: PrimitiveValue[]) : number {
                    let totalSum: number = 0;
                    for (let i: number = 0; i < valuesArr.length; i++) {
                        if (valuesArr[i]) {
                            totalSum += parseFloat(valuesArr[i].toString());
                        }}

                    return totalSum;
                }
                public calculateLegendValue(currentCatValues: PrimitiveValue[], valuesArr: PrimitiveValue[]): number {
                    let sum: number = 0;
                    for (let j: number = 0; j < currentCatValues.length; j++) {
                        if (currentCatValues[j].toString().toLowerCase() === 'yes'
                            || currentCatValues[j].toString().toLowerCase() === 'true'
                            || currentCatValues[j].toString() === '1') {
                            sum += parseFloat(valuesArr[j].toString());
                        }
                    }

                    return sum;
                }

            public validateData(dataView: DataView): boolean {
                let isInvalidData: boolean = false;
                const dataFormat: string[] = ['yes', 'no', 'true', 'false', '1', '0'];
                const categories: DataViewCategoryColumn[] = dataView && dataView.categorical
                && dataView.categorical.categories ? dataView.categorical.categories : [];
                if (categories.length) {
                    const catLen: number = categories.length;
                    for (let i: number = 0; i < catLen; i++) {
                        const currentCat: DataViewCategoryColumn = categories[i];
                        const currentCatValues: PrimitiveValue[] = currentCat && currentCat.values ? currentCat.values : [];
                        const curCatValLen: number = currentCatValues.length;
                        for (let j: number = 0; j < curCatValLen; j++) {
                            const curVal: string = currentCatValues[j] ? currentCatValues[j].toString().toLowerCase() : ' ';
                            if (dataFormat.indexOf(curVal) < 0 && curVal !== ' ') {
                                isInvalidData = true;
                                break;
                            }
                        }
                    }
                }

                return isInvalidData;
            }

            /** This is called once when the visual is initialially created */
            constructor(options: VisualConstructorOptions) {
                this.host = options.host;
                this.selectionManager = options.host.createSelectionManager();
                this.rootElement = d3.select(options.element);
                const svg: d3.Selection<SVGElement> = this.svg = this.rootElement.append('svg').classed('VennDiagram', true);
                this.mainGroup = svg.append('g');

                const oElement: JQuery = $('div');
                this.legend = createLegend(oElement, false, null, true);
                this.rootElement.select('.legend').style('top', 0);

                this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            }

            /** Update is called for data updates, resizes & formatting changes */
            public update(options: VisualUpdateOptions): void {
                this.currentViewport = {
                    height: Math.max(0, options.viewport.height),
                    width: Math.max(0, options.viewport.width)
                };
                this.dataViews = options.dataViews[0];
                let isInvalidData: boolean = false;
                isInvalidData = this.validateData(this.dataViews);
                const legendSetting: ILegendSetting = this.getLegendSettings(this.dataViews);
                const labelSettings: ILabelSettings = this.getLabelSettings(this.dataViews);
                this.mainGroup.selectAll('*').remove();
                this.rootElement.selectAll
                    ('.legend #legendGroup .legendItem, .legend #legendGroup .legendTitle, .legend #legendGroup .navArrow').remove();
                $('.ErrorMessage').remove();

                if (isInvalidData) {
                    const htmlChunk: string = '<div class="ErrorMessage"' +
                        'title="Please provide data in valid format">Please provide data in valid format</div>';
                    $('#sandbox-host').append(htmlChunk);

                    return;
                }
                if (!(options.dataViews &&
                    options.dataViews[0].categorical &&
                    options.dataViews[0].categorical.values &&
                    options.dataViews[0].categorical.values[0] &&
                    options.dataViews[0].categorical.categories &&
                    options.dataViews[0].categorical.categories[0])) {
                    const htmlChunk: string = '<div class="ErrorMessage">Please select "Category" and "Measure"</div>';
                    $('#sandbox-host').append(htmlChunk);

                    return;
                }
                const THIS: this = this;

                this.dataView = options.dataViews[0];
                const viewport: IViewport = options.viewport;
                const height: number = viewport.height;
                const width: number = viewport.width;
                const padding: number = 10;
                this.options = options;
                this.width = width;
                this.height = height;
                // Calculate percentage label
                this.getDataForPercent(this.dataView);
                this.getData();
                // Fetching capabilities
                this.viewModel = visualTransform(this.options, this.host, this);
                this.formatter = ValueFormatter.create({
                    format: options.dataViews[0].categorical.values[0].source.format,
                    precision: labelSettings.textPrecision,
                    value: labelSettings.displayUnits
                });

                // Render legends
                // Manage svg height and width based on legend height and width
                let legendHeight: number = 0;
                let legendWidth: number = 0;
                let vennHeight: number = options.viewport.height;
                let vennWidth: number = options.viewport.width;
                if (legendSetting.show) {
                    this.renderLegend(this.viewModel);
                    legendWidth = parseFloat($('.legend').attr('width'));
                    legendHeight = parseFloat($('.legend').attr('height'));
                    const legendPos: string = LegendPosition[this.legend.getOrientation()].toLowerCase();
                    if (legendPos === 'top' || legendPos === 'topcenter' || legendPos === 'bottom' || legendPos === 'bottomcenter') {
                        vennHeight = vennHeight - legendHeight <= 0 ? 0 : vennHeight - legendHeight;
                    } else if (legendPos === 'left' || legendPos === 'leftcenter' || legendPos === 'right' || legendPos === 'rightcenter') {
                        vennWidth = vennWidth - legendWidth <= 0 ? 0 : vennWidth - legendWidth;
                    }
                } else {
                    this.svg.style({
                        'margin-top': '0px'
                    });
                }
                this.svg.attr({
                    height: vennHeight,
                    width: vennWidth
                });

                // Adjust visual size and position according to legend position
                this.adjustVisual(legendSetting);
                this.vennPoints = this.viewModel.dataPoints;
                this.draw(this.width, this.height, this.viewModel);

                const selectionManager: ISelectionManager = this.selectionManager;
            }

            // tslint:disable-next-line:no-any
            public getFormattedData(value: any, precision: number, displayUnits: number, maxVal: number): string {
                let formattedData: string = '';
                const formatValue: number = displayUnits;
                // tslint:disable-next-line:no-any
                let formatter: any;
                let format: string = '';
                if (this.dataViews
                    && this.dataViews.categorical
                    && this.dataViews.categorical.values
                    && this.dataViews.categorical.values[0]
                    && this.dataViews.categorical.values[0].source
                    && this.dataViews.categorical.values[0].source.format) {
                    format = this.dataViews.categorical.values[0].source.format;
                }
                if (format === '') {
                    format = '0';
                }
                if (formatValue === 0) {
                    const alternateFormatter: number = parseInt(maxVal.toString(), 10).toString().length;
                    let formatterVal: number = 10;
                    if (alternateFormatter > 9) {
                        formatterVal = 1e9;
                    } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                        formatterVal = 1e6;
                    } else if (alternateFormatter <= 6 && alternateFormatter >= 4) {
                        formatterVal = 1e3;
                    }
                    formatter = ValueFormatter.create({
                        format: format,
                        precision: precision,
                        value: formatterVal
                    });
                    this.formatter.value = formatterVal;
                    formattedData = formatter.format(value);
                } else {
                    formatter = ValueFormatter.create({
                        format: format,
                        precision: precision,
                        value: displayUnits
                    });
                    this.formatter.value = formatValue;
                    formattedData = formatter.format(value);
                }

                return formattedData;
            }

            public adjustVisual(legendSetting: ILegendSetting): void {
                // tslint:disable-next-line:no-any
                const legendHeight: any = this.rootElement.select('.legend').attr('height');
                // tslint:disable-next-line:no-any
                const legendWidth: any = this.rootElement.select('.legend').attr('width');
                const legendOrient: legend.LegendPosition = this.legend.getOrientation();
                if (legendSetting.show) {
                    this.svg.style('margin-right', 0);
                    switch (legendOrient) {
                        case 0:
                        case 5:
                        case 1:
                        case 4:
                        case 6: {
                            this.height = (this.height - parseFloat(legendHeight)) < 0 ? 0 : (this.height - parseFloat(legendHeight));
                            break;
                        }
                        case 2:
                        case 7:
                            this.width = (this.width - parseFloat(legendWidth)) < 0 ? 0 : (this.width - parseFloat(legendWidth));
                            break;
                        case 8:
                        case 3: {
                            this.width = (this.width - parseFloat(legendWidth)) < 0 ? 0 : (this.width - parseFloat(legendWidth));
                            break;
                        }
                        default:
                            break;
                    }
                }
            }

            public renderLegend(viewModel: IVennViewModel): void {
                const legendSettings: ILegendSetting = this.getLegendSettings(this.dataView);
                if (!viewModel || !viewModel.legendData) {
                    return;
                }
                if (this.dataView && this.dataView.metadata) {
                    this.legendObjectProperties = powerbi.extensibility.utils.dataview.DataViewObjects
                        .getObject(this.dataView.metadata.objects, 'legend', {});
                }
                const legendData: LegendData = viewModel.legendData;
                const legendDataTorender: LegendData = {
                    dataPoints: [],
                    fontSize: 8,
                    title: legendData.title,
                    showPrimary: legendData.showPrimary
                };
                const totalValue: number = viewModel && viewModel.legendData
                && viewModel.legendData.measureSum ? viewModel.legendData.measureSum : 1;

                // tslint:disable-next-line:no-any
                const dataArr: any[] = [];
                for (let iCounter: number = 0; iCounter < legendData.dataPoints.length; iCounter++) {
                    const currVal: number = legendData.dataPoints[iCounter].measure ? legendData.dataPoints[iCounter].measure : 0;
                    dataArr.push(currVal);
                }

                for (let iCounter: number = 0; iCounter < legendData.dataPoints.length; iCounter++) {
                    // get the maximum value of the data
                    // tslint:disable-next-line:no-any
                    const maxDataVal: any = Math.max.apply(null, dataArr);
                    let formatterValue: number = 10;
                    if (legendSettings.displayUnits === 0) {
                        const alternateValueFormatter: number = parseInt(maxDataVal, 10).toString().length;
                        if (alternateValueFormatter > 9) {
                            formatterValue = 1e9;
                        } else if (alternateValueFormatter <= 9 && alternateValueFormatter > 6) {
                            formatterValue = 1e6;
                        } else if (alternateValueFormatter <= 6 && alternateValueFormatter >= 4) {
                            formatterValue = 1e3;
                        }
                    }
                    const formatter: IValueFormatter = ValueFormatter.create({
                        format: this.dataView.categorical.values[0].source.format,
                        precision: legendSettings.decimalPlaces,
                        value: legendSettings.displayUnits === 0 ? formatterValue : legendSettings.displayUnits
                    });
                    const tooltipFormatter: IValueFormatter = ValueFormatter.create({
                        format: this.dataView.categorical.values[0].source.format,
                        precision: 0
                    });
                    const formattedMeasure: string = formatter.format(legendData.dataPoints[iCounter].measure);
                    const formattedMeasureTooltip: string = tooltipFormatter.format(legendData.dataPoints[iCounter].measure);
                    const percentageCalc: number = (legendData.dataPoints[iCounter].measure / totalValue) * 100;
                    const percentageTooltip: string = `${percentageCalc.toFixed(4)}%`;
                    const percentageVal: string = `${percentageCalc.toFixed(legendSettings.decimalPlaces)}%`;

                    legendDataTorender.dataPoints.push({
                        color: legendData.dataPoints[iCounter].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        identity: legendData.dataPoints[iCounter].identity,
                        label: legendData.dataPoints[iCounter].label,
                        measure: formattedMeasure,
                        measureTooltip: formattedMeasureTooltip,
                        percTooltip: percentageTooltip,
                        percentage: percentageVal,
                        selected: false
                    });
                    legendValuesTorender[iCounter] = legendValues[iCounter];
                }
                if (this.legendObjectProperties) {
                    powerbi.extensibility.utils.chart.legend.data.update(legendDataTorender, this.legendObjectProperties);
                    let position: string;
                    position = <string>this.legendObjectProperties[powerbi.extensibility.utils.chart.legend.legendProps.position];
                    if (position) {
                        this.legend.changeOrientation(LegendPosition[position]);
                    }
                    this.legend.drawLegend(legendDataTorender, _.clone(this.currentViewport));
                    powerbi.extensibility.utils.chart.legend.positionChartArea(this.svg, this.legend);
                }
            }

            public Join(text: string): boolean {
                const len: number = text.length;
                for (let iCounter: number = 1; iCounter < len; iCounter++) { //initialized iCounter=1 (column names null will not work)
                    if (text[iCounter] === '$') {
                        return true;
                    }
                }

                return false;
            }

            public getCombinations(): void {
                let oCounter: number = 0;
                for (let iCounter: number = 0; iCounter < Math.pow(2, this.numberOfObjects); iCounter++) {
                    let objectData: {
                        // tslint:disable-next-line:no-any
                        sets: any[];
                        value: number;
                    };
                    objectData = { sets: [], value: 0 };
                    let newCombinationGenerated: string = '';
                    for (let jCounter: number = 0; jCounter < this.numberOfObjects; jCounter++) {
                        // tslint:disable-next-line:no-bitwise
                        if (iCounter & Math.pow(2, jCounter)) {
                            newCombinationGenerated = `${newCombinationGenerated + this.finalSingleObjects[jCounter]}$`;
                            objectData.sets.push(this.finalSingleObjects[jCounter]);
                        }
                    }
                    if (newCombinationGenerated !== '') {
                        if (this.Join(newCombinationGenerated.substring(0, newCombinationGenerated.length - 1))) {
                            this.finalOtherObjects[oCounter] = newCombinationGenerated.substring(0, newCombinationGenerated.length - 1);
                            oCounter++;
                        }
                        this.finalDataSet[iCounter - 1] = objectData;
                    }
                }
            }
            // tslint:disable-next-line:no-any
            public contains(a: any, n: any, x: any): any {
                for (let i: number = 0; i < n; i++) {
                    if (a[i] === x) {
                        return true;
                    }
                }
            }
            public equalCombination(text1: string, text2: string): boolean {
                const text1Split: string[] = text1.split('$');
                const text2Split: string[] = text2.split('$');
                let i: number;
                for (i = 0; i < text1Split.length; i++) {
                    if (!this.contains(text2Split, text2Split.length, text1Split[i])) {
                        return false;
                    }
                }
                for (i = 0; i < text2Split.length; i++) {
                    if (!this.contains(text1Split, text1Split.length, text2Split[i])) {
                        return false;
                    }
                }

                return true;
            }

            public getNamesOfCategories(): {
                'categories': string[],
                'values': number[]
            } {
                const categories: string[] = [];
                const count: number = this.dataView.categorical.categories[0].values.length;
                const catCount: number = this.dataView.categorical.categories.length;
                const cats: DataViewCategoryColumn[] = this.dataView.categorical.categories;
                const catValues: PrimitiveValue[] = this.dataView.categorical.values[0].values;
                const values: number[] = [];
                const valuesNew: number[] = [];
                const supportCategories: string[][] = [];
                const THIS: this = this;
                for (let i: number = 0; i < count; i++) {
                    let str: string = '';
                    const value: PrimitiveValue = catValues[i];
                    for (let j: number = 0; j < catCount; j++) {
                        if (cats[j].values[i].toString().toLowerCase() === 'yes'
                            || cats[j].values[i].toString().toLowerCase() === 'true'
                            || cats[j].values[i].toString() === '1') {
                            str += `${cats[j].source.displayName}$`;
                        }
                    }
                    if (str.split('$').length > 1) {
                        categories.push(str.trim().substring(0, str.length - 1));
                        values.push(Number(value));
                        supportCategories.push(str.trim().split('$'));
                        valuesNew.push(0);
                    }
                }
                // Calculating all sum up values
                // tslint:disable-next-line:no-any
                categories.forEach(function (str: string, index: number): any {
                    // tslint:disable-next-line:no-any
                    categories.forEach(function (strInner: string, indexInner: number): any {
                        if (THIS.FindMatch(supportCategories[index], supportCategories[indexInner])) {
                            valuesNew[index] += values[indexInner];
                        }
                    });
                });

                // Adding all categories from the i/p dataset even if all of its entries are "no"
                // tslint:disable-next-line:typedef
                if (categories.filter(str => str.split('$').length === 1).length !== catCount) {
                    for (let k: number = 0; k < catCount; k++) {
                        if (categories.indexOf(cats[k].source.displayName) === -1) {
                            categories.push(cats[k].source.displayName);
                            valuesNew.push(0);
                            // ClickFlag[k] = false;
                        }
                    }
                }

                return {
                    categories: categories,
                    values: valuesNew
                };
            }

            public FindMatch(a: string[], b: string[]): boolean {
                let difference: string[];
                // tslint:disable-next-line:typedef
                difference = a.filter(x => b.indexOf(x) === -1);

                return difference.length > 0 ? false : true;
            }
                // tslint:disable-next-line:cyclomatic-complexity no-any
                public getDataForPercent(dataView: any): void {
                // tslint:disable-next-line:no-any
                const categorical: any = Object.getPrototypeOf(this.dataView.categorical);
                // tslint:disable-next-line:no-any
                let data: any = {};
                // tslint:disable-next-line:no-any
                let value: any = {};
                let jCounter: number = 0;
                // tslint:disable-next-line:no-any
                const finalDataName: any = [];
                // tslint:disable-next-line:no-any
                const finalDataValue: any = [];
                this.numberOfObjects = 0;
                let iSumSingle: number = 0;
                let iSumOther: number = 0;
                // tslint:disable-next-line:no-any
                let iSumTotal: any = {};
                this.finalSingleObjects = [];
                this.finalOtherObjects = [];
                this.finalPercentIndicator = [];
                this.percentIndicator = [];

                // changing logic
                let dataModified: {
                    // tslint:disable-next-line:no-any
                    categories: any[];
                    // tslint:disable-next-line:no-any
                    values: any[];
                } = {
                    categories: [],
                    values: []
                };
                const tempDataModified: {'categories': string[],
            'values': number[]} = this.getNamesOfCategories();
                const tempDataModifiedInOrder: {'categories': string[],
        'values': number[]} = {
            categories : [],
            values : []
        };
                tempDataModifiedInOrder.categories = [];
                tempDataModifiedInOrder.values = [];
                const flag: number[] = [];
                for (let i: number = 0; i < tempDataModified.values.length; i++) {
            flag.push(0);
        }
                // tslint:disable-next-line:no-any
                dataView.categorical.categories.forEach(function(dataV: any, iteator: number): void {
            // tslint:disable-next-line:no-any
            tempDataModified.categories.forEach(function(d: any, i: number): void {
                if (dataV.source.displayName === d || (d.indexOf(dataV.source.displayName) > -1)) {
                    if (flag[i] === 0) {
                        tempDataModifiedInOrder.categories.push(d);
                        tempDataModifiedInOrder.values.push(tempDataModified.values[i]);
                        flag[i] = 1;
                    }
                }
            });
        });
                this.dataModified = dataModified = tempDataModifiedInOrder;
                value = dataModified.values;
                data = dataModified.categories;

                const maxObj: number = 11;

                for (let iCounter: number = 0; iCounter < maxObj; iCounter++) {
                    this.finalSingleObjectsValues[iCounter] = 0;
                    this.finalOtherObjectsValues[iCounter] = 0;
                    this.finalUpdatedSingleObjectsValues[iCounter] = 0;
                    this.finalUpdatedOtherObjectsValues[iCounter] = 0;
                }

                for (let iCounter: number = 0; iCounter < data.length; iCounter++) {
                    if (!this.Join(dataModified.categories[iCounter])) {
                        this.finalSingleObjects[jCounter] = dataModified.categories[iCounter];
                        this.finalSingleObjectsValues[jCounter] = dataModified.values[iCounter];
                        jCounter++;
                    }
                }
                this.numberOfObjects = numberOfObjects = this.dataView.categorical.categories.length;

                this.getCombinations();
                for (let iCounter: number = 1; iCounter < this.finalSingleObjects.length; iCounter++) {
                    finalDataName[iCounter] = this.finalSingleObjects[iCounter];
                    finalDataValue[iCounter] = 0;
                }
                for (let iCounter: number = this.finalSingleObjects.length;
                    iCounter < this.finalSingleObjects.length + this.finalOtherObjects.length - 1; iCounter++) {
                    finalDataName[iCounter] = this.finalOtherObjects[iCounter];
                    finalDataValue[iCounter] = 0;
                }

                for (jCounter = 0; jCounter < data.length; jCounter++) {
                    for (let iCounter: number = 1; iCounter < Math.pow(2, this.numberOfObjects); iCounter++) {
                        if (data[jCounter] === finalDataName[iCounter]) {
                            this.finalDataSet[iCounter - 1].value = value[jCounter];
                            break;
                        }
                    }
                }
                for (let iCounter: number = 0; iCounter < data.length; iCounter++) {
                    for (jCounter = 0; jCounter < this.finalOtherObjects.length; jCounter++) {
                        if (this.equalCombination(data[iCounter], this.finalOtherObjects[jCounter])) {
                            this.finalOtherObjectsValues[jCounter] = value[iCounter];
                        }
                    }
                }
                for (let iCounter: number = 0; iCounter < this.finalOtherObjects.length; iCounter++) {
                    if (!this.finalOtherObjectsValues[iCounter]) {
                        this.finalOtherObjectsValues[iCounter] = 0;
                    }
                }
                finalSingleObjects = this.finalSingleObjects;
                finalSingleObjectsValues = this.finalSingleObjectsValues;
                // Calculating individual region values
                this.finalUpdatedOtherObjectsValues[10] = this.finalOtherObjectsValues[10];

                this.finalUpdatedOtherObjectsValues[3] = this.finalOtherObjectsValues[3] >
                    this.finalOtherObjectsValues[10] ? this.finalOtherObjectsValues[3] - this.finalOtherObjectsValues[10] : 0;
                this.finalUpdatedOtherObjectsValues[6] = this.finalOtherObjectsValues[6] >
                    this.finalOtherObjectsValues[10] ? this.finalOtherObjectsValues[6] - this.finalOtherObjectsValues[10] : 0;
                this.finalUpdatedOtherObjectsValues[8] = this.finalOtherObjectsValues[8] >
                    this.finalOtherObjectsValues[10] ? this.finalOtherObjectsValues[8] - this.finalOtherObjectsValues[10] : 0;
                this.finalUpdatedOtherObjectsValues[9] = this.finalOtherObjectsValues[9] >
                    this.finalOtherObjectsValues[10] ? this.finalOtherObjectsValues[9] - this.finalOtherObjectsValues[10] : 0;

                const FUOOV0: number = this.finalOtherObjectsValues[0] - this.finalUpdatedOtherObjectsValues[3] -
                    this.finalUpdatedOtherObjectsValues[6] - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedOtherObjectsValues[0] = FUOOV0 < 0 ? 0 : FUOOV0;
                const FUOOV1: number = this.finalOtherObjectsValues[1] - this.finalUpdatedOtherObjectsValues[3] -
                    this.finalUpdatedOtherObjectsValues[8] - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedOtherObjectsValues[1] = FUOOV1 < 0 ? 0 : FUOOV1;
                const FUOOV2: number = this.finalOtherObjectsValues[2] - this.finalUpdatedOtherObjectsValues[3] -
                    this.finalUpdatedOtherObjectsValues[9] - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedOtherObjectsValues[2] = FUOOV2 < 0 ? 0 : FUOOV2;
                const FUOOV4: number = this.finalOtherObjectsValues[4] - this.finalUpdatedOtherObjectsValues[6] -
                    this.finalUpdatedOtherObjectsValues[8] - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedOtherObjectsValues[4] = FUOOV4 < 0 ? 0 : FUOOV4;
                const FUOOV5: number = this.finalOtherObjectsValues[5] - this.finalUpdatedOtherObjectsValues[6] -
                    this.finalUpdatedOtherObjectsValues[9] - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedOtherObjectsValues[5] = FUOOV5 < 0 ? 0 : FUOOV5;
                const FUOOV7: number = this.finalOtherObjectsValues[7] - this.finalUpdatedOtherObjectsValues[8] -
                    this.finalUpdatedOtherObjectsValues[9] - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedOtherObjectsValues[7] = FUOOV7 < 0 ? 0 : FUOOV7;

                const FUSOV0: number = this.finalSingleObjectsValues[0]
                    - this.finalUpdatedOtherObjectsValues[0]
                     - this.finalUpdatedOtherObjectsValues[1]
                     - this.finalUpdatedOtherObjectsValues[3]
                    - this.finalUpdatedOtherObjectsValues[4]
                    - this.finalUpdatedOtherObjectsValues[6]
                    - this.finalUpdatedOtherObjectsValues[8]
                    - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedSingleObjectsValues[0] = FUSOV0 < 0 ? 0 : FUSOV0;
                const FUSOV1: number = this.finalSingleObjectsValues[1]
                    - this.finalUpdatedOtherObjectsValues[0]
                    - this.finalUpdatedOtherObjectsValues[2]
                     - this.finalUpdatedOtherObjectsValues[3]
                    - this.finalUpdatedOtherObjectsValues[5]
                    - this.finalUpdatedOtherObjectsValues[6]
                    - this.finalUpdatedOtherObjectsValues[9]
                    - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedSingleObjectsValues[1] = FUSOV1 < 0 ? 0 : FUSOV1;
                const FUSOV2: number = this.finalSingleObjectsValues[2]
                    - this.finalUpdatedOtherObjectsValues[1]
                     - this.finalUpdatedOtherObjectsValues[2]
                     - this.finalUpdatedOtherObjectsValues[3]
                    - this.finalUpdatedOtherObjectsValues[7]
                    - this.finalUpdatedOtherObjectsValues[8]
                     - this.finalUpdatedOtherObjectsValues[9]
                    - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedSingleObjectsValues[2] = FUSOV2 < 0 ? 0 : FUSOV2;
                const FUSOV3: number = this.finalSingleObjectsValues[3]
                    - this.finalUpdatedOtherObjectsValues[4]
                    - this.finalUpdatedOtherObjectsValues[5]
                    - this.finalUpdatedOtherObjectsValues[6]
                    - this.finalUpdatedOtherObjectsValues[7]
                    - this.finalUpdatedOtherObjectsValues[8]
                    - this.finalUpdatedOtherObjectsValues[9]
                    - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedSingleObjectsValues[3] = FUSOV3 < 0 ? 0 : FUSOV3;
                // Calculating percentage indicator value
                for (let iCounter: number = 0; iCounter < this.finalUpdatedSingleObjectsValues.length; iCounter++) {
                    this.finalUpdatedSingleObjectsValues[iCounter] = this.finalUpdatedSingleObjectsValues[iCounter]
                        < 0 ? 0 : this.finalUpdatedSingleObjectsValues[iCounter];
                    iSumSingle += this.finalUpdatedSingleObjectsValues[iCounter];
                }
                for (let iCounter: number = 0; iCounter < this.finalUpdatedOtherObjectsValues.length; iCounter++) {
                    this.finalUpdatedOtherObjectsValues[iCounter] = this.finalUpdatedOtherObjectsValues[iCounter]
                        < 0 ? 0 : this.finalUpdatedOtherObjectsValues[iCounter];
                    iSumOther += this.finalUpdatedOtherObjectsValues[iCounter];
                }
                iSumTotal = iSumSingle + iSumOther;
                for (let iCounter: number = 0; iCounter < this.finalUpdatedSingleObjectsValues.length; iCounter++) {
                    this.finalPercentIndicator[iCounter] = ((this.finalUpdatedSingleObjectsValues[iCounter]
                        / iSumTotal) * 100) < 0 ? 0 : (this.finalUpdatedSingleObjectsValues[iCounter] / iSumTotal) * 100;
                    this.percentIndicator[iCounter] = this.finalPercentIndicator[iCounter];
                    this.finalPercentIndicator[iCounter] = `${this.finalPercentIndicator[iCounter].toFixed(2)}%`;
                }
            }
            // tslint:disable-next-line:cyclomatic-complexity
            public getData(): void {
                // tslint:disable-next-line:no-any
                const categorical: any = Object.getPrototypeOf(this.dataView.categorical);
                // tslint:disable-next-line:no-any
                let data: any = {};
                // tslint:disable-next-line:no-any
                let value: any = {};
                let jCounter: number = 0;
                const mCounter: number = 0;
                let lCounter: number = 0;
                const maxObj: number = 11;
                // tslint:disable-next-line:no-any
                const finalDataName: any[] = [];
                // tslint:disable-next-line:no-any
                const finalDataValue: any[] = [];
                this.numberOfObjects = 0;
                this.finalSingleObjects = [];

                data = this.dataModified.categories;
                value = this.dataModified.values;

                for (let iCounter: number = 0; iCounter < maxObj; iCounter++) {
                    this.finalSingleObjectsValues[iCounter] = 0;
                    this.finalOtherObjectsValues[iCounter] = 0;
                    this.finalUpdatedSingleObjectsValues[iCounter] = 0;
                    this.finalUpdatedOtherObjectsValues[iCounter] = 0;
                }
                this.singleTempValue = [];
                for (let iCounter: number = 0; iCounter < data.length; iCounter++) {
                    if (!this.Join(data[iCounter])) {
                        this.singleTemp[jCounter] = data[iCounter];
                        this.singleTempValue.push(value[iCounter]);
                        jCounter++;
                    }
                }

                for (let iCounter: number = 0; iCounter < jCounter; iCounter++) {
                    this.finalSingleObjects[lCounter] = this.singleTemp[iCounter];
                    this.finalSingleObjectsValues[lCounter] = this.singleTempValue[iCounter];
                    lCounter++;
                }
                this.numberOfObjects = this.dataView.categorical.categories.length;
                this.getCombinations();
                for (let iCounter: number = 1; iCounter < this.finalSingleObjects.length; iCounter++) {
                    finalDataName[iCounter] = this.finalSingleObjects[iCounter];
                    finalDataValue[iCounter] = 0;
                }
                for (let iCounter: number = this.finalSingleObjects.length;
                    iCounter < this.finalSingleObjects.length + this.finalOtherObjects.length - 1; iCounter++) {
                    finalDataName[iCounter] = this.finalOtherObjects[iCounter];
                    finalDataValue[iCounter] = 0;
                }

                for (jCounter = 0; jCounter < data.length; jCounter++) {
                    for (let iCounter: number = 1; iCounter < Math.pow(2, this.numberOfObjects); iCounter++) {
                        if (data[jCounter] === finalDataName[iCounter]) {
                            this.finalDataSet[iCounter - 1].value = value[jCounter];
                            break;
                        }
                    }
                }
                for (let iCounter: number = 0; iCounter < data.length; iCounter++) {
                    for (jCounter = 0; jCounter < this.finalOtherObjects.length; jCounter++) {
                        if (this.equalCombination(data[iCounter], this.finalOtherObjects[jCounter])) {
                            this.finalOtherObjectsValues[jCounter] = value[iCounter];
                        }
                    }
                }

                for (let iCounter: number = 0; iCounter < this.finalOtherObjects.length; iCounter++) {
                    if (this.finalOtherObjects[iCounter].split('$').length > this.numberOfObjects) {
                        this.finalOtherObjectsValues[iCounter] = 0;
                    }
                }

                for (let iCounter: number = 0; iCounter < 11; iCounter++) {
                    if (!this.finalOtherObjectsValues[iCounter]) {
                        this.finalOtherObjectsValues[iCounter] = 0;
                    }
                }

                if (this.numberOfObjects === 2) {
                    for (let iCounter: number = 0; iCounter < 11; iCounter++) {
                        if (iCounter !== 0) {
                            this.finalOtherObjectsValues[iCounter] = 0;
                        }
                    }
                }

                if (this.numberOfObjects === 3) {
                    for (let iCounter: number = 0; iCounter < 11; iCounter++) {
                        if (iCounter !== 0 && iCounter !== 1 && iCounter !== 2 && iCounter !== 3) {
                            this.finalOtherObjectsValues[iCounter] = 0;
                        }
                    }
                }
                finalSingleObjects = this.finalSingleObjects;
                finalSingleObjectsValues = this.finalSingleObjectsValues;
                // Calculating individual region value
                this.finalUpdatedOtherObjectsValues[10] = this.finalOtherObjectsValues[10];

                this.finalUpdatedOtherObjectsValues[3] = this.finalOtherObjectsValues[3] >
                    this.finalOtherObjectsValues[10] ? this.finalOtherObjectsValues[3] - this.finalOtherObjectsValues[10] : 0;
                this.finalUpdatedOtherObjectsValues[6] = this.finalOtherObjectsValues[6] >
                    this.finalOtherObjectsValues[10] ? this.finalOtherObjectsValues[6] - this.finalOtherObjectsValues[10] : 0;
                this.finalUpdatedOtherObjectsValues[8] = this.finalOtherObjectsValues[8] >
                    this.finalOtherObjectsValues[10] ? this.finalOtherObjectsValues[8] - this.finalOtherObjectsValues[10] : 0;
                this.finalUpdatedOtherObjectsValues[9] = this.finalOtherObjectsValues[9] >
                    this.finalOtherObjectsValues[10] ? this.finalOtherObjectsValues[9] - this.finalOtherObjectsValues[10] : 0;

                const FUOOV0: number = this.finalOtherObjectsValues[0] - this.finalUpdatedOtherObjectsValues[3] -
                    this.finalUpdatedOtherObjectsValues[6] - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedOtherObjectsValues[0] = FUOOV0 < 0 ? 0 : FUOOV0;
                const FUOOV1: number = this.finalOtherObjectsValues[1] - this.finalUpdatedOtherObjectsValues[3] -
                    this.finalUpdatedOtherObjectsValues[8] - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedOtherObjectsValues[1] = FUOOV1 < 0 ? 0 : FUOOV1;
                const FUOOV2: number = this.finalOtherObjectsValues[2] - this.finalUpdatedOtherObjectsValues[3] -
                    this.finalUpdatedOtherObjectsValues[9] - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedOtherObjectsValues[2] = FUOOV2 < 0 ? 0 : FUOOV2;
                const FUOOV4: number = this.finalOtherObjectsValues[4] - this.finalUpdatedOtherObjectsValues[6] -
                    this.finalUpdatedOtherObjectsValues[8] - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedOtherObjectsValues[4] = FUOOV4 < 0 ? 0 : FUOOV4;
                const FUOOV5: number = this.finalOtherObjectsValues[5] - this.finalUpdatedOtherObjectsValues[6] -
                    this.finalUpdatedOtherObjectsValues[9] - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedOtherObjectsValues[5] = FUOOV5 < 0 ? 0 : FUOOV5;
                const FUOOV7: number = this.finalOtherObjectsValues[7] - this.finalUpdatedOtherObjectsValues[8] -
                    this.finalUpdatedOtherObjectsValues[9] - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedOtherObjectsValues[7] = FUOOV7 < 0 ? 0 : FUOOV7;

                const FUSOV0: number = this.finalSingleObjectsValues[0]
                    - this.finalUpdatedOtherObjectsValues[0]
                    - this.finalUpdatedOtherObjectsValues[1]
                    - this.finalUpdatedOtherObjectsValues[3]
                    - this.finalUpdatedOtherObjectsValues[4]
                    - this.finalUpdatedOtherObjectsValues[6]
                    - this.finalUpdatedOtherObjectsValues[8]
                    - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedSingleObjectsValues[0] = FUSOV0 < 0 ? 0 : FUSOV0;
                const FUSOV1: number = this.finalSingleObjectsValues[1]
                    - this.finalUpdatedOtherObjectsValues[0]
                    - this.finalUpdatedOtherObjectsValues[2]
                     - this.finalUpdatedOtherObjectsValues[3]
                    - this.finalUpdatedOtherObjectsValues[5]
                     - this.finalUpdatedOtherObjectsValues[6]
                     - this.finalUpdatedOtherObjectsValues[9]
                    - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedSingleObjectsValues[1] = FUSOV1 < 0 ? 0 : FUSOV1;
                const FUSOV2: number = this.finalSingleObjectsValues[2]
                    - this.finalUpdatedOtherObjectsValues[1]
                    - this.finalUpdatedOtherObjectsValues[2]
                    - this.finalUpdatedOtherObjectsValues[3]
                    - this.finalUpdatedOtherObjectsValues[7]
                    - this.finalUpdatedOtherObjectsValues[8]
                    - this.finalUpdatedOtherObjectsValues[9]
                    - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedSingleObjectsValues[2] = FUSOV2 < 0 ? 0 : FUSOV2;
                const FUSOV3: number = this.finalSingleObjectsValues[3]
                    - this.finalUpdatedOtherObjectsValues[4]
                     - this.finalUpdatedOtherObjectsValues[5]
                      - this.finalUpdatedOtherObjectsValues[6]
                    - this.finalUpdatedOtherObjectsValues[7]
                     - this.finalUpdatedOtherObjectsValues[8]
                     - this.finalUpdatedOtherObjectsValues[9]
                    - this.finalUpdatedOtherObjectsValues[10];
                this.finalUpdatedSingleObjectsValues[3] = FUSOV3 < 0 ? 0 : FUSOV3;

                for (let iCounter: number = 0; iCounter < this.finalUpdatedSingleObjectsValues.length; iCounter++) {
                    this.finalUpdatedSingleObjectsValues[iCounter] =
                        this.finalUpdatedSingleObjectsValues[iCounter] < 0 ? 0 : this.finalUpdatedSingleObjectsValues[iCounter];
                }
                for (let iCounter: number = 0; iCounter < this.finalUpdatedOtherObjectsValues.length; iCounter++) {
                    this.finalUpdatedOtherObjectsValues[iCounter] =
                        this.finalUpdatedOtherObjectsValues[iCounter] < 0 ? 0 : this.finalUpdatedOtherObjectsValues[iCounter];
                }
            }

            public min(a: number, b: number): number {
                if (a < b) {
                    return a;
                } else {
                    return b;
                }
            }
            public max(a: number, b: number): number {
                if (a > b) {
                    return a;
                } else {
                    return b;
                }
            }

            // tslint:disable-next-line:no-any
            public drawOneObjects(width: number, height: number, marginX: number, marginY: number, color: any): void {
                const labelSettings: ILabelSettings = this.getLabelSettings(this.dataViews);
                const opSettings: IOpacitySettings = this.getOpacitySettings(this.dataViews);
                const externalOpacity: number = opSettings.externalArc / 100;
                // tslint:disable-next-line:no-any
                const mainGroup: any = this.mainGroup;
                width = width - 2 * marginX;
                height = height - 2 * marginY;
                const circleRadius: number = this.min(width, height) / 3;
                this.circles[0] = this.mainGroup.append('circle');
                this.texts[0] = this.mainGroup.append('text');
                this.texts[1] = this.mainGroup.append('text');

                this.circles[0]
                    .attr({
                        cx: width / 2 + circleRadius / 2,
                        cy: height / 2,
                        r: circleRadius
                    })
                    .style({
                        fill: color[0],
                        opacity: externalOpacity
                    })
                    .classed('A', true);

                if (labelSettings.show) {
                    const precision: number = labelSettings.textPrecision;
                    const displayUnits: number = labelSettings.displayUnits;
                    // tslint:disable-next-line:no-shadowed-variable
                    const maxVal: number = Math.max.apply(null, this.finalSingleObjectsValues);

                    // tslint:disable-next-line:no-any
                    const textProps: any[] = [];
                    textProps.push({
                        val:
                            this.getFormattedData(this.finalSingleObjectsValues[0], precision,
                                                  displayUnits, maxVal),
                        x: width / 2 + circleRadius / 2, y: height / 2, maxWidth: circleRadius * 2
                    }); // A

                    const measureDataProperties: TextProperties = {
                        fontFamily: 'Segoe UI,wf_segoe-ui_semibold,helvetica,arial,sans-serif',
                        fontSize: `${labelSettings.fontSize}px`,
                        text: textProps[0].val
                    };
                    this.mainGroup
                        .append('text')
                        .classed('venn_singleLabel', true)
                        .attr({
                            fill: labelSettings.color,
                            'font-size': `${labelSettings.fontSize}px`,
                            'text-anchor': 'middle',
                            x: textProps[0].x,
                            y: textProps[0].y
                        })
                        .text(textMeasurementService.getTailoredTextOrDefault(measureDataProperties, textProps[0].maxWidth));
                }

                // tslint:disable-next-line:no-any
                const maxVal: any = Math.max.apply(null, this.finalUpdatedSingleObjectsValues);
                // Add tooltip
                // tslint:disable-next-line:no-any
                let tooltipData: {}[];
                tooltipData = [];
                tooltipData.push({
                    key: this.finalSingleObjects[0],
                    value: this.getFormattedData(this.finalUpdatedSingleObjectsValues[0], 0, 1, maxVal)
                }); // A
                this.svg.selectAll('circle').data(tooltipData);
                this.svg.selectAll('.venn_singleLabel').data(tooltipData);

                this.tooltipServiceWrapper.addTooltip(this.svg.selectAll('circle, .venn_singleLabel'),
                                                      (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                                                      (tooltipEvent: TooltipEventArgs<number>) => null);
            }

            // tslint:disable-next-line:no-any
            public drawTwoObjects(width: number, height: number, marginX: number, marginY: number, color: any): void {
                const labelSettings: ILabelSettings = this.getLabelSettings(this.dataViews);
                const opSettings: IOpacitySettings = this.getOpacitySettings(this.dataViews);
                const externalOpacity: number = opSettings.externalArc / 100;
                const internalOpacity: number = opSettings.internalArc / 100;
                // tslint:disable-next-line:no-any
                const mainGroup: any = this.mainGroup;
                // tslint:disable-next-line:no-any
                const finalOtherObjectsValues: any = this.finalOtherObjectsValues;
                // tslint:disable-next-line:no-any
                const finalUpdatedSingleObjectsValues: any = this.finalUpdatedSingleObjectsValues;
                // tslint:disable-next-line:no-any
                const finalUpdatedOtherObjectsValues: any = this.finalUpdatedOtherObjectsValues;

                width = width - 2.5 * marginX;
                height = height - 2 * marginY;

                // Calculate radius circles
                const circleRadius: number = this.min(width, height) / 3;

                // Calculate centre of circles
                const centreAx: number = width / 2;
                const centreAy: number = height / 2;
                const centreBx: number = width / 2 + circleRadius;
                const centreBy: number = height / 2;

                // Calculate IntersectionPoint
                const distanceIntersectionPoint: number = Math.sqrt(Math.pow(circleRadius, 2) - (Math.pow(circleRadius, 2) / 4));
                const intersectionPointX: number = centreAx + circleRadius / 2;
                const intersectionPointYTop: number = centreAy - distanceIntersectionPoint;
                const intersectionPointYBottom: number = centreAy + distanceIntersectionPoint;

                // Create paths
                const pathCoordinates0: string = `M${intersectionPointX} ${intersectionPointYTop}
            A ${circleRadius} ${circleRadius},0, 0 , 0 , ${intersectionPointX
                    } ${intersectionPointYBottom}A ${circleRadius}
                    ${circleRadius},0 , 1, 1, ${intersectionPointX} ${intersectionPointYTop}`;

                this.paths[0] = this.mainGroup.append('path');
                this.paths[0].attr({ d: pathCoordinates0, fill: color[0] })
                    .style('opacity', externalOpacity)
                    .classed('A', true);

                const pathCoordinates1: string = `M${intersectionPointX} ${intersectionPointYTop}A ${circleRadius} ${circleRadius},0,
            1 , 1 , ${intersectionPointX} ${intersectionPointYBottom}
            A ${circleRadius} ${circleRadius},0 , 0, 0, ${intersectionPointX} ${intersectionPointYTop}`;

                this.paths[1] = this.mainGroup.append('path');
                this.paths[1].attr({ d: pathCoordinates1, fill: color[1] })
                    .style('opacity', externalOpacity)
                    .classed('B', true);

                const pathCoordinates2: string = `M${intersectionPointX} ${intersectionPointYTop}A ${circleRadius} ${circleRadius},0,
            0 , 0 , ${intersectionPointX} ${intersectionPointYBottom}
            A ${circleRadius} ${circleRadius},0 , 0, 0, ${intersectionPointX} ${intersectionPointYTop}`;

                color[2] = colorAverage(color[0], color[1]).toString();
                this.paths[2] = this.mainGroup.append('path');
                this.paths[2].attr({ d: pathCoordinates2 })
                    .style('fill', color[2])
                    .style('opacity', internalOpacity)
                    .classed('AB', true);

                // funtion to calculate intermediate color
                // tslint:disable-next-line:no-any
                function padToTwo(numberString: any): any {
                    if (numberString.length < 2) {
                        numberString = `0${numberString}`;
                    }

                    return numberString;
                }
                // tslint:disable-next-line:no-any typedef
                function colorAverage(a, b): any {
                    // tslint:disable-next-line:no-any
                    const args: any = Array.prototype.slice.call(arguments);

                    // tslint:disable-next-line:no-any
                    return args.reduce(function (prev: any, currentValue: any): any {
                        return currentValue.replace(/^#/, '')
                            .match(/.{2}/g)
                            // tslint:disable-next-line:no-any
                            .map(function (value: any, index: any): any {
                                return prev[index] + parseInt(value, 16);
                            });
                    },                 [0, 0, 0])
                        // tslint:disable-next-line:no-any
                        .reduce(function (prev: any, currentValue: any): any {
                            return prev + padToTwo(Math.floor(currentValue / args.length).toString(16));
                        },      '#');
                }

                if (labelSettings.show) {
                    const precision: number = labelSettings.textPrecision;
                    const displayUnits: number = labelSettings.displayUnits;
                    // tslint:disable-next-line:no-shadowed-variable no-any
                    const fullDataArr: any = this.finalUpdatedSingleObjectsValues.concat(this.finalUpdatedOtherObjectsValues);
                    // tslint:disable-next-line:no-shadowed-variable no-any
                    const maxVal: any = Math.max.apply(null, fullDataArr);
                    // Add text
                    // tslint:disable-next-line:no-any
                    const textProps: any[] = [];
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedSingleObjectsValues[0],
                                                   precision, displayUnits, maxVal),
                        x: width / 2 - circleRadius / 2, y: height / 2,
                        maxWidth: circleRadius
                    }); // A
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedSingleObjectsValues[1],
                                                   precision, displayUnits, maxVal),
                        x: centreAx + circleRadius + circleRadius / 2,
                        y: height / 2, maxWidth: circleRadius
                    }); // B
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedOtherObjectsValues[0],
                                                   precision, displayUnits, maxVal), x: (centreAx + centreBx) / 2,
                        y: height / 2, maxWidth: circleRadius
                    }); // AB
                    for (let iCounter: number = 0; iCounter < 3; iCounter++) {
                        const measureDataProperties: TextProperties = {
                            fontFamily: 'Segoe UI,wf_segoe-ui_semibold,helvetica,arial,sans-serif',
                            fontSize: `${labelSettings.fontSize}px`,
                            text: textProps[iCounter].val
                        };
                        this.mainGroup.append('text')
                            .attr({
                                fill: labelSettings.color,
                                'font-size': `${labelSettings.fontSize}px`,
                                'text-anchor': 'middle',
                                x: textProps[iCounter].x,
                                y: textProps[iCounter].y
                            })
                            .text(textMeasurementService.getTailoredTextOrDefault(measureDataProperties, textProps[iCounter].maxWidth));
                    }
                }

                // tslint:disable-next-line:no-any
                const fullDataArr: any = this.finalUpdatedSingleObjectsValues.concat(this.finalUpdatedOtherObjectsValues);
                // tslint:disable-next-line:no-any
                const maxVal: any = Math.max.apply(null, fullDataArr);
                // Add tooltip
                // tslint:disable-next-line:no-any
                const tooltipData: any = [];
                tooltipData.push({
                    key: this.finalSingleObjects[0], value:
                        this.getFormattedData(this.finalUpdatedSingleObjectsValues[0], 0, 1, maxVal)
                }); // A
                tooltipData.push({
                    key: this.finalSingleObjects[1], value:
                        this.getFormattedData(this.finalUpdatedSingleObjectsValues[1], 0, 1, maxVal)
                }); // B
                tooltipData.push({
                    key: `${this.finalSingleObjects[0]} & ${this.finalSingleObjects[1]}`, value:
                        this.getFormattedData(this.finalUpdatedOtherObjectsValues[0], 0, 1, maxVal)
                }); // AB

                this.svg.selectAll('path').data(tooltipData);
                this.svg.selectAll('text').data(tooltipData);

                this.tooltipServiceWrapper.addTooltip(this.svg.selectAll('path, text'),
                                                      (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                                                      (tooltipEvent: TooltipEventArgs<number>) => null);
            }

            // tslint:disable-next-line:no-any
            public drawThreeObjects(width: number, height: number, marginX: number, marginY: number, color: any): void {

                const labelSettings: ILabelSettings = this.getLabelSettings(this.dataViews);
                const opSettings: IOpacitySettings = this.getOpacitySettings(this.dataViews);
                const externalOpacity: number = opSettings.externalArc / 100;
                const internalOpacity: number = opSettings.internalArc / 100;
                let mainGroup: number = opSettings.internalArc / 100;
                mainGroup = this.mainGroup;
                // tslint:disable-next-line:no-any
                let circleRadius: any;
                width = width - 2.5 * marginX;
                height = height - 2 * marginY;
                circleRadius = this.min(width, height) / 3;

                // Calculate Centre Of circle
                const centreAx: number = width / 2;
                const centreAy: number = marginY + height / 4;
                const centreBx: number = width / 2 + circleRadius;
                const centreBy: number = marginY + height / 4;

                // Calculate IntersectionPoint
                const distanceIntersectionPoint1: number = Math.sqrt(Math.pow(circleRadius, 2) - (Math.pow(circleRadius, 2) / 4));
                const intersectionPointAbX: number = centreAx + circleRadius / 2;
                const intersectionPointABTopY: number = centreAy - distanceIntersectionPoint1;
                const intersectionPointABBottomY: number = centreAy + distanceIntersectionPoint1;

                const intersectionPointXTop2: number = width / 2 + circleRadius;
                const intersectionPointYTop2: number = marginY + height / 4;
                const intersectionPointACBottomX: number = width / 2 + circleRadius / 2 - circleRadius;
                const intersectionPointACBottomY: number = intersectionPointABBottomY;

                const intersectionPointBCTopX: number = width / 2;
                const intersectionPointBCTopY: number = marginY + height / 4;
                const intersectionPointBCBottomX: number = width / 2 + circleRadius / 2 + circleRadius;
                const intersectionPointBCBottomY: number = intersectionPointABBottomY;

                const centreCx: number = width / 2 + circleRadius / 2;
                const centreCy: number = intersectionPointABBottomY;
                // Create paths
                const pathCoordinates0: string = `M${intersectionPointAbX} ${intersectionPointABTopY}A ${circleRadius} ${circleRadius}
            ,0, 0 , 0 , ${intersectionPointBCTopX} ${intersectionPointBCTopY}A ${circleRadius} ${circleRadius},0 , 0 , 0
            , ${intersectionPointACBottomX} ${intersectionPointACBottomY}A ${circleRadius} ${circleRadius},0,0,1
            ,${intersectionPointAbX} ${intersectionPointABTopY}`;

                this.paths[0] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates0)
                    .attr('fill', color[0])
                    .attr('opacity', externalOpacity)
                    .classed('A', true);

                const pathCoordinates1: string = `M${intersectionPointAbX} ${intersectionPointABTopY}A ${circleRadius} ${circleRadius},0,0,
            1,${centreBx} ${centreBy}A ${circleRadius} ${circleRadius},
            0 ,0 ,1 , ${intersectionPointBCBottomX} ${intersectionPointBCBottomY}A
             ${circleRadius} ${circleRadius},0,0,0,${intersectionPointAbX} ${intersectionPointABTopY}`;

                this.paths[1] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates1)
                    .attr('fill', color[1])
                    .attr('opacity', externalOpacity)
                    .classed('B', true);

                const pathCoordinates2: string = `M${intersectionPointACBottomX} ${intersectionPointACBottomY}
            A ${circleRadius} ${circleRadius},0, 0 , 0 , ${centreCx} ${centreCy}A ${circleRadius} ${circleRadius},0 , 0 , 0,
             ${intersectionPointBCBottomX} ${intersectionPointBCBottomY}A ${circleRadius} ${circleRadius},0,0,1
            ,${intersectionPointACBottomX} ${intersectionPointACBottomY}`;
                this.paths[2] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates2)
                    .attr('fill', color[2])
                    .attr('opacity', externalOpacity)
                    .classed('C', true);

                const pathCoordinates3: string = `M${intersectionPointAbX}
                ${intersectionPointABTopY}A ${circleRadius} ${circleRadius},0, 0 , 0
            , ${centreAx} ${centreAy}A ${circleRadius} ${circleRadius},0 , 0 , 1
            , ${centreBx} ${centreBy}A ${circleRadius} ${circleRadius},0,0,0,${intersectionPointAbX} ${intersectionPointABTopY}`;

                color[3] = colorAverage(color[0], color[1]).toString();
                this.paths[3] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates3)
                    .attr('fill', color[3])
                    .attr('opacity', internalOpacity)
                    .classed('AB', true);

                const pathCoordinates4: string = `M${intersectionPointACBottomX}
                ${intersectionPointACBottomY}A ${circleRadius} ${circleRadius},0, 0 , 1
            , ${centreAx} ${centreAy}A ${circleRadius} ${circleRadius},0 , 0 , 0
            , ${centreCx} ${centreCy}A ${circleRadius} ${circleRadius},0,0,1,${intersectionPointACBottomX} ${intersectionPointACBottomY}`;

                color[4] = colorAverage(color[0], color[2]).toString();
                this.paths[4] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates4)
                    .attr('fill', color[4])
                    .attr('opacity', internalOpacity)
                    .classed('AC', true);

                const pathCoordinates5: string = `M${intersectionPointBCBottomX}
                 ${intersectionPointBCBottomY}A ${circleRadius} ${circleRadius},0, 0 , 0
            , ${centreBx} ${centreBy}A ${circleRadius} ${circleRadius},0 , 0 , 1
            , ${centreCx} ${centreCy}A ${circleRadius} ${circleRadius},0,0,0,${intersectionPointBCBottomX} ${intersectionPointBCBottomY}`;
                color[5] = colorAverage(color[1], color[2]).toString();
                this.paths[5] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates5)
                    .attr('fill', color[5])
                    .attr('opacity', internalOpacity)
                    .classed('BC', true);

                const pathCoordinates6: string = `M${centreAx} ${centreAy}A ${circleRadius} ${circleRadius},0, 0 , 1
            , ${centreBx} ${centreBy}A ${circleRadius} ${circleRadius},0 , 0 , 1
            , ${centreCx} ${centreCy}A ${circleRadius} ${circleRadius},0,0,1,${centreAx} ${centreAy}`;

                color[6] = colorAverage(color[4], color[5]).toString();
                color[6] = colorAverage(color[6], color[5]).toString();
                this.paths[6] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates6)
                    .attr('fill', color[6])
                    .attr('opacity', internalOpacity)
                    .classed('ABC', true);

                // funtion to calculate intermediate color
                // tslint:disable-next-line:no-any
                function padToTwo(numberString: any): any {
                    if (numberString.length < 2) {
                        numberString = `0${numberString}`;
                    }

                    return numberString;
                }

                // tslint:disable-next-line:no-any
                function colorAverage(a: any, b: any): any {
                    // tslint:disable-next-line:no-any
                    const args: any = Array.prototype.slice.call(arguments);

                    // tslint:disable-next-line:no-any
                    return args.reduce(function (prev: any, currentValue: any): any {
                        return currentValue
                            .replace(/^#/, '')
                            .match(/.{2}/g)
                            // tslint:disable-next-line:no-any
                            .map(function (value: any, index: any): any {
                                return prev[index] + parseInt(value, 16);
                            });
                    },                 [0, 0, 0])
                        // tslint:disable-next-line:no-any
                        .reduce(function (prev: any, currentValue: any): any {
                            return prev + padToTwo(Math.floor(currentValue / args.length).toString(16));
                        },      '#');
                }

                if (labelSettings.show) {
                    const labelPrecision: number = labelSettings.textPrecision;
                    const labelDisplayUnits: number = labelSettings.displayUnits;

                    // tslint:disable-next-line:no-shadowed-variable no-any
                    const fullDataArr: any = this.finalUpdatedSingleObjectsValues.concat(this.finalUpdatedOtherObjectsValues);
                    // tslint:disable-next-line:no-shadowed-variable no-any
                    const maxVal: any = Math.max.apply(null, fullDataArr);
                    // Add text
                    // tslint:disable-next-line:no-any
                    const textProps: any[] = [];
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedSingleObjectsValues[0],
                                                   labelPrecision, labelDisplayUnits, maxVal), x: width / 2 - circleRadius
                                / 3, y: height / 4 + circleRadius / 4, maxWidth: circleRadius - 30
                    }); // A
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedSingleObjectsValues[1],
                                                   labelPrecision, labelDisplayUnits, maxVal),
                        x: width / 2 + circleRadius + circleRadius / 3,
                        y: height / 4 + circleRadius / 4, maxWidth: circleRadius - 30
                    }); // B
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedSingleObjectsValues[2],
                                                   labelPrecision, labelDisplayUnits, maxVal),
                        x: width / 2 + circleRadius / 2, y:
                            marginY + height / 4 + 1.5 * circleRadius, maxWidth: circleRadius
                    }); // C
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedOtherObjectsValues[0],
                                                   labelPrecision, labelDisplayUnits, maxVal),
                        x: width / 2 + circleRadius / 2, y:
                            (height / 4 + circleRadius / 8) - 10, maxWidth: circleRadius - 30
                    }); // AB
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedOtherObjectsValues[1],
                                                   labelPrecision, labelDisplayUnits, maxVal),
                        x: width / 2.05, y: marginY + height
                            / 3.5 + circleRadius / 2, maxWidth: circleRadius / 1.8
                    }); // AC
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedOtherObjectsValues[2],
                                                   labelPrecision, labelDisplayUnits, maxVal),
                        x: width / 1.95 + circleRadius, y:
                            marginY + height / 3.5 + circleRadius / 2, maxWidth: circleRadius / 1.8
                    }); // BC
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedOtherObjectsValues[3],
                                                   labelPrecision, labelDisplayUnits, maxVal),
                        x: width / 2 + circleRadius / 2,
                        y: (marginY + height / 4 + circleRadius / 2), maxWidth: circleRadius / 1.8
                    }); // ABC

                    for (let iCounter: number = 0; iCounter < 7; iCounter++) {
                        const measureDataProperties: TextProperties = {
                            fontFamily: 'Segoe UI,wf_segoe-ui_semibold,helvetica,arial,sans-serif',
                            fontSize: `${labelSettings.fontSize}px`,
                            text: textProps[iCounter].val
                        };
                        this.mainGroup.append('text')
                            .attr({
                                fill: labelSettings.color,
                                'font-size': `${labelSettings.fontSize}px`,
                                'text-anchor': 'middle',
                                x: textProps[iCounter].x,
                                y: textProps[iCounter].y
                            })
                            .text(textMeasurementService.getTailoredTextOrDefault(measureDataProperties, textProps[iCounter].maxWidth));
                    }
                }

                // tslint:disable-next-line:no-any
                const fullDataArr: any = this.finalUpdatedSingleObjectsValues.concat(this.finalUpdatedOtherObjectsValues);
                // tslint:disable-next-line:no-any
                const maxVal: any = Math.max.apply(null, fullDataArr);
                // Add tooltip
                // tslint:disable-next-line:no-any
                const tooltipData: any[] = [];
                tooltipData.push({
                    key: this.finalSingleObjects[0], value: this
                        .getFormattedData(this.finalUpdatedSingleObjectsValues[0], 0, 1, maxVal)
                }); // A
                tooltipData.push({
                    key: this.finalSingleObjects[1], value: this
                        .getFormattedData(this.finalUpdatedSingleObjectsValues[1], 0, 1, maxVal)
                }); // B
                tooltipData.push({
                    key: this.finalSingleObjects[2], value: this
                        .getFormattedData(this.finalUpdatedSingleObjectsValues[2], 0, 1, maxVal)
                }); // C
                tooltipData.push({
                    key: `${this.finalSingleObjects[0]} & ${this
                        .finalSingleObjects[1]}`, value: this.getFormattedData(this.finalUpdatedOtherObjectsValues[0], 0, 1, maxVal)
                }); // AB
                tooltipData.push({
                    key: `${this.finalSingleObjects[0]} & ${this
                        .finalSingleObjects[2]}`, value: this.getFormattedData(this.finalUpdatedOtherObjectsValues[1], 0, 1, maxVal)
                }); // AC
                tooltipData.push({
                    key: `${this.finalSingleObjects[1]} & ${this
                        .finalSingleObjects[2]}`, value: this.getFormattedData(this.finalUpdatedOtherObjectsValues[2], 0, 1, maxVal)
                }); // BC
                tooltipData.push({
                    key: `${this.finalSingleObjects[0]} & ${this
                        .finalSingleObjects[1]} & ${this.finalSingleObjects[2]}`,
                    value: this.getFormattedData(this.finalUpdatedOtherObjectsValues[3], 0, 1, maxVal)
                }); // ABC

                this.svg.selectAll('path').data(tooltipData);
                this.svg.selectAll('text').data(tooltipData);

                this.tooltipServiceWrapper.addTooltip(this.svg.selectAll('path, text'),
                                                      (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                                                      (tooltipEvent: TooltipEventArgs<number>) => null);
            }

            public drawFourObjects(width: number, height: number, marginX: number, marginY: number, color: {}): void {
                const labelSettings: ILabelSettings = this.getLabelSettings(this.dataViews);
                const opSettings: IOpacitySettings = this.getOpacitySettings(this.dataViews);
                const externalOpacity: number = opSettings.externalArc / 100;
                const internalOpacity: number = opSettings.internalArc / 100;
                // tslint:disable-next-line:no-any
                const mainGroup: any = this.mainGroup;
                // tslint:disable-next-line:no-any
                const finalUpdatedOtherObjectsValues: any = this.finalUpdatedOtherObjectsValues;
                width = width - 2.2 * marginX - this.min(width, height) / 32;
                height = height - 2 * marginY;
                const circleRadius: number = this.min(width, height) / 3;

                // Calculate Centre for two circles
                const centreAx: number = width / 2 - circleRadius / 4;
                const centreAy: number = marginY + height / 2;
                const centreCx: number = width / 2 + 1.25 * circleRadius;
                const centreCy: number = marginY + height / 2;

                // find IntersectionPoint for two circles
                const distanceIntersectionPoint1: number = Math.sqrt(Math.pow(circleRadius, 2) - (Math.pow(circleRadius, 2) / 4));
                const intersectionPointAbX: number = centreAx + circleRadius / 2;
                const intersectionPointYTop1: number = centreAy - distanceIntersectionPoint1;
                const intersectionPointYBottom1: number = centreAy + distanceIntersectionPoint1;

                // Calculate centre
                const centreBx: number = width / 2 + circleRadius / 2;
                const centreBy: number = intersectionPointYBottom1 - 3 * circleRadius / 16;
                const centreDx: number = width / 2 + circleRadius / 2;
                const centreDy: number = intersectionPointYTop1 + 3 * circleRadius / 16;

                // Calculate IntersectionPoint for each circles
                const distanceIntersectionPointADX: number = (centreAx + centreDx) / 2;
                const distanceIntersectionPointADY: number = (centreAy + centreDy) / 2;
                const distanceIntersectionADTop: number = Math.sqrt(Math.pow(circleRadius, 2) - (Math.pow(circleRadius, 2) / 4));
                const distanceIntersectionPointTopADX: number = distanceIntersectionPointADX - .570 * circleRadius;
                const distanceIntersectionPointTopADY: number = distanceIntersectionPointADY
                 - distanceIntersectionADTop + .22 * circleRadius;
                const distanceIntersectionPointBottomADX: number = distanceIntersectionPointADX + .570 * circleRadius;
                const distanceIntersectionPointBottomADY: number = distanceIntersectionPointADY
                 + distanceIntersectionADTop - .22 * circleRadius;

                const distanceIntersectionPointDCX: number = (centreCx + centreDx) / 2;
                const distanceIntersectionPointDCY: number = (centreCy + centreDy) / 2;
                const distanceIntersectionDCTop: number = Math.sqrt(Math.pow(circleRadius, 2) - (Math.pow(circleRadius, 2) / 4));
                const distanceIntersectionPointTopDCX: number = distanceIntersectionPointDCX + .570 * circleRadius;
                const distanceIntersectionPointTopDCY: number = distanceIntersectionPointDCY
                - distanceIntersectionDCTop + .22 * circleRadius;
                const distanceIntersectionPointBottomDCX: number = distanceIntersectionPointDCX - .570 * circleRadius;
                const distanceIntersectionPointBottomDCY: number = distanceIntersectionPointDCY
                + distanceIntersectionDCTop - .22 * circleRadius;

                const distanceIntersectionPointABX: number = (centreAx + centreBx) / 2;
                const distanceIntersectionPointABY: number = (centreAy + centreBy) / 2;
                const distanceIntersectionABTop: number = Math.sqrt(Math.pow(circleRadius, 2) - (Math.pow(circleRadius, 2) / 4));
                const distanceIntersectionPointTopABX: number = distanceIntersectionPointABX + .570 * circleRadius;
                const distanceIntersectionPointTopABY: number = distanceIntersectionPointABY
                - distanceIntersectionABTop + .22 * circleRadius;
                const distanceIntersectionPointBottomABX: number = distanceIntersectionPointABX - .570 * circleRadius;
                const distanceIntersectionPointBottomABY: number = distanceIntersectionPointABY
                + distanceIntersectionABTop - .22 * circleRadius;

                const distanceIntersectionPointBCX: number = (centreCx + centreBx) / 2;
                const distanceIntersectionPointBCY: number = (centreCy + centreBy) / 2;
                const distanceIntersectionBCTop: number = Math.sqrt(Math.pow(circleRadius, 2) - (Math.pow(circleRadius, 2) / 4));
                const distanceIntersectionPointTopBCX: number = distanceIntersectionPointBCX - .570 * circleRadius;
                const distanceIntersectionPointTopBCY: number = distanceIntersectionPointBCY
                - distanceIntersectionBCTop + .22 * circleRadius;
                const distanceIntersectionPointBottomBCX: number = distanceIntersectionPointBCX + .570 * circleRadius;
                const distanceIntersectionPointBottomBCY: number = distanceIntersectionPointBCY +
                 distanceIntersectionBCTop - .22 * circleRadius;

                // Draw paths
                const pathCoordinates0: string = `M${centreAx} ${centreAy}A ${circleRadius} ${circleRadius},0,
            0 , 0 , ${distanceIntersectionPointBottomABX} ${distanceIntersectionPointBottomABY}
            A ${circleRadius} ${circleRadius},0 , 0, 1, ${distanceIntersectionPointTopADX} ${distanceIntersectionPointTopADY}
            A ${circleRadius} ${circleRadius},0,0,0,${centreAx} ${centreAy}`;

                this.paths[0] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates0)
                    .attr('fill', color[0])
                    .attr('opacity', externalOpacity)
                    .classed('A', true);

                const pathCoordinates1: string = `M${centreBx} ${centreBy}A ${circleRadius} ${circleRadius},0,
            0 , 1 , ${distanceIntersectionPointBottomABX} ${distanceIntersectionPointBottomABY}
            A ${circleRadius} ${circleRadius},0 , 0, 0, ${distanceIntersectionPointBottomBCX} ${distanceIntersectionPointBottomBCY}
            A ${circleRadius} ${circleRadius},0,0,1,${centreBx} ${centreBy}`;
                this.paths[1] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates1)
                    .attr('fill', color[1])
                    .attr('opacity', externalOpacity)
                    .classed('B', true);

                const pathCoordinates2: string = `M${centreCx} ${centreCy}A ${circleRadius} ${circleRadius},0,
            0 , 0 , ${distanceIntersectionPointTopDCX} ${distanceIntersectionPointTopDCY}
            A ${circleRadius} ${circleRadius},0 , 0, 1, ${distanceIntersectionPointBottomBCX} ${distanceIntersectionPointBottomBCY}
            A ${circleRadius} ${circleRadius},0,0,0,${centreCx} ${centreCy}`;

                this.paths[2] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates2)
                    .attr('fill', color[2])
                    .attr('opacity', externalOpacity)
                    .classed('C', true);

                const pathCoordinates3: string = `M${centreDx} ${centreDy}A ${circleRadius} ${circleRadius},0,
            0 , 1 , ${distanceIntersectionPointTopDCX} ${distanceIntersectionPointTopDCY}
            A ${circleRadius} ${circleRadius},0 , 0, 0, ${distanceIntersectionPointTopADX} ${distanceIntersectionPointTopADY}
            A ${circleRadius} ${circleRadius},0,0,1,${centreDx} ${centreDy}`;

                this.paths[3] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates3)
                    .attr('fill', color[3])
                    .attr('opacity', externalOpacity)
                    .classed('D', true);
                const pathCoordinates4: string = `M${distanceIntersectionPointTopADX}
                ${distanceIntersectionPointTopADY}A ${circleRadius} ${circleRadius},0,
            0 , 1 , ${centreDx} ${centreDy}
            A ${circleRadius} ${circleRadius},0 , 0, 0, ${distanceIntersectionPointTopBCX} ${distanceIntersectionPointTopBCY}
            A ${circleRadius} ${circleRadius},0,0,0,${centreAx} ${centreAy}A ${circleRadius} ${circleRadius},0,
            0 , 1 , ${distanceIntersectionPointTopADX} ${distanceIntersectionPointTopADY}`;

                // funtion to calculate intermediate color
                // tslint:disable-next-line:no-any
                function padToTwo(numberString: any): any {
                    if (numberString.length < 2) {
                        numberString = `0${numberString}`;
                    }

                    return numberString;
                }

                // tslint:disable-next-line:no-any
                function colorAverage(a: any, b: any): any {
                    // tslint:disable-next-line:no-any
                    const args: any = Array.prototype.slice.call(arguments);

                    // tslint:disable-next-line:no-any
                    return args.reduce(function (prev: any, currentValue: any): any {
                        return currentValue
                            .replace(/^#/, '')
                            .match(/.{2}/g)
                            // tslint:disable-next-line:no-any
                            .map(function (value: any, index: any): any {
                                return prev[index] + parseInt(value, 16);
                            });
                    },                 [0, 0, 0])
                        // tslint:disable-next-line:no-any
                        .reduce(function (prev: any, currentValue: any): any {
                            return prev + padToTwo(Math.floor(currentValue / args.length).toString(16));
                        },      '#');
                }

                color[4] = colorAverage(color[0], color[3]).toString();
                this.paths[4] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates4)
                    .attr('fill', color[4])
                    .attr('opacity', internalOpacity)
                    .classed('AD', true);

                const pathCoordinates5: string = `M${distanceIntersectionPointTopDCX}
                ${distanceIntersectionPointTopDCY}A ${circleRadius} ${circleRadius},0,
            0 , 0 , ${centreDx} ${centreDy}
            A ${circleRadius} ${circleRadius},0 , 0, 1, ${distanceIntersectionPointTopABX} ${distanceIntersectionPointTopABY}
            A ${circleRadius} ${circleRadius},0,0,1,${centreCx} ${centreCy}A ${circleRadius} ${circleRadius},0,
            0 , 0 , ${distanceIntersectionPointTopDCX} ${distanceIntersectionPointTopDCY}`;

                color[5] = colorAverage(color[2], color[3]).toString();
                this.paths[5] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates5)
                    .attr('fill', color[5])
                    .attr('opacity', internalOpacity)
                    .classed('CD', true);

                const pathCoordinates6: string = `M${distanceIntersectionPointBottomABX} ${distanceIntersectionPointBottomABY}
            A ${circleRadius} ${circleRadius},0,
            0 , 1 , ${centreAx} ${centreAy}
            A ${circleRadius} ${circleRadius},0 , 0, 0, ${distanceIntersectionPointBottomDCX} ${distanceIntersectionPointBottomDCY}
            A ${circleRadius} ${circleRadius},0,0,0,${centreBx} ${centreBy}A ${circleRadius} ${circleRadius},0,
            0 , 1, ${distanceIntersectionPointBottomABX} ${distanceIntersectionPointBottomABY}`;

                color[6] = colorAverage(color[0], color[1]).toString();
                this.paths[6] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates6)
                    .attr('fill', color[6])
                    .attr('opacity', internalOpacity)
                    .classed('AB', true);

                const pathCoordinates7: string = `M${distanceIntersectionPointBottomBCX} ${distanceIntersectionPointBottomBCY}
            A ${circleRadius} ${circleRadius},0,
            0 , 0 , ${centreCx} ${centreCy}
            A ${circleRadius} ${circleRadius},0 , 0, 1, ${distanceIntersectionPointBottomADX} ${distanceIntersectionPointBottomADY}
            A ${circleRadius} ${circleRadius},0,0,1,${centreBx} ${centreBy}A ${circleRadius} ${circleRadius},0,
            0 , 0, ${distanceIntersectionPointBottomBCX} ${distanceIntersectionPointBottomBCY}`;

                color[7] = colorAverage(color[1], color[2]).toString();
                this.paths[7] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates7)
                    .attr('fill', color[7])
                    .attr('opacity', internalOpacity)
                    .classed('BC', true);

                const pathCoordinates8: string = `M${centreBx} ${centreBy}A ${circleRadius} ${circleRadius},0,
            0 , 0 , ${distanceIntersectionPointBottomADX} ${distanceIntersectionPointBottomADY}
            A ${circleRadius} ${circleRadius},0 , 0, 1, ${distanceIntersectionPointBottomDCX} ${distanceIntersectionPointBottomDCY}
            A ${circleRadius} ${circleRadius},0,0,1,${distanceIntersectionPointBottomDCX} ${distanceIntersectionPointBottomDCY}
            A ${circleRadius} ${circleRadius},0,
            0 , 0, ${centreBx} ${centreBy}`;

                color[8] = colorAverage(color[6], color[7]).toString();
                this.paths[8] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates8)
                    .attr('fill', color[8])
                    .attr('opacity', internalOpacity)
                    .classed('ABC', true);

                const pathCoordinates9: string = `M${centreAx} ${centreAy}A ${circleRadius} ${circleRadius},0,
            0 , 1, ${distanceIntersectionPointTopBCX} ${distanceIntersectionPointTopBCY}
            A ${circleRadius} ${circleRadius},0 , 0, 0, ${distanceIntersectionPointBottomDCX} ${distanceIntersectionPointBottomDCY}
            A ${circleRadius} ${circleRadius},0,0,1,
            ${distanceIntersectionPointBottomDCX} ${distanceIntersectionPointBottomDCY}A ${circleRadius} ${circleRadius},0,
            0 , 1, ${centreAx} ${centreAy}`;

                color[9] = colorAverage(color[4], color[6]).toString();
                this.paths[9] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates9)
                    .attr('fill', color[9])
                    .attr('opacity', internalOpacity)
                    .classed('ABD', true);

                const pathCoordinates10: string = `M${centreDx} ${centreDy}A ${circleRadius} ${circleRadius},0,
            0 , 0, ${distanceIntersectionPointTopBCX} ${distanceIntersectionPointTopBCY}
            A ${circleRadius} ${circleRadius},0 , 0, 1, ${distanceIntersectionPointTopABX} ${distanceIntersectionPointTopABY}
            A ${circleRadius} ${circleRadius},0,0,0,${centreDx} ${centreDy}`;

                color[10] = colorAverage(color[4], color[5]).toString();
                this.paths[10] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates10)
                    .attr('fill', color[10])
                    .attr('opacity', internalOpacity)
                    .classed('ACD', true);

                const pathCoordinates11: string = `M${centreCx} ${centreCy}A ${circleRadius} ${circleRadius},0,
            0 , 0, ${distanceIntersectionPointTopABX} ${distanceIntersectionPointTopABY}
            A ${circleRadius} ${circleRadius},0 , 0, 1, ${distanceIntersectionPointBottomADX} ${distanceIntersectionPointBottomADY}
            A ${circleRadius} ${circleRadius},0,0,0,${centreCx} ${centreCy}`;

                color[11] = colorAverage(color[7], color[5]).toString();
                this.paths[11] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates11)
                    .attr('fill', color[11])
                    .attr('opacity', internalOpacity)
                    .classed('BCD', true);

                const pathCoordinates12: string = `M${distanceIntersectionPointTopABX}
                ${distanceIntersectionPointTopABY}A ${circleRadius} ${circleRadius},0,
            0 , 1, ${distanceIntersectionPointBottomADX} ${distanceIntersectionPointBottomADY}
            A ${circleRadius} ${circleRadius},0 , 0, 1, ${distanceIntersectionPointBottomDCX} ${distanceIntersectionPointBottomDCY}
            A ${circleRadius} ${circleRadius},0,0,1,${distanceIntersectionPointTopBCX} ${distanceIntersectionPointTopBCY}
            A ${circleRadius} ${circleRadius},0,0,1,${distanceIntersectionPointTopABX} ${distanceIntersectionPointTopABY}`;

                color[13] = colorAverage(color[8], color[9]).toString();
                color[14] = colorAverage(color[10], color[11]).toString();
                color[12] = colorAverage(color[13], color[14]).toString();
                this.paths[12] = this.mainGroup.append('path')
                    .attr('d', pathCoordinates12)
                    .attr('fill', color[12])
                    .attr('opacity', internalOpacity)
                    .classed('ABCD', true);

                if (labelSettings.show) {
                    const labelDisplayUnits: number = labelSettings.displayUnits;
                    const labelPrecision: number = labelSettings.textPrecision;
                    // tslint:disable-next-line:no-shadowed-variable no-any
                    const fullDataArr: any = this.finalUpdatedSingleObjectsValues.
                        concat(this.finalUpdatedOtherObjectsValues, this.finalOtherObjectsValues);
                    // tslint:disable-next-line:no-shadowed-variable no-any
                    const maxVal: any = Math.max.apply(null, fullDataArr);
                    // Add text
                    // tslint:disable-next-line:no-any
                    const textProps: any = [];
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedSingleObjectsValues[0],
                                                   labelPrecision, labelDisplayUnits, maxVal),
                        x: centreAx - circleRadius / 2, y:
                            centreAy + circleRadius / 16, maxWidth: circleRadius
                    }); // A
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedSingleObjectsValues[1],
                                                   labelPrecision, labelDisplayUnits, maxVal), x: centreBx, y: centreBy +
                                circleRadius / 2, maxWidth: circleRadius * 1.8
                    }); // B
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedSingleObjectsValues[2],
                                                   labelPrecision, labelDisplayUnits, maxVal),
                        x: centreCx + circleRadius / 2, y:
                            centreCy + circleRadius / 16, maxWidth: circleRadius
                    }); // C
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedSingleObjectsValues[3], labelPrecision,
                                                   labelDisplayUnits, maxVal), x: centreDx,
                        y: centreDy - circleRadius / 2, maxWidth: circleRadius * 1.8
                    }); // D
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedOtherObjectsValues[4],
                                                   labelPrecision, labelDisplayUnits, maxVal),
                        x: (centreAx + centreDx - circleRadius / 2) / 2,
                        y: (centreAy + centreDy - circleRadius / 2) / 2, maxWidth: circleRadius / 1.8
                    }); // AD
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedOtherObjectsValues[7],
                                                   labelPrecision, labelDisplayUnits, maxVal),
                        x: (centreDx + centreCx + circleRadius / 2) / 2, y:
                            (centreDy + centreCy - circleRadius / 2) / 2, maxWidth: circleRadius / 1.8
                    }); // CD
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedOtherObjectsValues[0], labelPrecision,
                                                   labelDisplayUnits, maxVal), x:
                            (centreAx + centreBx - circleRadius / 2) / 2, y: (centreAy +
                                centreBy + circleRadius / 2) / 2, maxWidth: circleRadius / 1.8
                    }); // AB
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedOtherObjectsValues[2], labelPrecision,
                                                   labelDisplayUnits, maxVal),
                        x: (centreBx + centreCx + circleRadius / 2) / 2, y: (centreBy +
                            centreCy + circleRadius / 2) / 2, maxWidth: circleRadius / 1.8
                    }); // BC
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedOtherObjectsValues[3], labelPrecision,
                                                   labelDisplayUnits, maxVal), x: centreBx,
                        y: centreBy - circleRadius / 6, maxWidth: circleRadius / 3.5
                    }); // ABC
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedOtherObjectsValues[6], labelPrecision,
                                                   labelDisplayUnits, maxVal),
                        x: centreAx + circleRadius / 3.5, y: centreAy + circleRadius / 16,
                        maxWidth: circleRadius / 2.2
                    }); // ABD
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedOtherObjectsValues[8], labelPrecision,
                                                   labelDisplayUnits, maxVal), x:
                            centreDx, y: centreDy + circleRadius / 4,
                        maxWidth: circleRadius / 3.5
                    }); // ACD
                    textProps.push({
                        val: this.getFormattedData(this.finalUpdatedOtherObjectsValues[9], labelPrecision,
                                                   labelDisplayUnits, maxVal), x:
                            centreCx - circleRadius / 3.5, y: centreCy + circleRadius / 16,
                        maxWidth: circleRadius / 2.2
                    }); // BCD
                    textProps.push({
                        val: this.getFormattedData(this.finalOtherObjectsValues[10], labelPrecision,
                                                   labelDisplayUnits, maxVal), x: (centreAx + centreCx) / 2,
                        y: (centreAy + centreCy) / 2 +
                            circleRadius / 16, maxWidth: circleRadius / 2.2
                    }); // ABCD

                    for (let iCounter: number = 0; iCounter < 13; iCounter++) {
                        let measureDataProperties: TextProperties;
                        measureDataProperties = {
                            fontFamily: 'Segoe UI,wf_segoe-ui_semibold,helvetica,arial,sans-serif',
                            fontSize: `${labelSettings.fontSize}px`,
                            text: textProps[iCounter].val
                        };
                        this.mainGroup.append('text')
                            .attr({
                                fill: labelSettings.color,
                                'font-size': `${labelSettings.fontSize}px`,
                                'text-anchor': 'middle',
                                x: textProps[iCounter].x,
                                y: textProps[iCounter].y
                            })
                            .text(textMeasurementService.getTailoredTextOrDefault(measureDataProperties, textProps[iCounter].maxWidth));
                    }
                }
                // tslint:disable-next-line:no-any
                const fullDataArr: any = this.finalUpdatedSingleObjectsValues.concat
                    (this.finalUpdatedOtherObjectsValues, this.finalOtherObjectsValues);
                // tslint:disable-next-line:no-any
                const maxVal: any = Math.max.apply(null, fullDataArr);
                // Add tooltip
                // tslint:disable-next-line:no-any
                const tooltipData: any = [];
                tooltipData.push({
                    key: this.finalSingleObjects[0], value: this
                        .getFormattedData(this.finalUpdatedSingleObjectsValues[0], 0, 1, maxVal)
                }); // A
                tooltipData.push({
                    key: this.finalSingleObjects[1], value: this
                        .getFormattedData(this.finalUpdatedSingleObjectsValues[1], 0, 1, maxVal)
                }); // B
                tooltipData.push({
                    key: this.finalSingleObjects[2], value: this
                        .getFormattedData(this.finalUpdatedSingleObjectsValues[2], 0, 1, maxVal)
                }); // C
                tooltipData.push({
                    key: this.finalSingleObjects[3], value: this
                        .getFormattedData(this.finalUpdatedSingleObjectsValues[3], 0, 1, maxVal)
                }); // D
                tooltipData.push({
                    key: `${this.finalSingleObjects[0]} & ${this
                        .finalSingleObjects[3]}`, value: this.getFormattedData(this.finalUpdatedOtherObjectsValues[4], 0, 1, maxVal)
                }); // AD
                tooltipData.push({
                    key: `${this.finalSingleObjects[2]} & ${this
                        .finalSingleObjects[3]}`, value: this.getFormattedData(this.finalUpdatedOtherObjectsValues[7], 0, 1, maxVal)
                }); // CD
                tooltipData.push({
                    key: `${this.finalSingleObjects[0]} & ${this
                        .finalSingleObjects[1]}`, value: this.getFormattedData(this.finalUpdatedOtherObjectsValues[0], 0, 1, maxVal)
                }); // AB
                tooltipData.push({
                    key: `${this.finalSingleObjects[1]} & ${this
                        .finalSingleObjects[2]}`, value: this.getFormattedData(this.finalUpdatedOtherObjectsValues[2], 0, 1, maxVal)
                }); // BC
                tooltipData.push({
                    key: `${this.finalSingleObjects[0]} & ${this
                        .finalSingleObjects[1]} & ${this.finalSingleObjects[2]}`, value: this
                            .getFormattedData(this.finalUpdatedOtherObjectsValues[3], 0, 1, maxVal)
                }); // ABC
                tooltipData.push({
                    key: `${this.finalSingleObjects[0]} & ${this
                        .finalSingleObjects[1]} & ${this.finalSingleObjects[3]}`, value: this
                            .getFormattedData(this.finalUpdatedOtherObjectsValues[6], 0, 1, maxVal)
                }); // ABD
                tooltipData.push({
                    key: `${this.finalSingleObjects[0]} & ${this
                        .finalSingleObjects[2]} & ${this.finalSingleObjects[3]}`, value: this
                            .getFormattedData(this.finalUpdatedOtherObjectsValues[8], 0, 1, maxVal)
                }); // ACD
                tooltipData.push({
                    key: `${this.finalSingleObjects[1]} & ${this
                        .finalSingleObjects[2]} & ${this.finalSingleObjects[3]}`, value: this
                            .getFormattedData(this.finalUpdatedOtherObjectsValues[9], 0, 1, maxVal)
                }); // BCD
                tooltipData.push({
                    key: `${this.finalSingleObjects[0]} & ${this
                        .finalSingleObjects[1]} & ${this.finalSingleObjects[2]} & ${this
                            .finalSingleObjects[3]}`, value: this.getFormattedData(this.finalOtherObjectsValues[10], 0, 1, maxVal)
                }); // ABCD

                this.svg.selectAll('path').data(tooltipData);
                this.svg.selectAll('text').data(tooltipData);

                this.tooltipServiceWrapper.addTooltip(this.svg.selectAll('path, text'),
                                                      (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                                                      (tooltipEvent: TooltipEventArgs<number>) => null);
            }

            // tslint:disable-next-line:no-any
            public draw(width: number, height: number, viewModel: any): void {
                const color: {} = {};
                for (let iCounter: number = 0; iCounter < viewModel.dataPoints.length; iCounter++) {
                    color[iCounter] = viewModel.dataPoints[iCounter].color;
                }
                const padding: number = 10;
                const radius: number = width / this.numberOfObjects;
                if (this.numberOfObjects === 1) {
                    this.drawOneObjects(width, height, Math.min(width, height) / 10, Math.min(width, height) / 10, color);
                } else if (this.numberOfObjects === 2) {
                    this.drawTwoObjects(width, height, Math.min(width, height) / 10, Math.min(width, height) / 10, color);
                } else if (this.numberOfObjects === 3) {
                    this.drawThreeObjects(width, height, Math.min(width, height) / 10, Math.min(width, height) / 10, color);
                } else if (this.numberOfObjects === 4) {
                    this.drawFourObjects(width, height, Math.min(width, height) / 10, Math.min(width, height) / 10, color);
                }
            }

            public getLabelSettings(dataView: DataView): ILabelSettings {
                let objects: DataViewObjects = null;
                const settings: ILabelSettings = this.getDefaultLabelSettings();

                if (!dataView.metadata || !dataView.metadata.objects) {
                    return settings;
                }
                objects = dataView.metadata.objects;
                let properties: {
                    labelSettings: {
                        color: DataViewObjectPropertyIdentifier;
                        displayUnits: DataViewObjectPropertyIdentifier;
                        fontSize: DataViewObjectPropertyIdentifier;
                        show: DataViewObjectPropertyIdentifier;
                        textPrecision: DataViewObjectPropertyIdentifier;
                    };
                    legend: {
                        decimalPlaces: DataViewObjectPropertyIdentifier;
                        displayUnits: DataViewObjectPropertyIdentifier;
                        show: DataViewObjectPropertyIdentifier;
                        showPrimary: DataViewObjectPropertyIdentifier;
                        titleText: DataViewObjectPropertyIdentifier;
                    };
                    opacity: {
                        externalArc: DataViewObjectPropertyIdentifier;
                        internalArc: DataViewObjectPropertyIdentifier;
                    };
                };
                properties = visualProperties;
                settings.show = DataViewObjects.getValue(objects, properties.labelSettings.show, settings.show);
                settings.color = DataViewObjects.getFillColor(objects, properties.labelSettings.color, settings.color);
                settings.fontSize = DataViewObjects.getValue(objects, properties.labelSettings.fontSize, settings.fontSize);
                settings.displayUnits = DataViewObjects.getValue(objects, properties.labelSettings.displayUnits, settings.displayUnits);
                settings.textPrecision = DataViewObjects.getValue(objects, properties.labelSettings.textPrecision, settings.textPrecision);
                settings.textPrecision = settings.textPrecision < 0 ? 0 : settings.textPrecision > 4 ? 4 : settings.textPrecision;

                return settings;
            }

            public getDefaultLabelSettings(): ILabelSettings {
                return {
                    color: '#000000',
                    displayUnits: 0,
                    fontSize: 12,
                    show: true,
                    textPrecision: 0
                };
            }

            public getLegendSettings(dataView: DataView): ILegendSetting {
                let objects: DataViewObjects = null;
                const settings: ILegendSetting = this.getDefaultLegendSettings();

                if (!dataView.metadata || !dataView.metadata.objects) {
                    return settings;
                }
                objects = dataView.metadata.objects;
                let properties: {
                    labelSettings: {
                        color: DataViewObjectPropertyIdentifier;
                        displayUnits: DataViewObjectPropertyIdentifier;
                        fontSize: DataViewObjectPropertyIdentifier;
                        show: DataViewObjectPropertyIdentifier;
                        textPrecision: DataViewObjectPropertyIdentifier;
                    };
                    legend: {
                        decimalPlaces: DataViewObjectPropertyIdentifier;
                        displayUnits: DataViewObjectPropertyIdentifier;
                        show: DataViewObjectPropertyIdentifier;
                        showPrimary: DataViewObjectPropertyIdentifier;
                        titleText: DataViewObjectPropertyIdentifier;
                    };
                    opacity: {
                        externalArc: DataViewObjectPropertyIdentifier;
                        internalArc: DataViewObjectPropertyIdentifier;
                    };
                };
                properties = visualProperties;
                settings.show = DataViewObjects.getValue(objects, properties.legend.show, settings.show);
                settings.titleText = DataViewObjects.getValue(objects, properties.legend.titleText, settings.titleText);
                settings.displayUnits = DataViewObjects.getValue(objects, properties.legend.displayUnits, settings.displayUnits);
                settings.decimalPlaces = DataViewObjects.getValue(objects, properties.legend.decimalPlaces, settings.decimalPlaces);
                settings.decimalPlaces = settings.decimalPlaces < 0 ? 0 : settings.decimalPlaces > 4 ? 4 : settings.decimalPlaces;
                settings.showPrimary = DataViewObjects.getValue(objects, properties.legend.showPrimary, settings.showPrimary);

                return settings;
            }

            public getDefaultLegendSettings(): ILegendSetting {
                return {
                    decimalPlaces: 0,
                    displayUnits: 0,
                    show: true,
                    titleText: 'Legend',
                    showPrimary: true
                };
            }

            public getDefaultOpacity(): IOpacitySettings {
                return {
                    externalArc: 100,
                    internalArc: 50
                };
            }

            public getOpacitySettings(dataView: DataView): IOpacitySettings {
                const opSettings: IOpacitySettings = this.getDefaultOpacity();
                let objects: DataViewObjects = null;
                if (!dataView.metadata || !dataView.metadata.objects) {
                    return opSettings;
                }
                objects = dataView.metadata.objects;
                let properties: {
                    externalArc: DataViewObjectPropertyIdentifier;
                    internalArc: DataViewObjectPropertyIdentifier;
                };
                properties = visualProperties.opacity;
                opSettings.externalArc = DataViewObjects.getValue(objects, properties.externalArc, opSettings.externalArc);
                opSettings.externalArc = opSettings.externalArc > 10 ? opSettings.externalArc : 10;
                opSettings.internalArc = DataViewObjects.getValue(objects, properties.internalArc, opSettings.internalArc);
                opSettings.internalArc = opSettings.internalArc > 10 ? opSettings.internalArc : 10;

                return opSettings;
            }

            public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
                const objectName: string = options.objectName;
                const labelSettings: ILabelSettings = this.getLabelSettings(this.dataViews);
                const legendSettings: ILegendSetting = this.getLegendSettings(this.dataViews);
                const opSettings: IOpacitySettings = this.getOpacitySettings(this.dataViews);
                const legendData: LegendData = this.getLegendData(this.dataViews, this.vennPoints, this.host);
                const metadataColumns: DataViewMetadataColumn[] = this.dataView.metadata.columns;
                const objectEnumeration: VisualObjectInstance[] = [];
                switch (objectName) {
                    case 'legend':
                        objectEnumeration.push({
                            displayName: 'Legend',
                            objectName: 'legend',
                            properties: {
                                show: legendSettings.show,
                                // tslint:disable-next-line:object-literal-sort-keys
                                position: LegendPosition[this.legend.getOrientation()],
                                showTitle: powerbi.extensibility.utils.dataview.DataViewObject
                                    .getValue(this.legendObjectProperties,
                                              powerbi.extensibility.utils.chart.legend.legendProps.showTitle, true),
                                titleText: legendSettings.titleText,
                                labelColor: powerbi.extensibility.utils.dataview.DataViewObject
                                    .getValue(this.legendObjectProperties,
                                              powerbi.extensibility.utils.chart.legend.legendProps.labelColor, null),
                                fontSize: powerbi.extensibility.utils.dataview.DataViewObject
                                    .getValue(this.legendObjectProperties,
                                              powerbi.extensibility.utils.chart.legend.legendProps.fontSize, 8),
                                labelDisplayUnits: legendSettings.displayUnits,
                                labelPrecision: legendSettings.decimalPlaces,
                                showPrimary: powerbi.extensibility.utils.dataview.DataViewObject
                                    .getValue(this.legendObjectProperties,
                                              powerbi.extensibility.utils.chart.legend.legendProps.showPrimary, true)
                            },
                            selector: null
                        });
                        break;
                    case 'colors':
                        const dataLen: number = this.vennPoints.length;
                        for (let i: number = 0; i < dataLen; i++) {
                            const vennPoint: IVennDataPoint = this.vennPoints[i];
                            // tslint:disable-next-line:no-any
                            const catName: any = this.finalSingleObjects[i] ? this.finalSingleObjects[i] : this.vennPoints[i].category;
                            objectEnumeration.push({
                                displayName: catName,
                                objectName: objectName,
                                properties: {
                                    colorToFill: {
                                        solid: {
                                            color: vennPoint.color
                                        }
                                    }
                                },
                                selector: vennPoint.selectionId
                            });

                        }
                        break;
                    case 'labelSettings':
                        objectEnumeration.push({
                            displayName: 'Labels',
                            objectName: objectName,
                            properties: {
                                show: labelSettings.show,
                                // tslint:disable-next-line:object-literal-sort-keys
                                color: labelSettings.color,
                                fontSize: labelSettings.fontSize,
                                displayUnits: labelSettings.displayUnits,
                                textPrecision: labelSettings.textPrecision
                            },
                            selector: null
                        });
                        break;
                    case 'opacity':
                        objectEnumeration.push({
                            displayName: 'opacity',
                            objectName: objectName,
                            properties: {
                                external: opSettings.externalArc,
                                internal: opSettings.internalArc
                            },
                            selector: null
                        });
                        break;
                    default:
                        break;
                }

                return objectEnumeration;
            }

            public getSettings(objects: DataViewObjects): boolean {
                let settingsChanged: boolean = false;
                if (typeof this.settings === 'undefined' || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
                    this.settings = {
                    };
                    settingsChanged = true;
                }
                this.prevDataViewObjects = objects;

                return settingsChanged;
            }

            // tslint:disable-next-line:no-any
            private getTooltipData(value: any): VisualTooltipDataItem[] {

                return [{
                    displayName: value && value.key ? value.key : '',
                    value: value && value.value ? value.value.toString() : ''
                }];
            }
        }
    }
