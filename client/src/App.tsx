import "./App.css";
import { AccountList } from "./components/AccountList";
import { useAccounts } from "./hooks/useAccounts";

function App() {
  const accountState = useAccounts();

  switch (accountState.status) {
    case "loading":
      return (
        <div className="loading-state" role="status">
          Loading accounts...
        </div>
      );
    case "error":
      return (
        <div className="error-state" role="alert">
          Error: {accountState.error}
        </div>
      );
    default:
      return <AccountList accounts={accountState.accounts} />;
  }
}

export default App;
