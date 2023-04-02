import React, { useState, useCallback, useEffect, useMemo } from "react"
import SectionsRepresentation from "./SectionsRepresentation";
import Kubernetes, { Resolution } from "./Kubernetes";
import styles from './EntryViewer.module.sass';
import { Tabs } from "../../UI";

export enum TabsEnum {
  Request = 0,
  Response = 1,
  Kubernetes = 2
}

interface AutoRepresentationProps {
  representation: string;
  source: Resolution;
  destination: Resolution;
  color: string;
  openedTab?: TabsEnum;
}

export const AutoRepresentation: React.FC<AutoRepresentationProps> = ({ representation, source, destination, color, openedTab = TabsEnum.Request }) => {
  const { request, response } = JSON.parse(representation);

  const TABS = useMemo(() => {
    const arr = [
      {
        tab: 'Request',
        badge: null
      },
      {
        tab: 'Response',
        badge: null
      },
      {
        tab: 'Kubernetes',
        badge: null
      }
    ]

    return arr
  }, [response]);

  const [currentTab, setCurrentTab] = useState(TABS[0].tab);

  const getOpenedTabIndex = useCallback(() => {
    const currentIndex = TABS.findIndex(current => current.tab === currentTab)
    return currentIndex > -1 ? currentIndex : 0
  }, [TABS, currentTab])

  useEffect(() => {
    if (openedTab) {
      setCurrentTab(TABS[openedTab].tab)
    }
  }, [])

  // Don't fail even if `representation` is an empty string
  if (!representation) {
    return <React.Fragment></React.Fragment>;
  }

  return <div className={styles.Entry}>
    {<div className={styles.body}>
      <div className={styles.bodyHeader}>
        <Tabs tabs={TABS} currentTab={currentTab} color={color} onChange={setCurrentTab} leftAligned />
      </div>
      {getOpenedTabIndex() === TabsEnum.Request && <React.Fragment>
        <SectionsRepresentation data={request} color={color} />
      </React.Fragment>}
      {response && response.length > 0 && getOpenedTabIndex() === TabsEnum.Response && <React.Fragment>
        <SectionsRepresentation data={response} color={color} />
      </React.Fragment>}
      {getOpenedTabIndex() === TabsEnum.Kubernetes && <React.Fragment>
        <Kubernetes source={source} destination={destination} color={color} />
      </React.Fragment>}
      <div style={{height: "50px"}}></div>
    </div>}
  </div>;
}
