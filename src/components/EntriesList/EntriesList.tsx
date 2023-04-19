import React, { useState } from "react";
import styles from './EntriesList.module.sass';
import ScrollableFeedVirtualized from "react-scrollable-feed-virtualized";
import down from "./assets/downImg.svg";
import Moment from "moment";
import { useInterval } from "../../helpers/interval";
import { EntryItem } from "../EntryListItem/EntryListItem";
import { HubBaseUrl } from "../../consts";
import { Entry } from "../EntryListItem/Entry";

interface EntriesListProps {
  entries: Entry[];
  listEntryREF: React.LegacyRef<HTMLDivElement>;
  onSnapBrokenEvent: () => void;
  isSnappedToBottom: boolean;
  setIsSnappedToBottom: (state: boolean) => void;
  scrollableRef: React.MutableRefObject<ScrollableFeedVirtualized>;
}

export const EntriesList: React.FC<EntriesListProps> = ({
  entries,
  listEntryREF,
  onSnapBrokenEvent,
  isSnappedToBottom,
  setIsSnappedToBottom,
  scrollableRef,
}) => {
  const [totalTcpStreams, setTotalTcpStreams] = useState(0);

  const [timeNow, setTimeNow] = useState(new Date());

  useInterval(async () => {
    fetch(`${HubBaseUrl}/pcaps/total-tcp-streams`)
      .then(response => response.ok ? response : response.text().then(err => Promise.reject(err)))
      .then(response => response.json())
      .then(data => setTotalTcpStreams(data.total))
      .catch(err => {
        console.error(err);
      });
  }, 3000, true);

  useInterval(async () => {
    setTimeNow(new Date());
  }, 1000, true);

  return <React.Fragment>
    <div className={styles.list}>
      <div id="list" ref={listEntryREF} className={styles.list}>
        <ScrollableFeedVirtualized ref={scrollableRef} itemHeight={48} marginTop={10} onSnapBroken={onSnapBrokenEvent}>
          {false /* It's because the first child is ignored by ScrollableFeedVirtualized */}
          {entries.map(entry => {
            return <EntryItem
              key={entry.id}
              id={entry.id}
              stream={entry.stream}
              entry={entry}
              style={{}}
              headingMode={false}
            />
          })}
        </ScrollableFeedVirtualized>
        <button type="button"
          title="Snap to bottom"
          className={`${styles.btnLive} ${isSnappedToBottom ? styles.hideButton : styles.showButton}`}
          onClick={() => {
            scrollableRef.current.jumpToBottom();
            setIsSnappedToBottom(true);
          }}>
          <img alt="down" src={down} />
        </button>
      </div>

      <div className={styles.footer}>
        <div>Showing <b id="item-count">{entries.length}</b> items from a total of <b
          id="total-tcp-streams">{totalTcpStreams}</b> TCP/UDP streams
        </div>
        <div>
          UTC:
          <span style={{
            marginLeft: 5,
            marginRight: 5,
            fontWeight: 600
          }}>
            {Moment(timeNow).utc().format('MM/DD/YYYY, h:mm:ss.SSS A')}
          </span>
        </div>
      </div>
    </div>
  </React.Fragment>;
};
