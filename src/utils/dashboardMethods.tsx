// Import Components
import FilterCard from '../components/Cards/FilterCard/FilterCard';
import TopRightChartsCard from '../components/Cards/TopRightChartsCard/TopRightChartsCard';
import MatrixMethodsCard from '../components/Cards/MatrixMethodsCard/MatrixMethodsCard';
import TopChemSoilPlots from '../components/Cards/TopChemSoilPlots/TopChemSoilPlots';
import SiteSummaryCard from '../components/Cards/SiteSummaryCard/SiteSummaryCard';
import GridLayoutCard from '../components/shared/GridLayoutCard/GridLayoutCard';
import CustomTooltip from '../components/shared/CustomTooltip/CustomTooltip';

import DragIndicatorIcon from '@material-ui/icons/DragIndicator';

import _ from 'lodash';

// Import Models
import {
    LayoutConfig, LayoutConfigComponent,
    LayoutConfigComponentTab,
    ResponsiveGridColAndBreakPoints,
    ResponsiveGridLayoutDimensions
} from '../models/AppDashboardModels';

import ArcGISMap from '../components/Cards/ArcGISMap/ArcGISMap';
import { gridProps, initialGridDimensions } from '../components/Dashboard-Draggable/appDashboardLayoutConfig';
import { Layout, Layouts } from 'react-grid-layout';

// Method returns a functional compoenent based on the parameters passed to it
// For each component it returns it will pass either WrappingCardChildrenProps or DefaultCardProps
// as prop types
export const componentMapper = (
    componentName: string,
    emitterName: string,
    tabs: LayoutConfigComponentTab[],
    isMaximized: boolean,
    loaderPosition?: 'default-loader' | 'br-loader' | 'tr-loader'
): JSX.Element => {
    // console.log('maximize', isMaximized);
    switch (componentName) {
        case 'GlobalFilter': {
            return (
                <FilterCard loaderPosition={loaderPosition!}/>
            );
        }
        case 'WebMap': {
            return (
                <ArcGISMap loaderPosition={loaderPosition!}/>
            );
        }
        case 'TopRightChartsCard': {
            return (
                <TopRightChartsCard 
                    emitterName={emitterName} tabs={tabs}
                    isMaximized={isMaximized} loaderPosition={loaderPosition!}
                />
            );
        }
        case 'MatrixMethods': {
            return (
                <MatrixMethodsCard
                    emitterName={emitterName} tabs={tabs}
                    isMaximized={isMaximized} loaderPosition={loaderPosition!}
                />
            );
        }
        case 'TopChemSoilPlots': {
            return (
                <TopChemSoilPlots
                    emitterName={emitterName} tabs={tabs}
                    isMaximized={isMaximized} loaderPosition={loaderPosition!}
                />
            );
        }
        case 'SiteSummaryCard': {
            return (
                <SiteSummaryCard
                    emitterName={emitterName} tabs={tabs}
                    isMaximized={isMaximized} loaderPosition={loaderPosition!}
                />
            );
        }
        default: {
            return  (
                <>{componentName}</>
            );
        }
    }
}

// JSX for to add draghandle to all cards that can be dragged and dropped
const DragHandle = (): JSX.Element => {
    return (
        <span className="drag-handle">
            <CustomTooltip title="Drag">
                <button type="button" className="icon-btn">
                    <DragIndicatorIcon/>
                </button>
            </CustomTooltip>
        </span>
    );
}

// Comparator function required by while creating the grid layout. It is one of the methods used to make the layout responsive
// by determine which height/width or should be considered when there is any conflict in the existing logic written 
const dimensionComparator = (greater: number, lesser: number, takeGreater: boolean): number => {
    // console.log('greater-lesser', greater, lesser);
    return takeGreater ?
    (greater > lesser ? greater : lesser) :
    (greater < lesser ? greater : lesser);
}

