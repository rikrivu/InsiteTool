import { SetStateAction } from 'react';
import { APIResponse, TimeSeriesAPI, TimeSeriesDataAPI } from '../../../../models/APIModels';
import { MultiSelection } from '../../../../models/DefaultMultiSelectModels';
import { FiltersData } from '../../../../models/FilterCardModels';
import { MultiSelectProps } from '../../../../models/LayoutCardHeaderModels';
import {
    TSChartData, TSChartDataConsolidated, TSChartOptionsState,
    TSFilterSelectionsModel, TSFilterState, TSMultiSelectConfig
} from '../../../../models/TimeSeriesModels';
import { getChemicalSpecificLocations, getLocationSpecificChemicals } from '../../../../services/tc-sp-ts-data-service';
import { getIcon } from '../../../../utils/globalUtilityMethods';

export const timeSeriesMultiSelectConfig: TSMultiSelectConfig[] = [
    {
        settingsName: 'Loc',
        displayName: 'Locations',
    },
    {
        settingsName: 'Chem',
        displayName: 'Chemicals',
    }
]

export const createInitFilterState = (startDate: Date, endDate: Date): TSFilterState => {
    return {
        siteId: 0,
        Loc: [],
        Chem: '',
        startDate: startDate,
        endDate: endDate
    }
}

export const createTSFilterInitSelections = (filterCardData: {siteId: number, data: FiltersData[]}): TSFilterSelectionsModel => {
    const newSelections: TSFilterSelectionsModel = {
        siteId: filterCardData.siteId,
        Loc: [],
        Chem: [...filterCardData.data.find((filter: FiltersData) => filter.filterName === 'Chem')?.dropdown!]
    }
    
    if (newSelections?.Chem?.[0]) {
        newSelections.Chem[0].selected = true;
    }
    return newSelections;
}

export const createTSFilterSelections = (
    options: string[], defaultSelect: boolean, prevOptions?: string[]
): MultiSelection[] => {
    // console.log('createTSFilterLocSelections', options, prevOptions);
    return options.map((loc: string, index: number) => ({
        value: loc,
        selected: defaultSelect ? (index ? false : true) :
        prevOptions?.length && prevOptions.includes(loc) ? true : false 
    }));
}

export const timeSeriesFilterStateCallBack = (multiSelectID: string, checked: boolean, opt: MultiSelection) => {
    if (checked) {
        return (prev: TSFilterState | undefined) => {
            if (prev) {
                switch(multiSelectID) {
                    case 'Loc': {
                        return {
                            ...prev,
                            Loc: [...prev.Loc, opt.value]
                        };
                    }
                    case 'Chem': {
                        return {
                            ...prev,
                            Chem: opt.value,
                            // Loc: []     //Everytime Chemical changes reset Loc array
                        };
                    }
                    default: {
                        return prev;
                    }
                }
            } else return prev;
        }
    } else {
        return (prev: TSFilterState | undefined) => {
            // console.log('prev', prev)
            if (prev) {
                switch(multiSelectID) {
                    case 'Loc': {
                        return {
                            ...prev,
                            [multiSelectID as keyof TSFilterState]: (prev[multiSelectID as keyof TSFilterState] as string[])
                            .filter((item: string) => item !== opt.value)
                        };
                    }
                    case 'Chem': {
                        return {
                            ...prev,
                            Chem: '',
                            // Loc: []     //Everytime Chemical changes reset Loc array
                        };
                    }
                    default: {
                        return prev;
                    }
                }
            } else return prev;
        }
    }
}

const createChartDataObject = (apiObj: TimeSeriesDataAPI, key: string): TSChartData => ({
    [`avgRepLimitPPM-${key}`]: apiObj.avgRepLimitPPM,
    [`avgResultPPM-${key}`]: apiObj.avgResultPPM,
    [`detectFlag-${key}`]: apiObj.detectFlag,
    [`gapValue-${key}`]: apiObj.detectFlag === 'Y' ? apiObj.avgResultPPM : null,
    [`zeroValue-${key}`]: apiObj.detectFlag === 'Y' ? apiObj.avgResultPPM : 0,
    [`halfValue-${key}`]: apiObj.detectFlag === 'Y' ? apiObj.avgResultPPM : apiObj.avgRepLimitPPM / 2,
    [`equalValue-${key}`]: apiObj.detectFlag === 'Y' ? apiObj.avgResultPPM : apiObj.avgRepLimitPPM,
    timeStamp: apiObj.timeStamp
})

export const createChartData = (data: TimeSeriesAPI): TSChartDataConsolidated => {
    const finalData: TSChartDataConsolidated = Object.keys(data)
    .reduce((result: TSChartDataConsolidated, key: string, index: number) => {

        if (!result.plots.includes(key)) {
            result.plots.push(key);
        }

        if (!index) {
            result.chartData = data[key].map((apiObj: TimeSeriesDataAPI) => createChartDataObject(apiObj, key))
        } else {
            data[key].forEach((apiObj: TimeSeriesDataAPI) => {

                let foundObjIndex: number = result.chartData
                .findIndex((chartObj: TSChartData) => chartObj.timeStamp === apiObj.timeStamp);

                const newObj: TSChartData = createChartDataObject(apiObj, key);

                if (foundObjIndex >= 0) {
                    result.chartData[foundObjIndex] = {
                        ...result.chartData[foundObjIndex],
                        ...newObj
                    }
                } else {
                    result.chartData.push(newObj)
                }
            })
        }

        return result;
    }, {
        plots: [],
        chartData: []
    });

    return finalData;
}

