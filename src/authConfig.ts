export const msalConfig = {
  auth: {
    clientId: "b8de641a-1331-43bd-95cd-2399261c6e75",
    authority: "https://login.microsoftonline.com/5e4e864c-3b82-4180-a515-5c8fb718fff8",
    // Local
    // redirectUri: "http://localhost:5000",
    // Master Appservice Frontend
    // redirectUri: "https://insitetoolmodernui.azurewebsites.net"
    // Develop Appservice Frontend
    redirectUri: "https://ghdinsite.azurewebsites.net"
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  }
};
  
  // Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: ["User.Read"]
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};