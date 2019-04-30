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
  "use strict";
  import legend = utils.chart.legend;
  import createLegend = utils.chart.legend.createLegend;
  import position = utils.chart.legend.positionChartArea;
  import LegendData = utils.chart.legend.LegendData;
  import ILegend = utils.chart.legend.ILegend;
  import legendIcon = utils.chart.legend.LegendIcon;
  import LegendPosition = utils.chart.legend.LegendPosition;
  import IValueFormatter = utils.formatting.IValueFormatter;
  import ValueFormatter = utils.formatting.valueFormatter;

  // tslint:disable-next-line:no-any
  let colorsPersistObject: any = {};
  let legendData: LegendData;
  let colorLegend: IColorLegend[] = [];
  let eventGroupFlag: boolean;
  let legendHeight: number;
  let calendarHeight: number;
  let highlightedLegend: string = "";
  const textAdjustmentValue: number = 20;
  const heightAdjustmentvalue: number = 25;
  const minLengthWeekChangeSameYear: number = 15;
  const maxLengthWeekChangeSameYear: number = 20;
  const minLengthWeekChangeNextyear: number = 24;
  const maxLengthWeekChangeNextyear: number = 27;
  const daysInWeek: number = 7;
  const daysInDecember: number = 31;
  const comaLiteral: string = ",";
  const spaceLiteral: string = " ";
  const dashLiteral: string = "-";
  const regex: RegExp = new RegExp(/[&\/\\#,+()$~%.'":*?<>{}]/g);
  const spaceRegex: RegExp = new RegExp(/\s/g);
  // tslint:disable-next-line:no-any
  const monthNum: any = {
    April: "4",
    August: "8",
    December: "12",
    February: "2",
    January: "1",
    July: "7",
    June: "6",
    March: "3",
    May: "5",
    November: "11",
    October: "10",
    September: "9"
  };
  // tslint:disable-next-line:no-any
  const monthName: any = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December"
  };

  // tslint:disable-next-line:interface-name
  export interface CalendarFormatter {
    startDataFormatter: IValueFormatter;
    endDataFormatter: IValueFormatter;
  }

  module CalendarRoles {
    export const startDate: string = "StartDate";
    export const endDate: string = "EndDate";
    export const tooltip: string = "Tooltip";
  }

  interface IColorLegend {
    keyName: string;
    color: string;
    selectionId: visuals.ISelectionId;
  }

  interface IBusinessHours {
    startTime: string;
    endTime: string;
    workDay: number[];
  }

  /**
   * Provide dynamic colors to events and legends based on events or eventgroup
   *
   * @category {DataViewCategoryColumn}   : Category Column
   * @index {number}                      : index value
   * @objectName {string}                 : object name defined in capabilities.json.
   * @propertyName {string}               : property name as specified  for the object
   * @defaultValue {T}                    : default color that will be set
   * @return {property}                   : returns color to be applied
   */
  export function getCategoricalObjectValue<T>(category: DataViewCategoryColumn, index: number,
                                               objectName: string, propertyName: string, defaultValue: T): T {
    const categoryObjects: DataViewObject[] = category.objects;
    if (categoryObjects) {
      const categoryObject: DataViewObject = categoryObjects[index];
      if (categoryObject) {
        const object: DataViewPropertyValue = categoryObject[objectName];
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
   * Clear message, legend, selection when update method is called.
   */
  function clearAll(): void {
    d3.select(".fieldMessage").remove();
    d3.select(".calendar").remove();
    d3.selectAll("#legendGroup").selectAll("g").remove();
    d3.select(".legendTitle").remove();
  }

  /**
   * Check whether data is present in startDate databag and events Databag,
   *
   * @options {VisualUpdateOptions}       : Category Column
   * @return {boolean}                    : returns true if required data is present
   */
  function MandatoryDataPresent(options: VisualUpdateOptions): boolean {
    let isStartDate: boolean = false;
    let isEvent: boolean = false;
    // tslint:disable-next-line:no-any
    const dataViewCategories: any[] = options.dataViews[0].categorical.categories;
    const categoriesLength: number = dataViewCategories.length;
    for (let iterator: number = 0; iterator < categoriesLength; iterator++) {
      if (dataViewCategories[iterator].source.roles.StartDate) {
        isStartDate = true;
      }
      if (dataViewCategories[iterator].source.roles.events) {
        isEvent = true;
      }
    }

    if (isStartDate === true && isEvent === true) {

      return true;
    }

    return false;
  }
  /**
   * Check whether mandatory data is present in required format
   *
   * @options {VisualUpdateOptions}       : Category Column
   * @return {boolean}                    : returns true if required data is present in required format
   */
  function MandatoryDataFormat(options: VisualUpdateOptions): boolean {
    // tslint:disable-next-line:no-any
    const dataViewCategories: any[] = options.dataViews[0].categorical.categories;
    let isStartDateFormat: boolean = false;
    let isEventFormat: boolean = false;

    const categoriesLength: number = dataViewCategories.length;
    for (let iterator: number = 0; iterator < categoriesLength; iterator++) {
      if (dataViewCategories[iterator].source.roles.StartDate
        && dataViewCategories[iterator].source.type.dateTime) {
        isStartDateFormat = true;
      }
      if (dataViewCategories[iterator].source.roles.events
        && dataViewCategories[iterator].source.type.text) {
        isEventFormat = true;
      }
    }

    if (isStartDateFormat === true && isEventFormat === true) {

      return true;
    }

    return false;
  }
  /**
   * Declaration of the main class
   */
  export class Visual implements IVisual {
    private static dataView: DataView;

    private static parseSettings(dataView: DataView): VisualSettings {
      return VisualSettings.parse(dataView) as VisualSettings;
    }

    public host: IVisualHost;
    // used for persisting Calendar View
    public calendarView: string = "month";
    public persistedDate: string = "";
    private settings: VisualSettings;
    private textNode: Text;
    private options: VisualConstructorOptions;
    private businessHoursObjectProperties: DataViewObject;
    private dataView: DataView;
    private legend: ILegend;
    private legendObjectProperties: DataViewObject;
    private selectionManager: ISelectionManager;

    constructor(options: VisualConstructorOptions) {
      this.options = options;
      this.host = options.host;
      this.legend = createLegend(options.element, false, null, true);
      this.selectionManager = options.host.createSelectionManager();
      // tslint:disable-next-line:no-any
      const dashboard: d3.Selection<any> = d3.select(options.element).append("div").attr("id", "dashboard");
    }

    /**
     * update() is called called whenever there is a change in the data or host environment.
     * @options {VisualUpdateOptions}
     * @return {void}
     */
    // tslint:disable-next-line:cyclomatic-complexity
    public update(options: VisualUpdateOptions): void {
      try {
      this.host.eventService.renderingStarted(options);
      this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
      const thisObj: this = this;
      // tslint:disable-next-line:no-any
      const startDateArray: any = [];
      // tslint:disable-next-line:no-any
      const eventArray: string[] = [];
      // tslint:disable-next-line:no-any
      const endDateArray: any = [];
      const eventGroupArray: string[] = [];
      const uniqueEvents: string[] = [];
      const uniqueColors: string[] = [];
      const eventColors: string[] = [];
      const eventGroup: string[] = [];
      const colors: string[] = [];
      const descriptionArray: string[] = [];
      let descriptionFlag: number = 0;
      const businessHours: IBusinessHours[] = [];
      const workDay: number[] = [];
      // contains index of category data, dragged into tooltip data bag
      const tooltipDataIndex: number[] = [];
      const toolTipDataColumnName: string[] = [];
      let eventName: string;
      let eventGroupName: string;
      let startDateIndex: number;
      let endDateIndex: number = null;
      let eventIndex: number;
      let eventGroupIndex: number = null;
      eventGroupFlag = false;
      let descriptionIndex: number = null;
      let categoriesLength: number;
      let endDateLength: number;
      let startDateCategory: DataViewCategoryColumn;
      let startWeekDay: number;
      const dataViews: DataView = options.dataViews[0];
      // tslint:disable-next-line:no-any
      const dataViewCategories: any[] = dataViews.categorical.categories;

      const viewPortHeight: number = options.viewport.height;
      const viewPortWidth: number = options.viewport.width;

      colorsPersistObject = {};
      const colorsPersistedArray: string = this.settings.caption.captionValue;
      // Retrieve persisted colors array value
      // tslint:disable-next-line:no-any
      const colorsParsedArray: any = JSON.parse(colorsPersistedArray);
      if (colorsPersistedArray !== "{}") {
        colorsPersistObject = colorsParsedArray;
      }

      // Clear message, selections, legend from screen
      clearAll();

      d3.select("#dashboard")
        .append("div")
        .classed("calendar", true)
        .append("div")
        .classed("fieldMessage", true)
        .attr("id", "calendar");

      // If mandatory field values are not entered, show error message
      const isMandatoryDataPresent: boolean = MandatoryDataPresent(options);
      if (!isMandatoryDataPresent) {
        d3.select(".fieldMessage").text(`'Start Date' and 'Event' are required fields`);
        d3.select(".fieldMessage").style("padding-top", `${(viewPortHeight / 2) - textAdjustmentValue}px`);
      }

      // If mandatory field values are entered, and data is not in correct format
      const isMandatoryDataFormat: boolean = MandatoryDataFormat(options);
      if (!isMandatoryDataFormat && isMandatoryDataPresent) {
        d3.select(".fieldMessage")
        .text(`'Start date' should be in 'datetime' format & 'Events' should be in 'text' format.`);
        d3.select(".fieldMessage").style("padding-top", `${(viewPortHeight / 2) - textAdjustmentValue}px`);
        // Initialized the 'dataViewCategories' to null so that calendar is not rendered
        dataViewCategories[0] = null;
      }

      categoriesLength = dataViewCategories.length;
      for (let index: number = 0; index < categoriesLength; index++) {
        if (dataViewCategories[index].source.roles.StartDate) {
          startDateIndex = index;
          startDateCategory = dataViewCategories[index];

        }
        if (dataViewCategories[index].source.roles.EndDate) {
          endDateIndex = index;
          endDateLength = dataViewCategories[endDateIndex].values.length;
        }
        if (dataViewCategories[index].source.roles.events) {
          eventIndex = index;
        }
        if (dataViewCategories[index].source.roles.EventGroup) {
          eventGroupIndex = index;
          eventGroupFlag = true;
        }

        if (dataViewCategories[index].source.roles.description) {
          descriptionFlag = 1;
          descriptionIndex = index;
          // to avoid repitition of values in tool tip
          if (toolTipDataColumnName.length !== 0) {
            for (let iterator: number = 0; iterator <= (toolTipDataColumnName.length - 1); iterator++) {
              if (toolTipDataColumnName.indexOf(dataViewCategories[index].source.displayName) === -1) {
                tooltipDataIndex.push(index);
                toolTipDataColumnName.push(dataViewCategories[index].source.displayName);
              }
            }
          } else {
            tooltipDataIndex.push(index);
            toolTipDataColumnName.push(dataViewCategories[index].source.displayName);
          }
        }
      }

      const startDateLength: number = dataViewCategories[startDateIndex].values.length;
      const eventLength: number = dataViewCategories[eventIndex].values.length;

      for (let index: number = 0; index < startDateLength; index++) {
        startDateArray.push(dataViewCategories[startDateIndex].values[index]
          ? new Date(dataViewCategories[startDateIndex].values[index]) : null);
        if (endDateIndex !== null) {
          endDateArray.push(dataViewCategories[endDateIndex].values[index] !== null
            ? (new Date(dataViewCategories[endDateIndex].values[index])) : null);

        }
      }

      const categoryColumn: DataViewCategoryColumn = dataViewCategories[startDateIndex];
      const eventColumn: DataViewCategoryColumn = dataViewCategories[eventIndex];
      let eventGroupColumn: DataViewCategoryColumn;

      // If user enters data in Event Group databag, legends will be rendered on event group
      if (eventGroupIndex !== null) {
        eventGroupColumn = dataViewCategories[eventGroupIndex];
        colorLegend = [];
        const uniqueValues: string[] = [];
        for (let index: number = 0; index < startDateLength; index++) {
          if (uniqueValues.indexOf(dataViewCategories[eventGroupIndex].values[index] as string) === -1 &&
            uniqueValues.indexOf("Others") === -1) {
            let tempEventGroup: string;
            tempEventGroup = eventGroupColumn.values[index]
            !== null ? eventGroupColumn.values[index].toString() : "Others";
            const label: string = tempEventGroup;
            const catPresent: boolean = label in colorsPersistObject;
            const defaultColor: string = catPresent ? colorsPersistObject[label]
            : this.host.colorPalette.getColor(tempEventGroup).value;
            colorsPersistObject[label] =
            getCategoricalObjectValue<Fill>(eventColumn, index, "colorSelector", "fillColor", {
              solid: {
                color: defaultColor
              }
            }).solid.color;
            colorLegend.push({
              color: colorsPersistObject[label],
              keyName: tempEventGroup,
              selectionId: this.host.createSelectionIdBuilder()
              .withCategory(startDateCategory, index).createSelectionId()
            });
            uniqueValues.push(dataViewCategories[eventGroupIndex].values[index] !== null ?
              dataViewCategories[eventGroupIndex].values[index] as string
               : dataViewCategories[eventGroupIndex].values[index] as string);
          }
          eventArray.push(dataViewCategories[eventIndex].values[index] as string);
          eventGroupArray.push(dataViewCategories[eventGroupIndex].values[index] !== null
            ? eventGroupColumn.values[index].toString() : "Others");
        }
      } else {  // If user  does not enters data in Event Group, legends will be rendered based on events
        colorLegend = [];
        const uniqueValues: string[] = [];
        for (let index: number = 0; index < startDateLength; index++) {
          if (uniqueValues.indexOf(dataViewCategories[eventIndex].values[index] as string) === -1) {
            const label: string = eventColumn.values[index].toString();
            const catPresent: boolean = label in colorsPersistObject;
            const defaultColor: string = catPresent ? colorsPersistObject[label] :
              this.host.colorPalette.getColor(eventColumn.values[index].toString()).value;
            colorsPersistObject[label]
             = getCategoricalObjectValue<Fill>(eventColumn, index, "colorSelector", "fillColor", {
              solid: {
                color: defaultColor
              }
            }).solid.color;
            colorLegend.push({
              color: colorsPersistObject[label],
              keyName: eventColumn.values[index].toString(),
              selectionId: this.host.createSelectionIdBuilder().withCategory(eventColumn, index).createSelectionId()
            });

            uniqueValues.push(dataViewCategories[eventIndex].values[index] as string);
          }
          eventArray.push(dataViewCategories[eventIndex].values[index] as string);
        }
      }

      // Add tool tip using titile, append data to tooltip string.
      let tooltipString: string = "";

      const tooltipData: string[] = [];
      if (descriptionFlag === 1) {
        for (let index: number = 0; index < startDateArray.length; index++) {
          tooltipString = "";
          for (let iterator: number = 0; iterator < tooltipDataIndex.length; iterator++) {
            // tslint:disable-next-line:no-any
            if (iterator === 0) {
              tooltipString = tooltipString.concat("\n");
            }
            // tslint:disable-next-line:no-any
            const dv: any = dataViewCategories[tooltipDataIndex[iterator]];
            tooltipString = tooltipString.concat(toolTipDataColumnName[iterator]);
            tooltipString = tooltipString.concat(" : ");
            if (dv.source.type.dateTime) {
              if (dv.values[index] as string !== null) {
                tooltipString = tooltipString.concat(
                  this.getFormattedValue(dv.source.format,
                                         new Date(dv.values[index])));
              } else {
                tooltipString = tooltipString.concat("Data Unavailable");
              }
            } else {
              if (dv.values[index] as string !== null) {
                tooltipString = tooltipString.concat(
                  this.getFormattedValue(dv.source.format,
                                         (dv.values[index])));
              } else {
                tooltipString = tooltipString.concat("Data Unavailable");
              }
            }
            tooltipString = tooltipString.concat("\n");
          }
          tooltipData.push(tooltipString);
        }
      }

      for (const index of eventArray) {
        if (jQuery.inArray(index, uniqueEvents) === -1) {
          uniqueEvents.push(index);
        }
      }

      if (eventGroupIndex !== null) {
        for (let index: number = 0; index < eventGroupArray.length; index++) {
          eventGroupName = eventGroupArray[index];
          for (const iterator of colorLegend) {
            if (eventGroupName === iterator.keyName) {
              eventColors[index] = iterator.color;
              break;
            }
          }
        }
      } else {
        for (let index: number = 0; index < eventArray.length; index++) {
          eventName = eventArray[index];
          for (const iterator of colorLegend) {
            if (eventName === iterator.keyName) {
              eventColors[index] = iterator.color;
              break;
            }
          }
          eventGroupArray.push("blank");
        }
      }

      if (this.settings.legend.show) {
        this.createLegend(options);
        legendHeight = this.legend.getMargins().height;
      } else if (this.settings.legend.show === false) {
        d3.select("#legendGroup").selectAll("g").remove();
        d3.select(".legendTitle").remove();
        d3.select("#dashboard").style("margin-top", "0");
        legendHeight = null;
      }

      if (legendHeight === null) {
        calendarHeight = options.viewport.height;
      } else {
        calendarHeight = options.viewport.height - legendHeight - heightAdjustmentvalue;
      }

      // Get List of all the days that needs to be displayed as working day
      if (this.settings.workDays.weekendSunday) {
        workDay.push(0);
      }
      if (this.settings.workDays.weekdayMonday) {
        workDay.push(1);
      }
      if (this.settings.workDays.weekdayTuesday) {
        workDay.push(2);
      }
      if (this.settings.workDays.weekdayWednesday) {
        workDay.push(3);
      }
      if (this.settings.workDays.weekdayThursday) {
        workDay.push(4);
      }
      if (this.settings.workDays.weekdayFriday) {
        workDay.push(5);
      }
      if (this.settings.workDays.weekendSaturday) {
        workDay.push(6);
      }

      const startTime: string = this.settings.workHours.startTime;
      let endTime: string = this.settings.workHours.endTime;
      if (endTime < startTime && startTime !== "00:00") {
        endTime = startTime;
        this.settings.workHours.endTime = startTime;
      }

      businessHours.push({
        endTime,
        startTime,
        workDay
      });

      // Get week day name to set beginning week in the calendar
      switch (this.settings.calendarSettings.startingWeekDay) {
        case "Monday": {
          startWeekDay = 1;
          this.settings.calendarSettings.startingWeekDay = "Monday";
          break;
        }
        case "Tuesday": {
          startWeekDay = 2;
          this.settings.calendarSettings.startingWeekDay = "Tuesday";
          break;
        }
        case "Wednesday": {
          startWeekDay = 3;
          this.settings.calendarSettings.startingWeekDay = "Wednesday";
          break;
        }
        case "Thursday": {
          startWeekDay = 4;
          this.settings.calendarSettings.startingWeekDay = "Thursday";
          break;
        }
        case "Friday": {
          startWeekDay = 5;
          this.settings.calendarSettings.startingWeekDay = "Friday";
          break;
        }
        case "Saturday": {
          startWeekDay = 6;
          this.settings.calendarSettings.startingWeekDay = "Saturday";
          break;
        }
        case "Sunday": {
          startWeekDay = 0;
          this.settings.calendarSettings.startingWeekDay = "Sunday";
          break;
        }
        default: {
          startWeekDay = 1;
          this.settings.calendarSettings.startingWeekDay = "Monday";
          break;
        }
      }

      /*If a view that is persisted is turned off, show default view.*/
      const persistedView: string = this.retrieveView();
      if ((persistedView === "" || persistedView === null) ||
        (persistedView === "agendaWeek" && !this.settings.buttons.week) ||
        (persistedView === "agendaDay" && !this.settings.buttons.day) ||
        (persistedView === "listMonth" && !this.settings.buttons.list)) {
        this.calendarView = "month";
        this.persistView();
      }
      if (descriptionFlag === 1) {
        this.getDatawithDescription(options, startDateArray, endDateArray,
                                    eventArray, eventColors, businessHours, tooltipData, eventGroupArray, startWeekDay);
      } else {
        this.getData(options, startDateArray, endDateArray, eventArray,
                     eventColors, businessHours, eventGroupArray, startWeekDay);
      }

      // Persist colors array
      this.settings.caption.captionValue = "{}";
      let properties: { [propertyName: string]: DataViewPropertyValue };
      properties = {};
      properties[`captionValue`] = JSON.stringify(colorsPersistObject);
      let caption1: VisualObjectInstancesToPersist;
      caption1 = {
        replace: [
          {
            objectName: "caption",
            properties,
            selector: null
          }]
      };
      this.host.persistProperties(caption1);

      this.host.eventService.renderingFinished(options);
    } catch (exeption) {
             this.host.eventService.renderingFailed(options, exeption);
        }
      }

    /**
     * Persist data stored in the variable calendarView.
     * @return {void}
     */
    public persistView(): void {
      const thisObj: Visual = this;
      let properties: { [propertyName: string]: DataViewPropertyValue };
      properties = {};
      properties[`calendarView`] = thisObj.calendarView;

      let persistCalendarView: VisualObjectInstancesToPersist;
      persistCalendarView = {
        replace: [
          {
            objectName: "persistCalendarView",
            properties,
            selector: null
          } as VisualObjectInstance]
      };
      thisObj.host.persistProperties(persistCalendarView);
    }

    /**
     * Retrive peristed string value
     * @return {string}                 : returns string value that has been persisted.
     */
    public retrieveView(): string {
      const view: string = this.settings.persistCalendarView.calendarView;

      return view;
    }

    /**
     * Persist data stored in the variable persistedDate.
     * @return {void}
     */
    public persistDate(): void {
      const thisObj: Visual = this;
      let properties: { [propertyName: string]: DataViewPropertyValue };
      properties = {};
      properties[`persistedDate`] = thisObj.persistedDate;

      let persistCalendarDate: VisualObjectInstancesToPersist;
      persistCalendarDate = {
        replace: [
          {
            objectName: "persistCalendarDate",
            properties,
            selector: null
          } as VisualObjectInstance]
      };
      thisObj.host.persistProperties(persistCalendarDate);
    }

    /**
     * Retrive peristed string value
     * @return {string}                 : returns date value that has been persisted.
     */
    public retrieveDate(): string {

      const dateString: string = this.settings.persistCalendarDate.persistedDate;

      return dateString;
    }

    /**
     * Apply formatter to the data
     * @tooltipFormat {any}       : data format
     * @d{any}                    : data d
     * @return {string}           : formatted data after applying the formatter settings
     */
    // tslint:disable-next-line:no-any
    public getFormattedValue(tooltipFormat: any, d: any): string {
      const primaryFormatter: IValueFormatter = ValueFormatter.create({
        format: tooltipFormat
      });

      return primaryFormatter.format(d);
    }

    /**
     * Add interactivity to legends and events
     *
     * @dataArray {string[]}                                   : contains list of event data
     * @selectionIdArray {ISelectionId[]}                      : contains array of selection Ids
     * @return {void}
     */
    public addSelection(dataArray: string[], selectionIdArray: ISelectionId[]): void {
      let selectedSelectionId: ISelectionId[] = [];
      let currentThis: this;
      currentThis = this;
      // tslint:disable-next-line:no-any
      let legends: any;
      legends = d3.selectAll(".legendItem");
      const selectionManager: ISelectionManager = this.selectionManager;
      // tslint:disable-next-line:no-any
      legends.on("click", function(d: any): void {
        if (d.tooltip !== highlightedLegend || (highlightedLegend === null) || highlightedLegend === "") {
          const selectedLegend: string = d.tooltip;
          highlightedLegend = d.tooltip;
          const dataArrayLength: number = dataArray.length;
          for (let iterator: number = 0; iterator < dataArrayLength; iterator++) {
            if (selectedLegend === dataArray[iterator]) {
              selectedSelectionId.push(selectionIdArray[iterator]);
            }
          }
          // tslint:disable-next-line:no-any
          selectionManager.select(selectedSelectionId).then((ids: any[]) => {
            const className: string = currentThis.EncodeData(d.tooltip);
            d3.selectAll(".event").style("opacity", ids.length > 0 ? 0.5 : 1);
            d3.selectAll(`.${className}`).style("opacity", 1);
            // tslint:disable-next-line:no-any
            let selectedEvent: any;
            selectedEvent = d3.selectAll(".fc-day-grid-event fc-h-event fc-event fc-start fc-end fc-draggable");
            legends.attr({
              "fill-opacity": ids.length > 0 ? 0.5 : 1
            });

            d3.select(this).attr({
              "fill-opacity": 1
            });
            selectedSelectionId = [];
          });
          (d3.event as Event).stopPropagation();
        } else if (d.tooltip !== highlightedLegend) {
          d3.selectAll(".event").style("opacity", 1);
          d3.selectAll(".legendItem").attr("fill-opacity", 1);
          highlightedLegend = "";
        }
      });
      d3.select("html").on("click",  (): void => {
        selectionManager.clear();
        d3.selectAll(".event").style("opacity", 1);
        d3.selectAll(".legendItem").attr("fill-opacity", 1);
        highlightedLegend = "";
      });
    }

    /**
     * Method to create legends
     *
     * @options {options}         : options
     * @return {void}
     */
    // tslint:disable-next-line:no-any
    public createLegend(options: any): void {
      // tslint:disable-next-line:no-any
      const dataViewCategories: any[] = options.dataViews[0].categorical.categories;
      const categoriesLength: number = dataViewCategories.length;
      let startDateIndex: number;
      let eventIndex: number = null;
      let eventGroupIndex: number = null;
      let legendIndex: number;
      for (let index: number = 0; index < categoriesLength; index++) {
        if (dataViewCategories[index].source.roles.StartDate) {
          startDateIndex = index;
        }
        if (dataViewCategories[index].source.roles.events) {
          eventIndex = index;
        }
        if (dataViewCategories[index].source.roles.EventGroup) {
          eventGroupIndex = index;
        }
      }
      if (eventGroupIndex !== null) {
        legendIndex = eventGroupIndex;
      } else {
        legendIndex = eventIndex;
      }

      // tslint:disable-next-line:no-any
      const selectionID: any[] = [];
      const startDateDataLength: number = dataViewCategories[startDateIndex].values.length;
      const data: string[] = [];

      if (eventGroupIndex !== null) {
        for (let index: number = 0; index < startDateDataLength; index++) {
          data.push(dataViewCategories[eventGroupIndex].values[index]);
          selectionID.push(this.host.createSelectionIdBuilder().withCategory(
            dataViewCategories[0], index).createSelectionId());
        }
      } else {
        for (let index: number = 0; index < startDateDataLength; index++) {
          data.push(dataViewCategories[eventIndex].values[index]);
          selectionID.push(this.host.createSelectionIdBuilder().withCategory(
            dataViewCategories[0], index).createSelectionId());
        }
      }

      const legendTitle: string = dataViewCategories[legendIndex].source.displayName;
      this.settings.legend.fontSize = this.settings.legend.fontSize > 18 ? 18 : this.settings.legend.fontSize;
      legendData = {
        dataPoints: [],
        fontSize: this.settings.legend.fontSize,
        labelColor: this.settings.legend.labelColor,
        title: legendTitle
      };

      const colorLegendLength: number = colorLegend.length;
      for (let legendIterator: number = 0; legendIterator < colorLegendLength; legendIterator++) {
        legendData.dataPoints.push({
          color: colorLegend[legendIterator].color,
          icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
          identity: this.host.createSelectionIdBuilder().withCategory(
            dataViewCategories[0], legendIterator).createSelectionId(),
          label: colorLegend[legendIterator].keyName,
          selected: false
        });
        if ((this.settings.legend.position) === "Top") {
          d3.select("#dashboard").style("margin-top", "50px");
          this.legend.changeOrientation(LegendPosition.Top);
        } else {
          d3.select("#dashboard").style("margin-top", "0");
          this.legend.changeOrientation(LegendPosition.Bottom);
        }

        this.legend.drawLegend(legendData, options.viewport);
      }
      const THIS: this = this;
      this.addSelection(data, selectionID);
      // tslint:disable-next-line:no-any
      $(".legend #legendGroup").on("click.load", ".navArrow", (): any => {
        THIS.addSelection(data, selectionID);
      });
    }

    /**
     * This function gets called for each of the objects defined in
     * the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */

    /**
     * Method to render calendar when data is dragged in tool tip databag
     * @options{any}                  : options
     * @startDateArray{any[]}         : array that contains start date of all the events
     * @endDateArray{any[]}           : array that contains end date for all the events
     * @eventArray{string[]}          : array of events
     * @eventColors{string[]}         : array of colors for events
     * @workHours{any[]}              : contains startTime, endTime, work Days
     * @descriptionArray{string[]}    : contains tooltip data
     * @eventGroupArray{string[]}     : contains arry of eventGroup for eventss
     * @startWeekDay{number}          : contains week start day number
     *
     * @return{void}
     */
    // tslint:disable-next-line

    // tslint:disable-next-line:no-any
    public getDatawithDescription(options: any, startDateArray: any[], endDateArray: any[], eventArray: string[],
      // tslint:disable-next-line:no-any
                                  eventColors: string[], workHours: any[],
                                  descriptionArray: string[], eventGroupArray: string[],
                                  startWeekDay: number): void {
      const thisObj: this = this;
      const today: Date = new Date();
      // tslint:disable-next-line:max-line-length
      const todayString: string = monthName[(today.getMonth() + 1)] + spaceLiteral + today.getDate() + comaLiteral + spaceLiteral + today.getFullYear();
      const persistedDate: string = this.retrieveDate();
      let showCalendarDate: string;
      if (persistedDate === null || persistedDate === "") {
        showCalendarDate = todayString;
        thisObj.persistedDate = showCalendarDate;
        thisObj.persistDate();
      } else {
        showCalendarDate = this.retrieveDate();
        thisObj.persistedDate = showCalendarDate;
      }
      let index: number = 0;
      // tslint:disable-next-line:no-any
      const jsonObj: any = [];
      const eventArrayLength: number = eventArray.length;

      for (index = 0; index < eventArrayLength; index++) {

        jsonObj.push({
          backgroundColor: eventColors[index],
          description: descriptionArray[index],
          end: endDateArray[index],
          group: eventGroupArray[index],
          start: startDateArray[index],
          title: eventArray[index]

        });
      }
      const buttons: string[] = [];
      if (this.settings.buttons.month) {
        buttons.push("month");
      }
      if (this.settings.buttons.week) {
        buttons.push("agendaWeek");
      }
      if (this.settings.buttons.day) {
        buttons.push("agendaDay");
      }
      if (this.settings.buttons.list) {
        buttons.push("listMonth");
      }

      $(".calendar").fullCalendar({

        navLinks: this.settings.calendarSettings.navLink,
        views: {
          month: {
            eventLimit: 3,
            displayEventTime: false
          },
          agendaWeek: {
            eventLimit: 3,
            displayEventTime: false
          },
          list: {
            displayEventTime: true
          },
          agendaDay: {

          }
        },
        header: {
          left: "prev,next today",
          center: "title",
          right: buttons.join(",")
        },
        firstDay: startWeekDay,
        height: calendarHeight,
        handleWindowResize: true,
        defaultDate: new Date(showCalendarDate),
        defaultView: this.retrieveView(),
        allDaySlot: false,
        isRTL: this.settings.calendarSettings.rtl,

        weekNumbers: this.settings.calendarSettings.weekNumber,
        businessHours: [
          {
            dow: workHours[0].workDay,
            start: workHours[0].startTime,
            end: workHours[0].endTime
          }
        ],

        nowIndicator: this.settings.calendarSettings.currentTimeLine,
        editable: false,
        selectable: true,
        events: jsonObj,
        eventTextColor: this.settings.events.fontColor,
        eventBorderColor: this.settings.events.borderColor,

        // tslint:disable-next-line:no-any
        eventRender(event: any, element: any): void {
          let className: string;
          if (eventGroupFlag) {
            className = thisObj.EncodeData(event.group);
          } else {
            className = thisObj.EncodeData(event.title);
          }
          element.attr("title", `${event.title} : ${event.description}`);
          element.addClass(className);
          element.addClass("event");
        }
      });

      d3.select(".fc-month-button").on("click",  (): void => {
        thisObj.calendarView = "month";
        thisObj.persistView();
      });

      d3.select(".fc-agendaWeek-button").on("click",  (): void => {
        thisObj.calendarView = "agendaWeek";
        thisObj.persistView();
      });

      d3.select(".fc-agendaDay-button").on("click",  (): void => {
        thisObj.calendarView = "agendaDay";
        thisObj.persistView();
      });

      d3.select(".fc-listMonth-button").on("click",  (): void => {
        thisObj.calendarView = "listMonth";
        thisObj.persistView();
      });

      d3.select(".fc-prev-button").on("click",  (): void => {
        const activeView: string = d3.select(".fc-state-active").text();
        const displayedDate: string = d3.select(".fc-center").text();
        if (activeView === "month" || activeView === "list") {
          const formattedDate: string = thisObj.getFormattedMonthDate(displayedDate);
          thisObj.persistedDate = formattedDate;
          thisObj.persistDate();
        } else
          if (activeView === "day") {
            thisObj.persistedDate = displayedDate;
            thisObj.persistDate();
          } else if (activeView === "week") {
            const formattedDate: string = thisObj.getFormattedWeekDate(displayedDate);
            thisObj.persistedDate = formattedDate;
            thisObj.persistDate();
          }
      });

      d3.select(".fc-next-button").on("click",  (): void => {
        const activeView: string = d3.select(".fc-state-active").text();
        const displayedDate: string = d3.select(".fc-center").text();

        if (activeView === "month" || activeView === "list") {
          const formattedDate: string = thisObj.getFormattedMonthDate(displayedDate);
          thisObj.persistedDate = formattedDate;
          thisObj.persistDate();
        } else
          if (activeView === "day") {
            thisObj.persistedDate = displayedDate;
            thisObj.persistDate();
          } else if (activeView === "week") {
            const formattedDate: string = thisObj.getFormattedWeekDate(displayedDate);
            thisObj.persistedDate = formattedDate;
            thisObj.persistDate();
          }
      });

      d3.select(".fc-today-button").on("click",  (): void => {
        thisObj.persistedDate = todayString;
        thisObj.persistDate();
      });
    }

    // tslint:disable-next-line:no-any
    public persist(view: string): any {
      this.calendarView = view;
      this.persistView();
    }

    /**
     * Method to format string and remove pecial characters and spaes
     * @data{string}         : data to be formatted
     * @data{string}         : formatted data
     */
    public removeSpecialCharacter(data: string): string {
      data = data.replace(regex, "");
      data = data.trim();

      return data;
    }

    /**
     * Method to format weekDateString
     * @WeekDateRange{string}         : options
     */
    public getFormattedWeekDate(weekDateRange: string): string {

      const monthDate: string = weekDateRange.split("–")[0];

      let month: string = monthDate.split(spaceLiteral)[0];
      month = this.removeSpecialCharacter(month);

      let date: string = monthDate.split(spaceLiteral)[1];
      date = this.removeSpecialCharacter(date);

      const weekDateRangeLength: number = weekDateRange.length;
      let year: string;
      // case: jan 1 - 7, 2001 ----> length = 15
      if (weekDateRangeLength >= minLengthWeekChangeSameYear && weekDateRangeLength <= maxLengthWeekChangeSameYear) {
        year = weekDateRange.split(",")[1];
      }

      if ((weekDateRangeLength >= minLengthWeekChangeNextyear && weekDateRangeLength <= maxLengthWeekChangeNextyear)) {
        year = weekDateRange.split(",")[2];
      }

      if ((weekDateRangeLength >= minLengthWeekChangeNextyear && weekDateRangeLength <= maxLengthWeekChangeNextyear)
        && ((month === "Dec") || (month === "December")
          && ((Number(date) + daysInWeek) > daysInDecember))
      ) {
        year = weekDateRange.split(" ")[2];
      }

      year = this.removeSpecialCharacter(year);

      const formattedString: string = month + spaceLiteral + date + comaLiteral + spaceLiteral + year;

      return formattedString;
    }

    /**
     * Method to format weekDateString
     * @WeekDateRange{string}               : options
     */
    public getFormattedMonthDate(monthYear: string): string {
      const year: string = monthYear.split(" ")[1];
      const month: string = monthYear.split(" ")[0];
      const monthNumber: string = monthNum[month].toString();
      const date: string = "1"; // default date if user selects month and list view.
      // const formattedDate : string = date + dashLiteral + month + dashLiteral + year;
      const formattedDate: string = month.substring(0, 3) + spaceLiteral + date + comaLiteral + spaceLiteral + year;

      return formattedDate;
    }
    /**
     * Method to encode the variables
     */
    public EncodeData(value: string): string {
      if (value === "") {
        return value.replace("", "sp");
      }
      if (value === null) {
        return value.replace("", "blank");
      }

      return value.replace(/[^A-Z0-9]/ig, "sp");
    }

    /**
     * Method to render calendar when tool tip data bag is empty
     * @options{any}                  : options
     * @startDateArray{any[]}         : array that contains start date of all the events
     * @endDateArray{any[]}           : array that contains end date for all the events
     * @eventArray{string[]}          : array of events
     * @eventColors{string[]}         : array of colors for events
     * @workHours{any[]}              : contains startTime, endTime, work Days
     * @eventGroupArray{string[]}     : contains arry of eventGroup for eventss
     * @startWeekDay{number}          : contains week start day number
     *
     * @return{void}
     */
    // tslint:disable-next-line
    public getData(options: any, startDateArray: any[], endDateArray: any[], eventArray: string[], eventColors: string[], workHours: any[], eventGroupArray: string[], startWeekDay: number): void {
      const thisObj: this = this;
      const today: Date = new Date();
      // tslint:disable-next-line:max-line-length
      const todayString: string = monthName[(today.getMonth() + 1)] + spaceLiteral + today.getDate() + comaLiteral + spaceLiteral + today.getFullYear();
      const persistedDate: string = this.retrieveDate();
      let showCalendarDate: string;
      if (persistedDate === null || persistedDate === "") {
        showCalendarDate = todayString;
        thisObj.persistedDate = showCalendarDate;
        thisObj.persistDate();
      } else {
        showCalendarDate = this.retrieveDate();
        thisObj.persistedDate = showCalendarDate;
      }
      let index: number = 0;
      // tslint:disable-next-line:no-any
      const jsonObj: any = [];
      // Creates JSON object for events
      const eventArrayLength: number = eventArray.length;
      for (index = 0; index < eventArrayLength; index++) {
        jsonObj.push({
          backgroundColor: eventColors[index],
          end: endDateArray[index],
          group: eventGroupArray[index],
          start: startDateArray[index],
          title: eventArray[index]
        });
      }
      const buttons: string[] = [];
      if (this.settings.buttons.month) {
        buttons.push("month");
      }
      if (this.settings.buttons.week) {
        buttons.push("agendaWeek");
      }
      if (this.settings.buttons.day) {
        buttons.push("agendaDay");
      }
      if (this.settings.buttons.list) {
        buttons.push("listMonth");
      }
      $(".calendar").fullCalendar({
        navLinks: this.settings.calendarSettings.navLink,
        eventLimit: true,
        views: {
          month: {
            eventLimit: 3,
            displayEventTime: false
          },
          week: {
            eventLimit: 3,
            displayEventTime: false
          },
          list: {
            displayEventTime: true
          }
        },
        header: {
          left: "prev,next today",
          center: "title",
          right: buttons.join(",")
        },
        firstDay: startWeekDay,
        height: calendarHeight,
        handleWindowResize: true,
        defaultDate: new Date(showCalendarDate),
        defaultView: this.retrieveView(),
        allDaySlot: false,
        isRTL: this.settings.calendarSettings.rtl,

        weekNumbers: this.settings.calendarSettings.weekNumber,
        businessHours: [
          {
            dow: workHours[0].workDay,
            start: workHours[0].startTime,
            end: workHours[0].endTime
          }
        ],
        nowIndicator: this.settings.calendarSettings.currentTimeLine,
        editable: false,
        selectable: true,
        events: jsonObj,
        eventTextColor: this.settings.events.fontColor,
        eventBorderColor: this.settings.events.borderColor,

        // tslint:disable-next-line:no-any
        eventRender(event: any, element: any): void {
          let className: string;
          if (eventGroupFlag) {
            className = thisObj.EncodeData(event.group);
          } else {
            className = thisObj.EncodeData(event.title);
          }
          element.attr("title", `${event.title}`);
          element.addClass(className);
          element.addClass("event");
        }
      });

      d3.select(".fc-month-button").on("click",  (): void => {
        thisObj.calendarView = "month";
        thisObj.persistView();
      });
      d3.select(".fc-agendaWeek-button").on("click",  (): void => {
        thisObj.calendarView = "agendaWeek";
        thisObj.persistView();
      });
      d3.select(".fc-agendaDay-button").on("click",  (): void => {
        thisObj.calendarView = "agendaDay";
        thisObj.persistView();
      });
      d3.select(".fc-listMonth-button").on("click",  (): void => {
        thisObj.calendarView = "listMonth";
        thisObj.persistView();
      });

      d3.select(".fc-prev-button").on("click",  (): void => {
        const activeView: string = d3.select(".fc-state-active").text();
        const displayedDate: string = d3.select(".fc-center").text();
        if (activeView === "month" || activeView === "list") {
          const formattedDate: string = thisObj.getFormattedMonthDate(displayedDate);
          thisObj.persistedDate = formattedDate;
          thisObj.persistDate();
        } else
          if (activeView === "day") {
            thisObj.persistedDate = displayedDate;
            thisObj.persistDate();
          } else if (activeView === "week") {
            const formattedDate: string = thisObj.getFormattedWeekDate(displayedDate);
            thisObj.persistedDate = formattedDate;
            thisObj.persistDate();
          }
      });

      d3.select(".fc-next-button").on("click", (): void => {
        const activeView: string = d3.select(".fc-state-active").text();
        const displayedDate: string = d3.select(".fc-center").text();
        if (activeView === "month" || activeView === "list") {
          const formattedDate: string = thisObj.getFormattedMonthDate(displayedDate);
          thisObj.persistedDate = formattedDate;
          thisObj.persistDate();
        } else
          if (activeView === "day") {
            thisObj.persistedDate = displayedDate;
            thisObj.persistDate();
          } else if (activeView === "week") {
            const formattedDate: string = thisObj.getFormattedWeekDate(displayedDate);
            thisObj.persistedDate = formattedDate;
            thisObj.persistDate();
          }
      });

      d3.select(".fc-today-button").on("click", (): void => {
        thisObj.persistedDate = todayString;
        thisObj.persistDate();
      });
    }

    // tslint:disable-next-line:max-line-length
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {

      let enumeration: VisualObjectInstance[];
      enumeration = [];

      switch (options.objectName) {

        case "legend":
          if (!this.settings.legend.show) {
            enumeration.push({
              displayName: "Legends",
              objectName: options.objectName,
              properties: {
                show: this.settings.legend.show
              },
              selector: null
            });
          } else {
            enumeration.push({
              displayName: "Legends",
              objectName: options.objectName,
              properties: {
                fontSize: this.settings.legend.fontSize,
                labelColor: this.settings.legend.labelColor,
                position: this.settings.legend.position,
                show: this.settings.legend.show
              },
              selector: null
            });
          }
          break;
        case "events":
          enumeration.push({
            displayName: "Event fields",
            objectName: options.objectName,
            properties: {
              borderColor: this.settings.events.borderColor,
              fontColor: this.settings.events.fontColor
                     },
            selector: null
          });
          break;
        case "buttons":
          enumeration.push({
            objectName: options.objectName,
            properties: {
              day: this.settings.buttons.day,
              list: this.settings.buttons.list,
              week: this.settings.buttons.week
            },
            selector: null
          });
          break;
        case "workHours":
          enumeration.push({
            objectName: options.objectName,
            properties: {
              endTime: this.settings.workHours.endTime,
              startTime: this.settings.workHours.startTime
                        },
            selector: null
          });
          break;
        case "workDays":
          enumeration.push({
            objectName: options.objectName,
            properties: {
              weekdayFriday: this.settings.workDays.weekdayFriday,
              weekdayMonday: this.settings.workDays.weekdayMonday,
              weekdayThursday: this.settings.workDays.weekdayThursday,
              weekdayTuesday: this.settings.workDays.weekdayTuesday,
              weekdayWednesday: this.settings.workDays.weekdayWednesday,
              weekendSaturday: this.settings.workDays.weekendSaturday,
              weekendSunday: this.settings.workDays.weekendSunday
            },
            selector: null
          });
          break;
        case "calendarSettings":
          enumeration.push({
            objectName: options.objectName,
            properties: {
              currentTimeLine: this.settings.calendarSettings.currentTimeLine,
              navLink: this.settings.calendarSettings.navLink,
              rtl: this.settings.calendarSettings.rtl,
              startingWeekDay: this.settings.calendarSettings.startingWeekDay,
              weekNumber: this.settings.calendarSettings.weekNumber
            },
            selector: null
          });
          break;
        case "colorSelector":
          for (const index of colorLegend) {
            enumeration.push({
              displayName: index.keyName,
              objectName: options.objectName,
              properties: {
                fillColor: index.color
              },
              selector: index.selectionId.getSelector()
            });
          }
          break;

        default:

      }

      return enumeration;
    }
  }
}
