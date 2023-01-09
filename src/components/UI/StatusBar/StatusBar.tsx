import style from './StatusBar.module.sass';
import React, { useState } from "react";
import { useInterval } from "../../../helpers/interval";
import { HubBaseUrl } from "../../../consts";

const pluralize = (noun: string, amount: number) => {
  return `${noun}${amount !== 1 ? 's' : ''}`
}

const uniqueNamespaces = (targets: Target[]) => {
  return [...new Set(targets.map(pod => `[${pod.namespace}]`))];
}

interface Target {
  name: string;
  namespace: string;
}

interface StatusBarContentProps {
  expandedBar: boolean;
  setExpandedBar: (v: boolean) => void;
  targets: Target[];
}

const StatusBarContent: React.FC<StatusBarContentProps> = ({
  expandedBar,
  setExpandedBar,
  targets,
}) => {
  return <div className={`${style.statusBar} ${(expandedBar ? `${style.expandedStatusBar}` : "")}`} onMouseOver={() => setExpandedBar(true)} onMouseLeave={() => setExpandedBar(false)} data-cy="expandedStatusBar">
    <div className={style.podsCount}>
      <span className={style.podsCountText} data-cy="podsCountText">
        {`Targeting ${targets.length} ${pluralize('pod', targets.length)} ${targets.length ? "in" : ""} ${targets.length ? pluralize('namespace', uniqueNamespaces(targets).length) : ""} ${uniqueNamespaces(targets).join(", ")}`}
      </span>
    </div>
    {expandedBar && <div style={{ marginTop: 20 }}>
      <table>
        <thead>
          <tr>
            <th style={{ width: "70%" }}>Pod name</th>
            <th style={{ width: "30%" }}>Namespace</th>
          </tr>
        </thead>
        <tbody>
          {targets.map(pod => <tr key={pod.name}>
            <td style={{ width: "70%" }}>{pod.name}</td>
            <td style={{ width: "30%" }}>{pod.namespace}</td>
          </tr>)}
        </tbody>
      </table>
    </div>}
  </div>;
}

export const StatusBar: React.FC = () => {
  const [expandedBar, setExpandedBar] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);

  useInterval(async () => {
    fetch(`${HubBaseUrl}/pods/targeted`)
      .then(response => response.json())
      .then(data => setTargets(data.targets))
      .catch(err => console.error(err));
  }, 5000, true);

  return <>
    {targets && <StatusBarContent expandedBar={expandedBar} setExpandedBar={setExpandedBar} targets={targets} />}
  </>;
}
