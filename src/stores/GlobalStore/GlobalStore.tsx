import {Context, createContext, Dispatch, useReducer} from 'react';
import { FiltersStateObject } from '../../models/FilterCardModels';
import _ from 'lodash';

export interface GlobalStoreState {
  [key: string]: any;
}

export interface GlobalStoreAction {
  type: string;
  data: any;
}

export interface GlobalStoreActions {
  actions: GlobalStoreAction[];
}

const initialState: GlobalStoreState = {
  notification: {
    show: 'initial',
    type: null
  }
};
const globalStore: Context<GlobalStoreState> = createContext<GlobalStoreState>(initialState);
// console.log('globalStore', globalStore);
const Provider: React.Provider<GlobalStoreState> = globalStore.Provider;

const checkAppDataRefresh = (currentFiltersState: FiltersStateObject | undefined, incomingFiltersState: FiltersStateObject): FiltersStateObject => {
  const checkedFiltersState: FiltersStateObject = _.cloneDeep(incomingFiltersState);
  if (currentFiltersState && currentFiltersState.siteInfo.siteId ===  incomingFiltersState.siteInfo.siteId) {
    let refreshAppData: boolean = false;
    for (const key of Object.keys(currentFiltersState.filters)) {
      if (currentFiltersState.filters[key].active !== incomingFiltersState.filters[key].active) {
        refreshAppData = true;
        break;
      } else if (
        !_.isEqual(currentFiltersState.filters[key].selections, incomingFiltersState.filters[key].selections)
        && incomingFiltersState.filters[key].active
      ) {
        refreshAppData = true;
        break;
      }
    }
    checkedFiltersState.refreshAppData = refreshAppData;
  } else {
    checkedFiltersState.refreshAppData = true;
  }
  console.log('checkAppDataRefresh', currentFiltersState, incomingFiltersState, checkedFiltersState);
  return checkedFiltersState;
}

const GlobalStateProvider = ( { children } : any ) => {
    
  const [state, dispatch]: [GlobalStoreState, Dispatch<GlobalStoreActions | ((prev: GlobalStoreState) => GlobalStoreActions)>]
  = useReducer<
    (
      state: GlobalStoreState,
      actions: GlobalStoreActions | ((prev: GlobalStoreState) => GlobalStoreActions)
    ) => GlobalStoreState
  >
  ((state: GlobalStoreState, actionList: GlobalStoreActions | ((prev: GlobalStoreState) => GlobalStoreActions)) => {

    // console.log('actionList', state, actionList, typeof actionList)

    const newState: GlobalStoreState = {...state};
    // console.log('Actions', actionList.actions);

    const actionsToWork: GlobalStoreActions =
    typeof actionList === 'function' ? actionList(state) : actionList;

    actionsToWork.actions.forEach(action => {
      if (action.type === 'filtersState') {
        // console.log('FilterState Action', action);
        newState[action.type] = checkAppDataRefresh(state.filtersState, action.data)
        // console.log('Checked FiltersState', newState[action.type]);
      } else {
        newState[action.type] = action.data;
      }
    });
    return newState;

  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { globalStore, GlobalStateProvider }