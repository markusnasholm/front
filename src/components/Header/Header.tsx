import React from "react";
import logo from './assets/Kubeshark-logo.svg';
import './Header.sass';
import * as UI from "../UI"
import Moment from 'moment';

interface HeaderProps {
  licenseEdition: string;
  licenseExpired: boolean;
  licenseEnd: number;
  licenseCurrentNodeCount: number;
  licenseNodeLimit: number;
}

export const Header: React.FC<HeaderProps> = ({ licenseEdition, licenseExpired, licenseEnd, licenseCurrentNodeCount, licenseNodeLimit }) => {
  return <div className="header">
    <div style={{ display: "flex", alignItems: "center" }}>
      <img className="logo" src={logo} alt="logo" />
      <div className="title">Kubeshark</div>
      <div className="description">Traffic analyzer for Kubernetes</div>
      <div className="edition" title={licenseEdition === "community" || licenseExpired ? "" : Moment(+licenseEnd)?.utc().format('MM/DD/YYYY, h:mm:ss.SSS A')}>({licenseEdition} Edition)</div>
      {licenseExpired && <div className="extra" title={Moment(+licenseEnd)?.utc().format('MM/DD/YYYY, h:mm:ss.SSS A')}>License expired!</div>}
      {licenseEdition !== "community" && !licenseExpired && <div className={`extra ${licenseCurrentNodeCount > licenseNodeLimit ? "failure" : "success" }`} title={`${licenseCurrentNodeCount > licenseNodeLimit ? `You are missing traffic from ${licenseCurrentNodeCount - licenseNodeLimit} nodes!` : "OK." }`}>{`Node limit: ${licenseCurrentNodeCount}/${licenseNodeLimit}`}</div>}
    </div>
    <div style={{ display: "flex", alignItems: "center" }}>
      <UI.InformationIcon />
    </div>
  </div>;
}
