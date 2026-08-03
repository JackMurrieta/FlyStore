import { useNavigate } from "react-router-dom";

import { Breadcrumb } from "./BreadCrumb";
import BackButton from "../../BackButton";
import { useBreadcrumb } from "../../../../hooks/useBreadCrumb";

interface HeaderNavigationProps {
  onBackClick?: () => void;
}

export function HeaderNavigation({ onBackClick }: HeaderNavigationProps) {
  const navigate = useNavigate();

  const breadcrumb = useBreadcrumb();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();

      return;
    }

    navigate(
      breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2].path : "/",
    );
  };

  return (
    <div className="header-navigation">
      <BackButton onClick={handleBack} />

      <Breadcrumb />
    </div>
  );
}
