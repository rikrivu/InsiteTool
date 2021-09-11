import { LayoutConfig, ResponsiveGridLayoutDimensions, ResponsiveGridProps } from '../../models/AppDashboardModels';

// Const Grid dimensions object for responsive design and creating the layout
export const initialGridDimensions: ResponsiveGridLayoutDimensions = {
    widths: {
        xlg: {x: 0},
        lg: {x: 0},
        md: {x: 0},
        sm: {x: 0},
        xs: {x: 0},
        xxs: {x: 0}
    },
    y: 0
}

// Default grid props for responsive layouting
export const gridProps: ResponsiveGridProps = {
    breakpoints: {xlg: 1366, lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0},
    cols: {xlg: 110, lg: 96, md: 80, sm: 48, xs: 32, xxs: 16},
    rowHeight: 0.36,
    autoSize: true,
    isBounded: true,
    margin: [5, 5]
}

// Config consist of an array of objects each corresponding to one row in the layout
// the 'components' key in these objects are array of objects themselves
// each object in components array correspond to one cell in the row
// cells can be standalone components. In such a case they will be objects 
// if the cells are grid themselves then they will array of objects just like originial config array
// eg. last cell in the second row is a grid itself and hence it is an array instead of object
export const defaultLayoutConfig: LayoutConfig[] = [
    {
        components: [
            {
                component: 'GlobalFilter',
                componentID: 'GlobalFilter',
                tabs: [
                    {
                        tabName: 'Filter',
                        truncatedName: 'Filter',
                        title: '',
                    }
                ],
                isDashboard: false,
                maximizable: true,
                isDraggable: true,
                minWidth: {
                    rowsOrCols: 13,
                    percentValue: 15
                },
                maxWidth: {
                    rowsOrCols: 24,
                    percentValue: 25
                },
                defaultWidth: {
                    rowsOrCols: 16,
                    percentValue: 16
                },
                minHeight: {
                    rowsOrCols: 60,
                    percentValue: 60
                },
                maxHeight: {
                    rowsOrCols: 74,
                    percentValue: 74
                }
            },
            {
                component: 'WebMap',
                componentID: 'WebMap',
                tabs: [],
                isDashboard: false,
                maximizable: true,
                isDraggable: true,
                minWidth: {
                    rowsOrCols: 24,
                    percentValue: 25
                },
                maxWidth: {
                    rowsOrCols: 72,
                    percentValue: 75
                },
                defaultWidth: {
                    rowsOrCols: 50,
                    percentValue: 52
                },
                minHeight: {
                    rowsOrCols: 46,
                    percentValue: 46
                },
                maxHeight: {
                    rowsOrCols: 75,
                    percentValue: 75
                },
                loaderPosition: 'br-loader'
            },
            {
                component: 'TopRightChartsCard',
                componentID: 'TopRightChartsCard',
                tabs: [
                    {
                        tabName: 'POI',
                        truncatedName: 'POI',
                        valueAccessor: 'POI',
                        title: 'Nearest Points of Interest',
                        complexComponent: {
                            componentType: 'chart',
                            chartType: 'horizontal-bar',
                            filters: ['Horizontal Axis', 'Vertical Axis'],
                            chartParams: {
                                xAxisDataKey: 'distMi',
                                yAxisDataKey: 'mergeSrc',
                                xAxisLabel: 'Closest Distance (mi)',
                                yAxisLabel: 'Point of Interest',
                                labelOffset: 65,
                                barColor: 'var(--color-graph-blue)'
                            }
                        },
                    },
                    {
                        tabName: 'Wetlands',
                        truncatedName: 'Wetlands',
                        valueAccessor: 'wetlands',
                        title: 'Nearest Wetlands',
                        complexComponent: {
                            componentType: 'chart',
                            chartType: 'horizontal-bar',
                            filters: ['Horizontal Axis', 'Vertical Axis'],
                            chartParams: {
                                xAxisDataKey: 'distMi',
                                yAxisDataKey: 'wetLandTY',
                                xAxisLabel: 'Closest Distance (mi)',
                                yAxisLabel: 'Wetland Type',
                                labelOffset: 65,
                                barColor: 'var(--color-graph-blue)'
                            }
                        }
                    },
                    {
                        tabName: 'Waterwells',
                        truncatedName: 'Waterwells',
                        valueAccessor: 'waterwells',
                        title: 'Water Wells near Site',
                        complexComponent: {
                            componentType: 'chart',
                            chartType: 'horizontal-bar',
                            filters: ['Horizontal Axis', 'Vertical Axis'],
                            chartParams: {
                                xAxisDataKey: 'count',
                                yAxisDataKey: 'ranges',
                                xAxisLabel: 'Number of Water Wells',
                                yAxisLabel: 'Distance from Site (mi)',
                                labelOffset: 65,
                                barColor: 'var(--color-graph-light-blue)'
                            }
                        }
                    },
                    {
                        tabName: 'Documents',
                        truncatedName: 'Documents',
                        valueAccessor: 'documents',
                        title: '',
                    },
                    {
                        tabName: 'Legend',
                        truncatedName: 'Legend',
                        valueAccessor: 'legend',
                        title: '',
                    },
                    {
                        tabName: '3D Visualization',
                        truncatedName: '3D Visualization',
                        valueAccessor: '3DViz',
                        title: '',
                        complexComponent: {
                            componentType: 'iframe'
                        },
                    },
                    {
                        tabName: 'RGB Map',
                        truncatedName: 'RGB Map',
                        valueAccessor: 'rgbMap',
                        title: '',
                        complexComponent: {
                            componentType: 'iframe'
                        }
                    },
                    {
                        tabName: 'RGB Model',
                        truncatedName: 'RGB Model',
                        valueAccessor: 'rgbModel',
                        title: '',
                        complexComponent: {
                            componentType: 'iframe'
                        }
                    },
                    {
                        tabName: 'IR Greyscale Map',
                        truncatedName: 'IR Greyscale Map',
                        valueAccessor: 'irGreyscaleMap',
                        title: '',
                        complexComponent: {
                            componentType: 'iframe'
                        }
                    },
                    {
                        tabName: 'RGB Video',
                        truncatedName: 'RGB Video',
                        valueAccessor: 'rgbVideo',
                        title: '',
                        complexComponent: {
                            componentType: 'iframe'
                        }
                    },
                    {
                        tabName: 'IR Video',
                        truncatedName: 'IR Video',
                        valueAccessor: 'irVideo',
                        title: '',
                        complexComponent: {
                            componentType: 'iframe'
                        }
                    }
                ],
                isDashboard: false,
                maximizable: true,
                isDraggable: true,
                emitterName: 'current_tab_topRightChartsCard',
                minWidth: {
                    rowsOrCols: 20,
                    percentValue: 21
                },
                minHeight: {
                    rowsOrCols: 33,
                    percentValue: 33
                }
            }
        ],
        defaultHeight: {
            rowsOrCols: 62,
            percentValue: 62
        }
    },
    {
        components: [
            {
                component: 'MatrixMethods',
                componentID: 'MatrixMethods',
                tabs: [
                    {
                        tabName: 'Matrixes',
                        truncatedName: 'Matrixes',
                        title: 'Matrixes',
                        complexComponent: {
                            componentType: 'chart',
                            chartType: 'doughnut',
                            filters: ['Data Labels'],
                            chartParams: {
                                xAxisDataKey: 'count',
                                yAxisDataKey: 'matrixCode'
                            }
                        }
                    },
                    {
                        tabName: 'Methods',
                        truncatedName: 'Methods',
                        title: 'Methods',
                        complexComponent: {
                            componentType: 'chart',
                            chartType: 'doughnut',
                            filters: ['Data Labels'],
                            chartParams: {
                                xAxisDataKey: 'count',
                                yAxisDataKey: 'analysisMethod'
                            }
                        }
                    },
                    {
                        tabName: 'Chemicals',
                        truncatedName: 'Chemicals',
                        title: 'Chemicals',
                        complexComponent: {
                            componentType: 'chart',
                            chartType: 'doughnut',
                            filters: ['Data Labels'],
                            chartParams: {
                                xAxisDataKey: 'count',
                                yAxisDataKey: 'chemical'
                            }
                        }
                    }
                ],
                isDashboard: false,
                maximizable: true,
                isDraggable: true,
                emitterName: 'current_tab_matrix_methods',
                minWidth: {
                    rowsOrCols: 13,
                    percentValue: 15
                },
                maxWidth: {
                    rowsOrCols: 40,
                    percentValue: 0
                },
                defaultWidth: {
                    rowsOrCols: 16,
                    percentValue: 16
                },
                minHeight: {
                    rowsOrCols: 28,
                    percentValue: 28
                }
            },
            {
                component: 'TopChemSoilPlots',
                componentID: 'TopChemSoilPlots',
                tabs: [
                    {
                        tabName: 'Top Chemicals',
                        truncatedName: 'TopChem',
                        title: 'Top Chemicals by Average Detected Result',
                        complexComponent: {
                            componentType: 'chart',
                            chartType: 'brush-bar',
                            filters: ['Horizontal Axis', 'Vertical Axis']
                        }
                    },
                    {
                        tabName: 'Soil Plots',
                        truncatedName: 'Soil Plots',
                        title: '',
                        complexComponent: {
                            componentType: 'chart',
                            chartType: 'stacked-bar'
                        }
                    },
                    {
                        tabName: 'Time Series',
                        truncatedName: 'Time Series',
                        title: '',
                        complexComponent: {
                            componentType: 'chart',
                            chartType: 'multi-line',
                            chartOptions: [
                                [{id: 'true', name: 'True'}, {id: 'false', name: 'False'}],
                                [
                                    {id: 'gaps', name: 'Gaps'}, {id: '0', name: '0'},
                                    {id: 'half', name: 'Half'}, {id: 'equal', name: 'Equal'}
                                ]
                            ]
                        }
                    }
                ],
                isDashboard: false,
                maximizable: true,
                isDraggable: true,
                emitterName: 'current_tab_topChemSoilPlots',
                minWidth: {
                    rowsOrCols: 28,
                    percentValue: 30
                },
                maxWidth: {
                    rowsOrCols: 72,
                    percentValue: 0
                },
                defaultWidth: {
                    rowsOrCols: 50,
                    percentValue: 52
                },
                minHeight: {
                    rowsOrCols: 30,
                    percentValue: 30
                }
            },
            [
                {
                    components: [
                        {
                            component: 'SiteSummaryCard',
                            componentID: 'AreaLoc',
                            tabs: [
                                {
                                    tabName: 'Area',
                                    truncatedName: 'Area',
                                    valueAccessor: 'area',
                                    title: '',
                                    ssCardTabDisplay: 'Site Area (Acres)',
                                    valueType: 'number'
                                },
                                {
                                    tabName: 'Number of Locations',
                                    truncatedName: 'NumLoc',
                                    valueAccessor: 'noOfLocations',
                                    title: '',
                                    ssCardTabDisplay: 'Number of Locations',
                                    valueType: 'number'
                                }
                            ],
                            isDashboard: false,
                            maximizable: true,
                            isDraggable: true,
                            emitterName: 'current_tab_site_summary_area_loc',
                            minWidth: {
                                rowsOrCols: 10,
                                percentValue: 10
                            },
                            maxWidth: {
                                rowsOrCols: 18,
                                percentValue: 19
                            },
                            minHeight: {
                                rowsOrCols: 15,
                                percentValue: 30
                            },
                            maxHeight: {
                                rowsOrCols: 70,
                                percentValue: 70
                            }
                        },
                        {
                            component: 'SiteSummaryCard',
                            componentID: 'AOI',
                            tabs: [
                                {
                                    tabName: 'Area(s) of Interest',
                                    truncatedName: 'AOIs',
                                    valueAccessor: 'noOfAOI',
                                    title: '',
                                    ssCardTabDisplay: 'Number of AOIs',
                                    valueType: 'number'
                                }
                            ],
                            isDashboard: false,
                            maximizable: true,
                            isDraggable: true,
                            emitterName: 'current_tab_aoi',
                            minWidth: {
                                rowsOrCols: 10,
                                percentValue: 10
                            },
                            maxWidth: {
                                rowsOrCols: 18,
                                percentValue: 19
                            },
                            minHeight: {
                                rowsOrCols: 15,
                                percentValue: 30
                            },
                            maxHeight: {
                                rowsOrCols: 70,
                                percentValue: 70
                            }
                        },
                    ]
                },
                {
                    components: [
                        {
                            component: 'SiteSummaryCard',
                            componentID: 'Targeted',
                            tabs: [
                                {
                                    tabName: 'Targeted',
                                    truncatedName: 'Targeted',
                                    valueAccessor: 'noOfChemicalsTestedFor',
                                    title: '',
                                    ssCardTabDisplay: 'Chemicals Targeted',
                                    valueType: 'number'
                                }
                            ],
                            isDashboard: false,
                            maximizable: true,
                            isDraggable: true,
                            emitterName: 'current_tab_targeted',
                            minWidth: {
                                rowsOrCols: 10,
                                percentValue: 10
                            },
                            maxWidth: {
                                rowsOrCols: 18,
                                percentValue: 19
                            },
                            minHeight: {
                                rowsOrCols: 15,
                                percentValue: 30
                            },
                            maxHeight: {
                                rowsOrCols: 70,
                                percentValue: 70
                            }
                        },
                        {
                            component: 'SiteSummaryCard',
                            componentID: 'PercDetect',
                            tabs: [
                                {
                                    tabName: 'Percent Detectection',
                                    truncatedName: 'PercDetect',
                                    valueAccessor: 'percentDetections',
                                    title: '',
                                    ssCardTabDisplay: 'Overall Detection Rate',
                                    valueType: 'percent'
                                }
                            ],
                            isDashboard: false,
                            maximizable: true,
                            isDraggable: true,
                            emitterName: 'current_tab_perc_detect',
                            minWidth: {
                                rowsOrCols: 10,
                                percentValue: 10
                            },
                            maxWidth: {
                                rowsOrCols: 18,
                                percentValue: 19
                            },
                            minHeight: {
                                rowsOrCols: 15,
                                percentValue: 30
                            },
                            maxHeight: {
                                rowsOrCols: 70,
                                percentValue: 70
                            }
                        }
                    ]
                }
            ]
        ],
    },
];