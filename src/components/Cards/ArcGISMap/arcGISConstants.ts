import {
  ExtentRef, RenderConfigModel, WidgetsStateModel
  // ShapeFileConfig
} from "./ArcGISModels";

export const defaultWidgetsState: WidgetsStateModel = {
  baseMapGallery: false,
  layersListView: false,
  bookmarksView: false,
  measurementsView: false,
  timeSliderView: false,
  featureTableView: false
};

export const initialExtentRef: ExtentRef = {
  xmaxRef: null,
  xminRef: null,
  ymaxRef: null,
  yminRef: null
}

export const locationMarker = {
  type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
  style: "circle",
  color: "#ffebaf",
  size: "8px",  // pixels
  outline: {  // autocasts as new SimpleLineSymbol()
    color: [0, 0, 0, 1],
    width: 1  // points
  }
};

export const defaultMapPointRadius = 8;
    
export const extentPolygonMarker = {
  type: "simple-fill",
  style: 'none',
  outline: {
    color: '#B23A1A',
    width: 1
  }
};

export const aoiPolygonMarker = {
  type: "simple-fill",
  outline: {
    color: '#818181',
    width: 1
  }
}

export const defaultPopupTemplatePolygon = {
  title: 'AOI',
  content: [{
    type: "fields",
    fieldInfos: [
      {
        fieldName: 'aoi',
        label: 'AOI',
        visible: true,
      },
      {
        fieldName: 'maxWidth',
        label: 'Max Width',
        visible: true,
      },
      {
        fieldName: 'maxLength',
        label: 'Max Length',
        visible: true,
      }
    ]
  }],
}

export const defaultPolygonFields: {name: string, type: string}[] = [
  {
    name: 'aoi',
    type: 'string'
  },
  {
    name: 'maxWidth',
    type: 'string'
  },
  {
    name: 'maxLength',
    type: 'string'
  }
]

export const esriModules: string [] = [
  "esri/config",
  "esri/views/MapView",
  "esri/WebMap",
  "esri/widgets/BasemapGallery",
  "esri/widgets/LayerList",
  "esri/geometry/SpatialReference",
  "esri/layers/GraphicsLayer",
  "esri/geometry/Point",
  "esri/Graphic",
  "esri/geometry/Extent",
  "esri/geometry/Polygon",
  "esri/geometry/projection",
  "esri/layers/FeatureLayer",
  "esri/widgets/Bookmarks",
  "esri/widgets/DistanceMeasurement2D",
  "esri/widgets/AreaMeasurement2D",
  "esri/widgets/TimeSlider",
  "esri/layers/support/Field",
  "esri/widgets/FeatureTable",
  "esri/request"
];

// export const shapeFileConfigs: ShapeFileConfig = {
//   waterwells: {
//     title: 'Waterwells',
//     path: './Waterwells.zip'
//   }
// }

