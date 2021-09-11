import { Dispatch, memo, RefObject, SetStateAction, useEffect, useMemo, useState } from 'react';
import './DefaultMultiSelect.scss';

// Import 3rd Party Libraries
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import MenuIcon from '@material-ui/icons/Menu';
import ClearIcon from '@material-ui/icons/Clear';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import SettingsIcon from '@material-ui/icons/Settings';

import { MultiSelection, MultiSelectToggleOptions } from '../../../models/DefaultMultiSelectModels';
import { MultiSelectProps } from '../../../models/LayoutCardHeaderModels';

// Import Components
import CustomTooltip from '../CustomTooltip/CustomTooltip';
import { useOnClickOutside } from '../ClickOutsideHook/ClickOutsideHook';

const setSelectionCount = (options: MultiSelection[]): number => {
    // console.log('options', options);
    return options?.length ?
    options.reduce((count: number, opt: MultiSelection) => {
        return opt.selected ? count+= 1 : count;
    }, 0)
    : 0;
}

const MemoizedCheckbox = memo(Checkbox, (prevProps: CheckboxProps, nextProps: CheckboxProps) => {
    return prevProps.checked === nextProps.checked
})

const createOptions = (
    options: MultiSelection[],
    props: MultiSelectProps,
    toggleOptions: MultiSelectToggleOptions,
    numberOfSelections: number
): JSX.Element => {

    // console.log('createOptions');

    let finalOptions: (JSX.Element[] | JSX.Element) =
    options.reduce((result: (JSX.Element[]), opt: MultiSelection, index: number) => {

        const selectedOptionIndex: (number | undefined) = props
        .selectOptions?.findIndex((selection: MultiSelection) => selection.value === opt.value);

        if (selectedOptionIndex !== undefined && selectedOptionIndex >= 0) {

            const currentOptionSelectionStatus: boolean
            = props.selectOptions?.[selectedOptionIndex].selected;

            // console.log('disabled checker', numberOfSelections, props.maxSelection, numberOfSelections >= props.maxSelection! && !currentOptionSelectionStatus);

            const buttonContent: JSX.Element = (
                <>
                    <MemoizedCheckbox
                        checked={currentOptionSelectionStatus}
                        icon={<CheckBoxOutlineBlankIcon className="checkbox-oultine" fontSize="inherit" />}
                        checkedIcon={<CheckBoxIcon className="checkbox-checked" fontSize="inherit" />}
                        color="default"
                        name="checkedI"
                    />
                    <span className="btn-text">{opt.value}</span>
                </>
            )

            const optionJSX: JSX.Element = (
                <CustomTooltip key={index} title={opt.value}>
                    {
                        numberOfSelections >= props.maxSelection! && !currentOptionSelectionStatus ?
                        <div className="multi-dropdown-option option-disabled">
                            {buttonContent}
                        </div>
                        :
                        <button className="multi-dropdown-option"
                            onClick={() => props.handleSelectionChange(
                                !currentOptionSelectionStatus, opt, props.multiSelectID
                            )}
                        >
                            {buttonContent}
                        </button>
                        
                    }
                </CustomTooltip>
            );

            if (toggleOptions.showOnlySelected && currentOptionSelectionStatus) {
                result.push(optionJSX);
            }

            if (toggleOptions.showAll) {
                result.push(optionJSX);
            }
        }
        return result;
    }, []);

    // console.log('TOggleOptions', toggleOptions, numberOfSelections);

    finalOptions = finalOptions.length ? (<>{finalOptions}</>) : (<div className="empty-dropdown">No matches found!</div>);

    return finalOptions;
}

