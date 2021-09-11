import { Dispatch, SetStateAction, useState } from 'react';
import { SelectedTabEmitter } from '../../../models/EventEmitterModels';
import { DefaultCardProps, LayoutConfigComponentTab, LoaderType } from '../../../models/AppDashboardModels';
import EventEmitter, { Events } from '../../../utils/EventEmitter';
import LegendsTab from './LegendsTab/LegendsTab';
import IframeTab from './IframeTab/IframeTab';
import HorzBarChartTabHOC from './HorzBarChartTabHOC/HorzBarChartTabHOC';
import { POIDataAPI, WaterwellsDataAPI, WetlandsDataAPI } from '../../../models/APIModels';
import DocumentsTab from './DocumentsTab/DocumentsTab';
import { getPOIData, getWetlandsData, getWaterwellsData } from '../../../services/top-right-card-data-service';

const createTabComponent = (
    tab: LayoutConfigComponentTab,
    isMaximized: boolean,
    setLoader: Dispatch<SetStateAction<LoaderType>> | undefined,
    loaderPosition: 'default-loader' | 'br-loader' | 'tr-loader'
): JSX.Element => {
    switch (tab.truncatedName) {
        case 'Legend': {
            return <LegendsTab/>;
        }
        case 'POI': {
            return (
                <HorzBarChartTabHOC<POIDataAPI>
                    tab={tab} isMaximized={isMaximized ? isMaximized : false}
                    setLoader={setLoader} loaderPosition={loaderPosition}
                    storeKey={'POIData'}
                    getData={getPOIData}
                    chartParams={tab.complexComponent?.chartParams!}
                />
            )
        }
        case 'Wetlands': {
            return (
                <HorzBarChartTabHOC<WetlandsDataAPI>
                    tab={tab} isMaximized={isMaximized ? isMaximized : false}
                    setLoader={setLoader} loaderPosition={loaderPosition}
                    storeKey={'wetlandsData'}
                    getData={getWetlandsData}
                    chartParams={tab.complexComponent?.chartParams!}
                />
            )
        }
        case 'Waterwells': {
            return (
                <HorzBarChartTabHOC<WaterwellsDataAPI>
                    tab={tab} isMaximized={isMaximized ? isMaximized : false}
                    setLoader={setLoader} loaderPosition={loaderPosition}
                    storeKey={'waterwellsData'}
                    getData={getWaterwellsData}
                    chartParams={tab.complexComponent?.chartParams!}
                />
            )
        }
        case 'Documents': {
            return (
                <DocumentsTab
                    tab={tab} isMaximized={isMaximized ? isMaximized : false}
                    setLoader={setLoader} loaderPosition={loaderPosition}
                />
            )
        }
        case '3D Visualization': case 'RGB Map': case 'RGB Model': case 'IR Greyscale Map':
        case 'RGB Video': case 'IR Video': {
            return (
                <IframeTab
                    tab={tab} isMaximized={isMaximized ? isMaximized : false}
                    setLoader={setLoader} loaderPosition={loaderPosition}
                />
            )
        }
        default: {
            return <div>No Component Found for this Tab.</div>
        }
    }
}

function TopRightChartsCard (props: DefaultCardProps) {
    // console.log('TopRightChartsCardProps', props);

    const [currentTab, setCurrentTab]: [LayoutConfigComponentTab, Dispatch<SetStateAction<LayoutConfigComponentTab>>]
    = useState<LayoutConfigComponentTab>(props.tabs[0]);

    EventEmitter.unsubscribe(props.emitterName as Events);
    EventEmitter.subscribe(props.emitterName as Events, (data: SelectedTabEmitter) => {
        // console.log('TopRightChartsCardEmitter', data);
        if (data.tabName !== currentTab.tabName) {
            setCurrentTab({...data});
        }
    });

    return (
        <div className={`cover-100${props.isMaximized ? ' max-chart-card-container' : ' chart-card-container'}`}>
            {createTabComponent(currentTab, props.isMaximized!, props.setLoader, props.loaderPosition)}
        </div>
    );
}

export default TopRightChartsCard;