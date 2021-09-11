import { useMsal } from "@azure/msal-react";
import { IPublicClientApplication } from "@azure/msal-browser";
import { getIcon } from "../../utils/globalUtilityMethods";
import CustomTooltip from "../shared/CustomTooltip/CustomTooltip";

function handleLogout(instance: IPublicClientApplication) {
    // instance.logoutPopup().catch(e => {
    //     console.error(e);
    // });
    instance.logoutRedirect().catch(e => {
        console.error(e);
    });
}

/**
 * Renders a button which, when selected, will open a popup for logout
 */
export const SignOutButton = () => {
    const { instance } = useMsal();

    return (
        <CustomTooltip title="Sign Out">
            <button className="sign-out icon-btn" onClick={() => handleLogout(instance)}>
                {getIcon('signout')}
            </button>
        </CustomTooltip>
    );
}