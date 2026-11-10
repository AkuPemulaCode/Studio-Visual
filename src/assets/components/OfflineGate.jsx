import { useOnlineStatus } from "../hooks/useOnlineStatus";
import OfflineScreen from "./OfflineScreen";

export default function OfflineGate({ children }) {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return <OfflineScreen onRetry={() => window.location.reload()} />;
  }

  return children;
}
