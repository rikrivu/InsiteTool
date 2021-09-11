import React from 'react';
import {
  BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, Tooltip,
  Legend, Cell
} from 'recharts';
import { soilPlotLegends } from './soilPlotsConfig';
import { DefaultChartModel } from '../../../models/ChartModels';
import _ from 'lodash';
import './StackedBarChart.scss';
import { SoilPlotBarData, SoilPlotLevelsAPI } from '../../../models/APIModels';
import CustomChartTooltip from '../utils/CustomChartTooltip';

const getVal = (obj: any, key: string): number => {
  // console.log('Getval', obj, key);
  return obj?.[key]?.value ? obj[key].value : null;
}

const CustomLegend = (props: any): JSX.Element => {
  // console.log('Legend Props', props);
  return (
    <div className={`${props.isMaximized ? 'sp-legend-container-max' : 'sp-legend-container'}`}>
      {
        Object.keys(soilPlotLegends).map((key: (keyof typeof soilPlotLegends), index: number) => (
          <div key={`item-${index}`} className="sp-legend">
            <div style={{background: soilPlotLegends[key]}}></div>
            <div>{key}</div>
          </div>
        ))
      }
    </div>
  );
}

function StackedBarChart (props: DefaultChartModel) {
  
  // console.log('Stacked Bar Chart props', props);

  return (
    <div className="chart-container-long">
      <ResponsiveContainer>
        <BarChart
          data={props.data.plotData}
          margin={{
            top: 30,
            right: 0,
            left: 5,
            bottom: 10
          }}
        >
          <YAxis
            orientation="right"
            reversed={true}
            tickFormatter={(val: any) => val + ' ft'}
            tick={{fill: 'var(--color-white)'}}
            tickCount={11}
          />

          <Tooltip content={
            <CustomChartTooltip
              chartType="stacked-bar"
            />
          }/>

          <XAxis
            dataKey="name"
            axisLine={false}
            interval={0}
            orientation="top"
            tick={{stroke: "var(--color-white)", fontSize: props.isMaximized ? 14 : 10}}
          />

          <Legend
            verticalAlign="top"
            content={(legendProps: any) => <CustomLegend {...legendProps}
            isMaximized={props.isMaximized}/>}
          />

          {
            _.times(props.data.maxLevels, (i: number) => {
              const currentLevel: keyof SoilPlotBarData = `level${i + 1}` as keyof SoilPlotBarData;
              return (
                <Bar key={`${i}-${currentLevel}`} dataKey={val => getVal(val, currentLevel)} stackId="x">
                  {
                    props.data.plotData.map((entry: SoilPlotBarData, index: number) => {
                      // console.log('ENtry', entry, currentLevel)
                      return (
                        <Cell
                          key={`${entry.name}-${currentLevel}-${index}`}
                          fill={`var(--color-soil-plot-${(entry[currentLevel] as SoilPlotLevelsAPI).graphic})`}
                        />
                      );
                    })
                  }
                </Bar>
              );
            })
          }
          
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const MemoizedStackedBarChart = React.memo(StackedBarChart);

export default MemoizedStackedBarChart;