export const getDataKey = (key: TSChartOptionsState['plotND']): TSChartOptionsState['dataKey'] => {
    switch(key) {
        case 'gaps': {
            return 'gapValue-';
        }
        case '0': {
            return 'zeroValue-';
        }
        case 'half': {
            return 'halfValue-';
        }
        case 'equal': {
            return 'equalValue-';
        }
    }
}

export const createHandleSelectionChange = (
    tsFilterSelections: TSFilterSelectionsModel | undefined,
    setTSFilterSelections: (value: SetStateAction<TSFilterSelectionsModel | undefined>) => void,
    setTimeSeriesFilterState: (value: SetStateAction<TSFilterState | undefined>) => void
): ((checked: boolean, opt: MultiSelection, multiSelectID: string) => void) => {
    return (checked: boolean, opt: MultiSelection, multiSelectID: string) => {
        console.log('handleSelectionChange', checked, opt, multiSelectID);
        if (tsFilterSelections) {
            setTSFilterSelections((prev: TSFilterSelectionsModel | undefined) => {
                if (prev) {
                    return {
                        ...prev,
                        [multiSelectID]: (prev[multiSelectID as keyof TSFilterSelectionsModel] as MultiSelection[])
                        .map((selection: MultiSelection) => ({
                            ...selection,
                            selected: opt.value === selection.value ? checked : selection.selected
                        }))
                    }
                } else {
                    return prev;
                }
            })
        }

        setTimeSeriesFilterState(timeSeriesFilterStateCallBack(multiSelectID, checked, opt));
    }
}

export const createRemoveAllSelections = (
    setTSFilterSelections: (value: SetStateAction<TSFilterSelectionsModel | undefined>) => void,
    setTimeSeriesFilterState: (value: SetStateAction<TSFilterState | undefined>) => void
) => {
    return (multiSelectID: string): void => {
        // console.log('removeAllSelections');
        setTSFilterSelections((prev: TSFilterSelectionsModel | undefined) => {
            if (prev) {
                return {
                    ...prev,
                    [multiSelectID]: (prev[multiSelectID as keyof TSFilterSelectionsModel] as MultiSelection[])
                    .map((selection: MultiSelection) => ({
                        ...selection,
                        selected: false
                    }))
                }
            } else {
                return prev
            }
        })
        setTimeSeriesFilterState((prev: TSFilterState | undefined) => {
            if (prev) {
                return {
                    ...prev,
                    [multiSelectID as keyof TSFilterState]: multiSelectID === 'Loc' ? [] : ''
                };
            } else return prev;
        })
    }
}

export const createTSMultiSelectProps = (
    tsFilterSelections: TSFilterSelectionsModel | undefined,
    handleSelectionChange: (checked: boolean, opt: MultiSelection, multiSelectID: string) => void,
    removeAllSelections: (multiSelectID: string) => void
): MultiSelectProps[] | undefined => {
    if (tsFilterSelections) {
        return timeSeriesMultiSelectConfig.reduce((result: MultiSelectProps[], config: TSMultiSelectConfig) => {
            // console.log('config.settingsName', config.settingsName)
            const newProp: MultiSelectProps = {
                showSelections: false,
                multiSelectID: config.settingsName,
                title: config.displayName,
                selectOptions: [...(tsFilterSelections[config.settingsName as keyof TSFilterSelectionsModel] as MultiSelection[])],
                handleSelectionChange: handleSelectionChange,
                removeAllSelections: removeAllSelections,
                icon: getIcon(config.settingsName)
            }

            if (config.settingsName === 'Chem') {
                newProp.maxSelection = 1;
            }

            if (config.settingsName === 'Loc') {
                newProp.maxSelection = 10;
            }

            result.push(newProp)
            return result;
        }, [])
    }
}

export const getLocations = async (
    chemical: string | undefined,
    filterCardData: {siteId: number, data: FiltersData[]}
): Promise<string[] | null> => {
    console.log('Chem', chemical);
    if (chemical?.length) {
        return await getChemicalSpecificLocations(filterCardData.siteId, chemical)
        .then((loc: APIResponse<string[]>) => loc.resultSet);
    } else if (chemical === '') {
        return new Promise((resolve, reject) => {
            const locations: FiltersData | undefined = filterCardData.data
            .find((filter: FiltersData) => filter.filterName === 'Loc');
            resolve(locations?.dropdown ? [...locations.dropdown?.map((opt: MultiSelection) => opt.value)] : null);
        })
    } else {
        return new Promise((resolve, reject) => {
            resolve(null);
        })
    }
}

export const getChemicals = async (
    locations: string[] | undefined,
    filterCardData: {siteId: number, data: FiltersData[]}
): Promise<string[] | null> => {
    console.log('locations', locations);

    if (locations) {
        if (locations.length) {
            return await getLocationSpecificChemicals(filterCardData.siteId, locations)
            .then((chem: APIResponse<string[]>) => chem.resultSet);
        } else {
            return new Promise((resolve, reject) => {
                const chemicals: FiltersData | undefined = filterCardData.data
                .find((filter: FiltersData) => filter.filterName === 'Chem');
                resolve(chemicals?.dropdown ? [...chemicals.dropdown?.map((opt: MultiSelection) => opt.value)] : null);
            })
        }
    } else {
        return new Promise((resolve, reject) => {
            resolve(null);
        })
    }
}

export const checkIfLocationsUpdated = (locations: string[], prevLocations: string[] | undefined): false | string[] => {
    if (prevLocations) {
        const intersection: string[] = locations.filter((loc: string) => prevLocations.includes(loc));
        return intersection.length === prevLocations.length ? false : intersection;
    } else {
        return false;
    }
}