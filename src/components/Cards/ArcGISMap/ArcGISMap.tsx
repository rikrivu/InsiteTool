import './ArcGISMap.scss';

import { loadModules } from 'esri-loader';
import {
  createRef, forwardRef, ForwardRefRenderFunction,
  memo, CSSProperties, Dispatch, MutableRefObject, SetStateAction,
  useCallback, useContext, useEffect, useMemo, useRef, useState
} from 'react';
import WidgetHeader from './WidgetHeader/WidgetHeader';
// @ts-ignore
import ResizePanel from 'react-resize-panel';
import CustomTooltip from '../../shared/CustomTooltip/CustomTooltip';

import * as arcGISUtils from '../ArcGISMap/arcGISConstants';
import { getMapLayersList, getWaterwellsLayerData, saveBookmarks } from '../../../services/data-service';

import { ExtentRef, FeatureTableInfo, RenderConfigModel, WidgetsStateModel } from './ArcGISModels';

import Worker from '../../../worker'
import { FiltersStateObject } from '../../../models/FilterCardModels';
import { createMap, createLayerToAdd } from './arcGISMapCreator';
import { GlobalStoreState, globalStore } from '../../../stores/GlobalStore/GlobalStore';
import { createElementForWidget, createFeatureTableTabBtns } from './arcGISMapMethods';
import { WrappingCardChildrenProps } from '../../../models/AppDashboardModels';
import { APIResponse } from '../../../models/APIModels';
import { exportCSVFile, getIcon, notify, thumbnailKeyRemoved } from '../../../utils/globalUtilityMethods';
import useResizeObserver from "use-resize-observer";
import LoadingSpinner from '../../shared/LoadingSpinner/LoadingSpinner';

const WidgetRenedererFn: ForwardRefRenderFunction<HTMLDivElement, any> = (props, ref) => (
  <div {...props} ref={ref}></div>
)

const WidgetContainer = forwardRef(WidgetRenedererFn);

