import { Dispatch, SetStateAction } from 'react';

export interface ExtentRef {
    xmaxRef: number | null,
    xminRef: number | null,
    ymaxRef: number | null,
    yminRef: number | null
}

export interface WidgetsStateModel {
    baseMapGallery: boolean;
    layersListView: boolean;
    bookmarksView: boolean;
    measurementsView: boolean;
    timeSliderView: boolean;
    featureTableView: boolean;
}

export interface WidgetHeaderBtn {
    icon: string;
    tooltip: string;
    onClick: Function;
}

export interface WidgetHeaderPropsModel {
    title: string;
    valueAccessor: keyof WidgetsStateModel;
    setWidgetsState: Dispatch<SetStateAction<WidgetsStateModel>>;
    buttons?: WidgetHeaderBtn[];
} 

export interface RenderConfigModel {
    [name: string]: ConfigLayerModel;
}

export interface FeatureTableInfo {
    [name: string]: FeatureTableInfoItem;
}

export interface FeatureTableInfoItem {
    layer: any;
}

export interface ConfigLayerModel {
    layerTitle: string;
    initialVisibility: boolean;
    hasFeatureTable: boolean;
    layerType: string;
    referredLayers: RenderConfigModel | null;
    showLabels: boolean;
    color?: string;
    parentLayerName?: keyof RenderConfigModel;
    isReferredLayer?: boolean;
    coloringType?: string;
    colorMap?: {
        [name: string]: string;
    }
    ranges?: PointRadiusRange[];
    colorRange?: PointColorRange[];
    dependantLayer?: string;
    dependantLayerType?: string;
    gradient?: ColorGradient;
}

export interface PointRange {
    min: number | null;
    max: number | null;
}

export interface PointRadiusRange extends PointRange {
    radiusMultiplier: number;
}

export interface PointColorRange extends PointRange {
    color: string;
}

export interface ColorGradient  {
  lowerLimit: number;
  lowerLimitColor: string;
  upperLimit: number;
  upperLimitColor: string;
  base: number;
  baseColor: string;
}

export interface FieldsFieldInfos {
    fields: any[];
    fieldInfos: any[];
}

export interface ShapeFileConfig {
    [name: string]: {
        title: string;
        path: string
    }
}

export interface LayerOptionals {
    labelingInfo?: any[];
    timeInfo?: any;
    timeExtent?: any;
}