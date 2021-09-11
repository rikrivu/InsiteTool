import './IframeTab.scss';
import { LayoutConfigComponentTab, LoaderType } from '../../../../models/AppDashboardModels';
import { Dispatch, SetStateAction } from 'react';

const iframes: any = {
    '3DViz':  `<div class="sketchfab-embed-wrapper">
    <iframe title="A 3D model" src="https://sketchfab.com/models/0fe89fd44d2140878d433ad5c39894db/embed?autospin=0.2&amp;autostart=1&amp;preload=1&amp;ui_controls=1&amp;ui_infos=1&amp;ui_inspector=1&amp;ui_stop=1&amp;ui_watermark=1&amp;ui_watermark_link=1" frameborder="0" allow="autoplay; fullscreen; vr" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>
    <p style="font-size: 13px; font-weight: normal; margin: 5px; color: #4A4A4A;">
    <a href="https://sketchfab.com/3d-models/day-4-lif-0fe89fd44d2140878d433ad5c39894db?utm_medium=embed&utm_source=website&utm_campaign=share-popup" target="_blank" style="font-weight: bold; color: #1CAAD9;">Day 4 LIF</a>
    by <a href="https://sketchfab.com/DetroitGHD?utm_medium=embed&utm_source=website&utm_campaign=share-popup" target="_blank" style="font-weight: bold; color: #1CAAD9;">GHD IDS</a>
    on <a href="https://sketchfab.com?utm_medium=embed&utm_source=website&utm_campaign=share-popup" target="_blank" style="font-weight: bold; color: #1CAAD9;">Sketchfab</a>
    </p>
    </div>`,
    rgbMap: `<iframe src="https://cloud.pix4d.com/project/embed/518958-f3b113a13a2c4f97838b0dce9c834456/" frameborder="0" allowfullscreen></iframe>`,
    rgbModel: `<iframe src="https://cloud.pix4d.com/embed/pro/mesh/518958?shareToken=f3b113a13a2c4f97838b0dce9c834456" frameborder="0" allowfullscreen></iframe>`,
    irGreyscaleMap: `<iframe src="https://cloud.pix4d.com/project/embed/521688-4614bec05c38416584847cb0c1a492cb/" frameborder="0" allowfullscreen></iframe>`,
    rgbVideo: `<iframe src="https://player.vimeo.com/video/350098860" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
    irVideo: `<iframe src="https://player.vimeo.com/video/350125120" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`
};

function IframeTab (props: {
    tab: LayoutConfigComponentTab,
    isMaximized: boolean,
    setLoader: Dispatch<SetStateAction<LoaderType>> | undefined,
    loaderPosition: 'default-loader' | 'br-loader' | 'tr-loader'
}) {

    return <div className="iFrame-container app-scroll" dangerouslySetInnerHTML={{ __html: iframes[props.tab.valueAccessor!] }}></div>;
}

export default IframeTab;