function ArcGISMapUnmemoized (props: WrappingCardChildrenProps) {

  // console.log('ArcGISMapUnmemoized', props);
       
  const horzRef = createRef<HTMLDivElement>();
  const { ref: containerRef, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();

  const widgetCSS: CSSProperties = {
    resize: 'both',
    overflow: 'auto',
    maxWidth: width - 70,
    maxHeight: height - 30
  };

  const [hasDDSummaryData, setHasDDSummaryData]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
  const [ddSummaryData, setddSummaryData]: [any, Dispatch<SetStateAction<any>>] = useState<any>();

  // const [hasWaterwellsData, setHasWaterwellsData]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
  const [waterwellsData, setWaterwellsData]: [any, Dispatch<SetStateAction<any>>] = useState<any>();

  // Variable for Toggling each widget in the Map
  const [widgetsState, setWidgetsState]: [WidgetsStateModel, Dispatch<SetStateAction<WidgetsStateModel>>]
  = useState<WidgetsStateModel>(arcGISUtils.defaultWidgetsState);

  const [showTimeSliderWidget, setShowTimeSliderWidget]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);

  const [currentFTableTab, setCurrentFTableTab]: [keyof RenderConfigModel, Dispatch<SetStateAction<keyof RenderConfigModel>>]
  = useState<keyof RenderConfigModel>('locationSummary');

  // Variable containing list of Layers that are part of the FeatureTable
  const [featureTableInfo, setFeatureTableInfo]: [FeatureTableInfo, Dispatch<SetStateAction<FeatureTableInfo>>]
  = useState<FeatureTableInfo>({});

  const [arcGISModules, setArcGISModules]: [any, Dispatch<SetStateAction<any>>] = useState<any>();
  
  const globalState: GlobalStoreState = useContext<GlobalStoreState>(globalStore);
  const { dispatch } = globalState;

  const mapEl = useRef<HTMLDivElement>(null);
  const viewRef: MutableRefObject<any | null> = useRef<any | null>(null);
  const webMapRef: MutableRefObject<any | null> = useRef<any | null>(null);
  const baseMapGalleryView = useRef<HTMLDivElement>(null);

  const activeMeasurement: MutableRefObject<any | null>
  = useRef<any | null>(null);

  const measurementSelection = useRef<((type: 'distance' | 'area' | 'clear') => void) | null>(null);
  const layerListWidget: MutableRefObject<any | null> = useRef<any | null>(null);
  const bookmarksWidget: MutableRefObject<any | null> = useRef<any | null>(null);
  const timeSliderWidget: MutableRefObject<any | null> = useRef<any | null>(null);
  const featureTableWidget: MutableRefObject<any | null> = useRef<any | null>(null);
  const fTableWidgetContainerRef = useRef<HTMLDivElement>(null);

  const extentPolygonRef: MutableRefObject<any | null> = useRef<any | null>(null);
  const extentRef = useRef<ExtentRef>(arcGISUtils.initialExtentRef);

  const layersDataRaw: MutableRefObject<any> = useRef<any>(null);

  // Create Buttons for FeatureTable window dynamically
  const featureTableTabBtns: JSX.Element = useMemo<JSX.Element>(
    () => createFeatureTableTabBtns(currentFTableTab, setCurrentFTableTab, featureTableInfo),
  [currentFTableTab, featureTableInfo])

  // Reset FeatureTable Info everytime site ie. siteInfo changes
  useEffect((): void => {
    setFeatureTableInfo({});
  }, [globalState.state.siteInfo])

  const onDownload = useCallback((jsonToConvert: any[], tab: keyof RenderConfigModel) => {
    console.log('jsonToConvert', jsonToConvert);

    const fileName: string = arcGISUtils.mapRenderConfig[tab] ?
    arcGISUtils.mapRenderConfig[tab].layerTitle + '_SiteID_' + globalState.state.siteInfo.siteId
    // : arcGISUtils.shapeFileConfigs[tab].title + '_SiteID_' + globalState.state.siteInfo.siteId;
    : 'unknownLayer_SiteID_' + globalState.state.siteInfo.siteId;

    if (jsonToConvert) {
      exportCSVFile(jsonToConvert, fileName, true);
    } else {
      notify(
        dispatch, { show: 'start', type: 'fail', message: `Unable to download ${fileName} layer as CSV.` }
      )
    }
  }, [dispatch, globalState.state.siteInfo.siteId])

  // Load all ArcGIS Modules only when page renders for the 1st Time
  useEffect(() => {
    setCurrentFTableTab('locationSummary');
    loadModules(arcGISUtils.esriModules, {css: true})
    .then(
      (
        [
          esriConfig, MapView, WebMap,
          BasemapGallery, LayerList,
          SpatialReference, GraphicsLayer, Point,
          Graphic, Extent, Polygon, projection, FeatureLayer, Bookmarks,
          DistanceMeasurement2D, AreaMeasurement2D, TimeSlider,
          Field, FeatureTable, request
        ]
      ) => {
        setArcGISModules({
          esriConfig: esriConfig,
          MapView: MapView,
          WebMap: WebMap,
          BasemapGallery: BasemapGallery,
          LayerList: LayerList,
          SpatialReference: SpatialReference,
          GraphicsLayer: GraphicsLayer,
          Point: Point,
          Graphic: Graphic,
          Extent: Extent,
          Polygon: Polygon,
          projection: projection,
          FeatureLayer: FeatureLayer,
          Bookmarks: Bookmarks,
          DistanceMeasurement2D: DistanceMeasurement2D,
          AreaMeasurement2D: AreaMeasurement2D,
          TimeSlider: TimeSlider,
          Field: Field,
          FeatureTable: FeatureTable,
          request: request
        });
      })
  }, [])

  // Method to add New Layers on Button Click
  // UseCallback used to prevent creating the function definition on every render
  const addNewLayer = useCallback((layerName: string, data: any): void => {

    const currentInstanceOfLayer = webMapRef.current.findLayerById(`${globalState.state.siteInfo.siteId}-${layerName}`);

    if (!currentInstanceOfLayer) {

      // webMapRef.current.remove(currentDrilldownLayer);

      if (props.setLoader) {
        props.setLoader({
          showLoader: true,
          position: props.loaderPosition
        });
      }

      layersDataRaw.current = {...layersDataRaw.current, [layerName]: data}

      createLayerToAdd(
        arcGISModules,
        globalState.state.siteInfo, data,
        setFeatureTableInfo,
        layerName
      ).then((res: any) => {
        console.log('New Layer Added', res, timeSliderWidget.current);

        // Add the res ie. DD Summary Layer to the current webMap
        webMapRef.current?.add(res);
        
        if (layerName === 'drillDownSummary') {
          // Add the timeSlider widget only when the DD Summary layer is available
          timeSliderWidget.current!.fullTimeExtent = res.timeExtent.expandTo("days");
          setShowTimeSliderWidget(true);
        }

        if (props.setLoader) {
          props.setLoader({showLoader: false});
        }
      });
    }
  }, [arcGISModules, globalState.state.siteInfo, props])

  // Update the featureTable widget to show the layer corresponding to one that is selected
  // either from LayerList or from featureTable Window Buttons
  useEffect(() => {
    if (featureTableInfo?.[currentFTableTab] && (!featureTableWidget.current || featureTableWidget.current.id !== currentFTableTab)) {

      // Destroy any featur Table instance if Present before creating new one
      if (fTableWidgetContainerRef.current?.hasChildNodes()) {
        featureTableWidget.current?.destroy();
      }
      // console.log('currentFTableTab', currentFTableTab, featureTableInfo, featureTableWidget.current)

      // Create new Feature table instance with the chosen Layer
      featureTableWidget.current = new arcGISModules.FeatureTable({
        id: currentFTableTab as string,
        view: viewRef.current!, // make sure to pass in view in order for selection to work
        layer: featureTableInfo[currentFTableTab]?.layer,
        container: createElementForWidget('featureTableView')
      });
    }
  }, [arcGISModules?.FeatureTable, currentFTableTab, featureTableInfo])

  // Make api call to fetch new layers data and Create the webmap every time filtersState changes
  useEffect(() => {
    // console.log('ArcGis Map filtersstate', globalState.state.filtersState);
    if (arcGISModules && globalState.state.filtersState && globalState.state.filtersState.refreshAppData) {

      if (props.setLoader) {
        props.setLoader({
          showLoader: true,
          position: props.loaderPosition
      });
      }
      setHasDDSummaryData(false);
      const workerInstance = new Worker();
  
      const callWorker = (filtersState: FiltersStateObject): Promise<unknown> => {
    
        return new Promise(async resolve => {
          // Use a web worker to process the data
          const processed = await workerInstance.processData(filtersState);
          resolve(processed);
        });
      }
      
      getMapLayersList(globalState.state.filtersState).then((data: APIResponse<any>) => {
        // console.log('MapLayers', data);

        layersDataRaw.current = {...layersDataRaw.current, ...data.resultSet};

        layersDataRaw.current = {...layersDataRaw.current, ...data.resultSet};

        createMap(
          arcGISModules,
          globalState.state.filtersState.siteInfo,
          callWorker,
          mapEl, viewRef, webMapRef,
          baseMapGalleryView, layerListWidget, bookmarksWidget,
          measurementSelection, activeMeasurement,
          timeSliderWidget, featureTableWidget,
          extentPolygonRef,
          extentRef,
          setddSummaryData, setHasDDSummaryData,
          props.setLoader, props.loaderPosition,
          setShowTimeSliderWidget,
          setFeatureTableInfo, setWidgetsState,
          setCurrentFTableTab,
          data.resultSet,
          globalState.state.filtersState,
        )
      })
      .catch(err => {
        console.log('API Call Aborted or Other error', err);
      });
    // }
    }
    return () => {
      // clean up the map view
      if (!!viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [arcGISModules, globalState.state.filtersState, props]);

  useEffect(() => {
    getWaterwellsLayerData(globalState.state.siteInfo.siteId)
    .then((res: APIResponse<any>) => {
      if (res.message === 'success') {
        setWaterwellsData(res.resultSet);
      }
    })
    .catch(err => console.log('API Call Aborted or Other error', err))
  }, [globalState.state.siteInfo])
      
  const mapZoomToDefault = useCallback((): void => {
    // console.log('onZoom to default X and Y max min', xmaxRef.current, xminRef.current, ymaxRef.current, yminRef.current);
    viewRef.current?.goTo(extentPolygonRef.current?.geometry.extent);
  }, [])

  const onSaveBookmarks = useCallback(() => {
    // console.log('Bookmarks', webMapRef.current.bookmarks)
    saveBookmarks(globalState.state.siteInfo.siteId, JSON.stringify(thumbnailKeyRemoved(webMapRef.current.bookmarks.items)))
    .then((res: APIResponse<string>) => {
      if (res.message === 'success') {
        notify(
          dispatch,
          {
            show: 'start', type: 'success',
            message: `${webMapRef.current.bookmarks.items.length} bookmark(s) saved successfully.`, icon: 'bookmark'
          }
        )
      } else {
        notify(
          dispatch,
          {
            show: 'start', type: 'fail',
            message: res.message.charAt(0).toUpperCase() + res.message.slice(1)
          }
        )
      }
    })
    .catch(err => {
      console.log(err)
      notify(
        dispatch, { show: 'start', type: 'fail', message: 'Unable to Add bookmark' }
      )
    })
  }, [dispatch, globalState.state.siteInfo.siteId])
    
  return (
    <div className="esri-map-container" ref={containerRef} >

      <div style={{ height: 'inherit' }} ref={mapEl} />

      {/* Feature Table Widget container */}
      
      <div className="feature-table-container">

        <div className="open-fTable">
          <button type="button" onClick={() => setWidgetsState((prev: WidgetsStateModel) => ({
            ...prev,
            featureTableView: !prev.featureTableView
          }))}>
            {!widgetsState.featureTableView && getIcon('arrowDropUp')}
            {widgetsState.featureTableView && getIcon('arrowDropDown')}
          </button>
        </div>
        
        <div className={`resize-panel-horz cover-100 fTable-wrapper${!widgetsState.featureTableView ? ' hide' : ''}`}>

          <ResizePanel ref={horzRef} direction='n' style={{height: '100%', minHeight: 150, maxHeight: 600}}>
            <div className="feature-table-content">

              <div className="fTable-tabs-container">
                
                {featureTableTabBtns}

                {
                  !!currentFTableTab && !!featureTableInfo[currentFTableTab] &&
                  <CustomTooltip title={`Download ${
                    // arcGISUtils.mapRenderConfig[currentFTableTab] ?
                    arcGISUtils.mapRenderConfig[currentFTableTab].layerTitle
                    // : arcGISUtils.shapeFileConfigs[currentFTableTab].title
                  } Layer`
                  }>
                    <button type="button" className="icon-btn save-btn"
                      onClick={() => onDownload(layersDataRaw.current[currentFTableTab], currentFTableTab)}
                    >
                      {getIcon('save')}
                    </button>
                  </CustomTooltip>
                }

              </div>

              <div ref={fTableWidgetContainerRef} id="featureTableView"></div>
            </div>
          </ResizePanel>
            
        </div>
      </div>

      {/* Feature Table Widget container Ends */}

      <CustomTooltip title="Basemap Gallery">
        <button type="button" className="esri-widget-btn bm-gallery"
          onClick={() => setWidgetsState((prev: WidgetsStateModel) => ({
            ...prev,
            baseMapGallery: !prev.baseMapGallery
          }))}
        >
          {getIcon('basemapGallery')}
        </button>
      </CustomTooltip>

      <CustomTooltip title="Layers List">
        <button type="button" className="esri-widget-btn layers-list"
          onClick={() => setWidgetsState((prev: WidgetsStateModel) => ({
            ...prev,
            layersListView: !prev.layersListView
          }))}
        >
          {getIcon('layers')}
        </button>
      </CustomTooltip>

      <CustomTooltip title="Bookmarks">
        <button type="button" className="esri-widget-btn bookmark"
          onClick={() => setWidgetsState((prev: WidgetsStateModel) => ({
            ...prev,
            bookmarksView: !prev.bookmarksView
          }))}
        >
          {getIcon('bookmark')}
        </button>
      </CustomTooltip>

      <CustomTooltip title="Measurements">
        <button type="button" className="esri-widget-btn measurement"
          onClick={() => setWidgetsState((prev: WidgetsStateModel) => ({
            ...prev,
            measurementsView: !prev.measurementsView
          }))}
        >
          {getIcon('measurements')}
        </button>
      </CustomTooltip>

      <CustomTooltip title="View Extent">
        <button type="button" className="esri-widget-btn def-extent" onClick={() => mapZoomToDefault()}>
          {getIcon('viewExtent')}
        </button>
      </CustomTooltip>

      {
        showTimeSliderWidget ?
        <CustomTooltip title="Time Slider">
          <button type="button" className="esri-widget-btn time-slider"
            onClick={() => setWidgetsState((prev: WidgetsStateModel) => ({
              ...prev,
              timeSliderView: !prev.timeSliderView
            }))}
          >
            {getIcon('timeSlider')}
          </button>
        </CustomTooltip>
        : null
      }

      {
        hasDDSummaryData ?
        <CustomTooltip title="Drilldown Summary Available">
          <button type="button" className="esri-widget-btn add-ddSummary"
            onClick={() => addNewLayer('drillDownSummary', ddSummaryData)}
          >
            {getIcon('drilldown')}
          </button>
        </CustomTooltip>
        :
        <CustomTooltip title="Drilldown Summary Loading">
          {/* <button type="button" className="esri-widget-btn add-ddSummary">
            {getIcon('visibilityOff')}
          </button> */}
          <div className="esri-widget-btn add-ddSummary">
            <LoadingSpinner size="small"/>
          </div>
        </CustomTooltip>
      }

      {
        waterwellsData ?
        <CustomTooltip title="Waterwells Available">
          <button type="button" className="esri-widget-btn add-waterwells"
            onClick={() => addNewLayer('waterwells', waterwellsData)}
          >
            {getIcon('water')}
          </button>
        </CustomTooltip>
        :
        <CustomTooltip title="Waterwells Loading">
          {/* <button type="button" className="esri-widget-btn add-waterwells">
            {getIcon('visibilityOff')}
          </button> */}
          <div className="esri-widget-btn add-waterwells">
            <LoadingSpinner size="small"/>
          </div>
        </CustomTooltip>
      }

      {/* Container For Basemap gallery Widget */}

      <div className={`widget-wrapper app-scroll${widgetsState.baseMapGallery ? '' : ' hide'}`} style={widgetCSS}>

        <WidgetHeader title="Basemap Gallery" valueAccessor="baseMapGallery" setWidgetsState={setWidgetsState}/>
        <WidgetContainer ref={baseMapGalleryView} id="baseMapGalleryView" className='widget-content'/>

      </div>
        
      {/* Container For LayerList Widget */}

      <div className={`widget-wrapper app-scroll${widgetsState.layersListView ? '' : ' hide'}`} style={widgetCSS}>

        <WidgetHeader title="Layers List" valueAccessor="layersListView" setWidgetsState={setWidgetsState}/>
        <div id="layersListView" className='removable-widget-content'></div>
      
      </div>

      {/* Container For Bookmarks Widget */}

      <div className={`widget-wrapper app-scroll${widgetsState.bookmarksView ? '' : ' hide'}`} style={widgetCSS}>

        <WidgetHeader title="Bookmarks" valueAccessor="bookmarksView"
          setWidgetsState={setWidgetsState}
          buttons={[{icon: 'save', tooltip: 'Save Bookmarks', onClick: onSaveBookmarks}]}
        />
        <div id="bookmarksView" className='removable-widget-content'></div>
        
      </div>

      {/* Container For Measurement Widget */}

      <div className={`widget-wrapper app-scroll${widgetsState.measurementsView ? '' : ' hide'}`} style={widgetCSS}>
        
        <WidgetHeader title="Measurements" valueAccessor="measurementsView" setWidgetsState={setWidgetsState}/>
        <div id="toolbarDiv" className="esri-component esri-widget measurement-btns">

          <button id="distance"
            className="esri-widget--button esri-interactive esri-icon-measure-line"
            title="Distance Measurement Tool"
            onClick={() => measurementSelection.current?.('distance')}
          >
          </button>

          <button id="area"
            className="esri-widget--button esri-interactive esri-icon-measure-area"
            title="Area Measurement Tool"
            onClick={() => measurementSelection.current?.('area')}
          >
          </button>

          <button id="clear"
            className="esri-widget--button esri-interactive esri-icon-trash"
            title="Clear Measurements"
            onClick={() => measurementSelection.current?.('clear')}
          >
          </button>

        </div>

        <div id="measurementView" className='removable-widget-content'></div>
        
      </div>

      {/* Container For Time Slider Widget */}

      <div className={`widget-wrapper app-scroll${widgetsState.timeSliderView ? '' : ' hide'}`} style={widgetCSS}>

        <WidgetHeader title="Time Slider" valueAccessor="timeSliderView" setWidgetsState={setWidgetsState}/>
        <div id="timeSliderView" className='removable-widget-content'></div>
        
      </div>

    </div>
  );
}

const ArcGISMap = memo(
  ArcGISMapUnmemoized,
  (
    prevProps: WrappingCardChildrenProps,
    nextProps: WrappingCardChildrenProps
  ) => prevProps.loaderPosition === nextProps.loaderPosition
);
export default ArcGISMap;