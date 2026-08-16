import { useAuth } from "../../hooks/auth/useAuth";
import { ProfileSection } from "../../components/cuenta/ProfileSection";
import { AddressSection } from "../../components/cuenta/AddressSection";
import { SecuritySection } from "../../components/cuenta/SecuritySection";
import "./CuentaPage.css";

export function CuentaPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="cuenta-page">
      <div className="cuenta-container">
        <h1 className="cuenta-header">MI CUENTA</h1>

        <ProfileSection user={user} />
        <AddressSection user={user} />
        <SecuritySection />
      </div>
    </div>
  );
}
