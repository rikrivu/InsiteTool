import './TimeSeries.scss';
import { Dispatch, memo, MutableRefObject, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// Import Models
import { APIResponse, TimeSeriesAPI } from '../../../../models/APIModels';
import { LayoutConfigComponentTab, LoaderType } from '../../../../models/AppDashboardModels';
import { MultiSelectProps } from '../../../../models/LayoutCardHeaderModels';
import { DateRangeSliderPropsCreate } from '../../../shared/DateRangeSlider/DateRangeSliderModels';
import {
    TSChartDataConsolidated, TSChartOptionsState,
    TSFilterSelectionsModel, TSFilterState
} from '../../../../models/TimeSeriesModels';

// Import Services
import { getTimeSeriesData } from '../../../../services/tc-sp-ts-data-service';

// Local Imports
import { GlobalStoreState, globalStore } from '../../../../stores/GlobalStore/GlobalStore';
import { createDateRangeSliderProps, getIcon } from '../../../../utils/globalUtilityMethods';
import {
    checkIfLocationsUpdated,
    createChartData, createHandleSelectionChange, createInitFilterState,
    createRemoveAllSelections,
    createTSFilterInitSelections, createTSFilterSelections,
    createTSMultiSelectProps, getChemicals, getDataKey, getLocations
} from './timeSeriesUtils';
import { chartMapper } from '../../../Charts/utils/defaultChartMethods';

// Import Components
import LayoutCardHeader from '../../../shared/LayoutCardHeader/LayoutCardHeader';
import TimeSeriesChartOptions from './TimeSeriesChartOptions';

// 3rd Party Libraries
import _ from 'lodash';
import { MAX_TICKS_TS_DATE_RANGE } from '../../../../app-config';

function TimeSeriesUnmemoized (props: {
    tab: LayoutConfigComponentTab,
    isMaximized: boolean,
    setLoader: Dispatch<SetStateAction<LoaderType>> | undefined,
    loaderPosition: 'default-loader' | 'br-loader' | 'tr-loader'
}) {

    const globalState: GlobalStoreState = useContext<GlobalStoreState>(globalStore);
    const { dispatch } = globalState;

    // console.log('TimeSeriesUnmemoized', globalState.state.siteInfo)

    const noChartData: MutableRefObject<boolean> = useRef<boolean>(true)

    const [tsFilterSelections, setTSFilterSelections]
    : [TSFilterSelectionsModel | undefined, Dispatch<SetStateAction<TSFilterSelectionsModel | undefined>>]
    = useState<TSFilterSelectionsModel>();

    const [chartOptionsState, setChartOptionsState]: [TSChartOptionsState, Dispatch<SetStateAction<TSChartOptionsState>>]
    = useState<TSChartOptionsState>({
        flagND: 'true',
        plotND: 'equal',
        dataKey: 'equalValue-'
    })
    
    const dateRangeSliderDefaultProps: DateRangeSliderPropsCreate
    = useMemo(
        () => createDateRangeSliderProps(globalState.state.siteInfo.earliestDate, 'month', MAX_TICKS_TS_DATE_RANGE),
        [globalState.state.siteInfo.earliestDate]
    );

    const initTSFilterState: TSFilterState =
    useMemo(
        () => createInitFilterState(dateRangeSliderDefaultProps.domainStart, dateRangeSliderDefaultProps.today),
        [dateRangeSliderDefaultProps.domainStart, dateRangeSliderDefaultProps.today]
    );

    const [[startDate, endDate], setDateRange]: [[Date, Date], Dispatch<SetStateAction<[Date, Date]>>] =
    useState<[Date, Date]>([dateRangeSliderDefaultProps.domainStart, dateRangeSliderDefaultProps.today]);

    const [applyDisabled, setApplyDisabled]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(true);

    const [timeSeriesFilterState, setTimeSeriesFilterState]: [TSFilterState | undefined, Dispatch<SetStateAction<TSFilterState | undefined>>]
    = useState<TSFilterState>();

    const [timeSeriesData, setTimeSeriesData]: [TSChartDataConsolidated | undefined, Dispatch<SetStateAction<TSChartDataConsolidated | undefined>>]
    = useState<TSChartDataConsolidated>();

    // console.log('tsFilterSelections', tsFilterSelections, timeSeriesFilterState, globalState.state);

    // The following useEffect handles scenarios like 1st mount and site changes
    useEffect(() => {
        // console.log('Entered', globalState.state.filterCardData, globalState.state.tsFilterSelections, initTSFilterState)

        // If no data in store or siteId mismatch which means a change in Site detected then save the data for filterSelectoins
        // & filterState in store
        if (
            globalState.state.filterCardData &&
            (
                !globalState.state.tsFilterSelections ||
                globalState.state.tsFilterSelections.siteId !== globalState.state.filterCardData.siteId
            )
        ) {
            const updatedTSFilterSelections: TSFilterSelectionsModel = createTSFilterInitSelections(globalState.state.filterCardData);

            dispatch((prev: GlobalStoreState) => ({
                ...prev,
                actions: [
                    {
                        type: 'tsFilterSelections',
                        data: {...updatedTSFilterSelections}
                    },
                    {
                        type: 'timeSeriesFilterState',
                        data: {
                            ...initTSFilterState,
                            Chem: updatedTSFilterSelections.Chem?.[0]?.value ?? '',
                            siteId: prev.siteInfo.siteId
                        }
                    }
                ]
            }))
        } else {
            // Update only local state for filterSelections with the value stored in store
            // setTSFilterSelections(_.cloneDeep(globalState.state.tsFilterSelections))
            setTSFilterSelections(globalState.state.tsFilterSelections)
        }
    }, [dispatch, globalState.state.filterCardData, globalState.state.tsFilterSelections, initTSFilterState])

    // The following useEffect checks any change in chemical and
    // makes api call to fetch locations based on the chemical selected
    useEffect(() => {
        getLocations(timeSeriesFilterState?.Chem, globalState.state.filterCardData)
        .then((locations: string[] | null) => {
            // console.log('locations', locations);
            if (locations) {
                if (noChartData.current) {
                    dispatch((prev: GlobalStoreState) => {
                        return ({
                        ...prev,
                        actions: [
                            {
                                type: 'tsFilterSelections',
                                data: {
                                    ...prev.tsFilterSelections,
                                    Loc: createTSFilterSelections(locations, true)
                                }
                            },
                            {
                                type: 'timeSeriesFilterState',
                                data: {
                                    ...prev.timeSeriesFilterState,
                                    Loc: [locations[0]]
                                }
                            }
                        ]
                    })})
                } else {
                    setTimeSeriesFilterState((prevState: TSFilterState | undefined) => {

                        setTSFilterSelections((prev: TSFilterSelectionsModel | undefined) => prev ? {
                            ...prev,
                            Loc: createTSFilterSelections(locations, false, prevState?.Loc)
                        } : prev)
                        const locationsForState: false | string[] = checkIfLocationsUpdated(locations, prevState?.Loc)
                        return prevState && locationsForState ? {
                            ...prevState,
                            Loc: locationsForState
                        } : prevState;
                    })
                }
            }
        })
        .catch(err => console.log('Error', err));
    }, [dispatch, globalState.state.filterCardData, timeSeriesFilterState?.Chem])

    useEffect(() => {
        if (timeSeriesFilterState?.Chem === '' && timeSeriesFilterState?.Loc.length) {
            getChemicals(timeSeriesFilterState.Loc, globalState.state.filterCardData)
            .then((chemicals: string[] | null) => {
                if (chemicals) {
                    setTSFilterSelections((prev: TSFilterSelectionsModel | undefined) => prev ? {
                        ...prev,
                        Chem: createTSFilterSelections(chemicals, false)
                    } : prev)
                }
            })
            .catch(err => console.log('Error', err));
        }
    }, [timeSeriesFilterState?.Chem, timeSeriesFilterState?.Loc, globalState.state.filterCardData])

    useEffect(() => {
        if (globalState.state.timeSeriesFilterState) {

            // setTimeSeriesFilterState(_.cloneDeep(globalState.state.timeSeriesFilterState));
            setTimeSeriesFilterState(globalState.state.timeSeriesFilterState);

            if (
                globalState.state.timeSeriesFilterState.Chem.length &&
                globalState.state.timeSeriesFilterState.Loc.length
            ) {

                if (
                    !globalState.state.timeSeriesData ||
                    !_.isEqual(globalState.state.timeSeriesData.timeSeriesFilterState, globalState.state.timeSeriesFilterState)
                ) {
                    // console.log('API Call timeSeriesData');
                    setTimeSeriesData(undefined);
                    getTimeSeriesData(globalState.state.timeSeriesFilterState)
                    .then((res: APIResponse<TimeSeriesAPI>) => {
                        noChartData.current = false;
                        const newData: TSChartDataConsolidated = createChartData(res.resultSet);
                        console.log('createChartData', newData)
                        dispatch((prev: GlobalStoreState) => ({
                            ...prev,
                            actions: [{
                                type: 'timeSeriesData',
                                data: {
                                    timeSeriesFilterState: {...globalState.state.timeSeriesFilterState},
                                    data: {...newData}
                                }
                            }]
                        }))
                    })
                    .catch(err => console.log('Error', err))
                } else {
                    // console.log('Update timeSeriesData from store');
                    setTimeSeriesData({...globalState.state.timeSeriesData.data});
                }
            } else if (globalState.state.timeSeriesData) {
                setTimeSeriesData({
                    plots: [],
                    chartData: []
                })
            }
        }
    }, [dispatch, globalState.state.timeSeriesData, globalState.state.timeSeriesFilterState])

    useEffect(() => {
        if (timeSeriesFilterState && globalState.state.timeSeriesFilterState) {
            if (_.isEqual(timeSeriesFilterState, globalState.state.timeSeriesFilterState)) {
                // console.log('Truing', timeSeriesFilterState, globalState.state.timeSeriesFilterState)
                setApplyDisabled(true)
            } else {
                // console.log('Falsing', timeSeriesFilterState, globalState.state.timeSeriesFilterState)
                if (timeSeriesFilterState.Chem.length && timeSeriesFilterState.Loc.length) {
                    setApplyDisabled(false)
                } else {
                    setApplyDisabled(true)
                }
            }
        }
    }, [globalState.state.timeSeriesFilterState, timeSeriesFilterState])

    useEffect(() => {
        if (props.setLoader) {
            if (timeSeriesData) {
                props.setLoader({showLoader: false})
            } else {
                props.setLoader({
                    showLoader: true,
                    position: props.loaderPosition
                })
            }
        }
    }, [timeSeriesData, props])

    const applyFilters = useCallback((): void => {
        dispatch((prev: GlobalStoreState) => ({
            ...prev,
            actions: [
                {
                    type: 'tsFilterSelections',
                    data: {...tsFilterSelections}
                },
                {
                    type: 'timeSeriesFilterState',
                    data: {...timeSeriesFilterState}
                }
            ]
        })) 
    }, [dispatch, timeSeriesFilterState, tsFilterSelections])

    const onDateRangeChange = useCallback(([sDate, eDate]: [Date, Date]): void => {
        // console.log('onDateRangeChange', sDate, eDate)
        setDateRange([sDate, eDate]);
        setTimeSeriesFilterState((prev: TSFilterState | undefined) => {
            if (prev) {
                return {
                    ...prev,
                    startDate: sDate,
                    endDate: eDate
                };
            } else return prev;
        })
    }, [])

    const multiSelectProps: MultiSelectProps[] | undefined = useMemo(
        () => createTSMultiSelectProps(
            tsFilterSelections,
            createHandleSelectionChange(
                tsFilterSelections,
                setTSFilterSelections,
                setTimeSeriesFilterState
            ),
            createRemoveAllSelections(
                setTSFilterSelections,
                setTimeSeriesFilterState
            )
        ),
        [tsFilterSelections]
    )

    const changeChartOptions = (
        value: (TSChartOptionsState['flagND'] | TSChartOptionsState['plotND']),
        radioGroup: 'flagND' | 'plotND'
    ): void => {
        console.log('changeChartOptions', value);
        setChartOptionsState((prev: TSChartOptionsState) => (
            prev[radioGroup] !== value ? {
                ...prev,
                [radioGroup]: value,
                dataKey: radioGroup === 'flagND' ? prev.dataKey : getDataKey(value as TSChartOptionsState['plotND'])
            } : prev
        ))
    }

    return (
        <>
            <LayoutCardHeader currentTab={props.tab}
                hasApply={{
                    applyCB: applyFilters,
                    disabled: applyDisabled
                }}
                dateRangeProps={{
                    ...dateRangeSliderDefaultProps, startDate, endDate, onDateRangeChange,
                    isMaximized: props.isMaximized
                }}
                multiSelectProps={multiSelectProps}
                specialComponent={{
                    icon: getIcon(''),
                    component: <TimeSeriesChartOptions
                        radioGroups={props.tab.complexComponent?.chartOptions!}
                        chartOptionsState={chartOptionsState}
                        handleRadioButtonToggle={changeChartOptions}
                    />
                }}
            />
            <div className="ts-content-wrapper">
                {
                    timeSeriesData?.chartData.length && props.tab.complexComponent?.chartType ?
                    chartMapper(
                        props.tab.complexComponent?.chartType, timeSeriesData,
                        {
                            isMaximized: props.isMaximized,
                            xAxisDataKey: 'timeStamp',
                            yAxisDataKey: chartOptionsState.dataKey,
                            tsChartOptions: chartOptionsState
                        }
                    )
                    : timeSeriesData !== undefined ? 
                    (
                        <div>
                            <div>No data available for selected Filters</div>
                            <sub>Note: Atleast one chemical needs to be selected.</sub>
                        </div>
                    ) : null
                }
            </div>
        </>
    );
}

const TimeSeries = memo(TimeSeriesUnmemoized);
export default TimeSeries;