import { Dispatch, SetStateAction, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { GlobalStoreState, globalStore } from '../../../../stores/GlobalStore/GlobalStore';
import { chartMapper } from '../../../Charts/utils/defaultChartMethods';
import _ from 'lodash';
import { APIResponse, SoilPlotBarData, SoilPlotChartData, SoilPlotDataAPI, SoilPlotsAPI } from '../../../../models/APIModels';
import LayoutCardHeader from '../../../shared/LayoutCardHeader/LayoutCardHeader';
import { MultiSelection } from '../../../../models/DefaultMultiSelectModels';
import { MultiSelectProps } from '../../../../models/LayoutCardHeaderModels';
import { MAX_ALLOWED_PLOTS } from '../../../../app-config';
import { LayoutConfigComponentTab, LoaderType } from '../../../../models/AppDashboardModels';
import { getIcon } from '../../../../utils/globalUtilityMethods';
import { getSoilPlots } from '../../../../services/tc-sp-ts-data-service';

const createStackedBarChartDataWithSelections
= (
    apiData: SoilPlotsAPI, MAX_ALLOWED_PLOTS: number
): [SoilPlotBarData[], SoilPlotBarData[], MultiSelection[]] => {

    return apiData.plotData.reduce(
        (chartData: [SoilPlotBarData[], SoilPlotBarData[], MultiSelection[]], bar: SoilPlotDataAPI, index: number) => {
        const newLevel: any = {
            name: bar.name
        };
        for (let i = 0; i < apiData.maxLevels; i++) {
            if (i < bar.graphics.length) {
                newLevel[`level${i + 1}`] = {...bar.graphics[i]}
            } else {
                newLevel[`level${i + 1}`] = {
                    graphic: 'NONE',
                    value: 0
                }
            }
        }
        chartData[0].push(newLevel as SoilPlotBarData);

        if (index < MAX_ALLOWED_PLOTS) {
            chartData[1].push(newLevel as SoilPlotBarData);
        }
        chartData[2].push({
            value: bar.name,
            selected: index < MAX_ALLOWED_PLOTS
        })
        return chartData;
    }, [[], [], []]);
}

const createSelectionsWithFilteredData = (data: SoilPlotChartData, MAX_ALLOWED_PLOTS: number): [SoilPlotBarData[], MultiSelection[]] => {
    return data.plotData.reduce((chartData: [SoilPlotBarData[], MultiSelection[]], bar: SoilPlotBarData, index: number) => {
        if (index < MAX_ALLOWED_PLOTS) {
            chartData[0].push({...bar})
        }
        chartData[1].push({
            value: bar.name,
            selected: index < MAX_ALLOWED_PLOTS
        })
        return chartData;
    }, [[], []])
}

function SoilPlotTab (props: {
    tab: LayoutConfigComponentTab,
    isMaximized: boolean,
    setLoader: Dispatch<SetStateAction<LoaderType>> | undefined,
    loaderPosition: 'default-loader' | 'br-loader' | 'tr-loader'
}) {

    const [soilPlotData, setSoilPlotData]
    : [(SoilPlotChartData | undefined), Dispatch<SetStateAction<SoilPlotChartData | undefined>>]
    = useState<SoilPlotChartData>();

    const [filteredSoilPlotData, setFilteredSoilPlotData]
    : [(SoilPlotChartData | undefined), Dispatch<SetStateAction<SoilPlotChartData | undefined>>]
    = useState<SoilPlotChartData>();

    const [currentSelections, setCurrentSelections]
    : [MultiSelection[], Dispatch<SetStateAction<MultiSelection[]>>]
    = useState<MultiSelection[]>([]);

    const globalState: GlobalStoreState = useContext<GlobalStoreState>(globalStore);
    const { dispatch } = globalState;

    // console.log('Invoking Soil Plots Tab', props);
        
    useEffect(() => {
        // console.log('useEffect', globalState.state, currentFiltersState.current);
        if (globalState.state.filtersState) {
            // console.log('Soil Plots tab FiltersState');
            if (
                !globalState.state.soilPlotData
                || globalState.state.filtersState.siteInfo.siteId !== globalState.state.soilPlotData.filtersState.siteInfo.siteId
                || (
                    !_.isEqual(globalState.state.filtersState, globalState.state.soilPlotData.filtersState)
                    && globalState.state.filtersState.refreshAppData
                )
            ) {
                setFilteredSoilPlotData(undefined);
                getSoilPlots(globalState.state.filtersState).then((data: APIResponse<SoilPlotsAPI>) => {
                    // console.log('Api Called', data);
                    const [newPlotData, newFilteredPlotData, newSelections]: [SoilPlotBarData[], SoilPlotBarData[], MultiSelection[]]
                    = createStackedBarChartDataWithSelections(data.resultSet, MAX_ALLOWED_PLOTS);
                    console.log('NewData', newPlotData, newFilteredPlotData, newSelections);
                    setSoilPlotData({
                        maxLevels: data.resultSet.maxLevels,
                        plotData: newPlotData
                    });
                    setFilteredSoilPlotData({
                        maxLevels: data.resultSet.maxLevels,
                        plotData: newFilteredPlotData
                    })
                    setCurrentSelections(newSelections)
                    dispatch((prev: GlobalStoreState) => ({
                        ...prev,
                        actions: [
                            {type: 'soilPlotData', data: {
                                filtersState: globalState.state.filtersState,
                                data: {
                                    maxLevels: data.resultSet.maxLevels,
                                    plotData: newPlotData
                                }
                            }}
                        ]
                    }));
                })
                .catch(err => {
                  console.log('API Call Aborted or Other error', err);
                });
            } else {
                // console.log('Soil Plots Tab Api Call Not Required');
                setSoilPlotData(globalState.state.soilPlotData.data);
                const [newFilteredPlotData, newSelections]: [SoilPlotBarData[], MultiSelection[]]
                = createSelectionsWithFilteredData(globalState.state.soilPlotData.data, MAX_ALLOWED_PLOTS);
                setFilteredSoilPlotData({
                    maxLevels: globalState.state.soilPlotData.data.maxLevels,
                    plotData: newFilteredPlotData
                })
                setCurrentSelections(newSelections)
                // console.log('Current Selections when no API Call', newFilteredPlotData, newSelections);
            }
        }
    }, [dispatch, globalState.state.filtersState, globalState.state.soilPlotData]);

    useEffect(() => {
        if (props.setLoader) {
            if (filteredSoilPlotData) {
                props.setLoader({showLoader: false})
            } else {
                props.setLoader({
                    showLoader: true,
                    position: props.loaderPosition
                })
            }
        }
    }, [filteredSoilPlotData, props])

    const handleSelectionChange = useCallback((checked: boolean, opt: MultiSelection, multiSelectID: string): void => {
        if (soilPlotData?.plotData.length) {
            let newFilteredPlotData: SoilPlotBarData[] = [];
            setCurrentSelections((prev: MultiSelection[]) => (
                prev.map((selection: MultiSelection, index: number) => {

                    if (
                        (opt.value === selection.value && checked) ||
                        (opt.value !== selection.value && selection.selected)
                    ) {
                        newFilteredPlotData.push({
                            ...soilPlotData?.plotData[index]
                        })
                    }

                    return {
                        ...selection,
                        selected: opt.value === selection.value ? checked : selection.selected
                    };
                })
            ));
            setFilteredSoilPlotData({
                maxLevels: soilPlotData.maxLevels,
                plotData: newFilteredPlotData
            })
        }
    }, [soilPlotData])

    const removeAllSelections = useCallback((filterName: string): void => {
        setCurrentSelections((prev: MultiSelection[]) => (
            prev.map((selection: MultiSelection) => ({
                ...selection,
                selected: false
            }))
        ))
        setFilteredSoilPlotData((prev: (SoilPlotChartData | undefined)) => {
            if (prev) {
                return {
                    ...prev,
                    plotData: []
                }
            } else {
                return prev;
            }
        })
    }, [])

    const multiSelectProps: MultiSelectProps[] = useMemo(() => ([{
        showSelections: false,
        multiSelectID: 'soilPlots',
        selectOptions: currentSelections,
        maxSelection: MAX_ALLOWED_PLOTS,
        handleSelectionChange: handleSelectionChange,
        removeAllSelections: removeAllSelections,
        icon: getIcon('soilPlots'),
        title: 'Locations'
    }]), [currentSelections, handleSelectionChange, removeAllSelections])
    
    return (
        <>
            <LayoutCardHeader currentTab={props.tab} multiSelectProps={multiSelectProps}/>
            {
                filteredSoilPlotData?.plotData?.length && props.tab.complexComponent?.chartType ?
                chartMapper(
                    props.tab.complexComponent.chartType,
                    filteredSoilPlotData,
                    {
                        isMaximized: props.isMaximized
                    }
                )
                : filteredSoilPlotData !== undefined ? <div>No Data Available</div> : null
            }
        </>
    );
}

export default SoilPlotTab;