// Creates dimensions (height/width, max-minHeight/max-minWidth) for a cell when called
const createLayoutDimensions = (
    component: LayoutConfigComponent,
    row: LayoutConfig,
    newLayout: Layout,
    colWidth: number,
    maxRows: number
): Layout => {
    const updatedLayout: Layout = {...newLayout};

    if ('defaultWidth' in component && component.defaultWidth) {
        updatedLayout.w = dimensionComparator(
            component.defaultWidth.percentValue * colWidth / 100, component.defaultWidth.rowsOrCols, true
        );
    }

    if ('defaultHeight' in row && row.defaultHeight) {
        updatedLayout.h = dimensionComparator(
            row.defaultHeight.percentValue * maxRows / 100, row.defaultHeight.rowsOrCols, true
        );
    }

    if ('minWidth' in component && component.minWidth) {
        updatedLayout.minW = dimensionComparator(
            component.minWidth.percentValue * colWidth / 100, component.minWidth.rowsOrCols, true
        );
    }

    if ('maxWidth' in component && component.maxWidth) {
        updatedLayout.maxW = dimensionComparator(
            component.maxWidth.percentValue * colWidth / 100, component.maxWidth.rowsOrCols, true
        );
    }

    if ('minHeight' in component && component.minHeight) {
        updatedLayout.minH = dimensionComparator(
            component.minHeight.percentValue * maxRows / 100, component.minHeight.rowsOrCols, false
        );
    }

    if ('maxHeight' in component && component.maxHeight) {
        updatedLayout.maxH = dimensionComparator(
            component.maxHeight.percentValue * maxRows / 100, component.maxHeight.rowsOrCols, true
        );
    }

    return updatedLayout;
}

// Function that creates the Layout and components that are passed the Grid library to get the final layout
// This method is performs a fair amount of calculations to precisely deduce height and width of every cell in the layout
// Refer to the library's documentation to get the basic idea on how each cell gets positioned based on their dimension
// ie. the layouts object which is of 'Layout' interface that is passed to the library
// https://www.npmjs.com/package/react-grid-layout

export const createDraggableGridLayout = (
    layoutConfig: LayoutConfig[], // Config based on which the laout is supposed to be created
    maxRows: number, // A unit of the library. Not to be confused with the actual number of rows present in the layout ie. 2 in this app 
    initialDimensions: ResponsiveGridLayoutDimensions // Starting dimensions of the layout
): [Layouts, JSX.Element[]] => {

    const currentDimensions: ResponsiveGridLayoutDimensions = _.cloneDeep(initialGridDimensions);

    const totalNoOfRows: number = layoutConfig.length;

    const colWidths: ResponsiveGridColAndBreakPoints = Object.keys(gridProps.cols)
    .reduce((finalColWidths: ResponsiveGridColAndBreakPoints, key: keyof ResponsiveGridColAndBreakPoints) => {

        finalColWidths[key] = gridProps.cols[key] - initialDimensions.widths[key].x

        return finalColWidths;
    }, {})

    const [layouts, components]: [Layouts, JSX.Element[]] = layoutConfig
    .reduce((result: [Layouts, JSX.Element[]], row: LayoutConfig, rowIndex: number) => {

        let calculatedRowHeightInRows: number = (maxRows - currentDimensions.y) / (totalNoOfRows - rowIndex);
        // console.log('calculatedRowHeightInRows start', calculatedRowHeightInRows, maxRows, currentDimensions.y, totalNoOfRows, rowIndex);

        const itemsPerRow: number = row.components.length;

        row.components.forEach((comp: (LayoutConfigComponent | LayoutConfig[]), compIndex: number) => {

            let innerLayouts: Layouts;
            let innerComponents: JSX.Element[];

            if (Array.isArray(comp)) {

                [innerLayouts, innerComponents] = createDraggableGridLayout(comp, calculatedRowHeightInRows, currentDimensions);
                result[1].push(...innerComponents)

            } else {
                // console.log('createLayout Grid', comp)
                result[1].push(
                    <div key={comp.componentID} className="gridItem"
                        style={{zIndex: comp.component === 'GlobalFilter' ? 1 : 'inherit'}}
                    >
                        {comp.isDraggable && <DragHandle/>}
                        <GridLayoutCard {...comp}>
                            {componentMapper(comp.component, comp.emitterName!, comp.tabs, false, comp.loaderPosition)}
                        </GridLayoutCard>
                    </div>
                )
            }

            Object.keys(colWidths).forEach((key: keyof ResponsiveGridColAndBreakPoints) => {
            
                if (!compIndex) {
                    currentDimensions.widths[key].x = 0;
                }

                let layoutToPush: Layout[];

                if (Array.isArray(comp)) {
                    
                    layoutToPush = [...innerLayouts[key]]

                } else {

                    const calculatedColWidthInCols: number =
                    (colWidths[key] - currentDimensions.widths[key].x) / (itemsPerRow - compIndex);
                    // console.log('calculation', colWidths[key], currentDimensions.widths[key], itemsPerRow, compIndex);
                    // console.log('calculatedRowWidth', comp.component, key, calculatedColWidthInCols);

                    let newLayout: Layout = {
                        i: comp.componentID,
                        x: initialDimensions.widths[key].x + currentDimensions.widths[key].x,
                        y: initialDimensions.y + currentDimensions.y,
                        w: calculatedColWidthInCols,
                        h: calculatedRowHeightInRows,
                        isDraggable: comp.isDraggable
                    }

                    newLayout = createLayoutDimensions(comp, row, newLayout, colWidths[key], maxRows);

                    layoutToPush = [newLayout];

                    currentDimensions.widths[key].x += newLayout.w;
                    calculatedRowHeightInRows = newLayout.h > calculatedRowHeightInRows ? newLayout.h : calculatedRowHeightInRows;
                    // console.log('calculatedRowHeightInRows end', calculatedRowHeightInRows);
                }

                if (result[0][key]) {
                    result[0][key].push(...layoutToPush)
                } else {
                    result[0][key] = [...layoutToPush]
                }
            })
        });
        
        currentDimensions.y += calculatedRowHeightInRows;

        return result;
    }, [{}, []])
    
    console.log('Layout', layouts, components, colWidths);

    return [layouts, components];
}

