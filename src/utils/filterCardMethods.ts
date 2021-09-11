import _ from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { filterConfig } from '../components/Cards/FilterCard/filterConfig';
import { FilterOptionsAPI, SiteAPIWithShapefileInfo } from '../models/APIModels';
import { MultiSelection } from '../models/DefaultMultiSelectModels';
import { FilterConfigModel, FiltersData, FiltersState, FiltersStateObject } from '../models/FilterCardModels';

const togglePanelArray = (currentPanel: boolean[], index: number): boolean[] => {
    return currentPanel.map((item: boolean, i: number) => i === index ? !currentPanel[index] : false);
    // console.log('CurrentPanel', updatedPanel);
}

export const handlePanelToggle = (
    index: number,
    filterPanelState: boolean[],
    setFilterAccordionState: Dispatch<SetStateAction<boolean[]>>,
): void => {
    const updatedFilterPanelState: boolean[] = togglePanelArray(filterPanelState, index);
    // console.log('index', index, updatedFilterPanelState);
    setFilterAccordionState(updatedFilterPanelState);
}

export const toggleSelectAll = (
    filterName: string,
    checked: boolean,
    setFiltersState: Dispatch<SetStateAction<FiltersStateObject | undefined>>,
): void => {
    setFiltersState((prev: (FiltersStateObject | undefined)) => {
        console.log('Switch Toggled', prev, checked, filterName);

        if (prev) {
            return {
                ...prev,
                filters: {
                    ...prev.filters,
                    [filterName]: {
                        ...prev.filters[filterName],
                        active: checked
                    }
                }
            };
        } else {
            return prev;
        }
    })
}

export const createFiltersStateSelection = (
    selections: MultiSelection[],
    checked: boolean
): MultiSelection[] => (selections.map((selection: MultiSelection) => ({
    value: selection.value,
    selected: checked
})));

export const enableApplyFilters = (
    stateInStore: (FiltersStateObject | undefined), localState: (FiltersStateObject | undefined)
): boolean => {

    if (localState && stateInStore) {

        if (stateInStore.siteInfo.siteId !== localState.siteInfo.siteId) {
            return true;
        }
        
        // console.log('stateInStore', stateInStore);
        // console.log('localState', localState)

        for (let key of Object.keys(localState.filters)) {
            if (!stateInStore.filters[key].active && !localState.filters[key].active) {
                continue;
            } else {
                if (stateInStore.filters[key].active !== localState.filters[key].active) {
                    return true;
                }
                if (!_.isEqual(localState.filters[key].selections, stateInStore.filters[key].selections)) {
                    return true;
                }
            }
        }
    
        return false;
    } else {
        return false;
    }
}

export const createFilterFromAPI = 
(
    data: FilterOptionsAPI,
    siteInfo: SiteAPIWithShapefileInfo
): [boolean[], FiltersStateObject, FiltersData[]] => {

    const [newPanelState, newFiltersState, newFiltersData]: [boolean[], FiltersStateObject, FiltersData[]]
    = [
        [],
        {
            siteInfo: {...siteInfo},
            refreshAppData: true,
            filters: {}
        },
        []
    ];
    
    Object.keys(filterConfig).forEach((key: keyof FilterConfigModel) => {
        newFiltersState.filters[filterConfig[key].filterName] = {
            active: false,
            filterName: filterConfig[key].filterName,
        }
        const newFilter: FiltersData = {
            filterName: filterConfig[key].filterName
        };
        if (filterConfig[key].dropdown && data[key]?.length) {
            
            newFilter.dropdown = [];
            newFiltersState.filters[filterConfig[key].filterName].selections = [];

            data[key].forEach((filter: string) => {
                newFilter.dropdown?.push({
                    value: filter,
                    selected: false
                });
                newFiltersState.filters[filterConfig[key].filterName].selections?.push({
                    value: filter,
                    selected: false
                })
            });

            newFilter.dropdownLabel = filterConfig[key].dropdownLabel
        }
        // console.log('NewFilters', newFiltersData)
        newFiltersData.push(newFilter);
        newPanelState.push(false);
    });
    // console.log('NewFilters', newPanelState, newFiltersState, newFiltersData)
    return [newPanelState, newFiltersState, newFiltersData];
}

export const createFilterFromStore =
(
    filtersState: (FiltersStateObject | undefined),
    siteInfo: SiteAPIWithShapefileInfo
): [boolean[], FiltersStateObject] => {
    // console.log('FilerState create', filtersState);
    const newPanelState: boolean[] = [];
    const newFiltersState: FiltersStateObject = filtersState ? _.cloneDeep(filtersState) : {
        siteInfo: {...siteInfo},
        refreshAppData: true,
        filters: {}
    };
    if (!filtersState) {
        Object.keys(filterConfig).forEach((key: keyof FilterConfigModel) => {
            newFiltersState.filters[filterConfig[key].filterName] = {
                active: false,
                filterName: filterConfig[key].filterName,
            }
            if (filterConfig[key].dropdown) {
                newFiltersState.filters[filterConfig[key].filterName].selections = [];
            }
            newPanelState.push(false);
        });
    } else {
        Object.keys(filtersState.filters).forEach((key: keyof FiltersState) => {
            newPanelState.push(false);
        });
    }

    return [newPanelState, newFiltersState];
}