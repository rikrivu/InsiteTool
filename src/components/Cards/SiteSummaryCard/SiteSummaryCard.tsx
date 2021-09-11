import './SiteSummaryCard.scss';

import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { SiteSummaryAPI } from '../../../models/APIModels';
import EventEmitter, { Events } from '../../../utils/EventEmitter';
import { SelectedTabEmitter } from '../../../models/EventEmitterModels';
import { to2DecimalPlacesPipe } from '../../../utils/globalUtilityMethods';
import { GlobalStoreState, globalStore } from '../../../stores/GlobalStore/GlobalStore';
import { DefaultCardProps, LayoutConfigComponentTab } from '../../../models/AppDashboardModels';

function SiteSummaryCard (props: DefaultCardProps) {

    const [currentTab, setCurrentTab]: [LayoutConfigComponentTab, Dispatch<SetStateAction<LayoutConfigComponentTab>>]
    = useState<LayoutConfigComponentTab>(props.tabs[0]);
    const globalState: GlobalStoreState = useContext<GlobalStoreState>(globalStore);
    const [siteSummaryData, setSiteSummaryData]: [SiteSummaryAPI | undefined, Dispatch<SetStateAction<SiteSummaryAPI | undefined>>]
    = useState<SiteSummaryAPI>();
    
    // console.log('SSCard', globalState);

    EventEmitter.unsubscribe(props.emitterName as Events);
    EventEmitter.subscribe((props.emitterName as Events), (data: SelectedTabEmitter) => {
        // console.log('SelectedTabEmitterData', data, currentTab);
        if (data.tabName !== currentTab.tabName) {
            setCurrentTab({...data});
        }
    });

    useEffect(() => {
        return () => {
            EventEmitter.unsubscribe(props.emitterName as Events);  
        }
    }, [props.emitterName]);

    useEffect(() => {
        if (globalState.state.siteSummaryDashboardData) {
            setSiteSummaryData({...globalState.state.siteSummaryDashboardData})
        }
    }, [globalState.state.siteSummaryDashboardData])

    useEffect(() => {
        if (props.setLoader) {
            if (siteSummaryData) {
                props.setLoader({showLoader: false})
            } else {
                props.setLoader({
                    showLoader: true,
                    position: props.loaderPosition
                })
            }
        }
    }, [props, siteSummaryData])

    return siteSummaryData && currentTab ?
    (
        <div className={`ss-card-container app-scroll${props.isMaximized ? ' unset-margin' : ''}`}>
            <div className={`${props.isMaximized ? 'ss-card-wrapper-maximized' : 'ss-card-wrapper'}`}>
                <div className="ss-card-label">{currentTab.ssCardTabDisplay}</div>
                <div className="ss-card-value">
                    {
                        currentTab.valueType ?
                        to2DecimalPlacesPipe(siteSummaryData[currentTab.valueAccessor as keyof SiteSummaryAPI], currentTab.valueType)
                        : siteSummaryData[currentTab.valueAccessor as keyof SiteSummaryAPI]
                    }
                </div>
            </div>
        </div>
    )
    : null;
}

export default SiteSummaryCard;