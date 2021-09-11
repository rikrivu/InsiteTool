import _ from 'lodash';
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { APIResponse } from '../../../../models/APIModels';
import { LayoutConfigComponentTab, LoaderType } from '../../../../models/AppDashboardModels';
import { ChartParams } from '../../../../models/ChartModels';
import { ChartFilterProps } from '../../../../models/LayoutCardHeaderModels';
import { GlobalStoreState, globalStore } from '../../../../stores/GlobalStore/GlobalStore';
import { createInitChartFilterState } from '../../../../utils/globalUtilityMethods';
import { chartMapper } from '../../../Charts/utils/defaultChartMethods';
import { useChartFilterWidget } from '../../../shared/ChartFilterWidgetHook/ChartFilterWidgetHook';
import LayoutCardHeader from '../../../shared/LayoutCardHeader/LayoutCardHeader';

function HorzBarChartTabHOC<T> (props: {
    tab: LayoutConfigComponentTab;
    isMaximized: boolean;
    setLoader: Dispatch<SetStateAction<LoaderType>> | undefined;
    loaderPosition: 'default-loader' | 'br-loader' | 'tr-loader';
    storeKey: string;
    getData(siteId: string): Promise<APIResponse<T[]>>;
    chartParams: ChartParams;
}) {
    const { siteId } = useParams<{siteId: string}>();

    const [chartData, setChartData]: [(T[] | undefined), Dispatch<SetStateAction<T[] | undefined>>]
    = useState<T[]>();

    const [chartFilterState, setChartFilterState]: [ChartFilterProps['filters'], (checked: boolean, key: string) => void]
    = useChartFilterWidget(createInitChartFilterState(props.tab.complexComponent?.filters!))
    
    const globalState: GlobalStoreState = useContext<GlobalStoreState>(globalStore);
    const { dispatch } = globalState;

    useEffect(() => {
        // console.log('Api Calling');
        if (!globalState.state[props.storeKey] || siteId !== globalState.state[props.storeKey].siteId) {
            setChartData(undefined);
            props.getData(siteId).then((data: APIResponse<T[]>) => {
                // console.log('Api Called');
                setChartData([...data.resultSet]);
                dispatch((prev: GlobalStoreState) => ({
                    ...prev,
                    actions: [
                        { 
                            type: props.storeKey,
                            data: {
                                siteId: siteId,
                                data: [...data.resultSet]
                            }
                        }
                    ]
                }))
            })
            .catch(err => {
              console.log('API Call Aborted or Other error', err);
            });
        } else {
            setChartData((prevData: T[] | undefined) => (
                _.isEqual(globalState.state[props.storeKey].data, prevData) ? prevData : [...globalState.state[props.storeKey].data]
            ))
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, globalState.state?.[props.storeKey], props, siteId]);

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
    
    return chartData?.length && props.tab.complexComponent?.chartType ?
    (
        <>
            <LayoutCardHeader currentTab={props.tab}
                chartFilters={{
                    onChange: setChartFilterState,
                    filters: chartFilterState
                }}
            />
            {
                chartMapper(
                    props.tab.complexComponent?.chartType,
                    chartData,
                    {
                        ...props.chartParams,
                        isMaximized: props.isMaximized ?? false,
                        chartFilters: chartFilterState
                    }
                )
            }
        </>
    )
    : !chartData ? null
    : !chartData.length ? <div>No {props.storeKey.replace('Data', '')} Data for this Site</div> : null;
}

export default HorzBarChartTabHOC;