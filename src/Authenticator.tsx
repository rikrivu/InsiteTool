import { useIsAuthenticated } from "@azure/msal-react";
import { SignInButton } from './components/AzureSigniIn/SignInButton';
import { SignOutButton } from './components/AzureSigniIn/SignOutButton';

/**
 * Renders the navbar component with a sign-in button if a user is not authenticated
 */
const Authenticator = (props: any) => {
    const isAuthenticated = useIsAuthenticated();

    return (
        <>
            { isAuthenticated ?
            <SignOutButton />: <SignInButton /> }
            {props.children}
        </>
    );
};

export default Authenticator;