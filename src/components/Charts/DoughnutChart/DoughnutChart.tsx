import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from 'recharts';
import { renderActiveShape, renderLabelLine } from './doughnutChartMethods';
import CustomDoughnutChartLabel from '../utils/CustomDoughnutChartLabel';
import CustomChartTooltip from '../utils/CustomChartTooltip';
import { useState, useCallback, useMemo } from 'react';
import { DefaultChartModel } from '../../../models/ChartModels';
import React from 'react';

function DoughnutChart (props: DefaultChartModel) {

  // console.log('Invoked DoughnutChart', props);

  const [activeIndex, setActiveIndex] = useState<number | undefined>();
  const [activeSector, setActiveSector] = useState<number | undefined>();

  const onMouseOver: any = useCallback((data: any, index: number): void => {
    // console.log('Mouse Enter');
    setActiveIndex(index);
  }, []);
  const onMouseLeave: any = useCallback((data: any, index: number): void => {
    // console.log('Mouse Left');
    setActiveIndex(undefined);
  }, []);

  const onMouseDown: any = useCallback((data: any, index: number): void => {
    // console.log('Pie Section Clicked');
    setActiveIndex(index);
    setActiveSector(index);
  }, []);

  const chartLabels = useMemo(() => {
    if ((props.chartFilters?.dataLabels?.isActive) === false) {
      return {
        label: undefined,
        labelLine: undefined
      }
    } else {
      return {
        label: (chartLabelProps: any) => CustomDoughnutChartLabel({...chartLabelProps, isMaximized: props.isMaximized}),
        labelLine: (labelLineProps: any) => renderLabelLine({...labelLineProps, isMaximized: props.isMaximized})
      }
    }
  }, [props.chartFilters, props.isMaximized])

  return props.xAxisDataKey && props.yAxisDataKey ? (
    <div className="chart-container-long">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            isAnimationActive={false}
            data={props.data}
            dataKey={props.xAxisDataKey}
            nameKey={props.yAxisDataKey}
            cx="50%"
            cy="50%"
            innerRadius="30%"
            outerRadius="50%"
            label={chartLabels.label}
            labelLine={chartLabels.labelLine}
            activeShape={(renderActiveShapeProps: any) => renderActiveShape({...renderActiveShapeProps, isMaximized: props.isMaximized})}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseLeave}
            onMouseDown={onMouseDown}
            activeIndex={activeIndex !== undefined ? activeIndex : (activeSector !== undefined ? activeSector : undefined)}
          >
            {
              props.data.map((item: any, index: number) => (
                <Cell key={`${props.xAxisDataKey}-cell-${index}`}
                  fill={item.color}
                  stroke={item.color}
                  strokeWidth={0.5}
                />
              ))
            }
          </Pie>
          <Tooltip content={<CustomChartTooltip chartType="doughnut"/>}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
  : <div>Incorrect Chart Data</div>;
}

const MemoizedDoughnutChart = React.memo(DoughnutChart);

// export default DoughnutChart;
export default MemoizedDoughnutChart;