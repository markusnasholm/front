import React from "react";
import logo from './assets/Kubeshark-logo.svg';
import './Header.sass';
import * as UI from "../UI"
import Moment from 'moment';

interface HeaderProps {
  licenseEdition: string;
  licenseExpired: boolean;
  licenseEnd: number;
}

export const Header: React.FC<HeaderProps> = ({ licenseEdition, licenseExpired, licenseEnd }) => {
  return <div className="header">
    <div style={{ display: "flex", alignItems: "center" }}>
      <img className="logo" src={logo} alt="logo" />
      <div className="title">Kubeshark</div>
      <div className="description">Traffic viewer for Kubernetes</div>
      <div className="edition" title={licenseEdition === "community" || licenseExpired ? "" : Moment(+licenseEnd)?.utc().format('MM/DD/YYYY, h:mm:ss.SSS A')}>({licenseEdition} Edition)</div>
      {licenseExpired && <div className="expired" title={Moment(+licenseEnd)?.utc().format('MM/DD/YYYY, h:mm:ss.SSS A')}>License expired!</div>}
    </div>
    <div style={{ display: "flex", alignItems: "center" }}>
      <UI.InformationIcon />
    </div>
  </div>;
}