export const mapRenderConfig: RenderConfigModel = {
  locationSummary: {
    layerTitle: "Location Summary",
    initialVisibility: true,
    hasFeatureTable: true,
    layerType: 'default',
    color: '#ffebaf',
    showLabels: true,
    referredLayers: {
      locType: {
        layerTitle: "Location Types",
        initialVisibility: false,
        hasFeatureTable: false,
        showLabels: false,
        isReferredLayer: true,
        parentLayerName: 'locationSummary',
        referredLayers: null,
        layerType: 'point-color',
        coloringType: 'colorMap',
        colorMap: {
          'Groundwater Well': '#e6beb9',
          'Soil Boring': '#a4e6ad',
        }
      },
      yrsSinceLatestSample: {
        layerTitle: "Yrs_Since_Latest_Sample",
        initialVisibility: false,
        hasFeatureTable: false,
        showLabels: false,
        isReferredLayer: true,
        parentLayerName: 'locationSummary',
        referredLayers: null,
        layerType: 'point-radius',
        color: '#0000dc',
        ranges: [
          {min: null, max: 0.709589, radiusMultiplier: 0.5},
          {min: 0.709589, max: 2.438356, radiusMultiplier: 1},
          {min: 2.438356, max: 5.246575, radiusMultiplier: 1.5},
          {min: 5.246575, max: 6.473973, radiusMultiplier: 2},
          {min: 6.473973, max: 8.093151, radiusMultiplier: 2.5}
        ]
      },
      timesSampled: {
        layerTitle: "Times_Sampled",
        initialVisibility: false,
        hasFeatureTable: false,
        showLabels: false,
        isReferredLayer: true,
        parentLayerName: 'locationSummary',
        referredLayers: null,
        layerType: 'point-radius',
        color: '#00c800',
        ranges: [
          {min: null, max: 1, radiusMultiplier: 0.5},
          {min: 1, max: 2, radiusMultiplier: 1},
          {min: 2, max: 3, radiusMultiplier: 1.5},
          {min: 3, max: 4, radiusMultiplier: 2},
          {min: 4, max: 6, radiusMultiplier: 2.5}
        ]
      },
      noOfMatrixcodes: {
        layerTitle: "No of Matrix Codes",
        initialVisibility: false,
        hasFeatureTable: false,
        showLabels: false,
        isReferredLayer: true,
        parentLayerName: 'locationSummary',
        referredLayers: null,
        layerType: 'point-radius',
        color: '#e1fa00',
        ranges: [
          {min: null, max: 1, radiusMultiplier: 1},
          {min: 1, max: 2, radiusMultiplier: 2},
          {min: 2, max: 3, radiusMultiplier: 4}
        ]
      },
      soilPercentCL: {
        layerTitle: "Soil Percent CL",
        initialVisibility: false,
        hasFeatureTable: false,
        showLabels: false,
        isReferredLayer: true,
        parentLayerName: 'locationSummary',
        referredLayers: null,
        layerType: 'point-color',
        coloringType: 'colorRange',
        colorRange: [
          {min: null, max: 0.066667, color: '#fff5eb'},
          {min: 0.066667, max: 0.500000, color: '#fdd0a2'},
          {min: 0.500000, max: 0.666667, color: '#fd8d3c'},
          {min: 0.666667, max: 0.866667, color: '#d94801'},
          {min: 0.866667, max: 0.950000, color: '#7f2704'}
        ]
      },
      soilPercentLIMESTONE: {
        layerTitle: "Soil Percent LIMESTONE",
        initialVisibility: false,
        hasFeatureTable: false,
        showLabels: false,
        isReferredLayer: true,
        parentLayerName: 'locationSummary',
        referredLayers: null,
        layerType: 'point-color',
        coloringType: 'colorRange',
        colorRange: [
          {min: null, max: 0, color: '#fff5eb'},
          {min: 0, max: 0.025000, color: '#fd8d3c'},
          {min: 0.025000, max: 0.050000, color: '#7f2704'}
        ]
      },
      maxSampleDepth: {
        layerTitle: "Max Sample Depth",
        initialVisibility: false,
        hasFeatureTable: false,
        showLabels: false,
        isReferredLayer: true,
        parentLayerName: 'locationSummary',
        referredLayers: null,
        layerType: 'point-color',
        coloringType: 'colorRange',
        colorRange: [
          {min: null, max: 6, color: '#fff5eb'},
          {min: 6, max: 11, color: '#fdd0a2'},
          {min: 11, max: 16, color: '#fd8d3c'},
          {min: 16, max: 23, color: '#d94801'},
          {min: 23, max: 30, color: '#7f2704'}
        ]
      },
      soilMaxDepth: {
        layerTitle: "Soil Max Depth",
        initialVisibility: false,
        hasFeatureTable: false,
        showLabels: false,
        isReferredLayer: true,
        parentLayerName: 'locationSummary',
        referredLayers: null,
        layerType: 'point-radius',
        dependantLayer: 'soilPercentCL',
        dependantLayerType: 'point-gradient',
        ranges: [
          {min: null, max: 10, radiusMultiplier: 0.5},
          {min: 10, max: 13, radiusMultiplier: 2},
          {min: 13, max: 16, radiusMultiplier: 3.5},
          {min: 16, max: 20, radiusMultiplier: 5},
          {min: 20, max: 23, radiusMultiplier: 6}
        ],
        gradient: {
          lowerLimit: 0.95,
          lowerLimitColor: '#804238',
          upperLimit: 0.25,
          upperLimitColor: '#ffc3ad',
          base: 0.6,
          baseColor: '#eb5244'
        }
      }
    }
  },
  drillDownSummary: {
    layerTitle: "Drilldown Summary",
    initialVisibility: false,
    hasFeatureTable: true,
    showLabels: false,
    layerType: 'default',
    color: '#91445c',
    referredLayers: null
  },
  aoi: {
    layerTitle: "Areas of Interest",
    initialVisibility: false,
    hasFeatureTable: true,
    showLabels: true,
    isReferredLayer: true,
    parentLayerName: 'locationSummary',
    referredLayers: null,
    layerType: 'polygon'
  },
  soilSummary: {
    layerTitle: "Soil Summary",
    initialVisibility: false,
    hasFeatureTable: true,
    showLabels: true,
    layerType: 'default',
    color: '#800d05',
    referredLayers: null
  },
  waterwells: {
    layerTitle: "Waterwells",
    initialVisibility: false,
    hasFeatureTable: true,
    showLabels: true,
    layerType: 'default',
    color: '#ff8d01',
    referredLayers: null
  }
}