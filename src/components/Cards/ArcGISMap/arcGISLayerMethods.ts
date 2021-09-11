import { MutableRefObject } from 'react';
import { defaultPolygonFields, defaultPopupTemplatePolygon, mapRenderConfig } from './arcGISConstants';
import {
    createFieldsFieldInfos, createLabelClass,
    createMapPointsForAllLayers, generateLayer,
    createPolygonRenderer,createRenderer, createBasicRenderer
 } from './arcGISMapMethods';
import { ConfigLayerModel, ExtentRef, FieldsFieldInfos, RenderConfigModel } from './ArcGISModels';
import { SiteAPIWithShapefileInfo } from '../../../models/APIModels';

export const createMapLayersDictionary = 
(
    siteInfo: SiteAPIWithShapefileInfo,
    data: any,
    spatialReferences: {input: any, output: any},
    extentRef: MutableRefObject<ExtentRef>,
    arcGISModules: any
): {[name: string]: typeof arcGISModules.FeatureLayer} => {

    const pointGraphicsAsObject: {[name: string]: typeof arcGISModules.Graphic[]} = {};
    
    return Object.keys(data).reduce((layers: {[name: string]: typeof arcGISModules.FeatureLayer}, key: string) => {

        const layerConfig: ConfigLayerModel = mapRenderConfig[key as keyof RenderConfigModel];

        if (data[key].length) {
        
            if (layerConfig.layerType === 'default') {
                pointGraphicsAsObject[key] = [];

                data[key].forEach((pointInfo: any) => {

                    const newPointGraphic: (typeof arcGISModules.Graphic | null) = createMapPointsForAllLayers(
                        arcGISModules,
                        pointInfo,
                        spatialReferences.input, spatialReferences.output,
                        key === 'locationSummary' ? extentRef : null
                    );

                    if (newPointGraphic) {
                        pointGraphicsAsObject[key].push(newPointGraphic);
                    }
                })

                const dataToWork = data[key].length ? data[key][0] : data[key];

                const {fields, fieldInfos}: FieldsFieldInfos
                = createFieldsFieldInfos(Object.keys(dataToWork), key, false);

                const popupTemplateConfig: any = {
                    title: '{locSort} - ' + layerConfig.layerTitle,
                    content: [{
                        type: "fields",
                        fieldInfos: fieldInfos
                    }],
                };

                // const popupTemplate: PopupTemplate = new PopupTemplate(popupTemplateConfig)

                //   console.log('fields', fields, fieldInfos, dataToWork);

                const newLayers: {[name: string]: typeof arcGISModules.FeatureLayer} = {
                    [key]: generateLayer(
                        arcGISModules.FeatureLayer,
                        `${siteInfo.siteId}-${key}`, layerConfig.layerTitle,
                        layerConfig.initialVisibility,
                        'OBJECTID', fields, [], 'point', popupTemplateConfig,
                        spatialReferences.output,
                        createBasicRenderer(layerConfig.layerTitle, false, mapRenderConfig[key].color)
                    )
                };

                // console.log('Main Layer', newLayers[key]);
                newLayers[key].applyEdits({addFeatures: pointGraphicsAsObject[key]})
                .then((res: any) => {
                    // console.log('Apllied Graphics', res);
                });

                if (layerConfig.showLabels) {
                    newLayers[`${key}-label`] = generateLayer(
                        arcGISModules.FeatureLayer,
                        `${siteInfo.siteId}-${key}-labels`, layerConfig.layerTitle + '-Labels',
                        false, 'OBJECTID', fields, [], 'point', popupTemplateConfig,
                        spatialReferences.output,
                        createBasicRenderer(layerConfig.layerTitle, true),
                        {labelingInfo: [createLabelClass('locSort')]}
                    ) 
                    
                    // console.log('newLayers', newLayers[`${key}-label`]);
                    newLayers[`${key}-label`].applyEdits({addFeatures: pointGraphicsAsObject[key]})
                    .then((res: any) => {
                    // console.log('Apllied Graphics', res);
                    });
                }

                if (layerConfig.referredLayers !== null) {

                    Object.keys(layerConfig.referredLayers!).forEach((refLayerKey: string) => {
                    
                        const referredLayer: ConfigLayerModel = layerConfig.referredLayers![refLayerKey as keyof RenderConfigModel]

                        if (referredLayer.layerType !== 'polygon') {

                            newLayers[refLayerKey] = generateLayer(
                                arcGISModules.FeatureLayer,
                                `${siteInfo.siteId}-${refLayerKey}`, referredLayer.layerTitle,
                                referredLayer.initialVisibility,
                                'OBJECTID', fields, [], 'point',
                                {
                                    ...popupTemplateConfig,
                                    title: referredLayer.layerTitle
                                },
                                spatialReferences.output,
                                createRenderer(refLayerKey, key)
                            )

                            // console.log('Referred Layers', newLayers, refLayerKey, pointGraphicsAsObject);

                            newLayers[refLayerKey].applyEdits({addFeatures: pointGraphicsAsObject[key]})
                            .then((res: any) => {
                            // console.log('RefLAyer Graphics', res);
                            });

                        }

                    })
                }

                layers = {...layers, ...newLayers};
            }

            if (layerConfig.layerType === 'polygon') {
                if (data[key].length) {

                    const aoiPolygonFields: any[] = defaultPolygonFields;

                    const aoiPolygonGraphics: (typeof arcGISModules.Graphic)[] = data[key].map((aoiInfo: any) => {

                        const aoiExtent: typeof arcGISModules.Extent = new arcGISModules.Extent({
                            ...aoiInfo,
                            spatialReference: spatialReferences.input
                        });

                        // console.log('aoiExtent', aoiExtent);

                        return new arcGISModules.Graphic({
                            geometry: arcGISModules.Polygon.fromExtent(aoiExtent),
                            attributes: {
                            aoi: aoiInfo.aoi,
                            maxWidth: aoiExtent.width,
                            maxLength: aoiExtent.height,
                            }
                        });
                    })

                    const aoiLayer: typeof arcGISModules.FeatureLayer = generateLayer(
                        arcGISModules.FeatureLayer,
                        `${siteInfo.siteId}-${key}`,
                        layerConfig.layerTitle, layerConfig.initialVisibility,
                        'OBJECTID', aoiPolygonFields, [], 'polygon', defaultPopupTemplatePolygon,
                        spatialReferences.output,
                        createPolygonRenderer(key, false, data[key])
                    )
                    
                    // console.log('aoiPolygons', aoiPolygonGraphics, aoiLayer);

                    aoiLayer.applyEdits({addFeatures: aoiPolygonGraphics}).then((res: any) => {
                    // console.log('RefLAyer Graphics', res);
                    });

                    layers = {...layers, [key]: aoiLayer};

                    if (layerConfig.showLabels) {
                        const aoiLabelLayer: typeof arcGISModules.FeatureLayer = generateLayer(
                            arcGISModules.FeatureLayer,
                            `${siteInfo.siteId}-${key}-'labels'`,
                            layerConfig.layerTitle + '-Labels', false,
                            'OBJECTID', aoiPolygonFields, [], 'polygon', defaultPopupTemplatePolygon,
                            spatialReferences.output, createPolygonRenderer(key, true),
                            {labelingInfo: [createLabelClass('AOI', 10)]}
                        )
                        
                        aoiLabelLayer
                        .applyEdits({addFeatures: aoiPolygonGraphics})
                        .then((res: any) => {
                            // console.log('RefLAyer Graphics', res);
                        });

                        layers = {...layers, [`${key}-label`]: aoiLabelLayer};
                    }
                }
            }
        }

        return layers;
    }, {})
}