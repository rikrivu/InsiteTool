import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { OUTPUT_WKID } from '../../../app-config';
import { random_rgba } from '../../../utils/globalUtilityMethods';
import {
  defaultMapPointRadius, mapRenderConfig,
  locationMarker, aoiPolygonMarker,
  // shapeFileConfigs
} from './arcGISConstants';
import { ConfigLayerModel,ExtentRef, FeatureTableInfo, FieldsFieldInfos, LayerOptionals, PointColorRange, PointRadiusRange, RenderConfigModel } from './ArcGISModels';
import CustomTooltip from '../../shared/CustomTooltip/CustomTooltip';

export type GeometryType = "polygon" | "polyline" | "point" | "multipoint" | "multipatch" | "mesh" | undefined;

export const generateLayer = (
  FeatureLayer: any,
  id: string, title: string, visible: boolean, objectIdField: string, fields: any[], source: any[],
  geometryType: string, popupTemplate: any, spatialReference: any, renderer: any, optionals?: any
): typeof FeatureLayer => {
  const newLayer = new FeatureLayer({
    id: id,
    title: title,
    visible: visible,
    objectIdField: objectIdField,
    fields: fields,
    source: source,
    geometryType: geometryType,
    popupTemplate: popupTemplate,
    spatialReference: spatialReference,
    renderer: renderer
  });

  if (optionals) {
    Object.keys(optionals).forEach((key: string) => {
      newLayer[key as keyof LayerOptionals] = optionals[key as keyof LayerOptionals];
    })
  }

  // console.log("NewLayer", newLayer, optionals ? {...newLayer, ...optionals} : newLayer);

  return newLayer;
}

export const createMapPointsForAllLayers = (
  arcGISModules: any,
  pointInfo: any,
  inputSpatialReference: any, outputSpatialReference: any,
  extentRef: MutableRefObject<ExtentRef> | null
): (typeof arcGISModules.Graphic | null) => {

  if (pointInfo.xcoord && pointInfo.ycoord) {

    // console.log('point', Point);
    
    // create a point from a geoJSON point and set its spatialReference to WGS84
    // const point = new Point([pointInfo.xcoord, pointInfo.ycoord], inputSpatialReference);
    const point = new arcGISModules.Point({
      x: pointInfo.xcoord,
      y: pointInfo.ycoord,
      spatialReference: inputSpatialReference
    });
  
    // project the point from WGS84 to winkel III projection
    const projectedPoint = arcGISModules.projection.project(point, outputSpatialReference);
    // console.log('projectedPoint', point, projectedPoint);
  
    if (extentRef) {
      if (!extentRef.current.xmaxRef && !extentRef.current.xminRef && !extentRef.current.ymaxRef && !extentRef.current.yminRef) {
        extentRef.current.xmaxRef = projectedPoint.latitude;
        extentRef.current.xminRef = projectedPoint.latitude;
        extentRef.current.ymaxRef = projectedPoint.longitude;
        extentRef.current.yminRef = projectedPoint.longitude;
      } else {
        extentRef.current.xmaxRef = Math.max(extentRef.current.xmaxRef as number, projectedPoint.latitude);
        extentRef.current.xminRef = Math.min(extentRef.current.xminRef as number, projectedPoint.latitude);
        extentRef.current.ymaxRef = Math.max(extentRef.current.ymaxRef as number, projectedPoint.longitude);
        extentRef.current.yminRef = Math.min(extentRef.current.yminRef as number, projectedPoint.longitude);
      }
    }
    // console.log('projectedPoint', point, projectedPoint, extentRef?.current)
    // console.log('Input Layers', graphicsLayers, parentLayerName);

    const defaultPointGraphic: typeof arcGISModules.Graphic = new arcGISModules.Graphic({
      geometry: projectedPoint,
      attributes: pointInfo
    })
    return defaultPointGraphic;
  } else {
    return null;
  }
}

export const createBasicRenderer = (title: string, isTransparent: boolean, color?: string, size?: number): any => {
  const renderer: any = {
    type: 'simple',
    label: title,
    symbol: {
      type: 'simple-marker',  // autocasts as new SimpleMarkerSymbol()
      style: 'circle',
    }
  }

  if (isTransparent) {
    renderer.symbol = {
      ...renderer.symbol,
      color: [0, 0, 0, 0],
      size: '4px',  // pixels
      outline: {  // autocasts as new SimpleLineSymbol()
        width: 0  // points
      }
    }
  } else {
    renderer.symbol = {
      ...renderer.symbol,
      color: color,
      size: size ? size + 'px' : '8px',
      outline: {  // autocasts as new SimpleLineSymbol()
        color: [0, 0, 0, 1],
        width: 1  // points
      }
    }
  }

  return renderer;
}

