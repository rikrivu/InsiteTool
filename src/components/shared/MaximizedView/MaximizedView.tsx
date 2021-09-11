import {
    Children, cloneElement,
    Dispatch, JSXElementConstructor,
    SetStateAction, isValidElement,
    ReactElement,
    useCallback, useEffect, useMemo, useState, memo
} from 'react';
import './MaximizedView.scss';
import MinimizeIcon from '@material-ui/icons/Minimize';
import EventEmitter, { Events } from '../../../utils/EventEmitter';
import CustomTooltip from '../CustomTooltip/CustomTooltip';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { SelectedTabEmitter } from '../../../models/EventEmitterModels';
import { LayoutComponentAsProps, LayoutConfigComponentTab, LoaderType } from '../../../models/AppDashboardModels';
import { createSelectedTabInfo } from '../../../utils/globalUtilityMethods';

function MaximizedViewUnmemoized (props: LayoutComponentAsProps) {

    const [currentTab, setCurrentTab]: [string, Dispatch<SetStateAction<string>>]
    = useState<string>(props.tabs.length ? props.tabs[0].truncatedName : '');

    const [loader, setLoader]: [LoaderType, Dispatch<SetStateAction<LoaderType>>] = useState<LoaderType>({showLoader: false})

    // console.log('Props children', props.children);

    const childrenWithProps: ReactElement<any, string | JSXElementConstructor<any>>[] | null | undefined =
    useMemo(() => Children.map(props.children, child => {
        console.log('MaximizedView Children', child, props.children);
        if (isValidElement(child)) {
            return cloneElement(child, {setLoader: setLoader})
        } 
    }), [props.children])

    useEffect(() => {

        if (props.tabs.length) {
            const selectedTabInfo: SelectedTabEmitter = createSelectedTabInfo(props.tabs[0], props.component);

            console.log('Maximize props', props.component, props.emitterName, props.tabs);
           
            EventEmitter.dispatch([((props.emitterName? props.emitterName : 'set_current_tab') as Events)], [selectedTabInfo]);
        }

    }, [props.component, props.emitterName, props.tabs]);

    const selectTab = useCallback((tab: LayoutConfigComponentTab): void => {

        const selectedTabInfo: SelectedTabEmitter = createSelectedTabInfo(tab, props.component);

        setCurrentTab(tab.truncatedName);

        EventEmitter.dispatch([((props.emitterName? props.emitterName : 'set_current_tab') as Events)], [selectedTabInfo]);
    }, [props.component, props.emitterName]);
    
    return (
        <div className="max-view-container">
            <div className="max-view-tabs-panel">
                
                <div className="max-view-tabs">
                    {
                        props.tabs.length === 1 ?

                        <div className="max-view-tab">{props.tabs[0].truncatedName}</div>
                        
                        : props.tabs.map((tab: LayoutConfigComponentTab, index: number) => {
                            return (
                                <CustomTooltip key={index} title={tab.tabName}>
                                    <button type="button"
                                        className={`max-view-tab${currentTab === tab.truncatedName ? ' active-max-view-tab' : ''}`}
                                        onClick={() => selectTab(tab)}
                                    >
                                        {tab.truncatedName}
                                    </button>
                                </CustomTooltip>
                            );
                        })
                    }
                </div>

                <CustomTooltip title="Minimize">
                    <button type="button" className="minimize-btn" onClick={() => {EventEmitter.dispatch([('maximize' as Events)], [null])}}>
                        <MinimizeIcon />
                    </button>
                </CustomTooltip>

            </div>

            <div className="max-view-content-wrapper">
                {
                    loader.showLoader &&
                    <div className={`loading-spinner${loader.position ? ' ' + loader.position : ' default-loader'}`}>
                        <LoadingSpinner/>
                    </div>
                }
                {childrenWithProps}
            </div>
        </div>
    );
}

const MaximizedView = memo(MaximizedViewUnmemoized);

export default MaximizedView;