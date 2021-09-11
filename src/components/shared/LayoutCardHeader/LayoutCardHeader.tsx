import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { LayoutConfigComponentTab } from '../../../models/AppDashboardModels';
import { ChartFilterProps, MultiSelectProps } from '../../../models/LayoutCardHeaderModels';
import { DateRangeSliderProps } from '../DateRangeSlider/DateRangeSliderModels';
import DateRangeSlider from '../DateRangeSlider/DateRangeSlider'
import DefaultMultiSelect from '../DefaultMultiSelect/DefaultMultiSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomTooltip from '../CustomTooltip/CustomTooltip';
import { memo, ReactNode } from 'react';
import ChartFilter from '../ChartFilter/ChartFilter';
import SpecialComponent from './SpecialComponent';

function UnMemoizedLayoutCardHeader (props: {
    currentTab: LayoutConfigComponentTab,
    dateRangeProps?: DateRangeSliderProps,
    chartFilters?: ChartFilterProps,
    multiSelectProps?: MultiSelectProps[],
    hasApply?: {
        applyCB: Function;
        disabled: boolean;
    },
    specialComponent?: {
        icon: ReactNode,
        component: ReactNode
    }
}) {
    // console.log('LayoutCardHeader', props);
    return (
        <>
            {props.currentTab.title.length ? <div>{props.currentTab.title}</div> : null}
            <div className="settings-panel">
                
                <div className="panel-left">
                    {
                        !!props.hasApply &&
                        <>
                            {
                                props.hasApply.disabled ?
                                <div className="icon-btn chart-card-settings option-disabled">
                                    <FontAwesomeIcon icon={faSyncAlt}/>
                                </div>
                                :
                                <CustomTooltip title="Apply Changes" onClick={() => props.hasApply?.applyCB()}>
                                    <button type="button" className="icon-btn chart-card-settings">
                                        <FontAwesomeIcon icon={faSyncAlt}/>
                                    </button>
                                </CustomTooltip>
                            }
                        </>
                    }
                </div>

                <div className={`panel-right${props.dateRangeProps ? ' adjust-date-slider': ''}`}>
                    {
                        !!props.dateRangeProps &&
                        <DateRangeSlider {...props.dateRangeProps}/>
                    }

                    {
                        !!props.multiSelectProps?.length &&
                        props.multiSelectProps.map((multiSelectProp: MultiSelectProps, index: number) => (
                            <DefaultMultiSelect key={index} {...multiSelectProp}/>
                        ))
                    }

                    {
                        props.chartFilters && !!Object.keys(props.chartFilters.filters).length &&
                        <ChartFilter {...props.chartFilters}/>
                    }

                    {
                        !!props.specialComponent &&
                        <SpecialComponent {...props.specialComponent}/>
                    }
                </div>
            </div>
        </>
    );
}

const LayoutCardHeader = memo(UnMemoizedLayoutCardHeader)
export default LayoutCardHeader;