import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  mapRenderConfig,
  // shapeFileConfigs
} from './arcGISConstants';
import { WidgetsStateModel, RenderConfigModel } from './ArcGISModels';
import Graphic from '@arcgis/core/Graphic';
import MapView from '@arcgis/core/views/MapView';


export const layerListWidgetActionsListCreatorFunction = (event: any) => {
  const item = event.item;
  // console.log('Event', event, event.item);
  if (item.layer.type !== "group") {
    // don't show legend twice
    item.panel = {
      content: "legend",
      open: false
    };
    item.actionsSections = [
      [
        {
          title: "Go to full extent",
          className: "esri-icon-zoom-out-fixed",
          id: "full-extent"
        }
      ],
      [
        {
          title: "Increase opacity",
          className: "esri-icon-plus",
          id: "increase-opacity"
        },
        {
          title: "Decrease opacity",
          className: "esri-icon-minus",
          id: "decrease-opacity"
        }
      ],
      [
        {
          title: "View in Feature Table",
          className: "esri-icon-table",
          id: "view-fTable"
        }
      ]
    ];
  }
}

export const layerListWidgetActionsTrigger =
(
  event: any,
  viewRef: MutableRefObject<MapView | null>,
  extentPolygonRef: MutableRefObject<Graphic | null>,
  setWidgetsState: Dispatch<SetStateAction<WidgetsStateModel>>,
  setCurrentFTableTab: Dispatch<SetStateAction<keyof RenderConfigModel>>
) => {
  // console.log('layerListWidget loaded', layerListWidget);
  console.log('Event Trigger', event, event.item);
  switch (event.action.id) {
    case "full-extent": {
      if (event.item.title === 'Waterwells') {
        viewRef.current?.goTo(event.item.layer.fullExtent);
      } else {
        viewRef.current?.goTo(extentPolygonRef.current?.geometry.extent);
      }
      break;
    }
    case "increase-opacity": {
      if (event.item.layer.opacity < 1) {
        event.item.layer.opacity += 0.25;
      }
      break;
    }
    case "decrease-opacity": {
      if (event.item.layer.opacity > 0) {
        event.item.layer.opacity -= 0.25;
      }
      break;
    }
    case "view-fTable": {

      setWidgetsState((prev: WidgetsStateModel) => {
        if (!prev.featureTableView) {
          return {
            ...prev,
            featureTableView: true
          }
        } else {
          return prev;
        }
      })

      setCurrentFTableTab((prev: keyof RenderConfigModel) => {
        let tab: string = event.item.layer.id.split('-').pop();

        if (
          !Object.keys(mapRenderConfig).includes(tab)
          // && !Object.keys(shapeFileConfigs).includes(tab)
        ) {
          tab = 'locationSummary'
        }
        console.log('Trigger Tab', tab, event.item.layer.id)

        if (prev !== tab)  {
          return tab;
        } else {
          return prev;
        }
      })

      break;
    }
  }
}