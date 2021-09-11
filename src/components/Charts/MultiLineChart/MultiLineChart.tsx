import { memo } from 'react';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts';
import MultiLineChartDots from '../utils/MultiLineChartDots'
import { MultiLineChartProps } from '../../../models/ChartModels';
import { formatTick } from '../../../utils/globalUtilityMethods';
import { defaultColorSet } from '../utils/DefaultChartColors';
import MultiLineChartTooltip from '../utils/MultiLineChartTooltip';

function UnmemoizedLineChart (props: MultiLineChartProps) {
    
    // console.log('UnmemoizedLineChart props changed', props);

    return (
        <div className="chart-container-long" style={{marginTop: 15}}>
            <ResponsiveContainer>
                <LineChart
                    data={props.data.chartData}
                    margin={{ top: 15, right: 50, left: 0, bottom: 5 }}
                >
                    <XAxis dataKey={props.xAxisDataKey} tickFormatter={formatTick} tick={{fill: 'var(--color-white)'}}/>
                    <YAxis tick={{fill: 'var(--color-white)'}}/>
                    <Tooltip position={{y: 0}} content={<MultiLineChartTooltip/>}/>
                    {
                        props.data.plots.map((plot: string, index: number) => (
                            <Line
                                key={plot}
                                connectNulls={props.tsChartOptions?.plotND === 'gaps' ? false : true}
                                dataKey={`${props.yAxisDataKey}${plot}`}
                                stroke={defaultColorSet[index % 7]}
                                fill={defaultColorSet[index % 7]}
                                dot={<MultiLineChartDots plot={plot} flagnd={props.tsChartOptions?.flagND}/>}
                            />
                        ))
                    }
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

const MultiLineChart = memo(UnmemoizedLineChart);
export default MultiLineChart;