export const createRenderer = (referredLayer: string, parentLayer: string): any => {

  const config: ConfigLayerModel = mapRenderConfig[parentLayer]?.referredLayers?.[referredLayer] as ConfigLayerModel;
  
  let renderer: any = {
    field: referredLayer,
    label: config.layerTitle
  }

  const defaultRenderer: any = {
    type: "simple",
    label: referredLayer,
    symbol: locationMarker
  };

  const defaultSymbol = {
    ...locationMarker,
    color: '#ffffff'
  }

  if (config) {
    switch (config.layerType) {
      case 'point-color': {
        switch (config.coloringType) {
          case 'colorMap': {
            renderer = {
              ...renderer,
              type: 'unique-value',
              defaultSymbol: defaultSymbol,
              defaultLabel: 'Others',
              uniqueValueInfos: Object.keys(config.colorMap!).map((key: string) => ({
                  value: key, // code for interstates/freeways
                  symbol: {
                    ...locationMarker,
                    color: config.colorMap?.[key]
                  },
                  label: key // used in the legend to describe features with this symbol
              }))
            };
            break;
          }
          case 'colorRange': {
            renderer = {
              ...renderer,
              type: 'class-breaks',
              defaultSymbol: defaultSymbol,
              defaultLabel: 'No Data',
              classBreakInfos: config.colorRange!.map((range: PointColorRange) => ({
                  minValue: range.min,
                  maxValue: range.max,
                  symbol: {
                    ...locationMarker,
                    color: range.color
                  },
                  label: `<= ${range.max}`
              }))
            };
            break;
          }
          default: {
            renderer = defaultRenderer;
            break;
          }
        }
        break;
      }
      case 'point-radius': {
        renderer = {
          ...renderer,
          type: 'class-breaks',
          defaultSymbol: defaultSymbol,
          defaultLabel: 'No Data',
          classBreakInfos: config.ranges?.map((range: PointRadiusRange) => ({
            minValue: range.min,
            maxValue: range.max,
            symbol: {
              ...locationMarker,
              color: config.color ? config.color : '#ffffff',
              size: `${defaultMapPointRadius * range.radiusMultiplier}px`
            },
            label: `<= ${range.max}`
          }))
        }
        if (config.dependantLayer && config.dependantLayerType === 'point-gradient') {
          renderer.visualVariables = [{
            type: 'color',
            field: config.dependantLayer,
            stops: [
              {
                value: config.gradient?.lowerLimit, // features where < 10% of the pop in poverty
                color: config.gradient?.lowerLimitColor, // will be assigned this color (beige)
                label:  `< ${config.gradient?.lowerLimit}`// label to display in the legend
              },
              {
                value: config.gradient?.base, // features where < 10% of the pop in poverty
                color: config.gradient?.baseColor, // will be assigned this color (beige)
                label:  `${config.gradient?.base}`// label to display in the legend
              },
              {
                value: config.gradient?.upperLimit, // features where < 10% of the pop in poverty
                color: config.gradient?.upperLimitColor, // will be assigned this color (beige)
                label: `< ${config.gradient?.upperLimit}` // label to display in the legend
              }
            ]
          }]
        }
        break;
      }
      default: {
        renderer = defaultRenderer;
        break;
      }
    }
    return renderer;
  }
}

export const createPolygonRenderer = (layer: string, isTransparent: boolean, uniqueValues?: any[]): any => {

  const config: ConfigLayerModel = mapRenderConfig[layer] as ConfigLayerModel;
  
  let renderer: any = {
    field: layer,
    label: config.layerTitle
  }

  if (isTransparent) {
    renderer = {
      ...renderer,
      type: 'simple',
      symbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0],
        outline: {
          width: 0
        }
      }
    }
  } else {
    renderer = {
      ...renderer,
      type: 'unique-value',
      // defaultSymbol: {
      //   ...aoiPolygonMarker,
      //   style: 'none'
      // },
      // defaultLabel: 'No AOIs',
      uniqueValueInfos: uniqueValues?.reduce((result: any[], val: any) => {
        if (val.aoi !== 'No AOI') {
          result.push({
            value: val.aoi,
            symbol: {
              ...aoiPolygonMarker,
              color: random_rgba()
            }
          })
        }
        return result;
      }, [])
    }
  }

  // console.log('Renderer', renderer);
  return renderer;

}

