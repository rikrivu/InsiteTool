import {
  APIHeader, APIPayload,
  SiteAPI, FilterOptionsAPI,
  SiteSummaryAPI,
  APIResponse
} from '../models/APIModels';
import { API_ENDPOINT } from '../app-config';
import { FiltersStateObject } from '../models/FilterCardModels';
import { MultiSelection } from '../models/DefaultMultiSelectModels';

const defaultHeader: APIHeader = {
  headers : { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

const createDefaultAPIPayload = (siteId: number): APIPayload => ({
  siteId: siteId,
  scdmChem: false,
  chemical: false,
  chemicals: [],
  location: false,
  locations: [],
  aoi: false,
  aois: [],
  analysisMethod: false,
  analysisMethods: [],
  matrixCode: false,
  matrixCodes: []
})

let filterOptionsAbortController: AbortController = new AbortController();
let mapLayersAbortController: AbortController = new AbortController();
let drillDownSummaryAbortController: AbortController = new AbortController();
let waterwellsLayerAbortController: AbortController = new AbortController();
let siteSummaryAbortController: AbortController = new AbortController();
let bookmarkAbortController: AbortController = new AbortController();

export const abort = (
  controller: AbortController,
  method?: string,
  body?: any, isFile?: boolean
): {options: RequestInit, controller: AbortController} => {

  controller.abort();
  controller = new AbortController();
  const signal: AbortSignal = controller.signal;

  const httpOptions: RequestInit = isFile ? { signal } : { headers: defaultHeader.headers, signal };

  if (method) {
    httpOptions.method = method;
  }
  if (body) {
    httpOptions.body = isFile ? body : JSON.stringify(body);
  }

  return {
    options: httpOptions,
    controller: controller
  };
}

const filtersStateToPayloadKeyMapper = (input: string): {activeKey: (keyof APIPayload | null), filterKey?: (keyof APIPayload | null)} => {
  switch (input) {
    case 'SCDMChem': {
      return {
        activeKey: 'scdmChem',
      };
    }
    case 'Chem': {
      return {
        activeKey: 'chemical',
        filterKey: 'chemicals'
      };
    }
    case 'Loc': {
      return {
        activeKey: 'location',
        filterKey: 'locations'
      };
    }
    case 'AOI': {
      return {
        activeKey: 'aoi',
        filterKey: 'aois'
      };
    }
    case 'Matrix Code': {
      return {
        activeKey: 'aoi',
        filterKey: 'aois'
      };
    }
    case 'Analysis Method': {
      return {
        activeKey: 'analysisMethod',
        filterKey: 'analysisMethods'
      };
    }
    default: {
      return {
        activeKey: null,
      };
    }
  }
}

export const createAPIPayload = (filterObj: FiltersStateObject, siteId: number): APIPayload => {
  // console.log('filterObj', filterObj);
  if (filterObj) {
    const payload: APIPayload = createDefaultAPIPayload(siteId ? siteId : filterObj.siteInfo.siteId);
    if (filterObj.filters) {
      Object.keys(filterObj.filters).forEach((key: string) => {
        const {activeKey, filterKey} = filtersStateToPayloadKeyMapper(key);
        if (activeKey) {
          (payload[activeKey] as boolean) =  filterObj.filters[key].active;
        }
        if (filterKey) {
          const selections: string[] | undefined = filterObj.filters[key]
          .selections?.reduce((list: string[], selection: MultiSelection) => {
            if (selection.selected) {
              list.push(selection.value)
            }
            return list;
          }, []);
          (payload[filterKey] as string[]) = selections ? selections : [];
        }
      })
    }
    return payload;
  } else {
    return createDefaultAPIPayload(siteId);
  }
}

export const getSites = async (): Promise<APIResponse<SiteAPI[]>> => {
  const res = await fetch(API_ENDPOINT + 'sites');
  return await res.json();
}

export const getFilterOptions = async (siteId: number): Promise<FilterOptionsAPI> => {
  const abortResponse: {options: RequestInit, controller: AbortController} = abort(filterOptionsAbortController);
  filterOptionsAbortController = abortResponse.controller;
  const res = await fetch(API_ENDPOINT + 'drilldownsummary/leftMenu?siteId=' + siteId, abortResponse.options);
  return await res.json();
}

export const getMapLayersList = async (filtersState: FiltersStateObject): Promise<APIResponse<any>> => {
  const payload: APIPayload = createAPIPayload(filtersState, filtersState.siteInfo.siteId);
  const abortResponse: {options: RequestInit, controller: AbortController} = abort(mapLayersAbortController, 'POST', payload);
  mapLayersAbortController = abortResponse.controller;

  const res = await fetch(API_ENDPOINT + 'map/layers', abortResponse.options);
  return await res.json();
}

export const getDrillDownSummary = async (filtersState: FiltersStateObject): Promise<APIResponse<any>> => {
  const payload: APIPayload = createAPIPayload(filtersState, filtersState.siteInfo.siteId);
  const abortResponse: {options: RequestInit, controller: AbortController} = abort(drillDownSummaryAbortController, 'POST', payload);
  drillDownSummaryAbortController = abortResponse.controller;

  const res = await fetch(API_ENDPOINT + 'map/drilldownsummary', abortResponse.options);
  return await res.json();
}

export const getWaterwellsLayerData = async (siteId: number): Promise<APIResponse<any>> => {
  const abortResponse: {options: RequestInit, controller: AbortController} = abort(waterwellsLayerAbortController);
  waterwellsLayerAbortController = abortResponse.controller;
  const res = await fetch(API_ENDPOINT + 'waterwellsPlot?siteId=' + siteId, abortResponse.options);
  return await res.json();
}

export const getSiteSummaryData = async (siteId: number): Promise<APIResponse<[SiteSummaryAPI]>> => {
  const abortResponse: {options: RequestInit, controller: AbortController} = abort(siteSummaryAbortController);
  siteSummaryAbortController = abortResponse.controller;
  const res = await fetch(API_ENDPOINT + 'siteSummary?siteId=' + siteId, abortResponse.options);
  return await res.json();
}

export const saveBookmarks = async (siteId: number, bookmark: string): Promise<APIResponse<string>> => {
  const abortResponse: {options: RequestInit, controller: AbortController} = abort(bookmarkAbortController, 'POST', {siteId, bookmark});
  bookmarkAbortController = abortResponse.controller;
  const res = await fetch(API_ENDPOINT + 'map/bookmark', abortResponse.options);
  return res.json();
}