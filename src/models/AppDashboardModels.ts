import { Dispatch, ReactNode, SetStateAction } from 'react';
import { ChartParams } from './ChartModels';

export interface CheckMaximize {
    isMaximized: boolean;
    component: string;
    emitterName: string;
    loaderPosition: 'default-loader' | 'br-loader' | 'tr-loader';
}

export interface LayoutConfig {
    components: (LayoutConfigComponent | LayoutConfig[])[];
    defaultHeight?: DimensionCalculator;
}

export interface DimensionCalculator {
    rowsOrCols: number;
    percentValue: number;
}

export interface LayoutConfigComponent {
    component: string;
    componentID: string;
    loaderPosition?: 'default-loader' | 'br-loader' | 'tr-loader';
    tabs: LayoutConfigComponentTab[];
    isDashboard: boolean;
    maximizable: boolean;
    isDraggable: boolean;
    emitterName?: string;
    defaultWidth?: DimensionCalculator;
    minWidth?: DimensionCalculator;
    maxWidth?: DimensionCalculator;
    minHeight?: DimensionCalculator;
    maxHeight?: DimensionCalculator;
}

export interface LayoutComponentAsProps extends LayoutConfigComponent {
    children?: ReactNode;
}

export interface LayoutConfigComponentTab {
    tabName: string;
    truncatedName: string;
    title: string;
    valueAccessor?: string;
    complexComponent?: {
        componentType: string;
        chartType?: 'horizontal-bar' | 'brush-bar' | 'doughnut' | 'stacked-bar' | 'line' | 'multi-line';
        filters?: string[];
        chartOptions?: {name: string, id: string}[][];
        chartParams?: ChartParams;
    }
    ssCardTabDisplay?: string;
    valueType?: 'number' | 'percent';
}

export interface ResponsiveGridLayoutDimensions {
    widths: {
        [P: string]: {x: number};
    };
    y: number;
}

export interface ResponsiveGridColAndBreakPoints {
    [P: string]: number;
}

export interface ResponsiveGridProps {
    breakpoints: ResponsiveGridColAndBreakPoints;
    cols: ResponsiveGridColAndBreakPoints;
    rowHeight: number;
    autoSize: boolean;
    isBounded: boolean;
    margin: [number, number];
}

export interface LayoutComponentAsProps extends LayoutConfigComponent {
    children?: ReactNode;
}

export interface LoaderType {
    showLoader: boolean;
    position?: 'default-loader' | 'br-loader' | 'tr-loader';
}

export interface WrappingCardChildrenProps {
    setLoader?: Dispatch<SetStateAction<LoaderType>>;
    loaderPosition: 'default-loader' | 'br-loader' | 'tr-loader';
}

export interface DefaultCardProps extends WrappingCardChildrenProps {
    emitterName: string;
    tabs: LayoutConfigComponentTab[];
    isMaximized?: boolean;
}