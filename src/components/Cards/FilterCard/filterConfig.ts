import { FilterConfigModel } from '../../../models/FilterCardModels';

// Config to determine how many filters to be shown in FilterCard
// Modify this to add or remove any filter
export const filterConfig: FilterConfigModel = {
    SCDMChem: {
        filterName: 'SCDMChem',
        dropdown: false,
        dropdownLabel: ''
    },
    chemicals: {
        filterName: 'Chem',
        dropdown: true,
        dropdownLabel: 'Chemical(s)'
    },
    locSort: {
        filterName: 'Loc',
        dropdown: true,
        dropdownLabel: 'LocSort(s)'
    },
    aoi: {
        filterName: 'AOI',
        dropdown: true,
        dropdownLabel: 'Area(s) of Interest'
    },
    matrixCode: {
        filterName: 'Matrix Code',
        dropdown: true,
        dropdownLabel: 'Matrix Code(s)'
    },
    analysisMethod: {
        filterName: 'Analysis Method',
        dropdown: true,
        dropdownLabel: 'Analysis Method(s'
    }
};