function DefaultMultiSelectUnmemoized (props: MultiSelectProps) {

    const [numberOfSelections, setNumberOfSelections]: [number, Dispatch<SetStateAction<number>>]
    = useState<number>(setSelectionCount(props.selectOptions));

    const [isOptionsPanelOpen, setIsOptionsPanelOpen]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);

    const [searchText, setSearchText]: [string, Dispatch<SetStateAction<string>>] = useState<string>('');

    const [optionsBasedOnActiveSelections, setOptionsBasedOnActiveSelections]
    : [MultiSelection[], Dispatch<SetStateAction<MultiSelection[]>>] = useState<MultiSelection[]>(props.selectOptions!);

    const [toggleOptions, setToggleOptions]: [MultiSelectToggleOptions, Dispatch<SetStateAction<MultiSelectToggleOptions>>]
    = useState<MultiSelectToggleOptions>({
        showAll: true,
        showOnlySelected: false
    });

    const dropdownRef: RefObject<HTMLDivElement> = useOnClickOutside(() => setIsOptionsPanelOpen(false));

    // console.log('Props.filtersState', props.selectOptions, props.multiSelectID);

    useEffect(() => {
        // console.log('Filterstate from Mulitiselect', props.multiSelectID, props.selectOptions);
        setNumberOfSelections(setSelectionCount(props.selectOptions!));
    }, [props.selectOptions]);

    useEffect(() => {
        const debouncedSearch: NodeJS.Timeout = setTimeout(() => {
            // console.log('SearchText', searchText);
            if (searchText?.length) {
                const updatedFilterOptions: MultiSelection[] = props.selectOptions!
                .filter((opt: MultiSelection) => opt.value.toLowerCase().includes(searchText.toLowerCase()));
                setOptionsBasedOnActiveSelections(updatedFilterOptions);
            } else {
                setOptionsBasedOnActiveSelections(props.selectOptions!);
            }
        }, 500);
        return () => clearTimeout(debouncedSearch);
    }, [props.selectOptions, searchText]);
    
    const optionsToShow: JSX.Element = useMemo<JSX.Element>(() =>
        createOptions(optionsBasedOnActiveSelections, props, toggleOptions, numberOfSelections),
        [numberOfSelections, optionsBasedOnActiveSelections, props, toggleOptions]
    )
    
    return (
        <div id={props.multiSelectID} ref={dropdownRef} className="multiselect-container">
            {
                props.showSelections ?
                <button type="button" className="multiselect-btn"
                    onClick={() => setIsOptionsPanelOpen((prev: boolean) => (!prev))}
                >
                    <div>{numberOfSelections} selected</div>
                    <ArrowDropDownIcon/>
                </button>
                :
                <CustomTooltip title={props.title ? props.title : 'Settings'}>
                    <button type="button" className="icon-btn chart-card-settings"
                        onClick={() => setIsOptionsPanelOpen((prev: boolean) => (!prev))}
                    >
                        {props.icon ? props.icon : <SettingsIcon/>}
                    </button>
                </CustomTooltip>
            }
            {
                isOptionsPanelOpen &&
                <div className={`multi-dropdown-wrapper${props.showSelections ? ' count-enabled' : ' adjust-position'}`}>
                    <input
                        type="text"
                        className="multi-dropdown-search"
                        placeholder="Search"
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                    />

                    {
                        searchText?.length ?
                        <CustomTooltip title="Clear">
                            <button type="button" className="icon-btn multi-dropdown-clear" onClick={() => setSearchText('')}>
                                <ClearIcon/>
                            </button>
                        </CustomTooltip>
                        : null
                    }

                    <div className={`multi-options-container app-scroll${props.showSelections ? ' default-height' : ' adjust-height'}`}>
                        {optionsToShow}
                    </div>

                    <div className="multi-dropdown-footer">
                        <div>
                            <CustomTooltip title="Show All">
                                <button type="button"
                                    className={`multi-filter-btn ${toggleOptions.showAll ? 'active-filter-btn' : ''}`}
                                    onClick={() => setToggleOptions({
                                        showAll: true,
                                        showOnlySelected: false
                                    })}
                                >
                                    <MenuIcon/>
                                </button>
                            </CustomTooltip>
                            <CustomTooltip title="Show Selected Only">
                                <button type="button"
                                    className={`multi-filter-btn ${toggleOptions.showOnlySelected ? 'active-filter-btn' : ''}`}
                                    onClick={() => setToggleOptions({
                                        showAll: false,
                                        showOnlySelected: true
                                    })}
                                >
                                    <PlaylistAddCheckIcon/>
                                </button>
                            </CustomTooltip>
                        </div>
                        <CustomTooltip title="Uncheck All">
                            <button type="button" className="multi-filter-btn"
                                onClick={() => props.removeAllSelections(props.multiSelectID)}
                            >
                                <DeleteForeverIcon/>
                            </button>
                        </CustomTooltip>
                    </div>
                </div>
            }

        </div>
    );
}
const DefaultMultiSelect = memo(DefaultMultiSelectUnmemoized);

export default DefaultMultiSelect;