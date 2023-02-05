import React, { useCallback, useEffect, useRef, useState } from "react";
import { Filters } from "../Filters/Filters";
import { EntriesList } from "../EntriesList/EntriesList";
import makeStyles from '@mui/styles/makeStyles';
import TrafficViewerStyles from "./TrafficViewer.module.sass";
import styles from '../EntriesList/EntriesList.module.sass';
import { EntryDetailed } from "../EntryDetailed/EntryDetailed";
import playIcon from "./assets/run.svg";
import pauseIcon from "./assets/pause.svg";
import variables from '../../variables.module.scss';
import { useRecoilState, useSetRecoilState } from "recoil";
import focusedItemAtom from "../../recoil/focusedItem";
import focusedStreamAtom from "../../recoil/focusedStream";
import { StatusBar } from "../UI/StatusBar/StatusBar";
import { useInterval } from "../../helpers/interval";
import queryAtom from "../../recoil/query";
import queryBuildAtom from "../../recoil/queryBuild";
import queryBackgroundColorAtom from "../../recoil/queryBackgroundColor";
import { toast } from "react-toastify";
import { HubWsUrl, ColorYellow } from "../../consts"
import { Entry } from "../EntryListItem/Entry";
import { useNavigate, useSearchParams } from "react-router-dom";

const useLayoutStyles = makeStyles(() => ({
  details: {
    flex: "0 0 50%",
    width: "45vw",
    padding: "12px 24px",
    borderRadius: 4,
    marginTop: 15,
    background: variables.headerBackgroundColor,
  },

  viewer: {
    display: "flex",
    overflowY: "auto",
    height: "calc(100% - 70px)",
    padding: 5,
    paddingBottom: 0,
    overflow: "auto",
  },
}));

interface TrafficViewerProps {
  entries: Entry[];
  setEntries: React.Dispatch<React.SetStateAction<Entry[]>>;
  setLastUpdated: React.Dispatch<React.SetStateAction<number>>;
  getLicense: () => void;
  actionButtons?: JSX.Element,
}

const DEFAULT_QUERY = window.__RUNTIME_CONFIG__.REACT_APP_DEFAULT_FILTER ? window.__RUNTIME_CONFIG__.REACT_APP_DEFAULT_FILTER.trim() : "timestamp >= now()" ;

