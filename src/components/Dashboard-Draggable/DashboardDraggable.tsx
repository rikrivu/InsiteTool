import './DashboardDraggable.scss';
import { Dispatch, SetStateAction, useEffect, useMemo, useState, memo, useContext } from 'react';
import { Layout, Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import { gridProps, defaultLayoutConfig, initialGridDimensions } from './appDashboardLayoutConfig';
import { MaximizeEmitter } from '../../models/EventEmitterModels';
import { calculateMaxRowsBasedOnWindowHeight, componentMapper, createDraggableGridLayout, findComponent } from '../../utils/dashboardMethods';
import EventEmitter, { Events } from '../../utils/EventEmitter';
import MaximizedView from '../shared/MaximizedView/MaximizedView';
import useWindowSize, { WindowSize } from './WindowResizeHook';
import { LayoutConfigComponent, CheckMaximize } from '../../models/AppDashboardModels';
import NotifierPopIn from '../shared/NotifierPopIn/NotifierPopIn';
import { GlobalStoreState, globalStore } from '../../stores/GlobalStore/GlobalStore';

const ResponsiveGridLayout = WidthProvider(memo(Responsive));

function DashboardDraggable () {
    
    const [checkMaximize, setCheckMaximize]: [CheckMaximize | undefined, Dispatch<SetStateAction<CheckMaximize | undefined>>]
    = useState<CheckMaximize>();

    const {height}: WindowSize = useWindowSize();
    const globalState: GlobalStoreState = useContext<GlobalStoreState>(globalStore);

    // console.log('Dashboard', height);

    const maxRows: number | undefined = useMemo(() => {
        if (height) {
            return calculateMaxRowsBasedOnWindowHeight(height);
        };
    }, [height])

    const [layouts, components]: [Layouts | undefined, JSX.Element[] | undefined] = useMemo(() => {
        if (maxRows) {
            return createDraggableGridLayout(defaultLayoutConfig, maxRows, initialGridDimensions)
        } else return [undefined, undefined]
    }, [maxRows]);

    const [currentComponentDetails, setCurrentComponentDetails]
    : [LayoutConfigComponent | undefined, Dispatch<SetStateAction<LayoutConfigComponent | undefined>> | undefined]
    = useState<LayoutConfigComponent>();

    EventEmitter.unsubscribe(('maximize' as Events));
    EventEmitter.subscribe(('maximize' as Events), (data: MaximizeEmitter) => {
        console.log('Maximized', data);
        if (data) {
            setCheckMaximize({
                isMaximized: true,
                component: data.component,
                emitterName: data.emitterName,
                loaderPosition: data.loaderPosition!
            });
            setCurrentComponentDetails(findComponent(data.componentID, defaultLayoutConfig));
        } else {
            setCheckMaximize(undefined);
            setCurrentComponentDetails(undefined);
        }
    });

    useEffect(() => {
        return () => {
            EventEmitter.unsubscribe(('maximize' as Events))
        };
    }, [])

    return (
        <div className="d-dashboard-container">

            <NotifierPopIn {...globalState.state.notification}/>

            {
                checkMaximize?.isMaximized && currentComponentDetails ?
                <MaximizedView {...currentComponentDetails}>
                    {componentMapper(
                        checkMaximize.component,
                        checkMaximize.emitterName,
                        currentComponentDetails.tabs,
                        true,
                        checkMaximize.loaderPosition
                    )}
                </MaximizedView>
                :
                (
                    layouts && components ?
                    (
                        <ResponsiveGridLayout className="layout"
                            {...gridProps}
                            layouts={layouts}
                            isDraggable={true}
                            draggableHandle=".drag-handle"
                            // preventCollision={true}
                            useCSSTransforms={false}
                            maxRows={maxRows}
                            onLayoutChange={(currentLayout: Layout[], allLayouts: Layouts) => {console.log('Layout Change', currentLayout, allLayouts)}}
                        >
                            {components}
                        </ResponsiveGridLayout>
                    )
                    : null
                )
            }
        </div>
    )
}

export default DashboardDraggable;