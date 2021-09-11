import './App.scss';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import AppHeaderNav from './components/AppHeaderNav/AppHeaderNav';
import DashboardDraggable from './components/Dashboard-Draggable/DashboardDraggable';
import { APIResponse, SiteAPI, SiteAPIWithShapefileInfo } from './models/APIModels';
import { getSites } from './services/data-service';

function AppRouter() {
  const [sites, setSites]: [SiteAPIWithShapefileInfo[] | undefined, Dispatch<SetStateAction<SiteAPIWithShapefileInfo[] | undefined>>]
  = useState<SiteAPIWithShapefileInfo[]>();

  useEffect(() => {
    getSites().then((data: APIResponse<SiteAPI[]>) => {
      if (data.resultSet.length) {
        setSites([...data.resultSet.map((site: SiteAPI) => ({
          ...site,
          hasShapefile: site.siteId === 1 ? true : false
        }))]);
      } else {
        console.log('No Site Data', data)
      }
    })
    .catch(err => {
      console.log('Error', err)
    });
  }, []);

  return (
    <Router>
      {
        !!sites &&
        <>
          <AppHeaderNav sites={sites}/>
          <Switch>
            <Route exact path='/'>
              <Redirect to='/1'></Redirect>
            </Route>
            <Route exact path='/:siteId' component={DashboardDraggable}></Route>
          </Switch>
        </>
      }
    </Router>
  );
}

export default AppRouter;
