import { Auth0Provider } from "@auth0/auth0-react";

export default function AuthProviderWrapper({ children }) {
  return (
    <Auth0Provider
      domain="dev-yhctej43vexumn2g.us.auth0.com"
      clientId="EWc9WtG5pUtVuzYt1RI1KsgiXq7ahcOd"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      {children}
    </Auth0Provider>
  );
}
