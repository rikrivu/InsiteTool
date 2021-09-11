export interface APIHeader {
    headers : { 
        'Content-Type': 'application/json';
        'Accept': 'application/json'
    }
}

export interface APIResponse<T> {
    message: string;
    resultSet: T;
}

export interface APIPayload {
    siteId: number;
    scdmChem: boolean;
    chemical: boolean;
    chemicals: string[];
    location: boolean;
    locations: string[];
    aoi: boolean;
    aois: string[];
    analysisMethod: boolean;
    analysisMethods: string[];
    matrixCode: boolean;
    matrixCodes: string[];

}

export interface TSAPIPayload {
    siteId: number;
    locations: string[];
    chemical: string;
    startDate: string;
    endDate: string;
}

export interface SiteAPI {
    siteId: number;
    siteCode: number;
    wkid: number;
    earliestDate: number;
    bookmark: string;
}

export interface SiteAPIWithShapefileInfo extends SiteAPI {
    hasShapefile: boolean;
}

export interface FilterOptionsAPI {
    [name: string]: string[];
}

export interface FilterAPI {
    filterName: string;
    filterId: number;
    dropdown: FilterAPIDropdown;
}

export interface FilterAPIDropdown {
    dropdownLabel: string;
    options: FilterAPIDropdownOption[];
}

export interface FilterAPIDropdownOption {
    optionId: number;
    display: string;
    value: string;
}

export interface POIDataAPI {
    mergeSrc: string;
    distMi: number;
}

export interface WetlandsDataAPI {
    wetLandTY: string;
    distMi: number;
}

export interface WaterwellsDataAPI {
    ranges: string;
    count: number;
}

export interface DocumentsAPI {
    siteId: number;
    docName: string;
    docUrl: string;
}

export type DoughnutChartDataWithColors<T extends {}> = T & {    // '{}' can be replaced with 'any'
    color: string;
};

export interface MatrixAPI {
    matrixcode: string;
    count: number;
    percentage: number;
}

export interface MethodsAPI {
    analysisMethod: string;
    count: number;
    percentage: number;
}

export interface ChemicalsAPI {
    chemical: string;
    count: number;
    percentage: number;
}

export interface TopChemicalsAPI {
    avgResultPPM: number;
    chemical: string;
}

export interface SoilPlotsAPI {
    maxLevels: number;
    plotData: SoilPlotDataAPI[];
}

export interface SoilPlotDataAPI {
    name: string;
    graphics: SoilPlotLevelsAPI[];
}

export interface SoilPlotChartData {
    maxLevels: number;
    plotData: SoilPlotBarData[];
}

export interface SoilPlotBarData {
    name: string;
    level1: SoilPlotLevelsAPI;
    level2: SoilPlotLevelsAPI;
    level3: SoilPlotLevelsAPI;
    level4: SoilPlotLevelsAPI;
    level5: SoilPlotLevelsAPI;
    level6: SoilPlotLevelsAPI;
    level7?: SoilPlotLevelsAPI;
    level8?: SoilPlotLevelsAPI;
    level9?: SoilPlotLevelsAPI;
    level10?: SoilPlotLevelsAPI;
    level11?: SoilPlotLevelsAPI;
}

export interface SoilPlotLevelsAPI {
    graphic: string;
    value: number;
}

export interface TimeSeriesAPI {
    [name: string]: TimeSeriesDataAPI[];
}

export interface TimeSeriesDataAPI {
    avgRepLimitPPM: number;
    avgResultPPM: number;
    detectFlag: 'Y' | 'N';
    timeStamp: number;
}

export interface SiteSummaryAPI {
    area: number | null;
    noOfLocations: number | null;
    noOfAOI: number | null;
    noOfChemicalsTestedFor: number | null;
    percentDetections: number | null;
}