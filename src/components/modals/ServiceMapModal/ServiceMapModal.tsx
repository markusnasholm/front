import React, { useState, useEffect } from "react";
import {
  Box,
  Fade,
  Modal,
  Backdrop,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { SelectChangeEvent } from '@mui/material/Select';
import Graph from "react-graph-vis";
import CloseIcon from '@mui/icons-material/Close';
import RectangleIcon from '@mui/icons-material/Rectangle';
import styles from './ServiceMapModal.module.sass'
import { GraphData, Node, Edge, LegendData } from "./ServiceMapModalTypes"
import ServiceMapOptions from './ServiceMapOptions'
import { Entry } from "../../EntryListItem/Entry";
import variables from '../../../variables.module.scss';
import { SyntaxHighlighter } from "../../UI/SyntaxHighlighter";

const modalStyle = {
  position: 'absolute',
  top: '2%',
  left: '50%',
  transform: 'translate(-50%, 0%)',
  width: '96vw',
  height: '96vh',
  bgcolor: '#F0F5FF',
  borderRadius: '5px',
  boxShadow: 24,
  color: '#000',
  padding: "1px 1px"
};

interface ServiceMapModalProps {
  entries: Entry[];
  lastUpdated: number;
  setLastUpdated: React.Dispatch<React.SetStateAction<number>>;
  isOpen: boolean;
  onClose: () => void;
}

enum EdgeTypes {
  Size = "size",
  SizeRequest = "size_request",
  SizeResponse = "size_response",
  Count = "count",
}

enum NodeTypes {
  Name = "name",
  Namespace = "namespace",
  Pod = "pod",
  Endpoints = "endpoints",
  Service = "service",
}

/**
 * Converts a long string of bytes into a readable format e.g KB, MB, GB, TB, YB
 *
 * @param {Int} num The number of bytes.
 */
function humanReadableBytes(bytes): string {
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const result = (bytes / Math.pow(1024, i)).toFixed(2);
  return result + ' ' + sizes[i];
}

export const ServiceMapModal: React.FC<ServiceMapModalProps> = ({ entries, lastUpdated, setLastUpdated, isOpen, onClose }) => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [graphOptions, setGraphOptions] = useState(ServiceMapOptions);
  const [lastEntriesLength, setLastEntriesLength] = useState(0);

  const [edgeType, setEdgeType] = useState("size");
  const [nodeType, setNodeType] = useState("name");

  const [legendData, setLegendData] = useState<LegendData>({});

  const [selectedEdges, setSelectedEdges] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);

  useEffect(() => {
    if (entries.length === lastEntriesLength) {
      return;
    }
    setLastEntriesLength(entries.length);

    const nodeMap = {};
    const edgeMap = {};
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const legendMap = {};

    entries.map(entry => {
      legendMap[entry.proto.name] = entry.proto;
      let srcLabel = entry.src.name;
      let dstLabel = entry.dst.name;

      let srcName = "";
      let dstName = "";
      let srcNamespace = "";
      let dstNamespace = "";
      let srcVerb = "";
      let dstVerb = "";

      switch (nodeType) {
      case NodeTypes.Name:
        srcLabel = entry.src.name;

        if (entry.src.pod) {
          srcVerb = NodeTypes.Pod;
          srcName = entry.src.pod.metadata.name;
          srcNamespace = entry.src.pod.metadata.namespace;
        } else if (entry.src.endpoint) {
          srcVerb = NodeTypes.Endpoints;
          srcName = entry.src.endpoint.metadata.name;
          srcNamespace = entry.src.endpoint.metadata.namespace;
        } else if (entry.src.service) {
          srcVerb = NodeTypes.Service;
          srcName = entry.src.service.metadata.name;
          srcNamespace = entry.src.service.metadata.namespace;
        }
        break;
      case NodeTypes.Namespace:
        if (entry.src.pod) {
          srcLabel = entry.src.pod.metadata.namespace;
        } else if (entry.src.endpoint) {
          srcLabel = entry.src.endpoint.metadata.namespace;
        } else if (entry.src.service) {
          srcLabel = entry.src.service.metadata.namespace;
        }

        srcVerb = NodeTypes.Namespace;
        srcName = srcLabel;
        break;
      case NodeTypes.Pod:
        if (entry.src.pod) {
          srcLabel = `${entry.src.pod.metadata.name}.${entry.src.pod.metadata.namespace}`;
          srcName = entry.src.pod.metadata.name;
          srcNamespace = entry.src.pod.metadata.namespace;
        }

        srcVerb = NodeTypes.Pod;
        break;
      case NodeTypes.Endpoints:
        if (entry.src.endpoint) {
          srcLabel = `${entry.src.endpoint.metadata.name}.${entry.src.endpoint.metadata.namespace}`;
          srcName = entry.src.endpoint.metadata.name;
          srcNamespace = entry.src.endpoint.metadata.namespace;
        }

        srcVerb = NodeTypes.Endpoints;
        break;
      case NodeTypes.Service:
        if (entry.src.service) {
          srcLabel = `${entry.src.service.metadata.name}.${entry.src.service.metadata.namespace}`;
          srcName = entry.src.service.metadata.name;
          srcNamespace = entry.src.service.metadata.namespace;
        }

        srcVerb = NodeTypes.Service;
        break;
      }

      switch (nodeType) {
      case NodeTypes.Name:
        dstLabel = entry.dst.name;

        if (entry.dst.pod) {
          dstVerb = NodeTypes.Pod;
          dstName = entry.dst.pod.metadata.name;
          dstNamespace = entry.dst.pod.metadata.namespace;
        } else if (entry.dst.endpoint) {
          dstVerb = NodeTypes.Endpoints;
          dstName = entry.dst.endpoint.metadata.name;
          dstNamespace = entry.dst.endpoint.metadata.namespace;
        } else if (entry.dst.service) {
          dstVerb = NodeTypes.Service;
          dstName = entry.dst.service.metadata.name;
          dstNamespace = entry.dst.service.metadata.namespace;
        }
        break;
      case NodeTypes.Namespace:
        if (entry.dst.pod) {
          dstLabel = entry.dst.pod.metadata.namespace;
        } else if (entry.dst.endpoint) {
          dstLabel = entry.dst.endpoint.metadata.namespace;
        } else if (entry.dst.service) {
          dstLabel = entry.dst.service.metadata.namespace;
        }

        dstVerb = NodeTypes.Namespace;
        dstName = dstLabel;
        break;
      case NodeTypes.Pod:
        if (entry.dst.pod) {
          dstLabel = `${entry.dst.pod.metadata.name}.${entry.dst.pod.metadata.namespace}`;
          dstName = entry.dst.pod.metadata.name;
          dstNamespace = entry.dst.pod.metadata.namespace;
        }

        dstVerb = NodeTypes.Pod;
        break;
      case NodeTypes.Endpoints:
        if (entry.dst.endpoint) {
          dstLabel = `${entry.dst.endpoint.metadata.name}.${entry.dst.endpoint.metadata.namespace}`;
          dstName = entry.dst.endpoint.metadata.name;
          dstNamespace = entry.dst.endpoint.metadata.namespace;
        }

        dstVerb = NodeTypes.Endpoints;
        break;
      case NodeTypes.Service:
        if (entry.dst.service) {
          dstLabel = `${entry.dst.service.metadata.name}.${entry.dst.service.metadata.namespace}`;
          dstName = entry.dst.service.metadata.name;
          dstNamespace = entry.dst.service.metadata.namespace;
        }

        dstVerb = NodeTypes.Service;
        break;
      }

      if (srcLabel.length === 0) {
        srcLabel = entry.src.ip;
      }
      if (dstLabel.length === 0) {
        dstLabel = entry.dst.ip;
      }

      let srcId: number;
      let dstId: number;

      const labelArr: string[] = [srcLabel, dstLabel];
      const nameArr: string[] = [srcName, dstName];
      const namespaceArr: string[] = [srcNamespace, dstNamespace];
      const verbArr: string[] = [srcVerb, dstVerb];
      for (let i = 0; i < labelArr.length; i++) {
        const nodeKey: string = labelArr[i];
        let node: Node;
        if (nodeKey in nodeMap) {
          node = nodeMap[nodeKey]
          nodeMap[nodeKey].value++;
        } else {
          node = {
            id: nodes.length,
            value: 1,
            label: nodeKey,
            title: nodeKey,
            color: variables.lightBlueColor,
            name: nameArr[i],
            namespace: namespaceArr[i],
            verb: verbArr[i],
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
      } else {
        edge = {
          id: edges.length,
          from: srcId,
          to: dstId,
          value: 0,
          label: "",
          title: entry.proto.longName,
          color: entry.proto.backgroundColor,
        }
        edgeMap[edgeKey] = edge;
        edges.push(edge);
      }

      switch (edgeType) {
      case EdgeTypes.Count:
        edgeMap[edgeKey].value++;
        edgeMap[edgeKey].label = `${edgeMap[edgeKey].value}`;
        break;
      case EdgeTypes.Size:
        edgeMap[edgeKey].value += entry.size;
        edgeMap[edgeKey].label = humanReadableBytes(edgeMap[edgeKey].value);
        break;
      case EdgeTypes.SizeRequest:
        edgeMap[edgeKey].value += entry.requestSize;
        edgeMap[edgeKey].label = humanReadableBytes(edgeMap[edgeKey].value);
        break;
      case EdgeTypes.SizeResponse:
        edgeMap[edgeKey].value += entry.responseSize;
        edgeMap[edgeKey].label = humanReadableBytes(edgeMap[edgeKey].value);
        break;
      }
    });

    setGraphData({
      nodes: nodes,
      edges: edges,
    });
    setLegendData(legendMap);
  }, [entries, lastUpdated]);

  useEffect(() => {
    if (graphData?.nodes?.length === 0) return;
    const options = { ...graphOptions };
    setGraphOptions(options);
  }, [graphData?.nodes?.length]);

  const handleEdgeChange = (event: SelectChangeEvent) => {
    setSelectedEdges([]);
    setEdgeType(event.target.value as string);
    setLastEntriesLength(0);
    setLastUpdated(Date.now());
  };

  const handleNodeChange = (event: SelectChangeEvent) => {
    setSelectedNodes([]);
    setNodeType(event.target.value as string);
    setLastEntriesLength(0);
    setLastUpdated(Date.now());
  };

  const events = {
    select: ({ nodes, edges }) => {
      setSelectedEdges(edges);
      setSelectedNodes(nodes);
    }
  }

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
              <Card sx={{ maxWidth: "20%", position: "absolute", zIndex: 1 }}>
                <CardContent>
                  <FormControl fullWidth size="small">
                    <InputLabel id="edge-select-label">Edges</InputLabel>
                    <Select
                      labelId="edge-select-label"
                      id="edge-select"
                      value={edgeType}
                      label="Edge"
                      onChange={handleEdgeChange}
                    >
                      <MenuItem value={EdgeTypes.Size}>Traffic Load</MenuItem>
                      <MenuItem value={EdgeTypes.SizeRequest}>Traffic Load (requests only)</MenuItem>
                      <MenuItem value={EdgeTypes.SizeResponse}>Traffic Load (responses only)</MenuItem>
                      <MenuItem value={EdgeTypes.Count}>Number of Items</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small" sx={{marginTop: "20px"}}>
                    <InputLabel id="node-select-label">Nodes</InputLabel>
                    <Select
                      labelId="node-select-label"
                      id="node-select"
                      value={nodeType}
                      label="Node"
                      onChange={handleNodeChange}
                    >
                      <MenuItem value={NodeTypes.Name}>Resolved Name</MenuItem>
                      <MenuItem value={NodeTypes.Namespace}>Kubernetes Namespace</MenuItem>
                      <MenuItem value={NodeTypes.Pod}>Kubernetes Pod</MenuItem>
                      <MenuItem value={NodeTypes.Endpoints}>Kubernetes Endpoints</MenuItem>
                      <MenuItem value={NodeTypes.Service}>Kubernetes Service</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>

              {Object.keys(legendData).length && <Card sx={{ maxWidth: "30%", position: "absolute", bottom: "10px", zIndex: 1 }}>
                <CardContent>
                  <List dense disablePadding>
                    {
                      Object.keys(legendData).map(function(key) {
                        const proto = legendData[key];
                        const primaryStyle = {
                          color: proto.backgroundColor,
                          fontWeight: "bold",
                        };
                        const secondaryStyle = {
                          color: proto.backgroundColor,
                        };

                        return <ListItem disableGutters disablePadding>
                          <ListItemIcon sx={{ minWidth: "36px" }}>
                            <RectangleIcon sx={{ color: proto.backgroundColor }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={proto.abbr}
                            secondary={proto.longName}
                            primaryTypographyProps={{ style: primaryStyle }}
                            secondaryTypographyProps={{ style: secondaryStyle }}
                          />
                        </ListItem>
                      })
                    }
                  </List>
                </CardContent>
              </Card>}

              <Card sx={{ maxWidth: "30%", position: "absolute", left: "50%", transform: "translate(-50%, 0%)", bottom: "10px", zIndex: 1 }}>
                <CardContent>
                  {selectedNodes.length === 0 && "Select a node to display its kubectl command."}
                  {
                    selectedNodes.length > 0 && selectedNodes.map(id => {
                      const node = graphData.nodes[id];
                      let namespaceFlag = "";
                      if (node.verb !== NodeTypes.Namespace) namespaceFlag = "-n";
                      if (node.name.length)
                        return <SyntaxHighlighter
                          showLineNumbers={false}
                          code={`kubectl describe ${node.verb} ${node.name} ${namespaceFlag} ${node.namespace}`}
                          language="bash"
                        />
                      else
                        return <></>
                    })
                  }
                </CardContent>
              </Card>

              <Graph
                graph={graphData}
                options={graphOptions}
                events={events}
              />
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
