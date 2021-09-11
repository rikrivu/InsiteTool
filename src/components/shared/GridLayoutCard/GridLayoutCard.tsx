import './GridLayoutCard.scss';

import {
    Children, cloneElement,
    Dispatch,
    isValidElement, JSXElementConstructor,
    ReactElement, RefObject, SetStateAction,
    useCallback, useEffect, useMemo, useState
} from 'react';

// 3rd Party Libraries
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowMaximize } from '@fortawesome/free-solid-svg-icons';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

// Import models
import { LayoutComponentAsProps, LayoutConfigComponentTab, LoaderType } from '../../../models/AppDashboardModels';
import { SelectedTabEmitter } from '../../../models/EventEmitterModels';

// Local Imports
import { EventEmitter, Events } from '../../../utils/EventEmitter';

// Import Components
import CustomTooltip from '../CustomTooltip/CustomTooltip';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { createSelectedTabInfo, createLayoutCardTabs } from '../../../utils/globalUtilityMethods';
import { useOnClickOutside } from '../ClickOutsideHook/ClickOutsideHook';
import { MAX_TAB_PER_CARD } from '../../../app-config';

function GridLayoutCard (props: LayoutComponentAsProps) {

    const [currentTab, setCurrentTab]
    : [LayoutConfigComponentTab | undefined, Dispatch<SetStateAction<LayoutConfigComponentTab | undefined>>]
    = useState<LayoutConfigComponentTab | undefined>(props.tabs.length ? props.tabs[0] : undefined);

    const [loader, setLoader]: [LoaderType, Dispatch<SetStateAction<LoaderType>>] = useState<LoaderType>({showLoader: false})

    const [isOptionsPanelOpen, setIsOptionsPanelOpen]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);

    const dropdownRef: RefObject<HTMLDivElement> = useOnClickOutside(() => setIsOptionsPanelOpen(false));

    const childrenWithProps: ReactElement<any, string | JSXElementConstructor<any>>[] | null | undefined =
    useMemo(() => Children.map(props.children, child => {
        // console.log('GridLayoutCard Children', child, props.children);
        if (isValidElement(child)) {
            return cloneElement(child, {setLoader: setLoader})
        } 
    }), [props.children])

    const selectTab = useCallback((tab: LayoutConfigComponentTab): void => {

        const selectedTabInfo: SelectedTabEmitter = createSelectedTabInfo(tab, props.component);

        setCurrentTab(tab);

        EventEmitter.dispatch([((props.emitterName? props.emitterName : 'set_current_tab') as Events)], [selectedTabInfo]);
    }, [props.component, props.emitterName]);

    const [tabs, dropdownTabs]: [LayoutConfigComponentTab[], JSX.Element[]]
    = useMemo(
        () => createLayoutCardTabs([...props.tabs], MAX_TAB_PER_CARD, currentTab!, selectTab, setIsOptionsPanelOpen), 
        [currentTab, props.tabs, selectTab]
    );

    // console.log('tabs', tabs, dropdownTabs);

    useEffect(() => {

        if (props.tabs.length) {
            // console.log('Layout card Tabs', props.tabs);
            const selectedTabInfo: SelectedTabEmitter = createSelectedTabInfo(props.tabs[0], props.component);
           
            EventEmitter.dispatch([((props.emitterName? props.emitterName : 'set_current_tab') as Events)], [selectedTabInfo]);
        }

    }, [props.component, props.emitterName, props.tabs]);

    // console.log('Props', props);
    return (
        <div className={`${props.isDashboard ? '' : 'card-container'}`}>
            
            <div className={`${props.isDashboard ? 'card-wrapper-dashboard' : 'card-wrapper'}`}>

                {
                    props.isDashboard ?
                    null :
                    <div className="card-top-bar">
                        <div className="card-left-panel">
                            {
                                tabs.length === 1 ?
                                <div>{props.tabs[0].truncatedName}</div>
                                : (
                                    tabs?.map((tab: LayoutConfigComponentTab, index: number) => {
                                        return (
                                            <CustomTooltip key={index} title={tab.tabName}>
                                                <button type="button"
                                                    className=
                                                    {`tab-btn text-truncate${
                                                        currentTab?.truncatedName === tab.truncatedName ? ' tab-active-btn' : ''
                                                    }`}
                                                    onClick={() => selectTab(tab)}
                                                >
                                                    {tab.truncatedName}
                                                </button>
                                            </CustomTooltip>
                                        );
                                    })
                                )
                            }
                            {
                                currentTab &&
                                !tabs.find((tab: LayoutConfigComponentTab) => tab.truncatedName === currentTab?.truncatedName) &&
                                <CustomTooltip title={currentTab.tabName}>
                                    <button type="button" className="tab-btn text-truncate tab-active-btn">
                                        {currentTab.truncatedName}
                                    </button>
                                </CustomTooltip>                                
                            }
                        </div>
                        <div className="card-right-panel">
                            {
                                !!dropdownTabs.length &&
                                <div ref={dropdownRef} className="dismissible-container">
                                    <CustomTooltip title="More Options">
                                        <button className="icon-btn"
                                            onClick={() => setIsOptionsPanelOpen((prev: boolean) => (!prev))}
                                        >
                                            <ArrowDropDownIcon/>
                                        </button>
                                    </CustomTooltip>

                                    {
                                        isOptionsPanelOpen &&
                                        <div className="dismissible-dropdown tab-dropdown">
                                           {dropdownTabs}
                                        </div>
                                    }

                                </div>
                            }
                            {
                                props.maximizable &&
                                <CustomTooltip title="Maximize">
                                    <button type="button" className="icon-btn-fa"
                                        onClick={() => EventEmitter.dispatch([('maximize' as Events)], [{
                                            component: props.component,
                                            componentID: props.componentID,
                                            emitterName: props.emitterName,
                                            loaderPosition: props.loaderPosition
                                        }])}
                                    >
                                        <FontAwesomeIcon icon={faWindowMaximize} className="icon-maximize" />
                                    </button>
                                </CustomTooltip>
                            }
                        </div>
                    </div>
                }

                <div className="card-content">
                    {
                        loader.showLoader &&
                        <div className={`loading-spinner${loader.position ? ' ' + loader.position : ' default-loader'}`}>
                            <LoadingSpinner/>
                        </div>
                    }
                    {childrenWithProps}
                </div>
            </div>
        </div>
    );
}

export default GridLayoutCard;