import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { APIResponse, SiteAPI, SiteAPIWithShapefileInfo, SiteSummaryAPI } from '../../models/APIModels';
import { getSiteSummaryData } from '../../services/data-service';
import { globalStore, GlobalStoreState } from '../../stores/GlobalStore/GlobalStore';
import './AppHeaderNav.scss';

function AppHeaderNav (props: {sites: SiteAPIWithShapefileInfo[]}): JSX.Element {

    const siteId: string = useLocation().pathname.replace('/', '');

    const [selectedSiteID, setSelectedSiteID]: [number, Dispatch<SetStateAction<number>>]
    = useState<number>(siteId ? parseInt(siteId) : 1);

    const history = useHistory();

    const globalState: GlobalStoreState = useContext<GlobalStoreState>(globalStore);
    const { dispatch } = globalState;

    // console.log('Params', siteId, selectedSiteID)

    useEffect((): void => {
        if (props.sites?.length) {
        dispatch((prev: GlobalStoreState) => ({
            ...prev,
            actions: [
                {
                    type: 'siteInfo',
                    data: {...props.sites?.find((site: SiteAPIWithShapefileInfo) => site.siteId === selectedSiteID)}
                }
            ]
        }));
        }
    }, [dispatch, props.sites, selectedSiteID])

    useEffect(() => {
        getSiteSummaryData(selectedSiteID).then((data: APIResponse<[SiteSummaryAPI]>) => {
            if (data.resultSet.length) {
                const ssData: SiteSummaryAPI = {...data.resultSet[0]}
                dispatch((prev: GlobalStoreState) => ({
                    ...prev,
                    actions: [
                        {
                            type: 'siteSummaryDashboardData',
                            data: {...ssData}
                        }
                    ]
                }));
            }
        })
        .catch(err => {
            console.log('API Call Aborted or Other error', err);
        });
    }, [dispatch, selectedSiteID]) 

    const navigateToSite = useCallback((change: any) => {
        console.log('Change', change, selectedSiteID);
        setSelectedSiteID(parseInt(change.target.value));
        history.push('/' + change.target.value);
    }, [history, selectedSiteID])

    return (
        <div className="header-nav">
            <div className="ghd-logo-container">
                <div>
                    <img src="./InSiteLogo.png" alt="InSiteLogo.png"/>
                </div>
            </div>
            <div className="company-info">by GHD digital</div>
            {
                props.sites?.length ?
                <div className="select-site">
                    <label htmlFor="site-selector">Site Code</label>
                    <select id="site-selector" onChange={navigateToSite} value={selectedSiteID}>
                        {props.sites.map((site: SiteAPI) => (
                            <option key={site.siteId} value={site.siteId}>{site.siteCode}</option>
                        ))}
                    </select>
                </div>
                : null
            }
        </div>
    );
}

export default AppHeaderNav;