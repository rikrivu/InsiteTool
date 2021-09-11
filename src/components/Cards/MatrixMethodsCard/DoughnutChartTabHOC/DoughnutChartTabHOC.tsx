import _ from 'lodash';
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { APIResponse, DoughnutChartDataWithColors } from '../../../../models/APIModels';
import { LayoutConfigComponentTab, LoaderType } from '../../../../models/AppDashboardModels';
import { ChartParams } from '../../../../models/ChartModels';
import { FiltersStateObject } from '../../../../models/FilterCardModels';
import { ChartFilterProps } from '../../../../models/LayoutCardHeaderModels';
import { GlobalStoreState, globalStore } from '../../../../stores/GlobalStore/GlobalStore';
import { createInitChartFilterState } from '../../../../utils/globalUtilityMethods';
import { getColorIndex } from '../../../Charts/DoughnutChart/doughnutChartMethods';
import { defaultColorSet } from '../../../Charts/utils/DefaultChartColors';
import { chartMapper } from '../../../Charts/utils/defaultChartMethods';
import { useChartFilterWidget } from '../../../shared/ChartFilterWidgetHook/ChartFilterWidgetHook';
import LayoutCardHeader from '../../../shared/LayoutCardHeader/LayoutCardHeader';

// An abstract component which can be only used by passing interface which determine the data types it will work with
function DoughnutChartTabHOC<T> (props: {
    tab: LayoutConfigComponentTab,
    isMaximized: boolean,
    setLoader: Dispatch<SetStateAction<LoaderType>> | undefined,
    loaderPosition: 'default-loader' | 'br-loader' | 'tr-loader';
    storeKey: string;
    getData(filtersState: FiltersStateObject): Promise<APIResponse<T[]>>;
    chartParams: ChartParams;
}) {

    const [chartData, setChartData]: [
        (DoughnutChartDataWithColors<T>[] | undefined),
        Dispatch<SetStateAction<DoughnutChartDataWithColors<T>[] | undefined>>
    ] = useState<DoughnutChartDataWithColors<T>[]>();

    const [chartFilterState, setChartFilterState]: [ChartFilterProps['filters'], (checked: boolean, key: string) => void]
    = useChartFilterWidget(createInitChartFilterState(props.tab.complexComponent?.filters!))

    const globalState: GlobalStoreState = useContext<GlobalStoreState>(globalStore);
    const { dispatch } = globalState;

    // console.log('Invoking DoughnutChartTabHOC Tab', props);
    
    useEffect(() => {
        if (globalState.state.filtersState) {
            if (
                !globalState.state[props.storeKey]
                || globalState.state.filtersState.siteInfo.siteId !== globalState.state[props.storeKey].filtersState.siteInfo.siteId
                || (
                    !_.isEqual(globalState.state.filtersState, globalState.state[props.storeKey].filtersState)
                    && globalState.state.filtersState.refreshAppData
                )
            ) {
                setChartData(undefined);
                // console.log('DoughnutChartTabHOC Tab Api Calling', globalState.state.filtersState);
                props.getData(globalState.state.filtersState).then((data: APIResponse<T[]>) => {
                    // console.log('Api Called', data);
                    const dataWithColor: DoughnutChartDataWithColors<T>[] = data.resultSet.map((dataItem: T, index: number) => ({
                        ...dataItem,
                        color: defaultColorSet[getColorIndex(index)]
                    }));
                    // console.log('Api Called', data, dataWithColor);
                    setChartData([...dataWithColor]);
                    dispatch((prev: GlobalStoreState) => ({
                        ...prev,
                        actions: [
                            { 
                                type: props.storeKey,
                                data: {
                                    filtersState: globalState.state.filtersState,
                                    data: [...dataWithColor]
                                }
                            }
                        ]
                    }));
                })
                .catch(err => {
                  console.log('API Call Aborted or Other error', err);
                });
            } else {
                // console.log('DoughnutChartTabHOC Tab Api Call Not Required');
                setChartData(globalState.state[props.storeKey].data);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, globalState.state?.[props.storeKey], globalState.state.filtersState, props]);

    useEffect(() => {
        if (props.setLoader) {
            if (chartData) {
                props.setLoader({showLoader: false})
            } else {
                props.setLoader({
                    showLoader: true,
                    position: props.loaderPosition
                })
            }
        }
    }, [chartData, props])
    
    return (
        <>
            <LayoutCardHeader
                currentTab={props.tab}
                chartFilters={{
                    onChange: setChartFilterState,
                    filters: chartFilterState
                }}
            />
            {
                chartData?.length && props.tab.complexComponent?.chartType ?
                chartMapper(
                    props.tab.complexComponent.chartType,
                    chartData,
                    {
                        ...props.chartParams,
                        isMaximized: props.isMaximized ?? false,
                        chartFilters: chartFilterState
                    }
                )
                : chartData !== undefined ? <div>No Data Available</div> : null
            }
        </>
    );

}

export default DoughnutChartTabHOC;