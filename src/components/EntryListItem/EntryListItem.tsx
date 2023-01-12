import React from "react";
import Moment from 'moment';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import styles from './EntryListItem.module.sass';
import StatusCode, { getClassification, StatusCodeClassification } from "../UI/StatusCode/StatusCode";
import Protocol from "../UI/Protocol/Protocol"
import padlock from "./assets/lock.svg";
import { Summary } from "../UI/Summary/Summary";
import Queryable from "../UI/Queryable/Queryable";
import ingoingIconSuccess from "./assets/ingoing-traffic-success.svg"
import ingoingIconFailure from "./assets/ingoing-traffic-failure.svg"
import ingoingIconNeutral from "./assets/ingoing-traffic-neutral.svg"
import outgoingIconSuccess from "./assets/outgoing-traffic-success.svg"
import outgoingIconFailure from "./assets/outgoing-traffic-failure.svg"
import outgoingIconNeutral from "./assets/outgoing-traffic-neutral.svg"
import { useRecoilState } from "recoil";
import focusedItemAtom from "../../recoil/focusedItem";
import focusedStreamAtom from "../../recoil/focusedStream";
import { Entry } from "./Entry";

interface EntryProps {
  id: string;
  stream: string;
  entry: Entry;
  style: unknown;
  headingMode: boolean;
  namespace?: string;
}

