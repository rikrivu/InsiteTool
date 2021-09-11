import { API_ENDPOINT } from '../app-config';
import { POIDataAPI, WetlandsDataAPI, WaterwellsDataAPI, APIResponse, DocumentsAPI } from '../models/APIModels';
import { abort } from './data-service';

let poiAbortController: AbortController = new AbortController();
let wetlandsAbortController: AbortController = new AbortController();
let waterwellsAbortController: AbortController = new AbortController();
let documentsAbortController: AbortController = new AbortController();
let uploadDocAbortController: AbortController = new AbortController();
let removeDocAbortController: AbortController = new AbortController();

export const getPOIData = async (siteId: string): Promise<APIResponse<POIDataAPI[]>> => {
  const abortResponse: {options: RequestInit, controller: AbortController} = abort(poiAbortController);
  poiAbortController = abortResponse.controller;
  const res = await fetch(API_ENDPOINT + 'poi?siteId=' + siteId, abortResponse.options);
  return await res.json();
}
  
export const getWetlandsData = async (siteId: string): Promise<APIResponse<WetlandsDataAPI[]>> => {
  const abortResponse: {options: RequestInit, controller: AbortController} = abort(wetlandsAbortController);
  wetlandsAbortController = abortResponse.controller;
  const res = await fetch(API_ENDPOINT + 'wetLands?siteId=' + siteId, abortResponse.options);
  return await res.json();
}
  
export const getWaterwellsData = async (siteId: string): Promise<APIResponse<WaterwellsDataAPI[]>> => {
  const abortResponse: {options: RequestInit, controller: AbortController} = abort(waterwellsAbortController);
  waterwellsAbortController = abortResponse.controller;
  const res = await fetch(API_ENDPOINT + 'waterwells?siteId=' + siteId, abortResponse.options);
  return await res.json();
}
  
export const getDocuments = async (siteId: string): Promise<APIResponse<DocumentsAPI[]>> => {
  const abortResponse: {options: RequestInit, controller: AbortController} = abort(documentsAbortController);
  documentsAbortController = abortResponse.controller;
  const res = await fetch(API_ENDPOINT + 'document/list?siteId=' + siteId, abortResponse.options);
  return await res.json();
}
  
export const uploadDocument = async (siteId: string, file: Blob): Promise<APIResponse<any>> => {
  const payload: FormData = new FormData();
  payload.append('file', file);
  payload.append('siteId', siteId);
  // console.log('uploadDocument', siteId, file, payload);
  const abortResponse: {options: RequestInit, controller: AbortController} = abort(uploadDocAbortController, 'POST', payload, true);
  uploadDocAbortController = abortResponse.controller;

  const res = await fetch(API_ENDPOINT + 'document/upload', abortResponse.options);
  return await res.json();
}

export const removeDocument = async (siteId: string, fileName: string): Promise<APIResponse<{count: number}>> => {
  const abortResponse: {options: RequestInit, controller: AbortController} = abort(removeDocAbortController, 'DELETE');
  removeDocAbortController = abortResponse.controller;
  const res = await fetch(
    API_ENDPOINT + 'document/delete?fileName=' + fileName + '&siteId=' + siteId,
    abortResponse.options
  );
  return await res.json();
}