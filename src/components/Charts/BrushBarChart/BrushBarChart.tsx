import React from 'react';
import {
  BarChart, Bar, Brush, XAxis, YAxis,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { DefaultChartModel } from '../../../models/ChartModels';
import CustomChartTooltip from '../utils/CustomChartTooltip';

function BrushBarChart (props: DefaultChartModel) {

    // console.log('Invoked BrushBarChart', props);

    return props.xAxisDataKey && props.yAxisDataKey ? (
        <div className="chart-container">
            <ResponsiveContainer>
                <BarChart
                    data={props.data}
                    margin={{
                        top: 10,
                        right: 40,
                        left: (!props.chartFilters || props.chartFilters?.vertAxis?.isActive === true) ? 0 : -40,
                        bottom: 5
                    }}
                >
                    <XAxis
                        dataKey={props.yAxisDataKey}
                        tick={
                            (!props.chartFilters || props.chartFilters?.horzAxis?.isActive === true) ?
                            {fill: 'var(--color-white)'} : false
                        }
                        axisLine={(!props.chartFilters || props.chartFilters?.horzAxis?.isActive === true) ? true : false}
                    />
                    <YAxis
                        tick={(!props.chartFilters || props.chartFilters?.vertAxis?.isActive === true) ?
                            {fill: 'var(--color-white)'} : false
                        }
                        axisLine={(!props.chartFilters || props.chartFilters?.vertAxis?.isActive === true) ? true : false}
                    />
                    <Tooltip content={
                        <CustomChartTooltip
                            chartType="brush-bar"
                            color={props.barColor ? props.barColor : 'var(--color-graph-blue)'}
                        />
                    }/>
                    <Brush
                        dataKey={props.yAxisDataKey}
                        height={10}
                        travellerWidth={7}
                        stroke="var(--color-white)"
                        fill="var(--color-brush-grey)"
                    />
                    <Bar dataKey={props.xAxisDataKey} fill={props.barColor ? props.barColor : 'var(--color-graph-blue)'} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
    : <div>Incorrect Chart Data</div>;
}

const MemoizedBrushBarChart = React.memo(BrushBarChart);

export default MemoizedBrushBarChart;