export const EntryItem: React.FC<EntryProps> = ({ id, stream, entry, style, headingMode, namespace }) => {
  const [focusedItem, setFocusedItem] = useRecoilState(focusedItemAtom);
  const [focusedStream, setFocusedStream] = useRecoilState(focusedStreamAtom);
  const isSelected = focusedItem === id;
  const isTcpSelected = focusedStream === stream;

  const classification = getClassification(entry.status)
  let ingoingIcon;
  let outgoingIcon;
  switch (classification) {
  case StatusCodeClassification.SUCCESS: {
    ingoingIcon = ingoingIconSuccess;
    outgoingIcon = outgoingIconSuccess;
    break;
  }
  case StatusCodeClassification.FAILURE: {
    ingoingIcon = ingoingIconFailure;
    outgoingIcon = outgoingIconFailure;
    break;
  }
  case StatusCodeClassification.NEUTRAL: {
    ingoingIcon = ingoingIconNeutral;
    outgoingIcon = outgoingIconNeutral;
    break;
  }
  }

  const isStatusCodeEnabled = ((entry.proto.name === "http" && "status" in entry) || entry.status !== 0);

  const borderStyle = !headingMode && !isSelected && isTcpSelected ? 'dashed' : 'solid';
  const transparentBorder = !headingMode && isTcpSelected ? entry.proto.backgroundColor : 'transparent';

  return <React.Fragment>
    <div
      id={id}
      className={`${styles.row} ${isSelected ? styles.rowSelected : ""}`}
      onClick={() => {
        if (!setFocusedItem) return;
        setFocusedItem(id);
        setFocusedStream(stream);
      }}
      style={{
        border: isSelected && !headingMode ? `1px ${entry.proto.backgroundColor} ${borderStyle}` : `1px ${transparentBorder} ${borderStyle}`,
        position: !headingMode ? "absolute" : "unset",
        top: style['top'],
        marginTop: !headingMode ? style['marginTop'] : "10px",
        width: !headingMode ? "calc(100% - 25px)" : "calc(100% - 18px)",
      }}
    >
      {!headingMode ? <Protocol
        protocol={entry.proto}
        horizontal={false}
      /> : null}
      {entry.tls && <div className={styles.padlock}>
        <Queryable
          query={`tls == "${entry.tls}"`}
          displayIconOnMouseOver={true}
          flipped={false}
          style={{ position: "absolute" }}
        >
          <img src={padlock} alt="Transport Layer Security (TLS)" />
        </Queryable>
      </div>}
      {isStatusCodeEnabled && <div>
        <StatusCode statusCode={entry.status} statusQuery={entry.statusQuery} />
      </div>}
      <div className={styles.endpointServiceContainer}>
        <Summary method={entry.method} methodQuery={entry.methodQuery} summary={entry.summary} summaryQuery={entry.summaryQuery} />
        <div className={styles.resolvedName}>
          <Queryable
            query={`src.name == "${entry.src.name}"`}
            displayIconOnMouseOver={true}
            flipped={true}
            style={{ marginTop: "-4px", overflow: "visible" }}
            iconStyle={!headingMode ? { marginTop: "4px", right: "16px", position: "relative" } :
              entry.proto.name === "http" ? { marginTop: "4px", left: "calc(50vw + 41px)", position: "absolute" } :
                { marginTop: "4px", left: "calc(50vw - 9px)", position: "absolute" }}
          >
            <span
              title="Source Name"
            >
              {entry.src.name ? entry.src.name : "[Unresolved]"}
            </span>
          </Queryable>
          <SwapHorizIcon style={{ color: entry.proto.backgroundColor, marginTop: "-2px", marginLeft: "5px", marginRight: "5px" }}></SwapHorizIcon>
          <Queryable
            query={`dst.name == "${entry.dst.name}"`}
            displayIconOnMouseOver={true}
            flipped={true}
            style={{ marginTop: "-4px" }}
            iconStyle={{ marginTop: "4px", marginLeft: "-2px", right: "11px", position: "relative" }}
          >
            <span
              title="Destination Name">
              {entry.dst.name ? entry.dst.name : "[Unresolved]"}
            </span>
          </Queryable>
        </div>
      </div>

      <div className={styles.separatorRight}>
        {headingMode ? <Queryable
          query={`namespace == "${namespace}"`}
          displayIconOnMouseOver={true}
          flipped={true}
          iconStyle={{ marginRight: "16px" }}
        >
          <span
            className={`${styles.tcpInfo} ${styles.ip}`}
            title="Namespace"
          >
            {`[${namespace}]`}
          </span>
        </Queryable> : null}
        <Queryable
          query={`src.ip == "${entry.src.ip}"`}
          displayIconOnMouseOver={true}
          flipped={true}
          iconStyle={{ marginRight: "16px" }}
        >
          <span
            className={`${styles.tcpInfo} ${styles.ip}`}
            title="Source IP"
          >
            {entry.src.ip}
          </span>
        </Queryable>
        <span className={`${styles.tcpInfo}`} style={{ marginTop: "19px" }}>{entry.src.port ? ":" : ""}</span>
        <Queryable
          query={`src.port == "${entry.src.port}"`}
          displayIconOnMouseOver={true}
          flipped={true}
          iconStyle={{ marginTop: "28px" }}
        >
          <span
            className={`${styles.tcpInfo} ${styles.port}`}
            title="Source Port"
          >
            {entry.src.port}
          </span>
        </Queryable>
        {entry.outgoing ?
          <Queryable
            query={`outgoing == true`}
            displayIconOnMouseOver={true}
            flipped={true}
            iconStyle={{ marginTop: "28px" }}
          >
            <img
              src={outgoingIcon}
              alt="Outgoing traffic"
              title="Outgoing"
            />
          </Queryable>
          :
          <Queryable
            query={`outgoing == false`}
            displayIconOnMouseOver={true}
            flipped={true}
            iconStyle={{ marginTop: "28px" }}
          >
            <img
              src={ingoingIcon}
              alt="Ingoing traffic"
              title="Ingoing"
            />
          </Queryable>
        }
        <Queryable
          query={`dst.ip == "${entry.dst.ip}"`}
          displayIconOnMouseOver={true}
          flipped={false}
          iconStyle={{ marginTop: "30px", right: "35px", position: "relative" }}
        >
          <span
            className={`${styles.tcpInfo} ${styles.ip}`}
            title="Destination IP"
          >
            {entry.dst.ip}
          </span>
        </Queryable>
        <span className={`${styles.tcpInfo}`} style={{ marginTop: "19px" }}>:</span>
        <Queryable
          query={`dst.port == "${entry.dst.port}"`}
          displayIconOnMouseOver={true}
          flipped={false}
        >
          <span
            className={`${styles.tcpInfo} ${styles.port}`}
            title="Destination Port"
          >
            {entry.dst.port}
          </span>
        </Queryable>
      </div>
      <div className={styles.timestamp}>
        <Queryable
          query={`timestamp >= datetime("${Moment(+entry.timestamp)?.utc().format('MM/DD/YYYY, h:mm:ss.SSS A')}")`}
          displayIconOnMouseOver={true}
          flipped={false}
        >
          <span
            title="Timestamp (UTC)"
          >
            {Moment(+entry.timestamp)?.utc().format('MM/DD/YYYY, h:mm:ss.SSS A')}
          </span>
        </Queryable>
      </div>
    </div>
  </React.Fragment>

}
