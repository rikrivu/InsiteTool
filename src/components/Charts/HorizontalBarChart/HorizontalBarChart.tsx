import { ResponsiveContainer, BarChart, Tooltip, XAxis, YAxis, Bar } from 'recharts';
import { DefaultChartModel } from '../../../models/ChartModels';
import CustomBarChartLabel from '../utils/CustomBarChartLabels';
import CustomChartTooltip from '../utils/CustomChartTooltip';

function HorizontalBarChart (props: DefaultChartModel) {
    return props.xAxisDataKey && props.yAxisDataKey ? (
        <div className="chart-container">
            <ResponsiveContainer>
                <BarChart
                    data={props.data}
                    layout="vertical"
                    margin={{
                        top: 20,
                        right: 30,
                        left: (!props.chartFilters || props.chartFilters?.vertAxis?.isActive === true) ? 100 : -40,
                        bottom: 20
                    }}
                >

                    <XAxis
                        type="number"
                        fontSize={12}
                        tick={
                            (!props.chartFilters || props.chartFilters?.horzAxis?.isActive === true) ?
                            {fill: 'var(--color-white)'} : false
                        }
                        axisLine={(!props.chartFilters || props.chartFilters?.horzAxis?.isActive === true) ? true : false}
                        label={{value: props.xAxisLabel, position: 'bottom', fill: 'var(--color-white)', offset: 0}}
                    />

                    <YAxis type="category"
                        dataKey={props.yAxisDataKey}
                        fontSize={12}
                        tick={
                            (!props.chartFilters || props.chartFilters?.vertAxis?.isActive === true) ? 
                            {fill: 'var(--color-white)'} : false
                        }
                        axisLine={(!props.chartFilters || props.chartFilters?.vertAxis?.isActive === true) ? true : false}
                        label={
                            <CustomBarChartLabel
                                fill='var(--color-white)'
                                axisType='yAxis'
                                labelOffset={props.labelOffset}
                            >
                                {props.yAxisLabel}
                            </CustomBarChartLabel>
                        }
                    />

                    <Tooltip content={
                        <CustomChartTooltip
                            chartType="horizontal-bar"
                            color={props.barColor ? props.barColor : 'var(--color-graph-blue)'}
                        />
                    }/>

                    <Bar
                        dataKey={props.xAxisDataKey}
                        barSize={25}
                        fill={props.barColor ? props.barColor : 'var(--color-graph-blue)'}
                    />

                </BarChart>
            </ResponsiveContainer>
        </div>
    )
    : <div>Incorrect Chart Data</div>;
}

export default HorizontalBarChart;