import { format } from "date-fns";
import { API_ENDPOINT } from "../app-config";
import { APIResponse, TopChemicalsAPI, APIPayload, SoilPlotsAPI, TimeSeriesAPI, TSAPIPayload } from "../models/APIModels";
import { FiltersStateObject } from "../models/FilterCardModels";
import { TSFilterState } from "../models/TimeSeriesModels";
import { abort, createAPIPayload } from "./data-service";

let topChemAbortController: AbortController = new AbortController();
let soilPlotsAbortController: AbortController = new AbortController();
let tsChemicalsAbortController: AbortController = new AbortController();
let tsLocationsAbortController: AbortController = new AbortController();
let timemSeriesAbortController: AbortController = new AbortController();

export const getTopChemicals = async (filtersState: FiltersStateObject): Promise<APIResponse<TopChemicalsAPI[]>> => {
    const payload: APIPayload = createAPIPayload(filtersState, filtersState.siteInfo.siteId);
    const abortResponse: {options: RequestInit, controller: AbortController} = abort(topChemAbortController, 'POST', payload);
    topChemAbortController = abortResponse.controller;
  
    // const res = await fetch(API_ENDPOINT + 'insitetool/filter/topchemicals', abortResponse.options);
    const res = await fetch(API_ENDPOINT + 'drilldownsummary/filter/topchemicals', abortResponse.options);
    return await res.json();
}
  
  export const getSoilPlots = async (filtersState: FiltersStateObject): Promise<APIResponse<SoilPlotsAPI>> => {
    const payload: APIPayload = createAPIPayload(filtersState, filtersState.siteInfo.siteId);
    const abortResponse: {options: RequestInit, controller: AbortController} = abort(soilPlotsAbortController, 'POST', payload);
    soilPlotsAbortController = abortResponse.controller;
    // return fetch('./dummySoilPlotsData.json', abortResponse.options)
    const res = await fetch(API_ENDPOINT + 'soilsummary/soilplot', abortResponse.options);
    return await res.json();
}
  
  export const getChemicalSpecificLocations = async (siteId: number, chemical: string): Promise<APIResponse<string[]>> => {
    const abortResponse: {options: RequestInit, controller: AbortController} = abort(tsLocationsAbortController);
    tsLocationsAbortController = abortResponse.controller;
    // const res = await fetch('locSortDummyData.json');
    const res = await fetch(
      API_ENDPOINT + 'drilldownsummary/timeseries/locations?chemical='
      + chemical + '&siteId=' + siteId
    );
    return await res.json();
}
  
  export const getLocationSpecificChemicals = async (siteId: number, locations: string[]): Promise<APIResponse<string[]>> => {
    const abortResponse: {options: RequestInit, controller: AbortController} = abort(tsChemicalsAbortController);
    tsChemicalsAbortController = abortResponse.controller;
    // const res = await fetch('locSortDummyData.json');
    const res = await fetch(
      API_ENDPOINT + 'drilldownsummary/timeseries/chemicals?locations='
      + locations.join(',') + '&siteId=' + siteId
    );
    return await res.json();
}
  
  export const getTimeSeriesData = async (tsFilterState: TSFilterState): Promise<APIResponse<TimeSeriesAPI>> => {
    // console.log('tsFilterState from getCall', tsFilterState)
    const {siteId, Loc: locations, Chem: chemical, startDate, endDate}: TSFilterState = tsFilterState;
    const payload: TSAPIPayload  = {
      siteId, locations, chemical,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
}
    // console.log('payload TimeSeries', payload)
    const abortResponse: {options: RequestInit, controller: AbortController} = abort(timemSeriesAbortController, 'POST', payload);
    timemSeriesAbortController = abortResponse.controller;
    const res = await fetch(API_ENDPOINT + 'drilldownsummary/timeseries', abortResponse.options);
    return await res.json();
}