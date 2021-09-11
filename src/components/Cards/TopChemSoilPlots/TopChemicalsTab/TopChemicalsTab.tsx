import { Dispatch, SetStateAction, useState, useContext, useEffect } from 'react';
import { APIResponse, TopChemicalsAPI } from '../../../../models/APIModels';
import { GlobalStoreState, globalStore } from '../../../../stores/GlobalStore/GlobalStore';
import _ from 'lodash';
import { chartMapper } from '../../../Charts/utils/defaultChartMethods';
import LayoutCardHeader from '../../../shared/LayoutCardHeader/LayoutCardHeader';
import { LayoutConfigComponentTab, LoaderType } from '../../../../models/AppDashboardModels';
import { ChartFilterProps } from '../../../../models/LayoutCardHeaderModels';
import { createInitChartFilterState } from '../../../../utils/globalUtilityMethods';
import { useChartFilterWidget } from '../../../shared/ChartFilterWidgetHook/ChartFilterWidgetHook';
import { getTopChemicals } from '../../../../services/tc-sp-ts-data-service';

function TopChemicalsTab (props: {
    tab: LayoutConfigComponentTab,
    isMaximized: boolean,
    setLoader: Dispatch<SetStateAction<LoaderType>> | undefined,
    loaderPosition: 'default-loader' | 'br-loader' | 'tr-loader'
}) {

    const [topChemData, setTopChemData]: [(TopChemicalsAPI[] | undefined), Dispatch<SetStateAction<TopChemicalsAPI[] | undefined>>]
    = useState<TopChemicalsAPI[]>();

    const [chartFilterState, setChartFilterState]: [ChartFilterProps['filters'], (checked: boolean, key: string) => void]
    = useChartFilterWidget(createInitChartFilterState(props.tab.complexComponent?.filters!))
    
    const globalState: GlobalStoreState = useContext<GlobalStoreState>(globalStore);
    const { dispatch } = globalState;

    // console.log('Invoking TopChemicalsTab Tab', props);
        
    useEffect(() => {
        if (globalState.state.filtersState) {
            if (
                !globalState.state.topChemData
                || globalState.state.filtersState.siteInfo.siteId !== globalState.state.topChemData.filtersState.siteInfo.siteId
                || (
                    !_.isEqual(globalState.state.filtersState, globalState.state.topChemData.filtersState)
                    && globalState.state.filtersState.refreshAppData
                )
            ) {
                setTopChemData(undefined);
                // console.log('TopChemicalsTab Tab Api Calling');
                getTopChemicals(globalState.state.filtersState).then((data: APIResponse<TopChemicalsAPI[]>) => {
                    // console.log('Api Called', data);
                    setTopChemData([...data.resultSet]);
                    dispatch((prev: GlobalStoreState) => ({
                        ...prev,
                        actions: [
                            {
                                type: 'topChemData',
                                data: {
                                    filtersState: globalState.state.filtersState,
                                    data: [...data.resultSet]
                                }
                            }
                        ]
                    }));
                })
                .catch(err => {
                  console.log('API Call Aborted or Other error', err);
                });
            } else {
                // console.log('TopChemicalsTab Tab Api Call Not Required');
                setTopChemData(globalState.state.topChemData.data);
            }
        }
    }, [dispatch, globalState.state.filtersState, globalState.state.topChemData]);

    useEffect(() => {
        if (props.setLoader) {
            if (topChemData) {
                props.setLoader({showLoader: false})
            } else {
                props.setLoader({
                    showLoader: true,
                    position: props.loaderPosition
                })
            }
        }
    }, [topChemData, props])
    
    return (
        <>
            <LayoutCardHeader currentTab={props.tab}
                chartFilters={{
                    onChange: setChartFilterState,
                    filters: chartFilterState
                }}
            />
            {
                topChemData?.length && props.tab.complexComponent?.chartType ?
                chartMapper(
                    props.tab.complexComponent.chartType,
                    topChemData,
                    {
                        xAxisDataKey: 'avgResultPPM',
                        yAxisDataKey: 'chemical',
                        yAxisLabel: 'Average Result PPM',
                        isMaximized: props.isMaximized,
                        chartFilters: chartFilterState
                    }
                )
                : topChemData !== undefined ? <div>No Data Available</div> : null
            }
        </>
    );
}

export default TopChemicalsTab;