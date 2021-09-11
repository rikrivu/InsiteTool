import { MultiSelection } from './DefaultMultiSelectModels';

export interface TSFilterSelectionsModel {
    siteId: number;
    Loc: MultiSelection[];
    Chem: MultiSelection[];
}

export interface TSMultiSelectConfig {
    settingsName: string;
    displayName: string;
}

export interface TSFilterState {
    siteId: number;
    Loc: string[];
    Chem: string;
    startDate: Date;
    endDate: Date;
}

export interface TSChartDataWithoutTimeStamp {
    [name: string]: number | 'Y' | 'N' | null;
}

export interface TSChartData extends TSChartDataWithoutTimeStamp {
    timeStamp: number;
}

export interface TSChartDataConsolidated {
    plots: string[];
    chartData: TSChartData[];
}

export interface TSChartOptionsState {
    flagND: 'true' | 'false';
    plotND: 'gaps' | '0' | 'half' | 'equal';
    dataKey: `${('gapValue' | 'zeroValue' | 'halfValue' | 'equalValue')}-`;
}

export interface TSChartOptionsProps {
    radioGroups: {name: string, id: string}[][];
    chartOptionsState: TSChartOptionsState;
    handleRadioButtonToggle(value: string, radioGroup: 'flagND' | 'plotND'): void;
}