// Return a number which corresponds to the maxRow units that the layout will have based on the viewport height
// This number along with the 'rowHeight' which is present in 'gridProps' object determines final height of the grid Layout
export const calculateMaxRowsBasedOnWindowHeight = (windowHeight: number): number => {
    switch(true) {
        case (windowHeight < 624): {
            return 95;
        }
        case (windowHeight >= 624 && windowHeight < 664): {
            return 100;
        }
        case (windowHeight >= 664 && windowHeight < 694): {
            return 108;
        }
        case (windowHeight >= 694 && windowHeight < 781): {
            return 113;
        }
        case (windowHeight >= 781 && windowHeight < 833): {
            return 130;
        }
        case (windowHeight >= 833 && windowHeight < 900): {
            return 139;
        }
        case (windowHeight >= 900 && windowHeight < 950): {
            return 152;
        }
        case (windowHeight >= 950 && windowHeight < 989): {
            return 161;
        }
        case (windowHeight >= 989 && windowHeight < 1028): {
            return 168;
        }
        case (windowHeight >= 1028 && windowHeight < 1057): {
            return 176;
        }
        case (windowHeight >= 1057): {
            return 181;
        }
        default: {
            return 101;
        }
    }
}

// Method to find a component in the config
// Used when the app is in Maximized view and the app needs to know which component to reneder inside Maximized view
export const findComponent = (
    componentIDToFind: string,
    layoutConfiguration: LayoutConfig[]
): (LayoutConfigComponent | undefined) => {
    
    let foundComponent: (LayoutConfigComponent | undefined) = undefined;

    for (let panel of layoutConfiguration) {

        for (let component of panel.components) {
            if (Array.isArray(component)) {
                foundComponent = findComponent(componentIDToFind, component);
                break;
            } else if (component.componentID === componentIDToFind) {
                foundComponent = component;
                break;
            }
        }

        if (foundComponent) {
            break;
        }
    }
    return foundComponent;
}