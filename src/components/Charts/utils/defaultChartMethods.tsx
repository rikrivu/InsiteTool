import { ChartParams } from '../../../models/ChartModels';
import MemoizedBrushBarChart from '../BrushBarChart/BrushBarChart';
import MemoizedDoughnutChart from '../DoughnutChart/DoughnutChart';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart'
import MemoizedStackedBarChart from '../StackedBarChart/StackedBarChart';
import MultiLineChart from '../MultiLineChart/MultiLineChart';

export const chartMapper = (chartType: string, data: any, params: ChartParams): JSX.Element => {
    switch(chartType) {
        case 'horizontal-bar': {
            return <HorizontalBarChart data={data} {...params}/>
        }
        case 'doughnut': {
            return <MemoizedDoughnutChart data={data} {...params}/>
        }
        case 'brush-bar': {
            return <MemoizedBrushBarChart data={data} {...params}/>
        }
        case 'stacked-bar': {
            return <MemoizedStackedBarChart data={data} {...params}/>
        }
        case 'multi-line': {
            return <MultiLineChart data={data} {...params}/>
        }
        default: {
            return (
                <div>No Chart Found</div>
            );
        }
    }
} 