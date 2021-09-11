import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { ESRI_KEY } from '../../../esriConfig';
import {
    createMapPointsForAllLayers,
    createElementForWidget,
    destroyWidgets,
    createFieldsFieldInfos,
    generateLayer,
    createSpatialReferences,
    measurementSelectionFn,
    createBasicRenderer
} from "./arcGISMapMethods";
import {
  ConfigLayerModel, ExtentRef, FeatureTableInfo,
  FieldsFieldInfos, RenderConfigModel,
  // ShapeFileConfig,
  WidgetsStateModel
} from "./ArcGISModels";
import * as arcGISUtils from '../ArcGISMap/arcGISConstants';
import { FiltersStateObject } from "../../../models/FilterCardModels";
import { initialExtentRef } from "../ArcGISMap/arcGISConstants";
import { layerListWidgetActionsListCreatorFunction, layerListWidgetActionsTrigger } from "./arcGISWidgetUtils";
import { SiteAPIWithShapefileInfo } from "../../../models/APIModels";
import { LoaderType } from "../../../models/AppDashboardModels";
import { createMapLayersDictionary } from "./arcGISLayerMethods";

// const getFeaturesFromZip = async (zipFile: any, name: any) => {
//   const form = new FormData();
//   const publishParams: any = {
//     'name': name, 
//     'targetSR': {
//       'wkid': 4326
//     },
//     'maxRecordCount': 5000,
//     // 'enforceInputFileSizeLimit': true,
//     // 'enforceOutputJsonSizeLimit': true
//   };
//   publishParams.generalize = false;
//   publishParams.maxAllowableOffset = 10;
//   publishParams.reducePrecision = false;
//   publishParams.numberOfDigitsAfterDecimal = 0;
//   form.append("publishParameters", JSON.stringify(publishParams));
//   form.append("filetype", "shapefile");
//   form.append("f", "json");
//   let zipName = name = ".zip";
//   // form.append("file", dataURItoBlob(zipFile), zipName);
//   form.append("file", zipFile, zipName);
//   const res = await fetch('https://www.arcgis.com/sharing/rest/content/features/generate', { method: 'POST', body: form });
//   // console.log('Res', res);
//   return await res.json();
// }

/* Not Required for this App as of now
// const dataURItoBlob = (dataURI: any) => {
//   console.log('ZipFIle', dataURI);
//   var array = [];
//   if (dataURI instanceof Array) {
//     array = dataURI;
//   } else {
//     console.log('dataURI')
//     var binary = atob(dataURI);
//     for (var i = 0; i < binary.length; i++) {
//       array.push(binary.charCodeAt(i));
//     }
//   }
//   return new Blob([new Uint8Array(array)], { type: 'application/zip' });
// }
*/

// export const createLayerFromShapeFile = (): Promise<any>[] => {
//   const featureCollectionPromises: Promise<any>[] = Object.keys(arcGISUtils.shapeFileConfigs).map(async (file: keyof ShapeFileConfig) => {
//     const zipFile = await fetch(arcGISUtils.shapeFileConfigs[file].path).then(res => res.blob());
//     const featureCollection = await getFeaturesFromZip(zipFile, arcGISUtils.shapeFileConfigs[file].title);
//     return {...featureCollection, id: file, title: arcGISUtils.shapeFileConfigs[file].title};
//   });
//   return featureCollectionPromises;
// }

