import { Dispatch, ReactNode, RefObject, SetStateAction, useState } from 'react';
import { useOnClickOutside } from '../ClickOutsideHook/ClickOutsideHook';
import CustomTooltip from '../CustomTooltip/CustomTooltip';

function SpecialComponent(props: {icon: ReactNode, component: ReactNode}) {

    const [isOptionsPanelOpen, setIsOptionsPanelOpen]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);

    const dropdownRef: RefObject<HTMLDivElement> = useOnClickOutside(() => setIsOptionsPanelOpen(false));

    return (
        <div ref={dropdownRef} className="dismissible-container">
            <CustomTooltip title="Chart Options">
                <button type="button" className="icon-btn chart-card-settings"
                    onClick={() => setIsOptionsPanelOpen((prev: boolean) => !prev)}
                >
                    {props.icon}
                </button>
            </CustomTooltip>

            {
                isOptionsPanelOpen &&
                <div className="dismissible-dropdown chart-filter-dropdown">
                    {props.component}
                </div>
            }

        </div>
    )
}

export default SpecialComponent;