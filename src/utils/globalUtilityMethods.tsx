import { Dispatch, SetStateAction } from 'react';
import { FILE_TYPES, TS_DATE_RANGE_FALBACK_YEARS } from '../app-config';
import { LayoutConfigComponentTab } from '../models/AppDashboardModels';
import { SelectedTabEmitter } from '../models/EventEmitterModels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFlask, faLocationArrow, faMapMarkerAlt,
    faVial, faCode, faInfo, faFlag, faCalendarAlt,
    faFile, faUpload, faTrashAlt, faSave, faSignOutAlt,
    faWater, faSortAmountDown
} from '@fortawesome/free-solid-svg-icons';
import SettingsIcon from '@material-ui/icons/Settings';
import TimelineIcon from '@material-ui/icons/Timeline';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import AppsIcon from '@material-ui/icons/Apps';
import HomeIcon from '@material-ui/icons/Home';
import LayersIcon from '@material-ui/icons/Layers';
import HeightIcon from '@material-ui/icons/Height';
import HistoryIcon from '@material-ui/icons/History';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import pdfLogo from '../assets/icons/pdf.png';
import { format, startOfToday, subYears } from 'date-fns';
import { scaleTime } from 'd3-scale';
import { DateRangeSliderPropsCreate } from '../components/shared/DateRangeSlider/DateRangeSliderModels';
import { ChartFilterProps } from '../models/LayoutCardHeaderModels';
import { GlobalStoreAction, GlobalStoreActions, GlobalStoreState } from '../stores/GlobalStore/GlobalStore';
import { NotifierModel } from '../components/shared/NotifierPopIn/NotifierModels';

const iconDictionary: {[name: string]: JSX.Element} = {
    'Chem': <FontAwesomeIcon icon={faFlask}/>,
    'Loc': <FontAwesomeIcon icon={faLocationArrow}/>,
    'soilPlots': <FontAwesomeIcon icon={faLocationArrow}/>,
    'AOI': <FontAwesomeIcon icon={faMapMarkerAlt}/>,
    'SCDMChem': <FontAwesomeIcon icon={faVial}/>,
    'Matrix Code': <FontAwesomeIcon icon={faCode}/>,
    'Analysis Method': <TimelineIcon/>,
    'info': <FontAwesomeIcon icon={faInfo}/>,
    'flag': <FontAwesomeIcon icon={faFlag}/>,
    'date': <FontAwesomeIcon icon={faCalendarAlt}/>,
    'pdf': <img src={pdfLogo} alt="pdf.png" />,
    'file': <FontAwesomeIcon icon={faFile}/>,
    'upload': <FontAwesomeIcon icon={faUpload}/>,
    'remove': <FontAwesomeIcon icon={faTrashAlt}/>,
    'save': <FontAwesomeIcon icon={faSave}/>,
    'bookmark': <BookmarkIcon/>,
    'basemapGallery': <AppsIcon/>,
    'viewExtent': <HomeIcon/>,
    'layers': <LayersIcon/>,
    'measurements': <HeightIcon/>,
    'timeSlider': <HistoryIcon/>,
    'visibilityOn': <VisibilityIcon/>,
    'visibilityOff': <VisibilityOffIcon/>,
    'arrowDropUp': <ArrowDropUpIcon/>,
    'arrowDropDown': <ArrowDropDownIcon/>,
    'signout': <FontAwesomeIcon icon={faSignOutAlt}/>,
    'water': <FontAwesomeIcon icon={faWater}/>,
    'drilldown': <FontAwesomeIcon icon={faSortAmountDown}/>
}

export const getIcon = (icon: string): JSX.Element => {
    return iconDictionary[icon] ? iconDictionary[icon] : <SettingsIcon/>;
}

export const formatTick = (ms: string | number | Date): string => {
  return format(new Date(ms), "MMM yyyy");
}

export const checkFileType = (fileName: string): string => {

    let matchedExtension: string | undefined;

    for (const extension of FILE_TYPES) {
        if (fileName.includes(extension)) {
            matchedExtension = extension;
            break;
        }
    }

    if (matchedExtension) {
        switch (matchedExtension) {
            case '.pdf': {
                return 'pdf';
            }
            case '.xl': case '.xls': case '.xlsx': {
                return 'excel';
            }
            case '.doc': case '.docx': {
                return 'doc';
            }
            default: {
                return 'file';
            }
        }
    } else {
        return 'file';
    }
}

export const createSelectedTabInfo = (tab: LayoutConfigComponentTab, component: string): SelectedTabEmitter => {

    const selectedTabInfo: SelectedTabEmitter = {
        ...tab,
        component: component
    };
    return selectedTabInfo;
}