export const createMap = (
    arcGISModules: any,
    siteInfo: SiteAPIWithShapefileInfo,
    callWorker: (filtersState: FiltersStateObject) => Promise<unknown>,
    mapEl: MutableRefObject<HTMLDivElement | null>,
    viewRef: MutableRefObject<any | null>,
    webMapRef: MutableRefObject<any | null>,
    baseMapGalleryView: MutableRefObject<HTMLDivElement | null>,
    layerListWidget: MutableRefObject<any | null>,
    bookmarksWidget: MutableRefObject<any | null>,
    measurementSelection: MutableRefObject<((type: 'distance' | 'area' | 'clear') => void) | null>,
    activeMeasurement: MutableRefObject<any | null>,
    timeSliderWidget: MutableRefObject<any | null>,
    featureTableWidget: MutableRefObject<any | null>,
    extentPolygonRef: MutableRefObject<any | null>,
    extentRef: MutableRefObject<ExtentRef>,
    setddSummaryData: Dispatch<SetStateAction<any>>,
    setHasDDSummaryData: Dispatch<SetStateAction<boolean>>,
    setMapLoader: Dispatch<SetStateAction<LoaderType>> | undefined,
    loaderPosition: 'default-loader' | 'br-loader' | 'tr-loader',
    setShowTimeSliderWidget: Dispatch<SetStateAction<boolean>>,
    setFeatureTableInfo: Dispatch<SetStateAction<FeatureTableInfo>>,
    setWidgetsState: Dispatch<SetStateAction<WidgetsStateModel>>,
    setCurrentFTableTab: Dispatch<SetStateAction<keyof RenderConfigModel>>,
    data: any, filtersState: FiltersStateObject
  ): void => {

    extentRef.current = {...initialExtentRef};

    const spatialReferences: {input: any, output: any}
    = createSpatialReferences(arcGISModules, siteInfo.wkid)

    // console.log('spatialReferences', siteInfo, spatialReferences);

    destroyWidgets([layerListWidget, bookmarksWidget, timeSliderWidget, featureTableWidget]);
  
    arcGISModules.esriConfig.apiKey = ESRI_KEY;
    
    setShowTimeSliderWidget(false);

    callWorker(filtersState).then((drillDownSummaryData: any) => {
      console.log('drillDownSummaryData', drillDownSummaryData);
      if (drillDownSummaryData.length) {
        setHasDDSummaryData(true);
        setddSummaryData(drillDownSummaryData)
      }
    });
  
    measurementSelection.current = (type: 'distance' | 'area' | 'clear') => {
      measurementSelectionFn(arcGISModules, type, activeMeasurement, viewRef);
    }
  
    arcGISModules.projection.load().then(() => {
  
      const extentPolygonGraphicLayer = new arcGISModules.GraphicsLayer({
        title: 'Extent',
        id: 'extentPolygonGraphicLayer',
        visible: true
      });

      const mapLayersAsObject: {[name: string]: typeof arcGISModules.FeatureLayer} = createMapLayersDictionary(
        siteInfo, data, spatialReferences, extentRef, arcGISModules
      )
  
      const polygon = {
        type: "polygon",
        rings: [
          [extentRef.current.ymaxRef, extentRef.current.xminRef], //Longitude, latitude
          [extentRef.current.ymaxRef, extentRef.current.xmaxRef], //Longitude, latitude
          [extentRef.current.yminRef, extentRef.current.xmaxRef], //Longitude, latitude
          [extentRef.current.yminRef, extentRef.current.xminRef],   //Longitude, latitude
        ]
      };
  
      extentPolygonRef.current = new arcGISModules.Graphic({
        geometry: polygon,
        symbol: arcGISUtils.extentPolygonMarker,
      });

      mapLayersAsObject['locationSummary'].when(() => {

        viewRef.current!.extent = extentPolygonRef.current?.geometry.extent;
        
        // console.log('customElements', customElements.get('vaadin-lumo-styles'));
        featureTableWidget.current = new arcGISModules.FeatureTable({
          id: 'locationSummary',
          view: viewRef.current!, // make sure to pass in view in order for selection to work
          layer: mapLayersAsObject['locationSummary'],
          container: createElementForWidget('featureTableView')
        });

        const newFeatureTableInfo: FeatureTableInfo =
        Object.keys(arcGISUtils.mapRenderConfig).reduce((result: FeatureTableInfo, configKey: keyof RenderConfigModel) => {

          if (arcGISUtils.mapRenderConfig[configKey].hasFeatureTable && mapLayersAsObject[configKey]) {
            result[configKey] = {
              layer: mapLayersAsObject[configKey]
            }
          }

          return result;
        }, {})
        
        setFeatureTableInfo((prev: FeatureTableInfo) => ({
          ...prev,
          ...newFeatureTableInfo
        }))

        // console.log('newFeatureTableInfo', newFeatureTableInfo)
      })
  
      Object.keys(mapLayersAsObject).forEach((key: string) => {
        webMapRef.current?.add(mapLayersAsObject[key]);
      });
      
      extentPolygonGraphicLayer.add(extentPolygonRef.current);
      webMapRef.current?.add(extentPolygonGraphicLayer);
      
      // console.log('Graphics Layer', mapLayersAsObject, webMapRef.current);
      // console.log('Extents', extentRef.current, extentPolygonRef.current, extentPolygonGraphicLayer);
    })

  // if (siteInfo.hasShapefile) {
  //   // createLayerFromShapeFile()
  //   Promise.all(createLayerFromShapeFile())
  //   .then((layerFeatures: any[]) => {

  //     console.log('ShapeFiles', layerFeatures);
      
  //     const newFeatureTableInfo: FeatureTableInfo = {};

  //     layerFeatures.forEach((layerFeature: any) => {
        
  //     let sourceGraphics: (typeof arcGISModules.Graphic)[] = [];

  //     const layers = layerFeature.featureCollection.layers.map((layer: any) => {

  //       const graphics: (typeof arcGISModules.Graphic)[] = layer.featureSet.features.map((feature: any) => {
  //         return arcGISModules.Graphic.fromJSON(feature);
  //       })
  //       sourceGraphics = sourceGraphics.concat(graphics);
  //       const {fields, fieldInfos}: FieldsFieldInfos
  //       = createFieldsFieldInfos(layer.layerDefinition.fields, null, true, arcGISModules.Field)

  //       const featureLayer: typeof arcGISModules.FeatureLayer = new arcGISModules.FeatureLayer({
  //         title: layerFeature.title,
  //         id: layerFeature.id,
  //         objectIdField: "FID",
  //         source: graphics,
  //         fields: fields,
  //         visible: false,
  //         popupTemplate: {
  //           title: layerFeature.title,
  //           content: [{
  //             type: "fields",
  //             fieldInfos: fieldInfos
  //           }],
  //         }
  //       });

  //       newFeatureTableInfo[layerFeature.id] = {layer: featureLayer};

  //       return featureLayer;
  //       // associate the feature with the popup on click to enable highlight and zoom to
  //     })

  //     webMapRef.current?.addMany(layers);
  //     setFeatureTableInfo((prev: FeatureTableInfo) => ({
  //       ...prev,
  //       ...newFeatureTableInfo
  //     }))
  //     })
  //   })
  //   .catch(err => {
  //     console.log('Some Error occured', err);
  //   });
  // }
  
  webMapRef.current = new arcGISModules.WebMap({
    basemap: "topo-vector",
  });

  // and we show that map in a container
  viewRef.current = new arcGISModules.MapView({
    map: webMapRef.current,
    container: mapEl.current ?? undefined
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const basemapGallery = new arcGISModules.BasemapGallery({
    view: viewRef.current!,
    container: baseMapGalleryView.current ?? undefined
  });
  
  viewRef.current?.when(function() {
    console.log('ViewExtent', viewRef.current, document.getElementById('feature-table-view'));

    // time slider widget initialization
    timeSliderWidget.current = new arcGISModules.TimeSlider({
      view: viewRef.current!,
      container:  createElementForWidget('timeSliderView'),
      timeVisible: true, // show the time stamps on the timeslider
      loop: true
    });

    let bookmarks;
    try {
      bookmarks = JSON.parse(siteInfo.bookmark);
      if (bookmarks?.length) {
        bookmarks = bookmarks.map((bookmark: any) => ({
          ...bookmark,
          viewpoint: {
            ...bookmark.viewpoint,
            targetGeometry: new arcGISModules.Extent(bookmark.extent)
          }
        }))
      } else {
        bookmarks = [];
      }
      // console.log('bookmarks', bookmarks);
    }
    catch (err) {console.log(err)}

    bookmarksWidget.current = new arcGISModules.Bookmarks({
      view: viewRef.current!,
      container: createElementForWidget('bookmarksView'),
      editingEnabled: true
    });

    bookmarks.forEach((bookmark: any) => {
      bookmarksWidget.current.bookmarks.add(bookmark)
    })
  
    layerListWidget.current = new arcGISModules.LayerList({
      view: viewRef.current!,
      container: createElementForWidget('layersListView'),
      listItemCreatedFunction: layerListWidgetActionsListCreatorFunction
    });
  
    layerListWidget.current.on("trigger-action", (event: any) => {
      // console.log('layerListWidget loaded', layerListWidget);
      layerListWidgetActionsTrigger(
        event, viewRef, extentPolygonRef,
        setWidgetsState, setCurrentFTableTab
      );
    });
  });

  // Set Loaders
  viewRef.current?.watch('updating', (evt: any) => {
    if(evt === true) {
      // console.log('Upadating');
      if (setMapLoader) {
        setMapLoader({
          showLoader: true,
          position: loaderPosition
        });
      }
    } else {
      // console.log('Upadated');
      if (setMapLoader) {
        setMapLoader({showLoader: false});
      }
    }
  })
}

export const createLayerToAdd = async (
  arcGISModules: any,
  siteInfo: SiteAPIWithShapefileInfo, data: any,
  setFeatureTableInfo: Dispatch<SetStateAction<FeatureTableInfo>>,
  layerName: string
): Promise<any> => {
  // console.log('arcGisModules', arcGISModules);

  const pointGraphics: (typeof arcGISModules.Graphic)[] = [];

  const spatialReferences = createSpatialReferences(arcGISModules, siteInfo.wkid);
  
  data.forEach((pointInfo: any) => {
    const newPointGraphic: (typeof arcGISModules.Graphic | null) = createMapPointsForAllLayers(
      arcGISModules,
      pointInfo,
      spatialReferences.input, spatialReferences.output,
      null
    );

    if (newPointGraphic) {
      pointGraphics.push(newPointGraphic);
    }
  })

  const config: ConfigLayerModel = arcGISUtils.mapRenderConfig[layerName];

  const {fields, fieldInfos}: FieldsFieldInfos
  = createFieldsFieldInfos(Object.keys(data[0]), null, false);

  const popupTemplate = {
    title: arcGISUtils.mapRenderConfig[layerName].layerTitle,
    content: [{
      type: "fields",
      fieldInfos: fieldInfos
    }],
  }

  if (layerName === 'drillDownSummary') {

  }

  const optionals: any = layerName === 'drillDownSummary' ?
  {
    timeInfo: {
      startField: 'date',
      endField: 'date',
      fullTimeExtent: {
        start: new Date(data[data.length - 1].date),
        end: new Date(data[0].date)
      }
    },
    timeExtent: {
      start: new Date(data[data.length - 1].date),
      end: new Date(data[0].date)
    }
  }: null;

  const generatedLayer: typeof arcGISModules.FeatureLayer = generateLayer(
    arcGISModules.FeatureLayer,
    `${siteInfo.siteId}-${layerName}`, 
    config.layerTitle, config.initialVisibility,
    'OBJECTID', fields, [], 'point', popupTemplate,
    spatialReferences.output,
    createBasicRenderer(
      arcGISUtils.mapRenderConfig[layerName].layerTitle, false, config.color,
      layerName === 'drillDownSummary' ? 10 : undefined
    ),
    optionals
  )

  await generatedLayer.applyEdits({addFeatures: pointGraphics})
  .then((res: any) => {
    console.log('LayerToAdd Apllied Graphics', res);
  });

  setFeatureTableInfo((prev: FeatureTableInfo) => ({
    ...prev,
    [layerName]: {
      layer: generatedLayer,
    }
  }))

  console.log('generatedLayer', generatedLayer);

  return generatedLayer;
}