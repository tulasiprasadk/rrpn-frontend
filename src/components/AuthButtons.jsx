import { useAuth0 } from "@auth0/auth0-react";

export default function AuthButtons() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  if (!isAuthenticated) {
    return <button onClick={() => loginWithRedirect()}>Login with Google</button>;
  }
  return (
    <div>
      <span>{user?.name}</span>
      <button onClick={() => logout({ returnTo: window.location.origin })}>Logout</button>
    </div>
  );
}



