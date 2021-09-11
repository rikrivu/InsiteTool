import './ChartFilter.scss';
import { ChartFilterProps } from '../../../models/LayoutCardHeaderModels';
import SettingsIcon from '@material-ui/icons/Settings';
import { Dispatch, RefObject, SetStateAction, useState } from 'react';
import { useOnClickOutside } from '../ClickOutsideHook/ClickOutsideHook';
import CustomTooltip from '../CustomTooltip/CustomTooltip';
import CustomSwitch from '../CustomSwitch/CustomSwitch';

function ChartFilter (props: ChartFilterProps) {

    const [isOptionsPanelOpen, setIsOptionsPanelOpen]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);

    const dropdownRef: RefObject<HTMLDivElement> = useOnClickOutside(() => setIsOptionsPanelOpen(false));

    return (
        <div ref={dropdownRef} className="dismissible-container">
            <CustomTooltip title="Chart Options">
                <button type="button" className="icon-btn chart-card-settings"
                    onClick={() => setIsOptionsPanelOpen((prev: boolean) => !prev)}
                >
                    <SettingsIcon/>
                </button>
            </CustomTooltip>

            {
                isOptionsPanelOpen &&
                <div className="dismissible-dropdown chart-filter-dropdown">
                    {
                        Object.keys(props.filters).length ?
                        Object.keys(props.filters).map((key: string, index: number) => (
                            <div key={key} className="chart-filter-option">
                                <div>{props.filters[key as keyof typeof props.filters]?.label}</div>
                                <CustomSwitch
                                    checked={props.filters[key as keyof typeof props.filters]?.isActive}
                                    onChange={(event, checked: boolean) => props.onChange(checked, key)}
                                />
                            </div>
                        ))
                        : <div>No Filters found.</div>
                    }
                </div>
            }

        </div>
    );
}

export default ChartFilter;