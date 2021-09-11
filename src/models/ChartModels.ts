import { ChartFilterProps } from './LayoutCardHeaderModels';
import { TSChartDataConsolidated, TSChartOptionsState } from './TimeSeriesModels';

export interface ChartParams {
    isMaximized?: boolean;
    xAxisDataKey?: string;
    yAxisDataKey?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    labelOffset?: number;
    barColor?: string;
    tsChartOptions?: TSChartOptionsState;
    chartFilters?: ChartFilterProps['filters'];
}

export interface DefaultChartModel extends ChartParams {
    data: any;
}

export interface MultiLineChartProps extends ChartParams {
    data: TSChartDataConsolidated;
}