export const TrafficViewer: React.FC<TrafficViewerProps> = ({ entries, setEntries, setLastUpdated, getLicense, actionButtons }) => {

  const classes = useLayoutStyles();
  const setFocusedItem = useSetRecoilState(focusedItemAtom);
  const setFocusedStream = useSetRecoilState(focusedStreamAtom);
  const [query, setQuery] = useRecoilState(queryAtom);
  const setQueryBuild = useSetRecoilState(queryBuildAtom);
  const setQueryBackgroundColor = useSetRecoilState(queryBackgroundColorAtom);
  const [isSnappedToBottom, setIsSnappedToBottom] = useState(true);
  const [wsReadyState, setWsReadyState] = useState(0);
  const [searchParams] = useSearchParams();

  const entriesBuffer = useRef([] as Entry[]);

  const scrollableRef = useRef(null);
  const ws = useRef(null);
  const queryRef = useRef(null);
  queryRef.current = query;

  const navigate = useNavigate();

  useEffect(() => {
    const querySearchParam = searchParams.get("q");
    if (querySearchParam !== null) {
      setQueryBuild(querySearchParam);
      setQuery(querySearchParam);
    } else {
      setQueryBuild(DEFAULT_QUERY);
      setQuery(DEFAULT_QUERY);
      navigate({ pathname: location.pathname, search: `q=${encodeURIComponent(DEFAULT_QUERY)}` });
      setQueryBackgroundColor(ColorYellow);
    }

    let init = false;
    if (!init) openWebSocket();
    return () => { init = true; }
  }, []);

  const closeWebSocket = useCallback((code: number) => {
    ws.current.close(code);
  }, [ws]);

  const sendQueryWhenWsOpen = () => {
    setTimeout(() => {
      if (ws?.current?.readyState === WebSocket.OPEN) {
        ws.current.send(queryRef.current);
      } else {
        sendQueryWhenWsOpen();
      }
    }, 500);
  };

  const listEntry = useRef(null);
  const openWebSocket = () => {
    setFocusedItem(null);
    entriesBuffer.current.length = 0;
    setEntries([]);
    setLastUpdated(Date.now());

    try {
      ws.current = new WebSocket(HubWsUrl);
      sendQueryWhenWsOpen();

      ws.current.onopen = () => {
        setWsReadyState(ws?.current?.readyState);
        toast.success("Connected to Hub.", {
          theme: "colored",
          autoClose: 1000,
        });
        getLicense();
      }

      ws.current.onclose = (e) => {
        setWsReadyState(ws?.current?.readyState);
        let delay = 3000;
        let msg = "Trying to reconnect...";

        // 4001 is a custom code, meaning don't try to reconnect.
        switch (e.code) {
        case 1000:
          delay = 100;
          msg = "Connecting with the new filter..."
          break;
        case 1006:
          toast.warning("Workers are down!", {
            theme: "colored",
            autoClose: 1000,
          });
          break;
        case 4001:
          return;
        default:
          break;
        }

        toast.info(msg, {
          theme: "colored",
          autoClose: 1000,
        });

        setTimeout(() => {
          openWebSocket();
        }, delay);
      }

      ws.current.onerror = (err) => {
        console.error("WebSocket error:", err);
        toast.error("Hub is down!", {
          theme: "colored",
          autoClose: 1000,
        });
        if (ws?.current?.readyState === WebSocket.OPEN) {
          ws.current.close();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleConnection = useCallback(async () => {
    if (ws?.current?.readyState === WebSocket.OPEN) {
      closeWebSocket(4001);
    } else {
      openWebSocket();
    }
    scrollableRef.current.jumpToBottom();
    setIsSnappedToBottom(true);
  }, [scrollableRef, setIsSnappedToBottom, closeWebSocket]);

  const reopenConnection = useCallback(async () => {
    closeWebSocket(1000);
    scrollableRef.current.jumpToBottom();
    setIsSnappedToBottom(true);
  }, [scrollableRef, setIsSnappedToBottom, closeWebSocket]);

  useEffect(() => {
    return () => {
      if (ws?.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  const getConnectionIndicator = () => {
    switch (wsReadyState) {
    case WebSocket.OPEN:
      return <div
        className={`${TrafficViewerStyles.indicatorContainer} ${TrafficViewerStyles.greenIndicatorContainer}`}>
        <div className={`${TrafficViewerStyles.indicator} ${TrafficViewerStyles.greenIndicator}`} />
      </div>
    default:
      return <div
        className={`${TrafficViewerStyles.indicatorContainer} ${TrafficViewerStyles.redIndicatorContainer}`}>
        <div className={`${TrafficViewerStyles.indicator} ${TrafficViewerStyles.redIndicator}`} />
      </div>
    }
  }

  const getConnectionTitle = () => {
    switch (wsReadyState) {
    case WebSocket.OPEN:
      return "streaming live traffic"
    default:
      return "streaming paused";
    }
  }

  const onSnapBrokenEvent = () => {
    setIsSnappedToBottom(false);
  }

  if (ws.current && !ws.current.onmessage) {
    ws.current.onmessage = (e) => {
      if (!e?.data) return;
      const entry = JSON.parse(e.data);

      if (entriesBuffer.current.length === 0) {
        setFocusedItem(entry.id);
        setFocusedStream(entry.stream);
      }

      entriesBuffer.current.push(entry);
    }
  }

  useInterval(async () => {
    setEntries(entriesBuffer.current);
    setLastUpdated(Date.now());
  }, 500, true);

  return (
    <div className={TrafficViewerStyles.TrafficPage}>
      <StatusBar />
      <div className={TrafficViewerStyles.TrafficPageHeader}>
        <div className={TrafficViewerStyles.TrafficPageStreamStatus}>
          <img id="pause-icon"
            className={TrafficViewerStyles.playPauseIcon}
            style={{ visibility: wsReadyState === WebSocket.OPEN ? "visible" : "hidden" }}
            alt="pause"
            src={pauseIcon}
            onClick={toggleConnection} />
          <img id="play-icon"
            className={TrafficViewerStyles.playPauseIcon}
            style={{ position: "absolute", visibility: wsReadyState === WebSocket.OPEN ? "hidden" : "visible" }}
            alt="play"
            src={playIcon}
            onClick={toggleConnection} />
          <div className={TrafficViewerStyles.connectionText}>
            {getConnectionTitle()}
            {getConnectionIndicator()}
          </div>
        </div>
        {actionButtons}
      </div>
      {<div className={TrafficViewerStyles.TrafficPageContainer}>
        <div className={TrafficViewerStyles.TrafficPageListContainer}>
          <Filters
            entries={entries}
            reopenConnection={reopenConnection}
            onQueryChange={(q) => { setQueryBuild(q?.trim()); }}
          />
          <div className={styles.container}>
            <EntriesList
              entries={entries}
              listEntryREF={listEntry}
              onSnapBrokenEvent={onSnapBrokenEvent}
              isSnappedToBottom={isSnappedToBottom}
              setIsSnappedToBottom={setIsSnappedToBottom}
              scrollableRef={scrollableRef}
            />
          </div>
        </div>
        <div className={classes.details} id="rightSideContainer">
          <EntryDetailed />
        </div>
      </div>}
    </div>
  );
};
