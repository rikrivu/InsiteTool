import { API_ENDPOINT } from '../app-config';
import { APIResponse, MatrixAPI, APIPayload, MethodsAPI, ChemicalsAPI } from '../models/APIModels';
import { FiltersStateObject } from '../models/FilterCardModels';
import { abort, createAPIPayload } from './data-service';

let matrixAbortController: AbortController = new AbortController();
let methodsAbortController: AbortController = new AbortController();
let chemicalsAbortController: AbortController = new AbortController();

export const getMatrixData = async (filtersState: FiltersStateObject): Promise<APIResponse<MatrixAPI[]>> => {
    // console.log('filtersState Matrix API', filtersState);
    const payload: APIPayload = createAPIPayload(filtersState, filtersState.siteInfo.siteId);
    const abortResponse: {options: RequestInit, controller: AbortController} = abort(matrixAbortController, 'POST', payload);
    matrixAbortController = abortResponse.controller;
  
    const res = await fetch(API_ENDPOINT + 'drilldownsummary/filter/matrix', abortResponse.options);
    return await res.json();
}
  
export const getMethodsData = async (filtersState: FiltersStateObject): Promise<APIResponse<MethodsAPI[]>> => {
    const payload: APIPayload = createAPIPayload(filtersState, filtersState.siteInfo.siteId);
    const abortResponse: {options: RequestInit, controller: AbortController} = abort(methodsAbortController, 'POST', payload);
    methodsAbortController = abortResponse.controller;
  
    const res = await fetch(API_ENDPOINT + 'drilldownsummary/filter/methods', abortResponse.options);
    return await res.json();
}

export const getChemicalsData = async (filtersState: FiltersStateObject): Promise<APIResponse<ChemicalsAPI[]>> => {
    const payload: APIPayload = createAPIPayload(filtersState, filtersState.siteInfo.siteId);
    const abortResponse: {options: RequestInit, controller: AbortController} = abort(chemicalsAbortController, 'POST', payload);
    chemicalsAbortController = abortResponse.controller;
  
    const res = await fetch(API_ENDPOINT + 'drilldownsummary/chemicals', abortResponse.options);
    return await res.json();
}