export const createLayoutCardTabs = (
    tabs: LayoutConfigComponentTab[],
    noOfTabs: number,
    currentTab: LayoutConfigComponentTab,
    selectTab: (tab: LayoutConfigComponentTab) => void,
    setIsOptionsPanelOpen: Dispatch<SetStateAction<boolean>>
): [LayoutConfigComponentTab[], JSX.Element[]] => {
    if (tabs.length > 3) {
        const newTabs: LayoutConfigComponentTab[] = tabs.splice(0, noOfTabs);
        return [
            [...newTabs],
            [
                ...tabs.map((tab: LayoutConfigComponentTab, index: number) => (
                    <button key={index}
                        className={`tab-dropdown-btn${currentTab.truncatedName === tab.truncatedName ? ' tab-dropdown-btn-active' : ''}`}
                        onClick={() => {
                            selectTab(tab);
                            setIsOptionsPanelOpen(false)
                        }}
                    >
                        {tab.truncatedName}
                    </button>
                ))
            ]
        ]
    } else {
        return [[...tabs], []];
    }
}

export const random_rgba = (): string => {
    const o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + 0.6 + ')';
}

export const to2DecimalPlacesPipe = (input: string | number | null, conversionType: 'number' | 'percent'): string => {
    // console.log('pipe', input, conversionType);
    let output: (number | null) = typeof input === 'string' ? parseFloat(input) : input;

    // output = Math.round(((output / 100) + Number.EPSILON) * 100);

    if (output === null) {
        return '-';
    } else {
        switch(conversionType) {
            case 'number': {
                return output.toLocaleString(undefined, {maximumFractionDigits: checkFraction(output)})
            }
            case 'percent': {
                return output.toLocaleString(undefined, {maximumFractionDigits: checkFraction(output)}) + '%';
            }
        }
    }
}

const checkFraction = (input: number): (undefined | 1 | 2) => {
    return !(input % 1) ? undefined : (!((input * 10) % 1) ? 1 : 2);
}

export const createDateRangeSliderProps = (
    startDate: number | undefined,
    stepType: 'day' | 'month' | 'year',
    maxTicks: number,
): DateRangeSliderPropsCreate => {

    const today: Date = startOfToday();
    const domainStart: Date = startDate ? new Date(startDate) : subYears(today, TS_DATE_RANGE_FALBACK_YEARS);

    const step: number = ((): number => {
        switch (stepType) {
            case 'day': {
                return 1000 * 60 * 60 * 24;
            }
            case 'month': {
                return 1000 * 60 * 60 * 24 * 30;
            }
            case 'year': {
                return 1000 * 60 * 60 * 24 * 365 ;
            }
            default: {
                return 1000 * 60 * 60 * 24 * 30;
            }
        }
    })()

    const dateTicks: number[] = scaleTime()
    .domain([domainStart, today])
    .ticks(maxTicks ? maxTicks : 8)
    .map((d: Date) => + d);

    return {today, domainStart, step, dateTicks};
}

export const createInitChartFilterState = (filters: string[]): ChartFilterProps['filters'] => {
    return filters.reduce((state: ChartFilterProps['filters'], filter: string) => {
        switch(filter) {
            case 'Data Labels': {
                state.dataLabels = {
                    label: filter,
                    isActive: true
                }
                break;
            }
            case 'Horizontal Axis': {
                state.horzAxis = {
                    label: filter,
                    isActive: true
                }
                break;
            }
            case 'Vertical Axis': {
                state.vertAxis = {
                    label: filter,
                    isActive: true
                }
                break;
            }
        }
        return state;
    }, {})
}

export const notify = (
    dispatch: Dispatch<GlobalStoreActions | ((prev: GlobalStoreState) => GlobalStoreActions)>,
    notification: NotifierModel, dataToUpdate?: GlobalStoreAction[]
): void => {

    dispatch((prev: GlobalStoreState) => ({
        ...prev,
        actions: [
            {
                type: 'notification',
                data: notification
            },
            ...(dataToUpdate ?? [])
        ]
    }))

    setTimeout(() => {
        dispatch((prev: GlobalStoreState) => ({
            ...prev,
            actions: [
                {
                    type: 'notification',
                    data: {
                        ...notification,
                        show: 'end'
                    }
                }
            ]
        }))
    }, 3000)
}

const convertToCSV = (objArray: any[] | string): string => {

    const array: any = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str: string = '';

    for (let i = 0; i < array.length; i++) {

        let line: string = '';
        
        for (var index in array[i]) {
            if (line !== '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}

export const exportCSVFile = (items: any[], fileTitle: string, hasHeaders: boolean): void => {

    // if (hasHeaders) {
    //     items.unshift(createCSVHeader(items[0]));
    // }

    // Convert Object to JSON

    const csv: string = convertToCSV(JSON.stringify(items));

    const exportedFilenmae = fileTitle + '.csv' || 'export.csv';

    const blob: Blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        const link: HTMLAnchorElement = document.createElement("a");

        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            const url: string = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = 'hidden';
            // const element: HTMLDivElement = document.getElementById('download-link') as HTMLDivElement;
            document.body.appendChild(link);
            // element.appendChild(link);
            link.click();
            document.body.removeChild(link);
            // element.removeChild(link);
        }
    }
}

export const createCSVHeader = (object: any): any => {
    return Object.keys(object).reduce((header: any, key: string) => {
        header[key] = key;
        return header;
    }, {})
}

export const thumbnailKeyRemoved = (bookmarks: any[]) => {
    return bookmarks.map(bookmark => {
        const modifiedBookmark = bookmark.toJSON();
        delete modifiedBookmark.thumbnail;
        return modifiedBookmark;
    });
}