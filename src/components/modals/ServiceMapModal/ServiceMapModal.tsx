import React, { useState, useEffect } from "react";
import {
  Box,
  Fade,
  Modal,
  Backdrop,
  Grid,
  IconButton,
} from "@mui/material";
import Graph from "react-graph-vis";
import CloseIcon from '@mui/icons-material/Close';
import styles from './ServiceMapModal.module.sass'
import { GraphData, Node, Edge } from "./ServiceMapModalTypes"
import ServiceMapOptions from './ServiceMapOptions'
import { Entry } from "../../EntryListItem/Entry";
import variables from '../../../variables.module.scss';

const modalStyle = {
  position: 'absolute',
  top: '4%',
  left: '50%',
  transform: 'translate(-50%, 0%)',
  width: '92vw',
  height: '92vh',
  bgcolor: '#F0F5FF',
  borderRadius: '5px',
  boxShadow: 24,
  color: '#000',
  padding: "1px 1px"
};

interface ServiceMapModalProps {
  entries: Entry[];
  lastUpdated: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceMapModal: React.FC<ServiceMapModalProps> = ({ entries, lastUpdated, isOpen, onClose }) => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [graphOptions, setGraphOptions] = useState(ServiceMapOptions);
  const [lastEntriesLength, setLastEntriesLength] = useState(0);

  useEffect(() => {
    if (entries.length === lastEntriesLength) {
      return;
    }
    setLastEntriesLength(entries.length);

    const nodeMap = {};
    const edgeMap = {};
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    entries.map(entry => {
      let srcName = entry.src.name;
      if (srcName.length === 0) {
        srcName = entry.src.ip;
      } else {
        srcName = `${srcName}(${entry.src.ip})`
      }
      let dstName = entry.dst.name;
      if (dstName.length === 0) {
        dstName = entry.dst.ip;
      } else {
        dstName = `${dstName}(${entry.dst.ip})`
      }

      let srcId: number;
      let dstId: number;

      const nameArr: string[] = [srcName, dstName];
      for (let i = 0; i < nameArr.length; i++) {
        const nodeKey: string = nameArr[i];
        let node: Node;
        if (nodeKey in nodeMap) {
          node = nodeMap[nodeKey]
          nodeMap[nodeKey].value++;
        } else {
          node = {
            id: Object.keys(nodeMap).length,
            value: 1,
            label: nodeKey,
            title: nodeKey,
            color: variables.lightBlueColor,
          };
          nodeMap[nodeKey] = node;
          nodes.push(node);
        }

        if (i == 0)
          srcId = node.id;
        else
          dstId = node.id;
      }

      const edgeKey = `${srcId}_${dstId}`;

      let edge: Edge;
      if (edgeKey in edgeMap) {
        edge = edgeMap[edgeKey];
        edgeMap[edgeKey].value++;
        edgeMap[edgeKey].label = `${edgeMap[edgeKey].value}`;
      } else {
        edge = {
          from: srcId,
          to: dstId,
          value: 1,
          label: "1",
          title: entry.proto.longName,
          color: entry.proto.backgroundColor,
        }
        edgeMap[edgeKey] = edge;
        edges.push(edge);
      }
    });

    setGraphData({
      nodes: nodes,
      edges: edges,
    })
  }, [entries, lastUpdated]);

  useEffect(() => {
    if (graphData?.nodes?.length === 0) return;
    const options = { ...graphOptions };
    setGraphOptions(options);
  }, [graphData?.nodes?.length]);

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={isOpen}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}>
      <Fade in={isOpen}>
        <Box sx={modalStyle}>
          <div className={styles.headerContainer}>
            <Grid container spacing={2}>
              <Grid item xs={11}>
                <div className={styles.headerSection}>
                  <span className={styles.title}>Service Map</span>
                </div>
              </Grid>
              <Grid item xs={1}>
                <IconButton onClick={() => onClose()} style={{
                  margin: "10px",
                  float: "right",
                  padding: "2px",
                }}>
                  <CloseIcon />
                </IconButton>
              </Grid>
            </Grid>
          </div>

          <div className={styles.modalContainer}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
            </div>
            <div style={{ height: "100%", width: "100%" }}>
              <Graph
                graph={graphData}
                options={graphOptions}
              />
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
