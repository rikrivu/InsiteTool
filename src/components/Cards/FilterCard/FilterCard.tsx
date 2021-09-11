import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from 'react';
import './FilterCard.scss';
import { getFilterOptions } from '../../../services/data-service';

// Import Components
import CustomSwitch from '../../shared/CustomSwitch/CustomSwitch';

// Import 3rd Party Libraries
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import _ from 'lodash';

// Import Models
import {  FilterOptionsAPI } from '../../../models/APIModels';
import { FiltersData, FiltersStateObject } from '../../../models/FilterCardModels';

// Local Imports
import {
    handlePanelToggle, toggleSelectAll,
    createFiltersStateSelection, enableApplyFilters,
    createFilterFromAPI, createFilterFromStore
} from '../../../utils/filterCardMethods';
import { GlobalStoreState, globalStore } from '../../../stores/GlobalStore/GlobalStore';
import DefaultMultiSelect from '../../shared/DefaultMultiSelect/DefaultMultiSelect';
import { MultiSelection } from '../../../models/DefaultMultiSelectModels';
import { WrappingCardChildrenProps } from '../../../models/AppDashboardModels';
import { getIcon } from '../../../utils/globalUtilityMethods';

function FilterCard (props: WrappingCardChildrenProps) {
    // console.log('FilterCard props', props);

    const [filtersDataAPI, setFiltersDataAPI]: [FiltersData[] | undefined, Dispatch<SetStateAction<FiltersData[] | undefined>>]
    = useState<FiltersData[]>();

    const [filterAccordionState, setFilterAccordionState]: [boolean[], Dispatch<SetStateAction<boolean[]>>]
    = useState<boolean[]>([]);

    const [filtersState, setFiltersState]: [FiltersStateObject | undefined, Dispatch<SetStateAction<FiltersStateObject | undefined>>]
    = useState<FiltersStateObject>();

    const [isApplyFilterActive, setIsApplyFilterActive]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);

    const globalState: GlobalStoreState = useContext<GlobalStoreState>(globalStore);
    const { dispatch } = globalState;
    // console.log('globalState FilterCard', globalState);

    useEffect(() => {
        if (globalState.state.siteInfo) {

            // console.log('siteInfo', globalState.state.siteInfo, globalState.state.filtersState);

            if (
                !globalState.state.filterCardData ||
                globalState.state.siteInfo?.siteId !== globalState.state.filtersState?.siteInfo.siteId
            ) {
                setFiltersDataAPI(undefined);
                getFilterOptions(globalState.state.siteInfo.siteId).then((data: FilterOptionsAPI) => {
                    const [newPanelState, newFiltersState, newFiltersData]: [boolean[], FiltersStateObject, FiltersData[]] =
                    createFilterFromAPI(data, globalState.state.siteInfo);
                    
                    // console.log('newFiltersState', newFiltersState);
    
                    setFilterAccordionState(newPanelState);
                    setFiltersState(newFiltersState);
                    setFiltersDataAPI(newFiltersData);
                    // console.log('Dispatching FiltersState');
                    dispatch((prev: GlobalStoreState) => ({
                        ...prev,
                        actions: [
                            {type: 'filtersState', data: {...newFiltersState}},
                            {type: 'filterCardData', data: {
                                siteId: globalState.state.siteInfo.siteId,
                                data: [...newFiltersData]
                            }}
                        ]
                    }))
                    // console.log('FilterAPIData', data, newFiltersData, newPanelState, newFiltersState);
                })
            } else {
                const [newPanelState, newFiltersState]: [boolean[], FiltersStateObject] =
                createFilterFromStore(globalState.state.filtersState, globalState.state.siteInfo);
                // console.log('NewPanelState', newPanelState);
                setFilterAccordionState((currentPanelState: boolean[]) => {
                    return currentPanelState.length ? currentPanelState : newPanelState;
                });
                setFiltersState((currentFiltersState: FiltersStateObject | undefined) => {
                    // console.log('currentFiltersState', currentFiltersState, newFiltersState);
                    if (currentFiltersState) {
                        return currentFiltersState;
                    } else {
                        return newFiltersState;
                    }
                });
                setFiltersDataAPI(globalState.state.filterCardData.data);
                // console.log('FilterAPIData from Store', globalState.state.filterCardData, newPanelState, newFiltersState);
            }
        }
    }, [dispatch, globalState.state.filterCardData, globalState.state.filtersState, globalState.state.siteInfo]);

    useEffect(() => {
        if (props.setLoader) {
            if (filtersDataAPI?.length) {
                props.setLoader({showLoader: false})
            } else {
                props.setLoader({
                    showLoader: true,
                    position: props.loaderPosition
                })
            }
        }
    }, [filtersDataAPI?.length, props])

    useEffect(() => {
        setIsApplyFilterActive(enableApplyFilters(globalState.state.filtersState, filtersState))
    }, [filtersState, globalState.state.filtersState])

    // Handle for selection change in any of the multiselect dropdowns
    const handleSelectionChange = useCallback((checked: boolean, opt: MultiSelection, filterName: string): void => {
        if (filtersState) {
            const updatedFiltersState: FiltersStateObject = _.cloneDeep(filtersState);

            const index: (number | undefined) = updatedFiltersState.filters[filterName]
            .selections?.findIndex((selection: MultiSelection) => selection.value === opt.value);
            
            if (index !== undefined && index >= 0) {
                updatedFiltersState.filters[filterName].selections![index].selected = checked;
                setFiltersState(updatedFiltersState)
            }
        }
    }, [filtersState])

    // Handle for removing all selections in any of the multiselect dropdowns
    const removeAllSelections = useCallback((filterName: string): void => {

        setFiltersState((currentFiltersState: (FiltersStateObject | undefined)) => {
            if (currentFiltersState?.filters[filterName]?.selections?.length) {

                let updatedFiltersState: FiltersStateObject = {...currentFiltersState};
                updatedFiltersState.filters[filterName].selections
                = createFiltersStateSelection(updatedFiltersState.filters[filterName].selections!, false);

                return updatedFiltersState;
            } else {
                return currentFiltersState;
            }
        });
    }, [])

    const applyFilters = useCallback((): void => {
        dispatch({
            ...globalState.state,
            actions: [
                {type: 'filtersState', data: filtersState},
            ]
        })
    }, [dispatch, filtersState, globalState.state])
    
    return (
        <>
            <div className="filters-container app-scroll">
                {
                    filtersDataAPI?.length ? filtersDataAPI.map((filter: FiltersData, index: number) => {
                        return (
                            <div key={index} className="filter-item-wrapper">
                                <div className={`${
                                        !filterAccordionState[index] ? 'filter-item' : ''
                                    }${
                                        filter.dropdown ? ' hoverable' : ''
                                    }${
                                        filterAccordionState[index] ? ' open-filter-item' : ''
                                    }`}
                                >
                                    {
                                        filter.dropdown?.length ?
                                        (
                                            <button type="button" className="filter-btn"
                                                onClick={() => handlePanelToggle(index, filterAccordionState, setFilterAccordionState)}
                                            >
                                                {
                                                    filterAccordionState[index] ?
                                                    <KeyboardArrowDownIcon className="panel-arrow"/>
                                                    : <KeyboardArrowRightIcon className="panel-arrow"/>
                                                }
                                                <div className="filter-icon">{getIcon(filter.filterName)}</div>
                                                <div className="filter-label">{filter.filterName}</div>
                                            </button>
                                        ) :
                                        (
                                            <div className="filter-non-btn">
                                                <KeyboardArrowRightIcon className="panel-arrow" style={{visibility: 'hidden'}}/>
                                                <div className="filter-icon">{getIcon(filter.filterName)}</div>
                                                <div className="filter-label">{filter.filterName}</div>
                                            </div>
                                        )
                                    }
                                    <CustomSwitch checked={filtersState?.filters?.[filter.filterName] ? filtersState.filters[filter.filterName].active : false}
                                        onChange={(event: any, checked: boolean) => toggleSelectAll(
                                            filter.filterName, checked, setFiltersState
                                        )}
                                    />
                                </div>
                                {
                                    filterAccordionState[index] ? 
                                    <div className="dropdown-container">
                                        <div className="dropdown-label">{filter.dropdownLabel}:</div>
                                        <DefaultMultiSelect
                                            multiSelectID={filter.filterName}
                                            showSelections={true}
                                            selectOptions={filtersState?.filters[filter.filterName].selections!}
                                            handleSelectionChange={handleSelectionChange}
                                            removeAllSelections={removeAllSelections}
                                        />
                                    </div>
                                    : null
                                }
                            </div>
                        );
                    })
                    : null
                }

                <div className="apply-filters-btn">
                    <button type="button" onClick={applyFilters} disabled={!isApplyFilterActive}>Apply Filters</button>
                </div>

            </div>
        </>
    );
}

export default FilterCard;