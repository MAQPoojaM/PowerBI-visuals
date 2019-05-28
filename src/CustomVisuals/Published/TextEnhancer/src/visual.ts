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

    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

    export module DataViewObjects {
        /** Gets the value of the given object/property pair. */
        export function getValue<T>(objects: DataViewObjects,
                                    propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T {
            if (!objects) {
                return defaultValue;
            }
            const objectOrMap: DataViewObject = objects[propertyId.objectName];
            const object: DataViewObject = objectOrMap as DataViewObject;

            return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
        }

        /** Gets an object from objects. */
        export function getObject(objects: DataViewObjects,
                                  objectName: string, defaultValue?: DataViewObject): DataViewObject {
            if (objects && objects[objectName]) {
                const object: DataViewObject = objects[objectName] as DataViewObject;

                return object;
            } else {
                return defaultValue;
            }
        }

        /** Gets a map of user-defined objects. */
        export function getUserDefinedObjects(objects: DataViewObjects, objectName: string): DataViewObjectMap {
            if (objects && objects[objectName]) {
                const map: DataViewObjectMap = objects[objectName] as DataViewObjectMap;

                return map;
            }
        }

        /** Gets the solid color from a fill property. */
        export function getFillColor(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier,
                                     defaultColor?: string): string {
            const value: Fill = getValue(objects, propertyId);
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
            const propertyValue: T = object[propertyName] as T;
            if (propertyValue === undefined) {
                return defaultValue;
            }

            return propertyValue;
        }

        /** Gets the solid color from a fill property using only a propertyName */
        export function getFillColorByPropertyName(objects: DataViewObjects,
                                                   propertyName: string, defaultColor?: string): string {
            const value: Fill = DataViewObject.getValue(objects, propertyName);
            if (!value || !value.solid) {
                return defaultColor;
            }

            return value.solid.color;
        }
    }

    export interface ITextSettings {
        color: string;
        transparency: number;
        fontSize: number;
        alignment: string;
        alignmentV: string;
        direction: string;
        letterSpacing: number;
        lineHeight: number;
        wordSpacing: number;
        perspective: number;
        textIndent: number;
        lineIndent: number;
        textRotate: number;
        skewX: number;
        skewY: number;
    }

    export interface IStaticTextSettings {
        showColon: boolean;
        textPosition: string;
        textDecoration: string;
        textTransform: string;
        textShadow: string;
        textShadowBlur: string;
        textShadowColor: string;
        fontWeight: string;
        backgroundcolor: string;
        transparency: number;
        fontFamily: string;
        boldStyle: boolean;
        underline: boolean;
        overline: boolean;
        strikethrough: boolean;
        italicStyle: boolean;
        postText: string;
    }

    export interface IDynamicTextContainer {
        textContainer: string;
        lengthContainer: number;
    }

    export interface IDynamicTextSettings {
        backgroundcolor: string;
        transparency: number;
        textDecoration: string;
        textTransform: string;
        textShadow: string;
        textShadowBlur: string;
        textShadowColor: string;
        fontWeight: string;
        fontFamily: string;
        boldStyle: boolean;
        underline: boolean;
        overline: boolean;
        strikethrough: boolean;
        italicStyle: boolean;
    }
    export let questTextProperties: {
        textSettings: {
            color: DataViewObjectPropertyIdentifier;
            transparency: DataViewObjectPropertyIdentifier;
            fontSize: DataViewObjectPropertyIdentifier;
            postText: DataViewObjectPropertyIdentifier;
            alignment: DataViewObjectPropertyIdentifier;
            alignmentV: DataViewObjectPropertyIdentifier;
            direction: DataViewObjectPropertyIdentifier;
            letterSpacing: DataViewObjectPropertyIdentifier;
            lineHeight: DataViewObjectPropertyIdentifier;
            wordSpacing: DataViewObjectPropertyIdentifier;
            perspective: DataViewObjectPropertyIdentifier;
            textIndent: DataViewObjectPropertyIdentifier;
            lineIndent: DataViewObjectPropertyIdentifier;
            textRotate: DataViewObjectPropertyIdentifier;
            skewX: DataViewObjectPropertyIdentifier;
            skewY: DataViewObjectPropertyIdentifier;
        };
        staticTextSettings: {
            showColon: DataViewObjectPropertyIdentifier;
            textPosition: DataViewObjectPropertyIdentifier;
            textDecoration: DataViewObjectPropertyIdentifier;
            textTransform: DataViewObjectPropertyIdentifier;
            textShadow: DataViewObjectPropertyIdentifier;
            textShadowBlur: DataViewObjectPropertyIdentifier;
            textShadowColor: DataViewObjectPropertyIdentifier;
            fontWeight: DataViewObjectPropertyIdentifier;
            backgroundcolor: DataViewObjectPropertyIdentifier;
            transparency: DataViewObjectPropertyIdentifier;
            postText: DataViewObjectPropertyIdentifier;
            fontFamily: DataViewObjectPropertyIdentifier;
            boldStyle: DataViewObjectPropertyIdentifier;
            italicStyle: DataViewObjectPropertyIdentifier;
            underline: DataViewObjectPropertyIdentifier;
            overline: DataViewObjectPropertyIdentifier;
            strikethrough: DataViewObjectPropertyIdentifier;
        };
        dynamicSettings: {
            backgroundcolor: DataViewObjectPropertyIdentifier;
            transparency: DataViewObjectPropertyIdentifier;
            textDecoration: DataViewObjectPropertyIdentifier;
            textTransform: DataViewObjectPropertyIdentifier;
            textShadow: DataViewObjectPropertyIdentifier;
            textShadowBlur: DataViewObjectPropertyIdentifier;
            textShadowColor: DataViewObjectPropertyIdentifier;
            fontWeight: DataViewObjectPropertyIdentifier;
            fontFamily: DataViewObjectPropertyIdentifier;
            boldStyle: DataViewObjectPropertyIdentifier;
            italicStyle: DataViewObjectPropertyIdentifier;
            underline: DataViewObjectPropertyIdentifier;
            overline: DataViewObjectPropertyIdentifier;
            strikethrough: DataViewObjectPropertyIdentifier;
        }
    };

    questTextProperties = {
        dynamicSettings: {
            backgroundcolor: { objectName: "Settings",
            propertyName: "backgroundcolor" } as DataViewObjectPropertyIdentifier,
            boldStyle: { objectName: "Settings", propertyName: "boldStyle" } as DataViewObjectPropertyIdentifier,
            fontFamily: { objectName: "Settings", propertyName: "fontFamily" } as DataViewObjectPropertyIdentifier,
            fontWeight: { objectName: "Settings", propertyName: "fontWeight" } as DataViewObjectPropertyIdentifier,
            italicStyle: { objectName: "Settings", propertyName: "italicStyle" } as DataViewObjectPropertyIdentifier,
            overline: { objectName: "Settings", propertyName: "overline" } as DataViewObjectPropertyIdentifier,
            strikethrough: { objectName: "Settings",
            propertyName: "strikethrough" } as DataViewObjectPropertyIdentifier,
            textDecoration: { objectName: "Settings",
            propertyName: "textDecoration" } as DataViewObjectPropertyIdentifier,
            textShadow: { objectName: "Settings", propertyName: "textShadow" } as DataViewObjectPropertyIdentifier,
            textShadowBlur: { objectName: "Settings",
            propertyName: "textShadowBlur" } as DataViewObjectPropertyIdentifier,
            textShadowColor: { objectName: "Settings",
            propertyName: "textShadowColor" } as DataViewObjectPropertyIdentifier,
            textTransform: { objectName: "Settings",
            propertyName: "textTransform" } as DataViewObjectPropertyIdentifier,
            transparency: { objectName: "Settings", propertyName: "transparency" } as DataViewObjectPropertyIdentifier,
            underline: { objectName: "Settings", propertyName: "underline" } as DataViewObjectPropertyIdentifier
        },
        staticTextSettings: {
            backgroundcolor: { objectName: "staticText",
            propertyName: "backgroundcolor" } as DataViewObjectPropertyIdentifier,
            boldStyle: { objectName: "staticText", propertyName: "boldStyle" } as DataViewObjectPropertyIdentifier,
            fontFamily: { objectName: "staticText", propertyName: "fontFamily" } as DataViewObjectPropertyIdentifier,
            fontWeight: { objectName: "staticText", propertyName: "fontWeight" } as DataViewObjectPropertyIdentifier,
            italicStyle: { objectName: "staticText", propertyName: "italicStyle" } as DataViewObjectPropertyIdentifier,
            overline: { objectName: "staticText", propertyName: "overline" } as DataViewObjectPropertyIdentifier,
            postText: { objectName: "staticText", propertyName: "postText" } as DataViewObjectPropertyIdentifier,
            showColon: { objectName: "staticText", propertyName: "showColon" } as DataViewObjectPropertyIdentifier,
            strikethrough: { objectName: "staticText",
            propertyName: "strikethrough" } as DataViewObjectPropertyIdentifier,
            textDecoration: { objectName: "staticText",
            propertyName: "textDecoration" } as DataViewObjectPropertyIdentifier,
            textPosition: { objectName: "staticText",
            propertyName: "textPosition" } as DataViewObjectPropertyIdentifier,
            textShadow: { objectName: "staticText", propertyName: "textShadow" } as DataViewObjectPropertyIdentifier,
            textShadowBlur: { objectName: "staticText",
            propertyName: "textShadowBlur" } as DataViewObjectPropertyIdentifier,
            textShadowColor: { objectName: "staticText",
            propertyName: "textShadowColor" } as DataViewObjectPropertyIdentifier,
            textTransform: { objectName: "staticText",
            propertyName: "textTransform" } as DataViewObjectPropertyIdentifier,
            transparency: { objectName: "staticText",
            propertyName: "transparency" } as DataViewObjectPropertyIdentifier,
            underline: { objectName: "staticText", propertyName: "underline" } as DataViewObjectPropertyIdentifier
        },
        textSettings: {
            alignment: { objectName: "textSettings", propertyName: "alignment" } as DataViewObjectPropertyIdentifier,
            alignmentV: { objectName: "textSettings", propertyName: "alignmentV" } as DataViewObjectPropertyIdentifier,
            color: { objectName: "textSettings", propertyName: "color" } as DataViewObjectPropertyIdentifier,
            direction: { objectName: "textSettings", propertyName: "direction" } as DataViewObjectPropertyIdentifier,
            fontSize: { objectName: "textSettings", propertyName: "fontSize" } as DataViewObjectPropertyIdentifier,
            letterSpacing: { objectName: "textSettings",
            propertyName: "letterSpacing" } as DataViewObjectPropertyIdentifier,
            lineHeight: { objectName: "textSettings", propertyName: "lineHeight" } as DataViewObjectPropertyIdentifier,
            lineIndent: { objectName: "textSettings", propertyName: "lineIndent" } as DataViewObjectPropertyIdentifier,
            perspective: { objectName: "textSettings",
            propertyName: "perspective" } as DataViewObjectPropertyIdentifier,
            postText: { objectName: "textSettings", propertyName: "postText" } as DataViewObjectPropertyIdentifier,
            skewX: { objectName: "textSettings", propertyName: "skewX" } as DataViewObjectPropertyIdentifier,
            skewY: { objectName: "textSettings", propertyName: "skewY" } as DataViewObjectPropertyIdentifier,
            textIndent: { objectName: "textSettings", propertyName: "textIndent" } as DataViewObjectPropertyIdentifier,
            textRotate: { objectName: "textSettings", propertyName: "textRotate" } as DataViewObjectPropertyIdentifier,
            transparency: { objectName: "textSettings",
            propertyName: "transparency" } as DataViewObjectPropertyIdentifier,
            wordSpacing: { objectName: "textSettings", propertyName: "wordSpacing" }as DataViewObjectPropertyIdentifier
        },
    };

    export class TextEnhancer implements IVisual {
        private eventService: IVisualEventService ;
        private target: d3.Selection<HTMLElement>;
        private dataViews: DataView;
        private staticTextSettings: IStaticTextSettings;
        private dynamicSettings: IDynamicTextSettings;
        private finalTextContainer: d3.Selection<HTMLElement>;
        private visualHost: IVisualHost;
        constructor(options: VisualConstructorOptions) {
            this.visualHost = options.host;
            this.eventService = options.host.eventService;
            this.target = d3.select(options.element);
            this.target.style({
                cursor: "default"
            });
        }

        public pointToPixel(pt: number): string {
            const pxPtRatio: number = 4 / 3;
            const pixelString: string = "px";

            return (pt * pxPtRatio) + pixelString;
        }

        public letSpace(ls: number): string {
            const pixelString: string = "px";

            return ls + pixelString;
        }

        public getLineHeight(lh: number): string {
            lh = lh == null ? 1.5 : lh;
            const pixelString: string = "";

            return lh + pixelString;
        }

        public getWordSpace(ws: number): string {
            const pixelString: string = "px";

            return ws + pixelString;
        }

        public getTextIndent(ti: number): string {
            ti = ti == null ? 0 : ti;
            const pixelString: string = "px";

            return ti + pixelString;
        }

        public getLineIndent(ti: number): string {
            ti = ti == null ? 0 : ti;
            const pixelString: string = "px";

            return ti + pixelString;
        }

        public getTextShadow(position: string, blur: string, color: string): string {
            let a: number = 0;
            let b: number = 0;
            let c: number = 0;
            switch (position) {
                case "none":
                    return "";
                case "topleft":
                    a = -2;
                    b = -2;
                    break;
                case "topcenter":
                    a = 0;
                    b = -2;
                    break;
                case "topright":
                    a = 2;
                    b = -2;
                    break;
                case "middleleft":
                    a = -2;
                    b = 0;
                    break;
                case "middlecenter":
                    a = 0;
                    b = 0;
                    break;
                case "middleright":
                    a = 2;
                    b = 0;
                    break;
                case "bottomleft":
                    a = -2;
                    b = 2;
                    break;
                case "bottomcenter":
                    a = 0;
                    b = 2;
                    break;
                case "bottomright":
                    a = 2;
                    b = 2;
                    break;
                default : break;
            }
            switch (blur) {
                case "low":
                    c = 2;
                    break;
                case "medium":
                    c = 8;
                    break;
                case "high":
                    c = 14;
                    break;
                default: break;
            }
            const pixelString: string = "px";

            return `${a}${pixelString} ${b}${pixelString} ${c}${pixelString} ${color}`;
        }

        public getPerspective(fw: number): string {
            const pixelString: string = "px";

            return fw + pixelString;
        }

        public getSkew(sk: number): string {
            sk = sk == null ? 0 : sk;
            const pixelString: string = "deg";

            return sk + pixelString;
        }

        public getSkewString(sx: number, sy: number): string {
            const skewString: string = `skewX(${this.getSkew(sx)}) skewY(${this.getSkew(sy)} )`;

            return skewString;
        }

        // tslint:disable-next-line:no-any
        public getDecimalPlacesCount(value: any): number {
            let decimalPlaces: number = 0;
            if (value > 0) {
                const arr: string[] = value.toString().split(".");
                if (!arr[1] && parseFloat(arr[1]) > 0) {
                    decimalPlaces = arr[1].length;
                }
            }

            return decimalPlaces;
        }

        public getDynamicTextValue(dataView: DataView): IDynamicTextContainer {
            // tslint:disable-next-line:no-any
            let textValDynamicInput: any;
            let valueLength: number = 0;
            if (dataView && dataView.categorical) {
                if (dataView.categorical.categories && dataView.categorical.categories[0] &&
                    dataView.categorical.categories[0].values) {
                    valueLength = dataView.categorical.categories[0].values.length;
                    textValDynamicInput = valueLength ? dataView.categorical.categories[0].values[0] : "(blank)";
                    if (dataView.categorical.categories[0].source && dataView.categorical.categories[0].source.format) {
                        const formatter: utils.formatting.IValueFormatter = valueFormatter.create({
                            format: dataView.categorical.categories[0].source.format
                        });
                        textValDynamicInput = formatter.format(textValDynamicInput);
                    }
                } else if (dataView.categorical.values && dataView.categorical.values[0] &&
                    dataView.categorical.values[0].values) {
                    valueLength = dataView.categorical.values[0].values.length;
                    textValDynamicInput = dataView.categorical.values[0].values[0] ?
                    dataView.categorical.values[0].values[0] : 0;
                    if (dataView.categorical.values[0] && dataView.categorical.values[0].source
                        && dataView.categorical.values[0].source.format) {
                        let decimalPlaces: number = this.getDecimalPlacesCount(textValDynamicInput);
                        decimalPlaces = decimalPlaces > 4 ? 4 : decimalPlaces;
                        const formatter: utils.formatting.IValueFormatter = valueFormatter.create({
                            format: dataView.categorical.values[0].source.format, precision: decimalPlaces, value: 1
                        });
                        textValDynamicInput = formatter.format(textValDynamicInput);
                    }
                }
                const obj: IDynamicTextContainer = {
                    lengthContainer: valueLength,
                    textContainer: textValDynamicInput
                };

                return obj;
            }
        }

        public getFontStyleClassName(settings: IDynamicTextSettings | IStaticTextSettings): string {
            let fontStyleClassName: string = "";
            if (settings.italicStyle) {
                fontStyleClassName = "tw_italic";
            }

            return fontStyleClassName;
        }

        public getTextDecoration(settings: IDynamicTextSettings | IStaticTextSettings): string {
            let textDecorationName: string = "";
            if (settings.underline) {
                textDecorationName += "underline ";
            }
            if (settings.overline) {
                textDecorationName += "overline ";
            }
            if (settings.strikethrough) {
                textDecorationName += "line-through ";
            }

            return textDecorationName;
        }

        public convertHex(hex: string): string {
            hex = hex.replace("#", "");
            const r: number = parseInt(hex.substring(0, 2), 16);
            const g: number = parseInt(hex.substring(2, 4), 16);
            const b: number = parseInt(hex.substring(4, 6), 16);
            const result: string = `rgb(${r},${g},${b})`;

            return result;
        }

        public getOpacityHex(transparency: number): string {
            transparency = (100 - transparency);
            if (transparency === 100) {
                return "";
            } else {
                return transparency <= 6 ? `0${Math.round((transparency / 100) * 255).toString(16).toUpperCase()}` :
                Math.round((transparency / 100) *  255).toString(16).toUpperCase();
            }
        }

        public toRadians(angle: number): number {
            return angle * (Math.PI / 180);
        }

        public getFontWeight(settings: IDynamicTextSettings | IStaticTextSettings): string {
            if (settings.boldStyle) {
                return "bold";
            } else {
                return "normal";
            }
        }

        public getTextTransform(settings: IDynamicTextSettings | IStaticTextSettings): string {
            return settings.textTransform;
        }

        public update(options: VisualUpdateOptions): void {
            try {
            this.eventService.renderingStarted(options);
            const textDynamic = (".dynamicText");
            this.target.selectAll(".tw_value").remove();
            const dataView: DataView = this.dataViews = options.dataViews[0];
            let valueLength: number = 0;
            const textSettings: ITextSettings = this.getTextSettings(dataView);
            this.dynamicSettings = this.getDynamicTextSettings(dataView);
            this.staticTextSettings = this.getStaticTextSettings(dataView);
            let textValDynamicInput: string;
            let textValStaticInput: string;
            textValStaticInput = this.staticTextSettings.postText;
            this.staticTextSettings.postText = textValStaticInput;
            const valuesContainer: IDynamicTextContainer = this.getDynamicTextValue(dataView);
            textValDynamicInput = valuesContainer.textContainer;
            const textFontSize: number = textSettings.fontSize;
            const letSpacing: number = textSettings.letterSpacing;
            const wordSpace: number = textSettings.wordSpacing;
            const lHeight: number = textSettings.lineHeight;
            const pers: number = textSettings.perspective > 0 ? 100 - textSettings.perspective + 1 : 0;
            const inden: number = textSettings.textIndent;
            let textRotationVal: number = textSettings.textRotate == null ? 0 : textSettings.textRotate;
            const textTrans: string = this.getTextTransform(this.staticTextSettings);
            const textTransD: string = this.getTextTransform(this.dynamicSettings);
            const dynamictextFontFamily: string = this.dynamicSettings.fontFamily;
            const staticTextFontFamily: string = this.staticTextSettings.fontFamily;
            const dynfontStyleClass: string = this.getFontStyleClassName(this.dynamicSettings);
            const staticfontStyleClass: string = this.getFontStyleClassName(this.staticTextSettings);
            const statictextDecoration: string = this.getTextDecoration(this.staticTextSettings);
            const dyntextDecoration: string = this.getTextDecoration(this.dynamicSettings);
            const statictextShadow: string = this.getStaticTextSettings(dataView).textShadow;
            const statictextShadowBlur: string = this.getStaticTextSettings(dataView).textShadowBlur;
            const statictextShadowColor: string = this.getStaticTextSettings(dataView).textShadowColor;
            const dyntextShadow: string = this.getDynamicTextSettings(dataView).textShadow;
            const dyntextShadowBlur: string = this.getDynamicTextSettings(dataView).textShadowBlur;
            const dyntextShadowColor: string = this.getDynamicTextSettings(dataView).textShadowColor;
            const staticfontwgt: string = this.getFontWeight(this.staticTextSettings);
            const dynfontwgt: string = this.getFontWeight(this.dynamicSettings);
            const textSkewX: number = textSettings.skewX;
            const textSkewY: number = textSettings.skewY;
            let textValStatic: string = "";
            let textValDynamic: string = "";
            valueLength = valuesContainer.lengthContainer;
            // Text Formatting
            if (valueLength === 1) {
                const original: d3.Selection<HTMLElement> = this.target.append("div")
                    .classed("tw_value tw_finalText", true)
                    .style("font-size", this.pointToPixel(textFontSize))
                    .style("letter-spacing", this.letSpace(letSpacing))
                    .style("word-spacing", this.getWordSpace(wordSpace))
                    .style("line-height", this.getLineHeight(lHeight))
                    .style("text-indent", this.getTextIndent(inden))
                    .style("color", textSettings.color +
                        this.getOpacityHex(textSettings.transparency == null ? 0 : textSettings.transparency))
                    .style("transform", this.getSkewString(textSkewX, textSkewY))
                    .style("width", "fit-content");

                textValStatic = textValStaticInput;
                textValDynamic = textValDynamicInput;
            } else {
                let errMsg: string = "";
                if (valueLength > 1) {
                    errMsg = "Query returned more than one row, please filter data to return one row";
                } else if (valueLength === 0) {
                    errMsg = "Query contains null value";
                }
                const original: d3.Selection<HTMLElement> = this.target.append("div")
                    .classed("tw_value errormsg", true)
                    .text(errMsg)
                    .attr("title", errMsg)
                    .style("font-size", this.pointToPixel(textFontSize))
                    .style("letter-spacing", this.letSpace(letSpacing))
                    .style("word-spacing", this.getWordSpace(wordSpace))
                    .style("line-height", this.getLineHeight(lHeight))
                    .style("text-indent", this.getTextIndent(inden))
                    .style("perspective", this.getPerspective(pers))
                    .style("font-family", "Segoe UI Semibold")
                    .style("color", "#777777")
                    .style("transform", this.getSkewString(textSkewX, textSkewY));
            }
            let url;
            // To check if url field exists
            if (dataView.categorical.categories !== undefined) {
            for (const iterator of options.dataViews[0].categorical.categories) {
                        if (iterator.source.type[`category`]
                            === "WebUrl" && iterator.source.roles.URL) {
                            url = (iterator.values.toString());
                        }
                    }
                }  else {
                    if (dataView.categorical.values[0].source.roles.URL) {
                        if (dataView.categorical.values[0].source.type[`category`]
                            === "WebUrl") {
                            url = (dataView.categorical.values[0].values.toString());
                        }
                    }
                }
            // Text Direction
            let textAlign: string = textSettings.alignment;
            let writingMode: string = textSettings.direction;
            switch (textSettings.direction) {
                case "vertical-lr":
                    textRotationVal = 180 + textRotationVal;
                    writingMode = "tb-rl";
                    break;
                case "vertical-rl":
                    writingMode = "tb-rl";
                    break;
                case "horizontal-bt":
                    textRotationVal = 180 + textRotationVal;
                    textAlign = textAlign === "left" ? "right" : (textAlign === "right" ? "left" : "center");
                    writingMode = "horizontal-tb";
                    break;
                default: break;
            }
            const element: string = d3.select(".tw_finalText").style("transform");
            const newTransform: string =  `${element} rotate(${textRotationVal}deg)`;
            this.finalTextContainer = d3.select(".tw_finalText")
                .style("text-align", textAlign)
                .style("writing-mode", writingMode)
                .style("transform", newTransform);

            // Vertical Alignment & Line Indentation
            const paddingVal: number = textSettings.lineIndent >= 0 ?
            textSettings.lineIndent : (-textSettings.lineIndent);
            let transformed: string = "";
            let paddingType: string = "";
            let positionName: string = "";
            let positionVal: string = "";
            const propVal: string = this.finalTextContainer.style("transform");
            switch (textSettings.alignmentV) {
                case "top": {
                            switch (textSettings.direction) {
                                case "horizontal-tb": {
                                                        transformed = `${propVal} translate(0%, 0%)`;
                                                        paddingType = textSettings.lineIndent >= 0 ?
                                                        "padding-top" : "padding-bottom";
                                                        positionName = "top";
                                                        positionVal = "0%";

                                                        if (textSettings.alignment === "right") {
                                                            this.finalTextContainer.style("float", "right");
                                                        } else if (textSettings.alignment === "center") {
                                                            this.finalTextContainer.style("width", "");
                                                            }
                                                      }
                                                      break;
                                case "horizontal-bt": {
                                                        transformed = `${propVal}  translate(0%, 0%)`;
                                                        paddingType = textSettings.lineIndent >= 0 ?
                                                        "padding-bottom" : "padding-top";
                                                        positionName = "top";
                                                        positionVal = "0%";

                                                        if (textSettings.alignment === "right") {
                                                            this.finalTextContainer.style("float", "right");
                                                        } else if (textSettings.alignment === "center") {
                                                            this.finalTextContainer.style("width", "");
                                                            }
                                                      }
                                                      break;
                                case "vertical-rl": {
                                                        if (textSettings.alignment === "center") {
                                                            transformed = `${propVal}  translate(-50%, 0%)`;
                                                            paddingType = textSettings.lineIndent >= 0 ?
                                                            "padding-right" : "padding-left";
                                                            positionName = "left";
                                                            positionVal = "50%";
                                                        } else if (textSettings.alignment === "right") {
                                                            transformed = `${propVal}  translate(-100%, 0%)`;
                                                            paddingType = textSettings.lineIndent >= 0 ?
                                                            "padding-right" : "padding-left";
                                                            positionName = "left";
                                                            positionVal = "100%";
                                                        } else if (textSettings.alignment === "left") {
                                                            transformed = `${propVal}  translate(0%, 0%)`;
                                                            paddingType = textSettings.lineIndent >= 0 ?
                                                            "padding-right" : "padding-left";
                                                            positionName = "top";
                                                            positionVal = "0%";
                                                        }
                                                    }
                                                    break;
                                case "vertical-lr": {
                                                        if (textSettings.alignment === "center") {
                                                            transformed = `${propVal}  translate(50%, 0%)`;
                                                            paddingType = textSettings.lineIndent >= 0 ?
                                                            "padding-left" : "padding-right";
                                                            positionName = "left";
                                                            positionVal = "50%";
                                                        } else if (textSettings.alignment === "right") {
                                                            transformed = `${propVal}  translate(100%, 0%)`;
                                                            paddingType = textSettings.lineIndent >= 0 ?
                                                            "padding-left" : "padding-right";
                                                            positionName = "left";
                                                            positionVal = "100%";
                                                        } else if (textSettings.alignment === "left") {
                                                            transformed = `${propVal}  translate(0%, 0%)`;
                                                            paddingType = textSettings.lineIndent >= 0 ?
                                                            "padding-left" : "padding-right";
                                                            positionName = "top";
                                                            positionVal = "0%";
                                                        }
                                                    }
                                                    break;
                                default: break;
                            }
                }           break;

                case "middle": {
                    positionName = "top";
                    positionVal = "50%";
                    switch (textSettings.direction) {
                        case "horizontal-tb":   {
                                                    transformed = `${propVal}  translate(0%, -50%)`;
                                                    paddingType = textSettings.lineIndent >= 0 ?
                                                    "padding-top" : "padding-bottom";

                                                    if (textSettings.alignment === "right") {
                                                        this.finalTextContainer.style("float", "right");
                                                    } else if (textSettings.alignment === "center") {
                                                        this.finalTextContainer.style("width", "");
                                                        }
                                                }
                                                break;
                        case "horizontal-bt":   {
                                                    transformed = `${propVal}  translate(0%, 50%)`;
                                                    paddingType = textSettings.lineIndent >= 0 ?
                                                    "padding-bottom" : "padding-top";

                                                    if (textSettings.alignment === "right") {
                                                        this.finalTextContainer.style("float", "right");
                                                    } else if (textSettings.alignment === "center") {
                                                        this.finalTextContainer.style("width", "");
                                                        }
                                                }
                                                break;
                        case "vertical-rl": {
                                                if (textSettings.alignment === "center") {
                                                    transformed = `${propVal}  translate(-50%, -50%)`;
                                                    paddingType = textSettings.lineIndent >= 0 ?
                                                    "padding-right" : "padding-left";
                                                    this.finalTextContainer = this.finalTextContainer
                                                        .style("left", "50%");
                                                } else if (textSettings.alignment === "right") {
                                                    transformed = `${propVal}  translate(-100%, -50%)`;
                                                    paddingType = textSettings.lineIndent >= 0 ?
                                                    "padding-right" : "padding-left";
                                                    this.finalTextContainer = this.finalTextContainer
                                                        .style("left", "100%");
                                                } else if (textSettings.alignment === "left") {
                                                    transformed = `${propVal}  translate(0%, -50%)`;
                                                    paddingType = textSettings.lineIndent >= 0 ?
                                                    "padding-right" : "padding-left";
                                                }
                                            }
                                            break;
                        case "vertical-lr": {
                                                if (textSettings.alignment === "center") {
                                                    transformed = `${propVal}  translate(50%, 50%)`;
                                                    paddingType = textSettings.lineIndent >= 0 ?
                                                    "padding-left" : "padding-right";
                                                    this.finalTextContainer = this.finalTextContainer
                                                        .style("left", "50%");
                                                } else if (textSettings.alignment === "right") {
                                                    transformed = `${propVal}  translate(100%, 50%)`;
                                                    paddingType = textSettings.lineIndent >= 0 ?
                                                    "padding-left" : "padding-right";
                                                    this.finalTextContainer = this.finalTextContainer
                                                        .style("left", "100%");
                                                } else if (textSettings.alignment === "left") {
                                                    transformed = `${propVal}  translate(0%, 50%)`;
                                                    paddingType = textSettings.lineIndent >= 0 ?
                                                    "padding-left" : "padding-right";
                                                }
                                            }
                                            break;
                        default: break;
                    }
                }              break;

                case "bottom": {
                    positionName = "top";
                    positionVal = "100%";
                    switch (textSettings.direction) {
                        case "horizontal-tb":   {
                                                    transformed = `${propVal}  translate(0%, -100%)`;
                                                    paddingType = textSettings.lineIndent >= 0 ?
                                                    "padding-top" : "padding-bottom";

                                                    if (textSettings.alignment === "right") {
                                                        this.finalTextContainer.style("float", "right");
                                                    } else if (textSettings.alignment === "center") {
                                                        this.finalTextContainer.style("width", "");
                                                        }
                                                }
                                                break;
                        case "horizontal-bt":   {
                                                    transformed = `${propVal}  translate(0%, 100%)`;
                                                    paddingType = textSettings.lineIndent >= 0 ?
                                                    "padding-bottom" : "padding-top";

                                                    if (textSettings.alignment === "right") {
                                                        this.finalTextContainer.style("float", "right");
                                                    } else if (textSettings.alignment === "center") {
                                                        this.finalTextContainer.style("width", "");
                                                        }
                                                }
                                                break;
                        case "vertical-rl": {
                                                if (textSettings.alignment === "center") {
                                                    transformed = `${propVal}  translate(-50%, -100%)`;
                                                    paddingType = textSettings.lineIndent >= 0 ?
                                                    "padding-right" : "padding-left";
                                                    this.finalTextContainer = this.finalTextContainer
                                                        .style("left", "50%");
                                                } else if (textSettings.alignment === "right") {
                                                    transformed = `${propVal}  translate(-100%, -100%)`;
                                                    paddingType = textSettings.lineIndent >= 0 ?
                                                    "padding-right" : "padding-left";
                                                    this.finalTextContainer = this.finalTextContainer
                                                        .style("left", "100%");
                                                } else if (textSettings.alignment === "left") {
                                                    transformed = `${propVal}  translate(0%, -100%)`;
                                                    paddingType = textSettings.lineIndent >= 0 ?
                                                    "padding-right" : "padding-left";
                                                }
                                            }
                                            break;
                        case "vertical-lr": {
                                                if (textSettings.alignment === "center") {
                                                    transformed = `${propVal}  translate(50%, 100%)`;
                                                    paddingType = textSettings.lineIndent >= 0 ?
                                                    "padding-left" : "padding-right";
                                                    this.finalTextContainer = this.finalTextContainer
                                                        .style("left", "50%");
                                                } else if (textSettings.alignment === "right") {
                                                    transformed = `${propVal}  translate(100%, 100%)`;
                                                    paddingType = textSettings.lineIndent >= 0 ?
                                                    "padding-left" : "padding-right";
                                                    this.finalTextContainer = this.finalTextContainer
                                                        .style("left", "100%");
                                                } else if (textSettings.alignment === "left") {
                                                    transformed = `${propVal}  translate(0%, 100%)`;
                                                    paddingType = textSettings.lineIndent >= 0 ?
                                                    "padding-left" : "padding-right";
                                                }
                                            }
                                            break;
                        default: break;
                    }
                }              break;
                default: break;
            }
            this.finalTextContainer = this.finalTextContainer
                .style("position", "relative")
                .style("transform", transformed)
                .style(positionName, positionVal)
                .style(paddingType, this.getLineIndent(paddingVal));
            this.finalTextContainer = this.finalTextContainer.append("div").classed("tw_pers", true);
            // Text Ordering
            const colonText: string = " : ";
            if (textValStatic !== "" && this.staticTextSettings.showColon) {
                if (this.staticTextSettings.textPosition === "suffix") {

                    this.getText(textValDynamic, dynfontStyleClass, dyntextDecoration,
                        textFontSize, dyntextShadow, dyntextShadowBlur,
                                 dyntextShadowColor, dynamictextFontFamily,
                                 this.dynamicSettings.backgroundcolor, dynfontwgt, textTransD);
                    this.colonText(colonText);
                    this.getTexts(textValStatic, staticfontStyleClass,
                        statictextDecoration, textFontSize, staticTextFontFamily,
                                  this.staticTextSettings.backgroundcolor, textTrans,
                                  statictextShadow, statictextShadowBlur,
                                  statictextShadowColor, staticfontwgt);
                    if (this.dynamicSettings.italicStyle) {
                        $(".dynamicpluscolon").css("padding-left", "4px");
                    }
                } else {
                    this.getTexts(textValStatic, staticfontStyleClass, statictextDecoration,
                        textFontSize, staticTextFontFamily, this.staticTextSettings.backgroundcolor,
                        textTrans, statictextShadow, statictextShadowBlur, statictextShadowColor, staticfontwgt);
                    this.colonText(colonText);
                    this.getText(textValDynamic, dynfontStyleClass, dyntextDecoration, textFontSize,
                        dyntextShadow, dyntextShadowBlur, dyntextShadowColor, dynamictextFontFamily,
                        this.dynamicSettings.backgroundcolor, dynfontwgt, textTransD);
                    if (this.staticTextSettings.italicStyle) {
                        $(".dynamicpluscolon").css("padding-left", "4px");
                    }
                }
            } else if (textValStatic !== "" && !this.staticTextSettings.showColon) {
                if (this.staticTextSettings.textPosition === "suffix") {
                    this.getText(textValDynamic, dynfontStyleClass, dyntextDecoration, textFontSize, dyntextShadow,
                        dyntextShadowBlur, dyntextShadowColor, dynamictextFontFamily,
                        this.dynamicSettings.backgroundcolor, dynfontwgt, textTransD);
                    this.addSpace();
                    this.getTexts(textValStatic, staticfontStyleClass, statictextDecoration, textFontSize,
                        staticTextFontFamily, this.staticTextSettings.backgroundcolor, textTrans, statictextShadow,
                        statictextShadowBlur, statictextShadowColor, staticfontwgt);
                } else {
                    this.getTexts(textValStatic, staticfontStyleClass, statictextDecoration, textFontSize,
                        staticTextFontFamily, this.staticTextSettings.backgroundcolor, textTrans, statictextShadow,
                        statictextShadowBlur, statictextShadowColor, staticfontwgt);
                    this.addSpace();
                    this.getText(textValDynamic, dynfontStyleClass, dyntextDecoration, textFontSize,
                        dyntextShadow, dyntextShadowBlur, dyntextShadowColor, dynamictextFontFamily,
                        this.dynamicSettings.backgroundcolor, dynfontwgt, textTransD);
                }
            } else if (textValStatic === "") {
                this.getText(textValDynamic, dynfontStyleClass, dyntextDecoration, textFontSize, dyntextShadow,
                    dyntextShadowBlur, dyntextShadowColor, dynamictextFontFamily, this.dynamicSettings.backgroundcolor,
                    dynfontwgt, textTransD);
            }

            const dynamicText = $(".dynamicText");
            const twFinalText = $(".tw_finalText");
            // Text Overflow Handling
            if (textRotationVal !== 0) {
                const textWidth: number = twFinalText.width();
                const textWidth2: number = $(".staticText").width() + dynamicText.width() +
                $(".dynamicpluscolon").width();
                const textHeight: number = twFinalText.height();
                switch (textSettings.alignmentV) {
                    case "top": {
                        switch (textSettings.direction) {
                            case "horizontal-tb":   {
                                                        textRotationVal = textRotationVal > 0 ?
                                                        textRotationVal % 180 : (-textRotationVal) % 180;
                                                        if (textSettings.alignment !== "center") {
                                                            this.finalTextContainer
                                                            .style("margin-top", `${((textWidth / 2)
                                                                * Math.sin(this.toRadians(textRotationVal)))}px`);
                                                        } else {
                                                            this.finalTextContainer
                                                            .style("margin-top", `${((textWidth2 / 2)
                                                                * Math.sin(this.toRadians(textRotationVal)))}px`);
                                                        }
                                                    }
                                                    break;
                            case "horizontal-bt":   {
                                                        textRotationVal = textRotationVal > 0 ?
                                                        textRotationVal % 180 : (-textRotationVal) % 180;
                                                        if (textSettings.alignment !== "center") {
                                                            this.finalTextContainer.style("margin-top",
                                                            `${((textWidth / 2) *
                                                                Math.sin(this.toRadians(textRotationVal)))}px`);
                                                        } else {
                                                            this.finalTextContainer
                                                            .style("margin-top", `${((textWidth2 / 2)
                                                                * Math.sin(this.toRadians(textRotationVal)))}px`);
                                                        }
                                                    }
                                                    break;
                            case "vertical-rl": {
                                                    let buffer: number = 0;
                                                    let rotVal: number
                                                    = textRotationVal > 0 ? textRotationVal : -textRotationVal;
                                                    textRotationVal = textRotationVal > 0 ?
                                                     textRotationVal % 180 : (-textRotationVal) % 180;
                                                    rotVal = rotVal % 360;
                                                    if (rotVal < 180) {
                                                        buffer = (rotVal / 100 * 2) * textSettings.fontSize;
                                                    } else {
                                                        buffer = ((360 - rotVal) / 100 * 2) * textSettings.fontSize;
                                                    }
                                                    if (textSettings.alignment === "left") {
                                                        this.finalTextContainer
                                                        .style("margin-left", `${((textHeight / 2)
                                                            * Math.sin(this.toRadians(textRotationVal)))}px`);
                                                    } else if (textSettings.alignment === "right") {
                                                        this.finalTextContainer
                                                        .style("margin-left", `${-((textHeight / 2) *
                                                            Math.sin(this.toRadians(textRotationVal)) + buffer)}px`);
                                                        }
                                                }
                                                break;
                            case "vertical-lr": {
                                                    let buffer: number = 0;
                                                    textRotationVal = textSettings.alignment === "right" ?
                                                     textRotationVal - 180 : textRotationVal;
                                                    let rotVal: number =
                                                    textRotationVal > 0 ? textRotationVal : -textRotationVal;
                                                    textRotationVal = textRotationVal > 0 ?
                                                     textRotationVal % 180 : (-textRotationVal) % 180;
                                                    rotVal = rotVal % 360;
                                                    if (rotVal < 180) {
                                                        buffer = (rotVal / 100 * 2) * textSettings.fontSize;
                                                    } else {
                                                        buffer = ((360 - rotVal) / 100 * 2) * textSettings.fontSize;
                                                    }
                                                    if (textSettings.alignment === "left") {
                                                        this.finalTextContainer
                                                        .style("margin-left", `${((textHeight / 2) *
                                                            Math.sin(this.toRadians(textRotationVal)))}px`);
                                                    } else if (textSettings.alignment === "right") {
                                                        this.finalTextContainer
                                                        .style("margin-left", `${-((textHeight / 2) *
                                                            Math.sin(this.toRadians(textRotationVal)) + buffer)}px`);
                                                        }
                                                }
                                                break;
                            default: break;
                        }
                    }           break;

                    case "middle": {
                        switch (textSettings.direction) {
                            case "vertical-rl": {
                                let marginT: number = 0;
                                let marginL: number = 0;
                                let buffer: number = 0;
                                let rotVal: number = textRotationVal > 0 ? textRotationVal : -textRotationVal;
                                rotVal = rotVal % 360;
                                if (rotVal < 180) {
                                    buffer = (rotVal / 100 * 2) * textWidth;
                                } else {
                                    buffer = ((360 - rotVal) / 100 * 2) * textWidth;
                                }
                                switch (textSettings.alignment) {
                                    case "left":    {
                                                        if (rotVal > 0 && rotVal <= 90) {
                                                            const a: number = Math.sin(this.toRadians(90 - rotVal));
                                                            marginT = ((textHeight - (textHeight) * a) / 2);
                                                        } else if ((rotVal > 90 && rotVal <= 270)) {
                                                            const a: number = Math.sin(this.toRadians(rotVal - 90));
                                                            marginT = ((textHeight + (textHeight) * a) / 2);
                                                        } else if (rotVal > 270 && rotVal < 360) {
                                                            const a: number = Math.sin(this.toRadians(rotVal % 270));
                                                            marginT = ((textHeight - (textHeight) * a) / 2);

                                                        }
                                                        if ((rotVal > 180 && rotVal < 360)) {
                                                            const a: number = -Math.sin(this.toRadians(rotVal));
                                                            marginL = (((textHeight) * a));
                                                        }
                                                        this.finalTextContainer.style("margin-top", `${-marginT}px`);
                                                        this.finalTextContainer
                                                        .style("margin-left", `${marginL - buffer}px`);
                                                    }
                                                    break;
                                    case "right":   {
                                                        if (rotVal > 0 && rotVal <= 90) {
                                                            const a: number = Math.sin(this.toRadians(90 - rotVal));
                                                            marginT = ((textHeight - (textHeight) * a) / 2);
                                                        } else if ((rotVal > 90 && rotVal <= 270)) {
                                                            const a: number = Math.sin(this.toRadians(rotVal - 90));
                                                            marginT = ((textHeight + (textHeight) * a) / 2);
                                                        } else if (rotVal > 270 && rotVal < 360) {
                                                            const a: number = Math.sin(this.toRadians(rotVal % 270));
                                                            marginT = ((textHeight - (textHeight) * a) / 2);
                                                        }
                                                        if ((rotVal > 0 && rotVal < 180)) {
                                                            const a: number = -Math.sin(this.toRadians(rotVal));
                                                            marginL = (((textHeight) * a));
                                                        }
                                                        this.finalTextContainer.style("margin-top", `${-marginT}px`);
                                                        this.finalTextContainer
                                                        .style("margin-left", `${marginL - buffer}px`);
                                                    }
                                                    break;
                                    case "center":  {
                                                        if (rotVal > 0 && rotVal <= 90) {
                                                            const b: number = Math.sin(this.toRadians(90 - rotVal));
                                                            marginT = ((textHeight - (textHeight) * b) / 2);
                                                        } else if ((rotVal > 90 && rotVal <= 270)) {
                                                            const b: number = Math.sin(this.toRadians(rotVal - 90));
                                                            marginT = ((textHeight + (textHeight) * b) / 2);
                                                        } else if (rotVal > 270 && rotVal < 360) {
                                                            const b: number = Math.sin(this.toRadians(rotVal % 270));
                                                            marginT = ((textHeight - (textHeight) * b) / 2);
                                                        }
                                                        let a: number = Math.sin(this.toRadians(rotVal));
                                                        a = a > 0 ? a : -a;
                                                        marginL = (((textHeight) * a)) / 2;
                                                        this.finalTextContainer.style("margin-top", `${-marginT}px`);
                                                        if (rotVal < 180) {
                                                            this.finalTextContainer
                                                            .style("margin-left", `${-marginL}px`);
                                                        } else {
                                                            this.finalTextContainer
                                                            .style("margin-left", `${marginL}px`);
                                                        }
                                                    }
                                                    break;
                                    default: break;
                                }
                            }                   break;
                            case "vertical-lr": {
                                let marginT: number = 0;
                                let marginL: number = 0;
                                let buffer: number = 0;
                                let rotVal: number = textRotationVal > 0 ? textRotationVal : -textRotationVal;
                                rotVal = rotVal - 180;
                                rotVal = rotVal % 360;
                                if (rotVal < 180) {
                                    buffer = (rotVal / 100 * 2) * textSettings.fontSize;
                                } else {
                                    buffer = ((360 - rotVal) / 100 * 2) * textSettings.fontSize;
                                }
                                switch (textSettings.alignment) {
                                    case "left": {
                                                    if (rotVal > 0 && rotVal <= 90) {
                                                        const a: number = Math.sin(this.toRadians(90 - rotVal % 90));
                                                        marginT = ((textHeight - (textHeight) * a) / 2);
                                                    } else if ((rotVal > 90 && rotVal <= 270)) {
                                                        const a: number = Math.sin(this.toRadians(rotVal - 90));
                                                        marginT = ((textHeight + (textHeight) * a) / 2);
                                                    } else if (rotVal > 270 && rotVal < 360) {
                                                        const a: number = Math.sin(this.toRadians(rotVal % 270));
                                                        marginT = ((textHeight - (textHeight) * a) / 2);
                                                    }
                                                    if ((rotVal > 180 && rotVal < 360)) {
                                                        const a: number = -Math.sin(this.toRadians(rotVal));
                                                        marginL = (((textHeight) * a));
                                                    }
                                                    this.finalTextContainer.style("margin-top", `${-marginT}px`);
                                                    this.finalTextContainer.style("margin-left", `${marginL}px`);
                                                 }
                                                 break;
                                    case "right": {
                                                    if (rotVal > 0 && rotVal <= 90) {
                                                        const a: number = Math.sin(this.toRadians(90 - rotVal));
                                                        marginT = ((textHeight - (textHeight) * a) / 2);
                                                    } else if ((rotVal > 90 && rotVal <= 270)) {
                                                        const a: number = Math.sin(this.toRadians(rotVal - 90));
                                                        marginT = ((textHeight + (textHeight) * a) / 2);
                                                    } else if (rotVal > 270 && rotVal < 360) {
                                                        const a: number = Math.sin(this.toRadians(rotVal % 270));
                                                        marginT = ((textHeight - (textHeight) * a) / 2);
                                                    }
                                                    if ((rotVal > 0 && rotVal < 180)) {
                                                        const a: number = -Math.sin(this.toRadians(rotVal));
                                                        marginL = (((textHeight) * a));
                                                    }
                                                    this.finalTextContainer.style("margin-top", `${-marginT}px`);
                                                    this.finalTextContainer
                                                    .style("margin-left", `${(marginL - buffer)}px`);
                                                  }
                                                  break;
                                    case "center":  {
                                                        if (rotVal > 0 && rotVal <= 90) {
                                                            const b: number =
                                                            Math.sin(this.toRadians(90 - rotVal % 90));
                                                            marginT = ((textHeight - (textHeight) * b) / 2);
                                                        } else if ((rotVal > 90 && rotVal <= 270)) {
                                                            const b: number = Math.sin(this.toRadians(rotVal - 90));
                                                            marginT = ((textHeight + (textHeight) * b) / 2);
                                                        } else if (rotVal > 270 && rotVal < 360) {
                                                            const b: number = Math.sin(this.toRadians(rotVal % 270));
                                                            marginT = ((textHeight - (textHeight) * b) / 2);
                                                        }
                                                        let a: number = Math.sin(this.toRadians(rotVal));
                                                        a = a > 0 ? a : -a;
                                                        marginL = (((textHeight) * a)) / 2;
                                                        this.finalTextContainer.style("margin-top", `${-marginT}px`);
                                                        if (rotVal < 180) {
                                                            this.finalTextContainer
                                                            .style("margin-left", `${-marginL}px`);
                                                        } else {
                                                            this.finalTextContainer
                                                            .style("margin-left", `${marginL}px`);
                                                        }
                                                    }
                                                    break;
                                    default: break;
                                }
                            }                   break;
                            default: break;
                        }
                    }              break;

                    case "bottom": {
                        switch (textSettings.direction) {
                            case "horizontal-tb":   {
                                                        let buffer: number = 0;
                                                        let rotVal: number = textRotationVal > 0 ?
                                                        textRotationVal : -textRotationVal;
                                                        textRotationVal = textRotationVal > 0 ? textRotationVal % 180 :
                                                        (-textRotationVal) % 180;
                                                        rotVal = rotVal % 360;
                                                        if (rotVal < 180) {
                                                            buffer = (rotVal / 100 * 2) * textSettings.fontSize;
                                                        } else {
                                                            buffer = ((360 - rotVal) / 100 * 2) * textSettings.fontSize;
                                                        }
                                                        if (textSettings.alignment !== "center") {
                                                            this.finalTextContainer
                                                            .style("margin-top", `${(-((textWidth / 2) * Math.sin(
                                                                this.toRadians(textRotationVal)) + (buffer)))}px`);
                                                        } else {
                                                            this.finalTextContainer
                                                            .style("margin-top", `${(-((textWidth2 / 2) * Math.sin(
                                                                this.toRadians(textRotationVal)) + (buffer)))}px`);
                                                        }
                                                    }
                                                    break;
                            case "horizontal-bt": {
                                                    let buffer: number = 0;
                                                    textRotationVal = textRotationVal - 180;
                                                    const rotVal: number = textRotationVal > 0 ?
                                                    textRotationVal : -textRotationVal;
                                                    textRotationVal = textRotationVal > 0 ? textRotationVal % 180 :
                                                    (-textRotationVal) % 180;
                                                    if (rotVal < 180) {
                                                        buffer = (rotVal / 100 * 2) * textSettings.fontSize;
                                                    } else {
                                                        buffer = ((360 - rotVal) / 100 * 2) * textSettings.fontSize;
                                                    }

                                                    if (textSettings.alignment !== "center") {
                                                        this.finalTextContainer
                                                        .style("margin-top", `${(-((textWidth / 2) *
                                                            Math.sin(this.toRadians(textRotationVal)) + (buffer)))}px`);
                                                    } else {
                                                        this.finalTextContainer
                                                        .style("margin-top", `${(-((textWidth2 / 2) *
                                                            Math.sin(this.toRadians(textRotationVal)) + (buffer)))}px`);
                                                    }
                                                  }
                                                  break;
                            case "vertical-rl": {
                                let marginT: number = 0;
                                let marginL: number = 0;
                                let buffer: number = 0;
                                let rotVal: number = textRotationVal > 0 ? textRotationVal : -textRotationVal;
                                rotVal = rotVal % 360;
                                if (rotVal < 180) {
                                    buffer = (rotVal / 100 * 2) * textSettings.fontSize;
                                } else {
                                    buffer = ((360 - rotVal) / 100 * 2) * textSettings.fontSize;
                                }
                                switch (textSettings.alignment) {
                                    case "left": {
                                                    if (rotVal > 0 && rotVal <= 90) {
                                                        const a: number = Math.sin(this.toRadians(90 - rotVal));
                                                        marginT = ((textHeight - (textHeight) * a) / 2);
                                                    } else if ((rotVal > 90 && rotVal <= 270)) {
                                                        const a: number = Math.sin(this.toRadians(rotVal - 90));
                                                        marginT = ((textHeight + (textHeight) * a) / 2);

                                                    } else if (rotVal > 270 && rotVal < 360) {
                                                        const a: number = Math.sin(this.toRadians(rotVal % 270));
                                                        marginT = ((textHeight - (textHeight) * a) / 2);
                                                    }
                                                    if (rotVal <= 180) {
                                                        const a: number = -Math.sin(this.toRadians(rotVal % 180));
                                                        marginL = ((textHeight) * a) / 2;
                                                    } else if (rotVal > 180) {
                                                        const a: number = Math.sin(this.toRadians(rotVal % 180));
                                                        marginL = ((1.5 * textHeight) * a);
                                                    }
                                                    this.finalTextContainer.style("margin-top", `${-2 * marginT}px`);
                                                    this.finalTextContainer.style("margin-left", `${marginL}px`);
                                                 }
                                                 break;
                                    case "right": {
                                                    if (rotVal > 0 && rotVal <= 90) {
                                                        const a: number = Math.sin(this.toRadians(90 - rotVal));
                                                        marginT = ((textHeight - (textHeight) * a) / 2);
                                                    } else if ((rotVal > 90 && rotVal <= 270)) {
                                                        const a: number = Math.sin(this.toRadians(rotVal - 90));
                                                        marginT = ((textHeight + (textHeight) * a) / 2);
                                                    } else if (rotVal > 270 && rotVal < 360) {
                                                        const a: number = Math.sin(this.toRadians(rotVal % 270));
                                                        marginT = ((textHeight - (textHeight) * a) / 2);
                                                    }
                                                    if (rotVal <= 180) {
                                                        const a: number = -Math.sin(this.toRadians(rotVal % 180));
                                                        marginL = ((1.5 * textHeight) * a);

                                                    } else if (rotVal > 180) {
                                                        const a: number = Math.sin(this.toRadians(rotVal % 180));
                                                        marginL = ((textHeight) * a) / 2;
                                                    }
                                                    this.finalTextContainer.style("margin-top", `${-2 * marginT}px`);
                                                    this.finalTextContainer
                                                    .style("margin-left", `${marginL - buffer}px`);
                                                  }
                                                  break;
                                    case "center":  {
                                                        if (rotVal > 0 && rotVal <= 90) {
                                                            const b: number = Math.sin(this.toRadians(90 - rotVal));
                                                            marginT = ((textHeight - (textHeight) * b) / 2);
                                                        } else if ((rotVal > 90 && rotVal <= 270)) {
                                                            const b: number = Math.sin(this.toRadians(rotVal - 90));
                                                            marginT = ((textHeight + (textHeight) * b) / 2);
                                                        } else if (rotVal > 270 && rotVal < 360) {
                                                            const b: number = Math.sin(this.toRadians(rotVal % 270));
                                                            marginT = ((textHeight - (textHeight) * b) / 2);
                                                        }
                                                        if (rotVal <= 180) {
                                                            const b: number = -Math.sin(this.toRadians(rotVal % 180));
                                                            marginL = ((textHeight) * b) / 2;
                                                        } else if (rotVal > 180) {
                                                            const b: number = Math.sin(this.toRadians(rotVal % 180));
                                                            marginL = ((1.5 * textHeight) * b);
                                                        }
                                                        let a: number = Math.sin(this.toRadians(rotVal));
                                                        a = a > 0 ? a : -a;
                                                        marginL = (((textHeight) * a));
                                                        this.finalTextContainer
                                                        .style("margin-top", `${-2 * marginT}px`);
                                                        if (rotVal < 180) {
                                                            this.finalTextContainer
                                                            .style("margin-left", `${-marginL}px`);
                                                        } else {
                                                            this.finalTextContainer
                                                            .style("margin-left", `${marginL}px`);
                                                        }
                                                    }
                                                    break;
                                    default: break;
                                }
                            }                   break;

                            case "vertical-lr": {
                                let marginT: number = 0;
                                let marginL: number = 0;
                                let buffer: number = 0;
                                let rotVal: number = textRotationVal > 0 ? textRotationVal : -textRotationVal;
                                rotVal = rotVal - 180;
                                rotVal = rotVal % 360;
                                if (rotVal < 180) {
                                    buffer = (rotVal / 100 * 2) * textSettings.fontSize;
                                } else {
                                    buffer = ((360 - rotVal) / 100 * 2) * textSettings.fontSize;
                                }
                                switch (textSettings.alignment) {
                                    case "left": {
                                                    if (rotVal > 0 && rotVal <= 90) {
                                                        const a: number = Math.sin(this.toRadians(90 - rotVal));
                                                        marginT = ((textHeight - (textHeight) * a) / 2);
                                                    } else if ((rotVal > 90 && rotVal <= 270)) {
                                                        const a: number = Math.sin(this.toRadians(rotVal - 90));
                                                        marginT = ((textHeight + (textHeight) * a) / 2);
                                                    } else if (rotVal > 270 && rotVal < 360) {
                                                        const a: number = Math.sin(this.toRadians(rotVal % 270));
                                                        marginT = ((textHeight - (textHeight) * a) / 2);
                                                    }
                                                    if (rotVal <= 180) {
                                                        const a: number = -Math.sin(this.toRadians(rotVal % 180));
                                                        marginL = ((textHeight) * a) / 2;
                                                    } else if (rotVal > 180) {
                                                        const a: number = Math.sin(this.toRadians(rotVal % 180));
                                                        marginL = ((1.5 * textHeight) * a);
                                                    }
                                                    this.finalTextContainer.style("margin-top", `${-2 * marginT}px`);
                                                    this.finalTextContainer.style("margin-left", `${marginL}px`);
                                                 }
                                                 break;
                                    case "right": {
                                                    if (rotVal > 0 && rotVal <= 90) {
                                                        const a: number = Math.sin(this.toRadians(90 - rotVal));
                                                        marginT = ((textHeight - (textHeight) * a) / 2);
                                                    } else if ((rotVal > 90 && rotVal <= 270)) {
                                                        const a: number = Math.sin(this.toRadians(rotVal - 90));
                                                        marginT = ((textHeight + (textHeight) * a) / 2);

                                                    } else if (rotVal > 270 && rotVal < 360) {
                                                        const a: number = Math.sin(this.toRadians(rotVal % 270));
                                                        marginT = ((textHeight - (textHeight) * a) / 2);
                                                    }
                                                    if (rotVal <= 180) {
                                                        const a: number = -Math.sin(this.toRadians(rotVal % 180));
                                                        marginL = ((1.5 * textHeight) * a);

                                                    } else if (rotVal > 180) {
                                                        const a: number = Math.sin(this.toRadians(rotVal % 180));
                                                        marginL = ((textHeight) * a) / 2;
                                                    }
                                                    this.finalTextContainer.style("margin-top", `${-2 * marginT}px`);
                                                    this.finalTextContainer
                                                    .style("margin-left", `${marginL - buffer}px`);
                                                  }
                                                  break;
                                    case "center":  {
                                                        if (rotVal > 0 && rotVal <= 90) {
                                                            const b: number = Math.sin(this.toRadians(90 - rotVal));
                                                            marginT = ((textHeight - (textHeight) * b) / 2);
                                                        } else if ((rotVal > 90 && rotVal <= 270)) {
                                                            const b: number = Math.sin(this.toRadians(rotVal - 90));
                                                            marginT = ((textHeight + (textHeight) * b) / 2);

                                                        } else if (rotVal > 270 && rotVal < 360) {
                                                            const b: number = Math.sin(this.toRadians(rotVal % 270));
                                                            marginT = ((textHeight - (textHeight) * b) / 2);
                                                        }
                                                        if (rotVal <= 180) {
                                                            const b: number = -Math.sin(this.toRadians(rotVal % 180));
                                                            marginL = ((textHeight) * b) / 2;
                                                        } else if (rotVal > 180) {
                                                            const b: number = Math.sin(this.toRadians(rotVal % 180));
                                                            marginL = ((1.5 * textHeight) * b);
                                                        }
                                                        let a: number = Math.sin(this.toRadians(rotVal));
                                                        a = a > 0 ? a : -a;
                                                        marginL = (((textHeight) * a));
                                                        this.finalTextContainer
                                                        .style("margin-top", `${-2 * marginT}px`);
                                                        if (rotVal < 180) {
                                                            this.finalTextContainer
                                                            .style("margin-left", `${-marginL}px`);
                                                        } else {
                                                            this.finalTextContainer
                                                            .style("margin-left", `${marginL}px`);
                                                        }
                                                    }
                                                    break;
                                    default: break;
                                }
                            }                   break;
                            default: break;
                        }
                    }              break;
                    default: break;
                }
            }
            if (textSettings.direction === "vertical-lr" || textSettings.direction === "vertical-rl") {
                this.finalTextContainer.style("max-height", `${$("#sandbox-host").height()}px`);
            } else if (textSettings.direction === "horizontal-tb" || textSettings.direction === "horizontal-bt") {
                this.finalTextContainer.style("max-width", `${$("#sandbox-host").width()}px`);
            }

            // Applying Perpective
            if (valueLength === 1) {
                let transformedVal: string = "";
                if (pers == null || pers === 0) {
                    d3.select(".tw_finalText").style("perspective", "none");
                } else {
                    d3.select(".tw_finalText")
                        .style("perspective", this.getPerspective(pers))
                        .style("perspective-origin", "center")
                        .attr("overflow-x", "visible");
                    if (textSettings.direction === "vertical-rl" || textSettings.direction === "vertical-lr") {
                        transformedVal = "rotateY(25deg)";
                    } else {
                        transformedVal = "rotateX(25deg)";
                    }
                }
                d3.select(".tw_pers").style("transform", transformedVal);
            }
        // Below Two lines are to handle height issue of div in edge
            const spanHeight: number = dynamicText.height();
            $(".tw_value.tw_finalText").height(spanHeight + 2);
            for (const jIterator of options.dataViews[0].categorical.categories) {
                if (jIterator.source.type[`category`]
                    === "WebUrl" && jIterator.source.roles.URL) {
                        dynamicText.on("click", (): void => {

                this.visualHost.launchUrl(url);
            });
        }
    }
            if (dataView.categorical.categories !== undefined) {
             for (const iterator of options.dataViews[0].categorical.categories) {
                    if (iterator.source.type[`category`]
                        === "WebUrl" && iterator.source.roles.URL) {
                            dynamicText.addClass("urlIcon");
                    }
                }
            }  else {
                if (dataView.categorical.values[0].source.roles.URL) {
                    if (dataView.categorical.values[0].source.type[`category`]
                        === "WebUrl") {
                            dynamicText.addClass("urlIcon");
                    }
                }
            }
            this.eventService.renderingFinished(options);
                   } catch (exeption) {
                            this.eventService.renderingFailed(options, exeption);
                       }

        }

        public getDefaultTextSettings(): ITextSettings {
            return {
                alignment: "left",
                alignmentV: "top",
                color: "#000000",
                direction: "horizontal-tb",
                fontSize: 18,
                letterSpacing: null,
                lineHeight: null,
                lineIndent: null,
                perspective: null,
                skewX: null,
                skewY: null,
                textIndent: null,
                textRotate: null,
                transparency: null,
                wordSpacing: null
            };
        }

        public getTextSettings(dataView: DataView): ITextSettings {
            let objects: DataViewObjects = null;
            const textSetting: ITextSettings = this.getDefaultTextSettings();
            if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
                return textSetting;
            }
            objects = dataView.metadata.objects;
            textSetting.color = DataViewObjects.getFillColor(objects,
                questTextProperties.textSettings.color, textSetting.color);
            textSetting.transparency = DataViewObjects.getValue(objects, questTextProperties.textSettings.transparency,
                                                                textSetting.transparency) == null ?
                null : (DataViewObjects.getValue(objects,
                    questTextProperties.textSettings.transparency, textSetting.transparency) > 100 ?
                    100 : (DataViewObjects.getValue(objects,
                        questTextProperties.textSettings.transparency, textSetting.transparency) < 0 ?
                        0 : DataViewObjects.getValue(objects,
                            questTextProperties.textSettings.transparency, textSetting.transparency)
                    ));
            textSetting.fontSize = DataViewObjects.getValue(objects,
                questTextProperties.textSettings.fontSize, textSetting.fontSize);
            textSetting.alignment = DataViewObjects.getValue(objects,
                questTextProperties.textSettings.alignment, textSetting.alignment);
            textSetting.alignmentV = DataViewObjects.getValue(objects,
                questTextProperties.textSettings.alignmentV, textSetting.alignmentV);
            textSetting.direction = DataViewObjects.getValue(objects,
                questTextProperties.textSettings.direction, textSetting.direction);
            textSetting.letterSpacing = DataViewObjects.getValue(objects,
                questTextProperties.textSettings.letterSpacing, textSetting.letterSpacing);
            textSetting.wordSpacing = DataViewObjects.getValue(objects, questTextProperties.textSettings.wordSpacing,
                                                               textSetting.wordSpacing);
            textSetting.lineHeight = DataViewObjects.getValue(objects,
                questTextProperties.textSettings.lineHeight, textSetting.lineHeight);
            textSetting.lineHeight = (textSetting.lineHeight == null || textSetting.lineHeight === 0) ?
             null : (textSetting.lineHeight < 0 ? 0 : textSetting.lineHeight);
            textSetting.perspective = DataViewObjects.getValue(objects, questTextProperties.textSettings.perspective,
                                                               textSetting.perspective);
            textSetting.perspective = textSetting.perspective == null ?
            null : (textSetting.perspective < 0 ? 0 : textSetting.perspective);
            textSetting.textIndent = DataViewObjects.getValue(objects,
                questTextProperties.textSettings.textIndent, textSetting.textIndent);
            textSetting.lineIndent = DataViewObjects.getValue(objects,
                questTextProperties.textSettings.lineIndent, textSetting.lineIndent);
            textSetting.textRotate = DataViewObjects.getValue(objects,
                questTextProperties.textSettings.textRotate, textSetting.textRotate);
            textSetting.skewX = DataViewObjects.getValue(objects,
                questTextProperties.textSettings.skewX, textSetting.skewX);
            textSetting.skewY = DataViewObjects.getValue(objects,
                questTextProperties.textSettings.skewY, textSetting.skewY);

            return textSetting;
        }

        public getDefaultStaticTextSettings(): IStaticTextSettings {
            return {
                backgroundcolor: "#ffffff",
                boldStyle: false,
                fontFamily: "Segoe UI",
                fontWeight: "normal",
                italicStyle: false,
                overline: false,
                postText: "",
                showColon: true,
                strikethrough: false,
                textDecoration: "none",
                textPosition: "prefix",
                textShadow: "none",
                textShadowBlur: "low",
                textShadowColor: "#000000",
                textTransform: "",
                transparency: null,
                underline: false
            };
        }

        public getDefaultDynamicTextSettings(): IDynamicTextSettings {
            return {
                backgroundcolor: "#FFF",
                boldStyle: false,
                fontFamily: "Segoe UI",
                fontWeight: "normal",
                italicStyle: false,
                overline: false,
                strikethrough: false,
                textDecoration: "none",
                textShadow: "none",
                textShadowBlur: "low",
                textShadowColor: "#000",
                textTransform: "",
                transparency: null,
                underline: false
            };
        }

        public getDynamicTextSettings(dataView: DataView): IDynamicTextSettings {
            let objects: DataViewObjects = null;
            const dynamicSettings: IDynamicTextSettings = this.getDefaultDynamicTextSettings();
            if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
                return dynamicSettings;
            }
            objects = dataView.metadata.objects;
            dynamicSettings.backgroundcolor = DataViewObjects.getFillColor(
                objects, questTextProperties.dynamicSettings.backgroundcolor, dynamicSettings.backgroundcolor);
            dynamicSettings.transparency = DataViewObjects.getValue(
                objects, questTextProperties.dynamicSettings.transparency,
                dynamicSettings.transparency == null ? 0 : (DataViewObjects.getValue(
                    objects, questTextProperties.dynamicSettings.transparency, dynamicSettings.transparency) > 100 ?
                    100 : (DataViewObjects.getValue(
                        objects, questTextProperties.dynamicSettings.transparency, dynamicSettings.transparency) < 0 ?
                        0 : DataViewObjects.getValue(
                            objects, questTextProperties.dynamicSettings.transparency, dynamicSettings.transparency)
                    )));
            dynamicSettings.textDecoration = DataViewObjects.getValue(
                objects, questTextProperties.dynamicSettings.textDecoration, dynamicSettings.textDecoration);
            dynamicSettings.textTransform = DataViewObjects.getValue(
                objects, questTextProperties.dynamicSettings.textTransform, dynamicSettings.textTransform);
            dynamicSettings.textShadow = DataViewObjects.getValue(
                objects, questTextProperties.dynamicSettings.textShadow, dynamicSettings.textShadow);
            dynamicSettings.textShadowBlur = DataViewObjects.getValue(
                objects, questTextProperties.dynamicSettings.textShadowBlur, dynamicSettings.textShadowBlur);
            dynamicSettings.textShadowColor = DataViewObjects.getFillColor(
                objects, questTextProperties.dynamicSettings.textShadowColor, dynamicSettings.textShadowColor);
            dynamicSettings.fontWeight = DataViewObjects.getValue(
                objects, questTextProperties.dynamicSettings.fontWeight, dynamicSettings.fontWeight);
            dynamicSettings.fontFamily = DataViewObjects.getValue(
                objects, questTextProperties.dynamicSettings.fontFamily, dynamicSettings.fontFamily);
            dynamicSettings.boldStyle = DataViewObjects.getValue(
                objects, questTextProperties.dynamicSettings.boldStyle, dynamicSettings.boldStyle);
            dynamicSettings.italicStyle = DataViewObjects.getValue(
                objects, questTextProperties.dynamicSettings.italicStyle, dynamicSettings.italicStyle);
            dynamicSettings.underline = DataViewObjects.getValue(
                objects, questTextProperties.dynamicSettings.underline, dynamicSettings.underline);
            dynamicSettings.overline = DataViewObjects.getValue(
                objects, questTextProperties.dynamicSettings.overline, dynamicSettings.overline);
            dynamicSettings.strikethrough = DataViewObjects.getValue(
                objects, questTextProperties.dynamicSettings.strikethrough, dynamicSettings.strikethrough);

            return dynamicSettings;
        }

        public getStaticTextSettings(dataView: DataView): IStaticTextSettings {
            let objects: DataViewObjects = null;
            const textSetting: IStaticTextSettings = this.getDefaultStaticTextSettings();
            if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
                return textSetting;
            }
            objects = dataView.metadata.objects;
            textSetting.showColon = DataViewObjects.getValue(
                objects, questTextProperties.staticTextSettings.showColon, textSetting.showColon);
            textSetting.textPosition = DataViewObjects.getValue(
                objects, questTextProperties.staticTextSettings.textPosition, textSetting.textPosition);
            textSetting.textDecoration = DataViewObjects.getValue(
                objects, questTextProperties.staticTextSettings.textDecoration, textSetting.textDecoration);
            textSetting.textTransform = DataViewObjects.getValue(
                objects, questTextProperties.staticTextSettings.textTransform, textSetting.textTransform);
            textSetting.textShadow = DataViewObjects.getValue(
                objects, questTextProperties.staticTextSettings.textShadow, textSetting.textShadow);
            textSetting.textShadowBlur = DataViewObjects.getValue(
                objects, questTextProperties.staticTextSettings.textShadowBlur, textSetting.textShadowBlur);
            textSetting.textShadowColor = DataViewObjects.getFillColor(
                objects, questTextProperties.staticTextSettings.textShadowColor, textSetting.textShadowColor);
            textSetting.fontWeight = DataViewObjects.getValue(
                objects, questTextProperties.staticTextSettings.fontWeight, textSetting.fontWeight);
            textSetting.backgroundcolor = DataViewObjects.getFillColor(
                objects, questTextProperties.staticTextSettings.backgroundcolor, textSetting.backgroundcolor);
            textSetting.transparency = DataViewObjects.getValue(
                objects, questTextProperties.staticTextSettings.transparency, textSetting.transparency == null ?
                null : (DataViewObjects.getValue(
                    objects, questTextProperties.staticTextSettings.transparency, textSetting.transparency) > 100 ?
                    100 : (DataViewObjects.getValue(
                        objects, questTextProperties.staticTextSettings.transparency, textSetting.transparency) < 0 ?
                        0 : DataViewObjects.getValue(
                            objects, questTextProperties.staticTextSettings.transparency, textSetting.transparency)
                    )
                ));
            textSetting.fontFamily = DataViewObjects.getValue(
                objects, questTextProperties.staticTextSettings.fontFamily, textSetting.fontFamily);
            textSetting.boldStyle = DataViewObjects.getValue(
                objects, questTextProperties.staticTextSettings.boldStyle, textSetting.boldStyle);
            textSetting.italicStyle = DataViewObjects.getValue(
                objects, questTextProperties.staticTextSettings.italicStyle, textSetting.italicStyle);
            textSetting.underline = DataViewObjects.getValue(
                objects, questTextProperties.staticTextSettings.underline, textSetting.underline);
            textSetting.overline = DataViewObjects.getValue(
                objects, questTextProperties.staticTextSettings.overline, textSetting.overline);
            textSetting.strikethrough = DataViewObjects.getValue(
                objects, questTextProperties.staticTextSettings.strikethrough, textSetting.strikethrough);
            textSetting.postText = DataViewObjects.getValue(
                objects, questTextProperties.staticTextSettings.postText, textSetting.postText);

            return textSetting;
        }
        // tslint:disable: object-literal-sort-keys
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions):
        VisualObjectInstanceEnumeration {
            const textSetting: ITextSettings = this.getTextSettings(this.dataViews);
            const objectName: string = options.objectName;
            const objectEnumeration: VisualObjectInstance[] = [];
            switch (objectName) {
                case "textSettings":
                    objectEnumeration.push({
                        objectName,
                        properties: {
                            color: textSetting.color,
                            transparency: textSetting.transparency,
                            fontSize: textSetting.fontSize,
                            alignment: textSetting.alignment,
                            textIndent: textSetting.textIndent,
                            alignmentV: textSetting.alignmentV,
                            lineIndent: textSetting.lineIndent,
                            direction: textSetting.direction,
                            lineHeight: textSetting.lineHeight,
                            letterSpacing: textSetting.letterSpacing,
                            wordSpacing: textSetting.wordSpacing,
                            perspective: textSetting.perspective,
                            textRotate: textSetting.textRotate,
                            skewX: textSetting.skewX,
                            skewY: textSetting.skewY

                        },
                        selector: null,

                    });
                    break;
                case "staticText":
                    if (this.staticTextSettings.textShadow === "none") {
                        objectEnumeration.push({
                            objectName,
                            properties: {
                                  // This field to keep it compatible with the older version. DO NOT DELETE.
                                  textPosition: this.staticTextSettings.textPosition,
                                  postText: this.staticTextSettings.postText,
                                  showColon: this.staticTextSettings.showColon,
                                  backgroundcolor: this.staticTextSettings.backgroundcolor,
                                  transparency: this.staticTextSettings.transparency,
                                  textTransform: this.staticTextSettings.textTransform,
                                  textShadow: this.staticTextSettings.textShadow,
                                  fontFamily: this.staticTextSettings.fontFamily,
                                  boldStyle: this.staticTextSettings.boldStyle,
                                  italicStyle: this.staticTextSettings.italicStyle,
                                  underline: this.staticTextSettings.underline,
                                  overline: this.staticTextSettings.overline,
                                  strikethrough: this.staticTextSettings.strikethrough
                            },
                            selector: null,

                        });
                    } else {
                        objectEnumeration.push({
                            objectName,
                            properties: {
                                // This field to keep it compatible with the older version. DO NOT DELETE.
                                textPosition: this.staticTextSettings.textPosition,
                                postText: this.staticTextSettings.postText,
                                showColon: this.staticTextSettings.showColon,
                                backgroundcolor: this.staticTextSettings.backgroundcolor,
                                transparency: this.staticTextSettings.transparency,
                                textTransform: this.staticTextSettings.textTransform,
                                textShadow: this.staticTextSettings.textShadow,
                                textShadowBlur: this.staticTextSettings.textShadowBlur,
                                textShadowColor: this.staticTextSettings.textShadowColor,
                                fontFamily: this.staticTextSettings.fontFamily,
                                boldStyle: this.staticTextSettings.boldStyle,
                                italicStyle: this.staticTextSettings.italicStyle,
                                underline: this.staticTextSettings.underline,
                                overline: this.staticTextSettings.overline,
                                strikethrough: this.staticTextSettings.strikethrough
                            },
                            selector: null,

                        });
                    }
                    break;
                case "Settings":
                    if (this.dynamicSettings.textShadow === "none") {
                        objectEnumeration.push({
                            objectName,
                            properties: {
                                backgroundcolor: this.dynamicSettings.backgroundcolor,
                                transparency: this.dynamicSettings.transparency,
                                textTransform: this.dynamicSettings.textTransform,
                                textShadow: this.dynamicSettings.textShadow,
                                fontFamily: this.dynamicSettings.fontFamily,
                                boldStyle: this.dynamicSettings.boldStyle,
                                italicStyle: this.dynamicSettings.italicStyle,
                                underline: this.dynamicSettings.underline,
                                overline: this.dynamicSettings.overline,
                                strikethrough: this.dynamicSettings.strikethrough
                            },
                            selector: null,

                        });
                    } else {
                        objectEnumeration.push({
                            objectName,
                            properties: {
                                backgroundcolor: this.dynamicSettings.backgroundcolor,
                                transparency: this.dynamicSettings.transparency,
                                textTransform: this.dynamicSettings.textTransform,
                                textShadow: this.dynamicSettings.textShadow,
                                textShadowBlur: this.dynamicSettings.textShadowBlur,
                                textShadowColor: this.dynamicSettings.textShadowColor,
                                fontFamily: this.dynamicSettings.fontFamily,
                                boldStyle: this.dynamicSettings.boldStyle,
                                italicStyle: this.dynamicSettings.italicStyle,
                                underline: this.dynamicSettings.underline,
                                overline: this.dynamicSettings.overline,
                                strikethrough: this.dynamicSettings.strikethrough
                            },
                            selector: null,

                        });
                    }
                    break;
                default: break;
            }

            return objectEnumeration;
        }
        /*tslint:enable*/

        private getTexts(text: string, fontStyleClass: string, textDecoration: string, textFontSize: number,
                         textFontFamily: string, backgroundcolor: string, textTrans: string, statictextShadow: string,
                         statictextShadowBlur: string, statictextShadowColor: string, fontWeight: string): void {
            this.finalTextContainer.append("span")
                .classed("staticText", true)
                .text(text)
                .classed(fontStyleClass, true)
                .style("font-size", this.pointToPixel(textFontSize))
                .style("font-family", textFontFamily)
                .style("background-color", backgroundcolor +
                this.getOpacityHex(this.staticTextSettings.transparency == null
                     ? 0 : this.staticTextSettings.transparency))
                .style("text-decoration", textDecoration)
                .style("text-shadow", this.getTextShadow(statictextShadow, statictextShadowBlur, statictextShadowColor))
                .style("font-weight", fontWeight)
                .style("text-transform", textTrans)
                .style("border-radius", "5px");
        }

        private getText(text: string, fontStyleClass: string, textDecoration: string, textFontSize: number,
                        dyntextShadow: string, dyntextShadowBlur: string, dyntextShadowColor: string,
                        textFontFamily: string, backgroundcolor: string, fontWeight: string, textTransD: string): void {
            this.finalTextContainer.append("span")
                .classed("dynamicText", true)
                .text(text)
                .classed(fontStyleClass, true)
                .style("font-size", this.pointToPixel(textFontSize))
                .style("font-family", textFontFamily)
                .style("text-shadow", this.getTextShadow(dyntextShadow, dyntextShadowBlur, dyntextShadowColor))
                .style("font-weight", fontWeight)
                .style("background-color", backgroundcolor +
                this.getOpacityHex(this.dynamicSettings.transparency == null
                     ? 0 : this.dynamicSettings.transparency))
                .style("text-decoration", textDecoration)
                .style("text-transform", textTransD)
                .style("border-radius", "5px");
        }

        private colonText(colonText: string): void {
            this.finalTextContainer.append("span")
                .classed("dynamicpluscolon", true)
                .text(colonText);
        }

        private addSpace(): void {
            this.finalTextContainer.append("span")
                .classed("space", true)
                .text(" ");
        }
    }
}
