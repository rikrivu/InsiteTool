import { SiteAPIWithShapefileInfo } from './APIModels';
import { MultiSelection } from './DefaultMultiSelectModels';

export interface FilterConfigModel {
    [name: string]: {
        filterName: string;
        dropdown: boolean;
        dropdownLabel: string;
    }
}

export interface FiltersState {
    [name: string]: {
        filterName: string;
        active: boolean;
        selections?: MultiSelection[];
    };
}

export interface FiltersStateObject {
    siteInfo: SiteAPIWithShapefileInfo;
    refreshAppData: boolean;
    filters: FiltersState;
}

export interface FiltersData {
    filterName: string;
    dropdown?: MultiSelection[];
    dropdownLabel?: string;
}