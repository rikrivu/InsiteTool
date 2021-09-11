import { EventEmitterModel } from '../models/EventEmitterModels';

export enum Events {
  MAXIMIZED = 'maximized',
  OUTSIDE_CLICK = 'outside_click',
  FILTER_STATE = 'filter_state',
  CURRENT_TAB_TOPRIGHTCHARTSCARD = 'current_tab_topRightChartsCard',
  CURRENT_TAB_MATRIX_METHODS = 'current_tab_matrix_methods',
  CURRENT_TAB_TOPCHEMSOILPLOTS = 'current_tab_topChemSoilPlots',
  SET_CURRENT_TAB = 'set_current_tab',
  CURRENT_TAB_SITE_SUMMARY_AREA_LOC = 'current_tab_site_summary_area_loc',
  CURRENT_TAB_AOI = 'current_tab_aoi',
  CURRENT_TAB_TARGETED = 'current_tab_targeted',
  CURRENT_TAB_PERC_DETECT = 'current_tab_perc_detect',
  DATA_SITE_SUMMARY = 'data_site_summary'
  // use an enum to keep track of events similar to action types set as variables in redux
}

export const EventEmitter: EventEmitterModel = {
  events: {},
  dispatch(incomingEvents: Events[], data: any[]) {
    // console.log('EventEmitter', data, events);
    incomingEvents.forEach((event: Events, index: number) => {
      if (!this.events[event]) return;
      this.events[event].forEach((callback: any) => callback(data[index]))
    })
  },
  subscribe(event: Events, callback: (data: any) => any) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  },
  unsubscribe(event: Events) {
    if (!this.events[event]) return;
    delete this.events[event];
  }
}

export default EventEmitter;