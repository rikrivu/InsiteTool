import { memo } from 'react';
import { TSChartOptionsProps } from '../../../../models/TimeSeriesModels';
import RadioButtonGroup from '../../../shared/RadioButtonGroup/RadioButtonGroup';

function TimeSeriesChartOptionsUnmemoized (props: TSChartOptionsProps) {
    // console.log('TimeSeriesChartOptionsUnmemoized', props);
    return (
        <div className="ts-chart-options-container">
            <div>
                <div>Flag ND</div>
                <RadioButtonGroup
                    groupId='flagND'
                    options={props.radioGroups[0]}
                    selected={props.chartOptionsState['flagND']}
                    handleRadioButtonToggle={(event) => {props.handleRadioButtonToggle(event.target.value, 'flagND')}}
                />
            </div>
            <div>
                <div>Plot ND as</div>
                <RadioButtonGroup
                    groupId='plotND'
                    options={props.radioGroups[1]}
                    selected={props.chartOptionsState['plotND']!}
                    handleRadioButtonToggle={(event) => {props.handleRadioButtonToggle(event.target.value, 'plotND')}}
                />
            </div>
        </div>
    );
}

const TimeSeriesChartOptions = memo(TimeSeriesChartOptionsUnmemoized)
export default TimeSeriesChartOptions;