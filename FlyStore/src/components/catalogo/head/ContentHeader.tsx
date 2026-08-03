import React from "react";
import HorizontalList from "./HorizontalList";
import BackButton from "./BackButton";
import FlyLogo from "../head/FlyLogo";

import type { ContentHeaderProps } from "./types";

import "./ContentHeader.css";

const ContentHeader: React.FC<ContentHeaderProps> = ({
  nombreCatalogo,
  subCatalogo,
  mensajeGenerico,
  listaDatos,
  onBackClick,
}) => {
  return (
    <section className="content-header">

      <header className="content-header__top">

        <BackButton onClick={onBackClick} />

        <div className="content-header__breadcrumb">

          <FlyLogo />

          <div>

            <span className="sec-eyebrow">
              {nombreCatalogo}
              {subCatalogo && ` / ${subCatalogo}`}
            </span>

          </div>

        </div>

      </header>

      <p className="content-header__description sec-desc">
        {mensajeGenerico}
      </p>

      <HorizontalList data={listaDatos} />

    </section>
  );
};

export default ContentHeader;