export const createLabelClass = (featureName: string, fontSize?: number): any => {
  return {
    // autocasts as new LabelClass()
    symbol: {
      type: "text",  // autocasts as new TextSymbol()
      color: "#1a1a1a", // black
      font: {  // autocast as new Font()
        size: fontSize ? fontSize : 8,
      }
    },
    // labelPlacement: "above-center",
    labelPlacement: "center-center",
    labelExpressionInfo: {
      expression: "$feature." + featureName
    }
  };
}

export const createElementForWidget = (elementId: string): HTMLDivElement => {
  const widgetparentNode: (HTMLElement | null) = document.getElementById(elementId);
  const newWidgetNode: HTMLDivElement = document.createElement("div");
  widgetparentNode?.appendChild(newWidgetNode);
  return newWidgetNode;
}

export const destroyWidgets = (widgetRefs: MutableRefObject<any>[]): void => {
  widgetRefs.forEach((widgetRef: MutableRefObject<any>) => {
    if (widgetRef.current) {
      widgetRef.current.destroy();
    }
  });
}


export const createFieldsFieldInfos
= (dataToWork: any[], key: keyof RenderConfigModel | null, forShapeFile: boolean, Field?: any): FieldsFieldInfos => {

  const intitializer: FieldsFieldInfos = {
    fields: [],
    fieldInfos: []
  }

  return dataToWork.reduce((result: FieldsFieldInfos, item: any) => {

    if (forShapeFile && Field) {

      result.fields.push(Field.fromJSON(item));

      result.fieldInfos.push({
        fieldName: item.name,
        label: item.name,
        visible: true,
      });
    }

    if (!forShapeFile) {

      result.fields.push({
        name: item,
        type: 'string'
      });

      result.fieldInfos.push({
        fieldName: item,
        label: item,
        visible: true,
      })
    }

    return result;
  }, intitializer)
}

export const createSpatialReferences = (arcGISModules: any, wkid: number): {input: any, output: any} => {
  return {
    input: new arcGISModules.SpatialReference({
      wkid: wkid
    }),
    output: new arcGISModules.SpatialReference({
      wkid: OUTPUT_WKID
    })
  };
}

export const createFeatureTableTabBtns =
(
  currentFTableTab: keyof RenderConfigModel,
  setCurrentFTableTab: Dispatch<SetStateAction<keyof RenderConfigModel>>,
  featureTableInfo: FeatureTableInfo
): JSX.Element => {
  
  const btns: JSX.Element = <>
    {
      Object.keys(featureTableInfo)
      .reduce((result: JSX.Element[], key: keyof FeatureTableInfo, index) => {
    
        if (
          mapRenderConfig[key]?.hasFeatureTable
          // || shapeFileConfigs[key]
          ) {

          const title: string = mapRenderConfig[key] ?
          mapRenderConfig[key].layerTitle
          // : shapeFileConfigs[key].title;
          : 'unknown'

          result.push((
            <CustomTooltip key={index} title={title}>
              <span>
                <button type="button"
                  className={`tab-btn ${currentFTableTab === key ? ' tab-active-btn' : ''}`}
                  onClick={() => setCurrentFTableTab((prev: keyof RenderConfigModel) => prev !== key ? key : prev)}
                >
                  {title}
                </button>
              </span>
            </CustomTooltip>
          ));
        }
    
        return result;
      }, [])
    }
  </>

  return btns;
}

const clearMeasurement = (measurment: MutableRefObject<any>): void => {
  if (measurment?.current) {
    measurment.current.destroy();
    measurment.current = null;
  }
}

export const measurementSelectionFn = (
  arcGISModules: any,
  type: 'distance' | 'area' | 'clear',
  activeMeasurement: MutableRefObject<any>,
  viewRef: MutableRefObject<any>
): void => {
  const measurementViewNode: (HTMLElement | null) = document.getElementById('measurementView');
  const newMeasurementWidgetNode: HTMLDivElement = document.createElement('div');
  measurementViewNode?.appendChild(newMeasurementWidgetNode);

  switch (type) {
    case 'distance': {
      clearMeasurement(activeMeasurement);
      activeMeasurement.current = new arcGISModules.DistanceMeasurement2D({
        view: viewRef.current,
        container: newMeasurementWidgetNode
      });
      activeMeasurement.current?.viewModel.start();
      break;
    }
    case 'area': {
      clearMeasurement(activeMeasurement);
      activeMeasurement.current = new arcGISModules.AreaMeasurement2D({
        view: viewRef.current,
        container: newMeasurementWidgetNode
      });
      activeMeasurement.current?.viewModel.start();
      break;
    }
    case 'clear': {
      clearMeasurement(activeMeasurement);
      break;
    }
  }
}