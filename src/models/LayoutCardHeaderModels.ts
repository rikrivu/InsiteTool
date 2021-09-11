import { MultiSelection } from './DefaultMultiSelectModels';

export interface MultiSelectProps {
    showSelections: boolean;
    multiSelectID: string;
    selectOptions: MultiSelection[];
    handleSelectionChange(
        checked: boolean, opt: MultiSelection, multiSelectID: string
    ): void;
    removeAllSelections(multiSelectID: string): void;
    maxSelection?: number;
    icon?: JSX.Element;
    title?: string;
}

export interface ChartFilterState {
    isActive: boolean;
    label: string;
}

export interface ChartFilterProps {
    onChange: Function;
    filters: {
        dataLabels?: ChartFilterState;
        horzAxis?: ChartFilterState;
        vertAxis?: ChartFilterState;
    }
}