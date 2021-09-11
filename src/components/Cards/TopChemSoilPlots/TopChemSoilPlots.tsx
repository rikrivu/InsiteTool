import { Dispatch, SetStateAction, useState } from 'react';
import { SelectedTabEmitter } from '../../../models/EventEmitterModels';
import EventEmitter, { Events } from '../../../utils/EventEmitter';
import TopChemicalsTab from './TopChemicalsTab/TopChemicalsTab';
import SoilPlotTab from './SoilPlotTab/SoilPlotTab';
import { DefaultCardProps, LayoutConfigComponentTab, LoaderType } from '../../../models/AppDashboardModels';
import TimeSeries from './TimeSeries/TimeSeries';

const createTabComponent = (
    tab: LayoutConfigComponentTab,
    isMaximized: boolean,
    setLoader: Dispatch<SetStateAction<LoaderType>> | undefined,
    loaderPosition: 'default-loader' | 'br-loader' | 'tr-loader'
): JSX.Element => {
    switch (tab.truncatedName) {
        case 'TopChem': {
            return (
                <TopChemicalsTab
                    tab={tab} isMaximized={isMaximized ? isMaximized : false}
                    setLoader={setLoader} loaderPosition={loaderPosition}
                />
            );
        }
        case 'Soil Plots': {
            return (
                <SoilPlotTab
                    tab={tab} isMaximized={isMaximized ? isMaximized : false}
                    setLoader={setLoader} loaderPosition={loaderPosition}
                />
            );
        }
        case 'Time Series': {
            return (
                <TimeSeries
                    tab={tab} isMaximized={isMaximized ? isMaximized : false}
                    setLoader={setLoader} loaderPosition={loaderPosition}
                />
            );
        }
        default: {
            return <div>No Component Found for this Tab.</div>
        }
    }
}

function TopChemSoilPlots (props: DefaultCardProps) {
    // console.log('TopChemSoilPlots', props);

    const [currentTab, setCurrentTab]: [LayoutConfigComponentTab, Dispatch<SetStateAction<LayoutConfigComponentTab>>]
    = useState<LayoutConfigComponentTab>(props.tabs[0]);

    EventEmitter.unsubscribe(props.emitterName as Events);
    EventEmitter.subscribe(props.emitterName as Events, (data: SelectedTabEmitter) => {
        // console.log('TopChemSoilPlotsEmitter', data);
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

export default TopChemSoilPlots;