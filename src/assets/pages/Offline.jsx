import OfflineScreen from "../components/OfflineScreen";

export default function Offline() {
  return <OfflineScreen onRetry={() => window.location.reload()} />;
}
