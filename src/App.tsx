import './App.scss';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";

import AppRouter from './AppRouter';
import Authenticator from './Authenticator';

function App() {

  return (
    <Authenticator>
      <AuthenticatedTemplate>
          {/* <p>You are signed in!</p> */}
        <AppRouter/>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
          <p>You are not signed in! Please sign in.</p>
      </UnauthenticatedTemplate>
  </Authenticator>
  );
}

export default App;
