// import { DefaultCardProps, LayoutComponentTab } from '../../../models/LayoutConfigurationModels';
import EventEmitter, { Events } from '../../../utils/EventEmitter';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { SelectedTabEmitter } from '../../../models/EventEmitterModels';
import { DefaultCardProps, LayoutConfigComponentTab, LoaderType } from '../../../models/AppDashboardModels';
import DoughnutChartTabHOC from './DoughnutChartTabHOC/DoughnutChartTabHOC';
import { ChemicalsAPI, MatrixAPI, MethodsAPI } from '../../../models/APIModels';
import { getMatrixData, getMethodsData, getChemicalsData } from '../../../services/matrix-method-data-service';

const createTabComponent = (
    tab: LayoutConfigComponentTab,
    isMaximized: boolean,
    setLoader: Dispatch<SetStateAction<LoaderType>> | undefined,
    loaderPosition: 'default-loader' | 'br-loader' | 'tr-loader'
): JSX.Element => {
    // console.log('createTabComponent isMaximized', isMaximized);
    switch (tab.truncatedName) {
        case 'Matrixes': {
            return (
                <DoughnutChartTabHOC<MatrixAPI>
                    tab={tab} isMaximized={isMaximized ? isMaximized : false}
                    setLoader={setLoader} loaderPosition={loaderPosition}
                    storeKey='matrixData'
                    getData={getMatrixData}
                    chartParams={tab.complexComponent?.chartParams!}
                />
            );
        }
        case 'Methods': {
            return (
                <DoughnutChartTabHOC<MethodsAPI>
                    tab={tab} isMaximized={isMaximized ? isMaximized : false}
                    setLoader={setLoader} loaderPosition={loaderPosition}
                    storeKey='methodsData'
                    getData={getMethodsData}
                    chartParams={tab.complexComponent?.chartParams!}
                />
            );
        }
        case 'Chemicals': {
            return (
                <DoughnutChartTabHOC<ChemicalsAPI>
                    tab={tab} isMaximized={isMaximized ? isMaximized : false}
                    setLoader={setLoader} loaderPosition={loaderPosition}
                    storeKey='chemicalsData'
                    getData={getChemicalsData}
                    chartParams={tab.complexComponent?.chartParams!}
                />
            );
        }
        default: {
            return <div>No Component Found for this Tab.</div>
        }
    }
}

function MatrixMethodsCard (props: DefaultCardProps) {

    const [currentTab, setCurrentTab]: [LayoutConfigComponentTab, Dispatch<SetStateAction<LayoutConfigComponentTab>>]
    = useState<LayoutConfigComponentTab>(props.tabs[0]);

    // console.log('Matrix_methods props', props);
    EventEmitter.unsubscribe(props.emitterName as Events);
    EventEmitter.subscribe(props.emitterName as Events, (data: SelectedTabEmitter) => {
        // console.log('Matrix Method Config Data', data);
        if (data.tabName !== currentTab.tabName) {
            setCurrentTab({...data});
        }
    });

    const tabComponent: JSX.Element = useMemo(
        () => createTabComponent(currentTab, props.isMaximized!, props.setLoader, props.loaderPosition),
        [currentTab, props.isMaximized, props.loaderPosition, props.setLoader]
    )

    // console.log('Invoking MatrixMethodsCard', props);

    return (
        <div className={`cover-100${props.isMaximized ? ' max-chart-card-container' : ' chart-card-container'}`}>
            {tabComponent}
        </div>
    );
}

export default MatrixMethodsCard;