import React, { useState, useEffect, useRef } from "react";
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
  FormControlLabel,
  DialogContentText,
  Checkbox,
  Button,
} from "@mui/material";
import { SelectChangeEvent } from '@mui/material/Select';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import RectangleIcon from '@mui/icons-material/Rectangle';
import CircleIcon from '@mui/icons-material/Circle';
import styles from './ServiceMapModal.module.sass'
import { GraphData, Node, Edge, LegendData } from "./ServiceMapModalTypes"
import ServiceMapOptions from './ServiceMapOptions'
import { Entry } from "../../EntryListItem/Entry";
import { SyntaxHighlighter } from "../../UI/SyntaxHighlighter";
import ForceGraph from "./ForceGraph";
import Moment from "moment";
import { useSetRecoilState } from "recoil";
import queryBuildAtom from "../../../recoil/queryBuild";
import seedrandom from "seedrandom";

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

enum EdgeTypes {
  Bandwidth = "bandwidth",
  BandwidthRequest = "bandwidthRequest",
  BandwidthResponse = "bandwidthResponse",
  BandwidthCumulative = "bandwidthCumulative",
  BandwidthCumulativeRequest = "bandwidthCumulativeRequest",
  BandwidthCumulativeResponse = "bandwidthCumulativeResponse",
  Throughput = "throughput",
  ThroughputCumulative = "throughputCumulative",
  Latency = "latency",
}

enum NodeTypes {
  Name = "name",
  Namespace = "namespace",
  Pod = "pod",
  EndpointSlice = "endpointSlice",
  Service = "service",
}

/**
 * Converts a long string of bytes into a readable format e.g KB, MB, GB, TB, YB
 *
 * @param {Int} num The number of bytes.
 */
function humanReadableBytes(bytes): string {
  let i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (i < 0) i = 0;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const result = (bytes / Math.pow(1024, i)).toFixed(2);
  return result + ' ' + sizes[i];
}

interface ServiceMapModalProps {
  entries: Entry[];
  lastUpdated: number;
  setLastUpdated: React.Dispatch<React.SetStateAction<number>>;
  isOpen: boolean;
  onClose: () => void;
  edgeType: string;
  setEdgeType: React.Dispatch<React.SetStateAction<string>>;
  nodeType: string;
  setNodeType: React.Dispatch<React.SetStateAction<string>>;
}

const colorPalette = [
  "#FDFFB6",
  "#9BF6FF",
  "#BDB2FF",
  "#FFFFFC",
  "#FFD6A5",
  "#CAFFBF",
  "#A0C4FF",
  "#FFC6FF",
  "#FFADAD",
]

export const ServiceMapModal: React.FC<ServiceMapModalProps> = ({
  entries,
  lastUpdated,
  setLastUpdated,
  isOpen,
  onClose,
  edgeType,
  setEdgeType,
  nodeType,
  setNodeType,
}) => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [graphOptions, setGraphOptions] = useState(ServiceMapOptions);
  const [lastEntriesLength, setLastEntriesLength] = useState(0);

  const [legendData, setLegendData] = useState<LegendData>({});
  const [legendFilter, setLegendFilter] = useState("");

  const [selectedEdges, setSelectedEdges] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);

  const [showCumulative, setShowCumulative] = React.useState(false);
  const [showRequests, setShowRequests] = React.useState(true);
  const [showResponses, setShowResponses] = React.useState(true);

  const [maximizeOptionsCard, setMaximizeOptionsCard] = React.useState(true);
  const [maximizeLegendCard, setMaximizeLegendCard] = React.useState(true);
  const [maximizeKubectlCard, setMaximizeKubectlCard] = React.useState(true);
  const [maximizeFilterCard, setMaximizeFilterCard] = React.useState(true);

  const setQueryBuild = useSetRecoilState(queryBuildAtom);

  useEffect(() => {
    if (entries.length === lastEntriesLength) return;
    setLastEntriesLength(entries.length);

    const nodeMap = {};
    const edgeMap = {};
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const legendMap = {};

    let firstMoment: Moment.Moment;

    entries.map(entry => {
      if (firstMoment === undefined)
        firstMoment = Moment(+entry.timestamp)?.utc();

      legendMap[entry.proto.abbr] = entry.proto;
      let srcLabel = entry.src.name;
      let dstLabel = entry.dst.name;

      let srcName = "";
      let dstName = "";
      let srcVerb = "";
      let dstVerb = "";

      switch (nodeType) {
      case NodeTypes.Name:
        srcLabel = entry.src.name;

        if (entry.src.pod) {
          srcVerb = NodeTypes.Pod;
          srcName = entry.src.pod.metadata.name;
        } else if (entry.src.endpointSlice) {
          srcVerb = NodeTypes.EndpointSlice;
          srcName = entry.src.endpointSlice.metadata.name;
        } else if (entry.src.service) {
          srcVerb = NodeTypes.Service;
          srcName = entry.src.service.metadata.name;
        }
        break;
      case NodeTypes.Namespace:
        if (entry.src.pod) {
          srcLabel = entry.src.pod.metadata.namespace;
        } else if (entry.src.endpointSlice) {
          srcLabel = entry.src.endpointSlice.metadata.namespace;
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
        }

        srcVerb = NodeTypes.Pod;
        break;
      case NodeTypes.EndpointSlice:
        if (entry.src.endpointSlice) {
          srcLabel = `${entry.src.endpointSlice.metadata.name}.${entry.src.endpointSlice.metadata.namespace}`;
          srcName = entry.src.endpointSlice.metadata.name;
        }

        srcVerb = NodeTypes.EndpointSlice;
        break;
      case NodeTypes.Service:
        if (entry.src.service) {
          srcLabel = `${entry.src.service.metadata.name}.${entry.src.service.metadata.namespace}`;
          srcName = entry.src.service.metadata.name;
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
        } else if (entry.dst.endpointSlice) {
          dstVerb = NodeTypes.EndpointSlice;
          dstName = entry.dst.endpointSlice.metadata.name;
        } else if (entry.dst.service) {
          dstVerb = NodeTypes.Service;
          dstName = entry.dst.service.metadata.name;
        }
        break;
      case NodeTypes.Namespace:
        if (entry.dst.pod) {
          dstLabel = entry.dst.pod.metadata.namespace;
        } else if (entry.dst.endpointSlice) {
          dstLabel = entry.dst.endpointSlice.metadata.namespace;
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
        }

        dstVerb = NodeTypes.Pod;
        break;
      case NodeTypes.EndpointSlice:
        if (entry.dst.endpointSlice) {
          dstLabel = `${entry.dst.endpointSlice.metadata.name}.${entry.dst.endpointSlice.metadata.namespace}`;
          dstName = entry.dst.endpointSlice.metadata.name;
        }

        dstVerb = NodeTypes.EndpointSlice;
        break;
      case NodeTypes.Service:
        if (entry.dst.service) {
          dstLabel = `${entry.dst.service.metadata.name}.${entry.dst.service.metadata.namespace}`;
          dstName = entry.dst.service.metadata.name;
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
      const namespaceArr: string[] = [entry.src.namespace, entry.dst.namespace];
      const verbArr: string[] = [srcVerb, dstVerb];
      for (let i = 0; i < labelArr.length; i++) {
        const nodeKey: string = labelArr[i];
        let node: Node;
        const namespace = namespaceArr[i];
        if (nodeKey in nodeMap) {
          node = nodeMap[nodeKey]
          nodeMap[nodeKey].value++;
        } else {
          node = {
            id: nodes.length,
            value: 1,
            label: nodeKey,
            group: namespace,
            title: nodeKey,
            name: nameArr[i],
            namespace: namespace,
            verb: verbArr[i],
          };
          nodeMap[nodeKey] = node;
          nodes.push(node);

          if (!(namespace in ServiceMapOptions.groups)) {
            const rng = seedrandom(namespace);
            let n = rng.int32();
            if (n < 0) n = -n;
            ServiceMapOptions.groups[namespace] = {
              color: colorPalette[n % 9],
              filter: `src.namespace == "${namespace}" or dst.namespace == "${namespace}"`,
            }
          }
        }

        if (i == 0)
          srcId = node.id;
        else
          dstId = node.id;
      }

      const edgeKey = `${srcId}_${dstId}`;

      let filter = entry.proto.macro;

      if (nodeType === NodeTypes.Namespace) {
        if (entry.src.namespace)
          filter += ` and src.namespace == "${entry.src.namespace}"`
        else if (entry.src.name)
          filter += ` and src.name == "${entry.src.name}"`
        else
          filter += ` and src.ip == "${entry.src.ip}"`

        if (entry.dst.namespace)
          filter += ` and dst.namespace == "${entry.dst.namespace}"`
        else if (entry.dst.name)
          filter += ` and dst.name == "${entry.dst.name}"`
        else
          filter += ` and dst.ip == "${entry.dst.ip}"`
      } else {
        if (entry.src.name)
          filter += ` and src.name == "${entry.src.name}"`
        else
          filter += ` and src.ip == "${entry.src.ip}"`

        if (entry.dst.name)
          filter += ` and dst.name == "${entry.dst.name}"`
        else
          filter += ` and dst.ip == "${entry.dst.ip}"`
      }

      let edge: Edge;
      if (edgeKey in edgeMap) {
        edge = edgeMap[edgeKey];
      } else {
        edge = {
          id: edges.length,
          from: srcId,
          to: dstId,
          value: 0,
          count: 0,
          cumulative: 0,
          label: "",
          filter: filter,
          title: entry.proto.longName,
          color: entry.proto.backgroundColor,
        }
        edgeMap[edgeKey] = edge;
        edges.push(edge);
      }

      const secondsPassed = Moment(+entry.timestamp).utc().diff(firstMoment, "seconds");

      switch (edgeType) {
      case EdgeTypes.Bandwidth:
        if (showRequests)
          edgeMap[edgeKey].cumulative += entry.requestSize;
        if (showResponses)
          edgeMap[edgeKey].cumulative += entry.responseSize;

        if (showCumulative)
          edgeMap[edgeKey].value = edgeMap[edgeKey].cumulative;
        else
          edgeMap[edgeKey].value = edgeMap[edgeKey].cumulative / secondsPassed;

        edgeMap[edgeKey].label = humanReadableBytes(edgeMap[edgeKey].value);

        if (!showCumulative)
          edgeMap[edgeKey].label += "/s";
        break;
      case EdgeTypes.Throughput:
        edgeMap[edgeKey].cumulative++;

        if (showCumulative)
          edgeMap[edgeKey].value = edgeMap[edgeKey].cumulative;
        else
          edgeMap[edgeKey].value = Math.ceil(
            edgeMap[edgeKey].cumulative / secondsPassed
          ) / 100;

        edgeMap[edgeKey].label = `${edgeMap[edgeKey].value}`;

        if (!showCumulative)
          edgeMap[edgeKey].label += "/s";
        break;
      case EdgeTypes.Latency:
        edgeMap[edgeKey].value = Math.ceil(
          (entry.elapsedTime + edgeMap[edgeKey].value * edgeMap[edgeKey].count) / (edgeMap[edgeKey].count + 1)
        ) / 100;
        edgeMap[edgeKey].label = `${edgeMap[edgeKey].value} ms`;
        break;
      }

      edgeMap[edgeKey].count++;
    });

    setGraphData({
      nodes: nodes,
      edges: edges,
    });

    const legendMapSorted = Object.keys(legendMap).sort().reduce(
      (obj, key) => {
        obj[key] = legendMap[key];
        return obj;
      },
      {}
    );

    setLegendData(legendMapSorted);
  }, [entries, lastUpdated]);

  useEffect(() => {
    if (graphData?.nodes?.length === 0) return;
    const options = { ...graphOptions };
    setGraphOptions(options);
  }, [graphData?.nodes?.length]);

  const handleEdgeChange = (event: SelectChangeEvent) => {
    setLegendFilter("");
    setSelectedEdges([]);
    setGraphData({
      nodes: [],
      edges: [],
    });
    setEdgeType(event.target.value as string);
    setLastEntriesLength(0);
    setLastUpdated(Date.now());
  };

  const handleNodeChange = (event: SelectChangeEvent) => {
    setLegendFilter("");
    setSelectedNodes([]);
    setGraphData({
      nodes: [],
      edges: [],
    });
    setNodeType(event.target.value as string);
    setLastEntriesLength(0);
    setLastUpdated(Date.now());
  };

  const events = {
    select: ({ nodes, edges }) => {
      setLegendFilter("");
      setSelectedEdges(edges);
      setSelectedNodes(nodes);
    }
  }

  const handleShowCumulativeCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowCumulative(event.target.checked);
    setLastEntriesLength(0);
    setLastUpdated(Date.now());
  };

  const handleShowRequestsCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowRequests(event.target.checked);
    setLastEntriesLength(0);
    setLastUpdated(Date.now());
  };

  const handleShowResponsesCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowResponses(event.target.checked);
    setLastEntriesLength(0);
    setLastUpdated(Date.now());
  };

  const filter = selectedEdges.reduce((acc, x) => acc === null ? graphData.edges[x].filter : `(${acc}) or \n(${graphData.edges[x].filter})`, null);
  const handleSetFilter = () => setQueryBuild(filter?.trim());

  const modalRef = useRef(null);

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={isOpen}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}>
      <Fade in={isOpen}>
        <Box ref={modalRef} sx={modalStyle}>
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
              <Card sx={{
                maxWidth: "20%",
                position: "absolute",
                left: "0.5%",
                zIndex: 1,
              }}>
                {maximizeOptionsCard ?
                  <IconButton onClick={() => {
                    setMaximizeOptionsCard(false);
                  }} style={{
                    margin: "2px",
                    float: "right",
                    padding: "2px",
                  }}>
                    <RemoveIcon />
                  </IconButton>
                  :
                  <IconButton onClick={() => {
                    setMaximizeOptionsCard(true);
                  }} style={{
                    margin: "2px",
                    float: "right",
                    padding: "2px",
                  }}>
                    <AddIcon />
                  </IconButton>
                }

                {maximizeOptionsCard && <CardContent>
                  <FormControl fullWidth size="small">
                    <InputLabel id="edge-select-label">Edges</InputLabel>
                    <Select
                      labelId="edge-select-label"
                      id="edge-select"
                      value={edgeType}
                      label="Edge"
                      onChange={handleEdgeChange}
                    >
                      <MenuItem value={EdgeTypes.Bandwidth}>Bandwidth</MenuItem>
                      <MenuItem value={EdgeTypes.Throughput}>Throughput</MenuItem>
                      <MenuItem value={EdgeTypes.Latency}>Latency</MenuItem>
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
                      <MenuItem value={NodeTypes.Namespace}>Namespace</MenuItem>
                      <MenuItem value={NodeTypes.Pod}>Pod</MenuItem>
                      <MenuItem value={NodeTypes.EndpointSlice}>EndpointSlice</MenuItem>
                      <MenuItem value={NodeTypes.Service}>Service</MenuItem>
                    </Select>
                  </FormControl>

                  {(edgeType === EdgeTypes.Bandwidth || edgeType === EdgeTypes.Throughput) && <FormControlLabel
                    label={<DialogContentText style={{marginTop: "4px"}}>Show cumulative {edgeType === EdgeTypes.Bandwidth ? EdgeTypes.Bandwidth : ""}{edgeType === EdgeTypes.Throughput ? EdgeTypes.Throughput : ""}</DialogContentText>}
                    control={<Checkbox checked={showCumulative} onChange={handleShowCumulativeCheck} />}
                    style={{marginTop: "5px"}}
                    labelPlacement="end"
                  />}

                  {edgeType === EdgeTypes.Bandwidth && <FormControlLabel
                    label={<DialogContentText style={{marginTop: "4px"}}>Include request sizes</DialogContentText>}
                    control={<Checkbox checked={showRequests} onChange={handleShowRequestsCheck} />}
                    labelPlacement="end"
                  />}

                  {edgeType === EdgeTypes.Bandwidth && <FormControlLabel
                    label={<DialogContentText style={{marginTop: "4px"}}>Include response sizes</DialogContentText>}
                    control={<Checkbox checked={showResponses} onChange={handleShowResponsesCheck} />}
                    labelPlacement="end"
                  />}
                </CardContent>}
              </Card>

              {Object.keys(legendData).length && <Card sx={{
                maxWidth: "30%",
                position: "absolute",
                left: "0.5%",
                bottom: "1%",
                zIndex: 1,
              }}>
                {maximizeLegendCard ?
                  <IconButton onClick={() => {
                    setMaximizeLegendCard(false);
                  }} style={{
                    margin: "2px",
                    float: "right",
                    padding: "2px",
                  }}>
                    <RemoveIcon />
                  </IconButton>
                  :
                  <IconButton onClick={() => {
                    setMaximizeLegendCard(true);
                  }} style={{
                    margin: "2px",
                    float: "right",
                    padding: "2px",
                  }}>
                    <AddIcon />
                  </IconButton>
                }

                {maximizeLegendCard && <CardContent sx={{ maxHeight: "20vh", overflow: "scroll" }}>
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

                        return <ListItem key={key} disableGutters disablePadding sx={{
                          backgroundColor: "#E8E8E8",
                          padding: "0 5px 0 5px",
                          marginBottom: "5px",
                          border: "2px solid white",
                          "&:hover": {
                            border: `2px solid ${proto.backgroundColor}`
                          },
                          cursor: "pointer",
                        }}
                        onClick={() => setLegendFilter(proto.macro)}>
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
                    {
                      Object.keys(ServiceMapOptions.groups).map(function(key) {
                        if (!key) return <></>;

                        const group = ServiceMapOptions.groups[key];
                        const primaryStyle = {
                          color: group.color,
                          fontWeight: "bold",
                        };
                        const secondaryStyle = {
                          color: group.color,
                        };

                        return <ListItem key={key} disableGutters disablePadding sx={{
                          backgroundColor: "#505050",
                          padding: "0 5px 0 5px",
                          marginBottom: "5px",
                          border: "2px solid white",
                          "&:hover": {
                            border: `2px solid ${group.color}`
                          },
                          cursor: "pointer",
                        }}
                        onClick={() => setLegendFilter(group.filter)}>
                          <ListItemIcon sx={{ minWidth: "36px" }}>
                            <CircleIcon sx={{ color: group.color }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={key}
                            secondary="Namespace"
                            primaryTypographyProps={{ style: primaryStyle }}
                            secondaryTypographyProps={{ style: secondaryStyle }}
                          />
                        </ListItem>
                      })
                    }
                  </List>
                </CardContent>}
              </Card>}

              <Card sx={{
                maxWidth: "35%",
                position: "absolute",
                left: "50%",
                bottom: "1%",
                transform: "translate(-50%, 0%)",
                zIndex: 1,
              }}>
                {maximizeKubectlCard ?
                  <IconButton onClick={() => {
                    setMaximizeKubectlCard(false);
                  }} style={{
                    margin: "2px",
                    float: "right",
                    padding: "2px",
                  }}>
                    <RemoveIcon />
                  </IconButton>
                  :
                  <IconButton onClick={() => {
                    setMaximizeKubectlCard(true);
                  }} style={{
                    margin: "2px",
                    float: "right",
                    padding: "2px",
                  }}>
                    <AddIcon />
                  </IconButton>
                }

                {maximizeKubectlCard && <CardContent sx={{ maxHeight: "20vh", overflow: "scroll" }}>
                  {selectedNodes.length === 0 && <>Select a node to display its kubectl command. <a className="kbc-button kbc-button-xxs">Right-Click</a> and drag for rectangular selection.</>}
                  {
                    selectedNodes.length > 0 && selectedNodes.map(id => {
                      const node = graphData.nodes[id];
                      let namespaceFlag = "";
                      if (node.verb !== NodeTypes.Namespace) namespaceFlag = "-n";
                      return <div key={id}>
                        <b>{node.label}</b>
                        <SyntaxHighlighter
                          showLineNumbers={false}
                          code={node.name.length ? `kubectl describe ${node.verb} ${node.name} ${namespaceFlag} ${node.namespace}` : "# NOT APPLICABLE"}
                          language="bash"
                        />
                      </div>
                    })
                  }
                </CardContent>}
              </Card>

              <Card sx={{
                maxWidth: "30%",
                position: "absolute",
                right: "0.5%",
                zIndex: 1,
              }}>
                {maximizeFilterCard ?
                  <IconButton onClick={() => {
                    setMaximizeFilterCard(false);
                  }} style={{
                    margin: "2px",
                    float: "right",
                    padding: "2px",
                  }}>
                    <RemoveIcon />
                  </IconButton>
                  :
                  <IconButton onClick={() => {
                    setMaximizeFilterCard(true);
                  }} style={{
                    margin: "2px",
                    float: "right",
                    padding: "2px",
                  }}>
                    <AddIcon />
                  </IconButton>
                }

                {maximizeFilterCard && <CardContent sx={{ maxHeight: "20vh", overflow: "scroll" }}>
                  {selectedEdges.length === 0 && !legendFilter && <>Select an edge to generate its filter. <a className="kbc-button kbc-button-xxs">Ctrl</a> + <a className="kbc-button kbc-button-xxs">Left-Click</a> to multiselect edges.</>}
                  {
                    !legendFilter && selectedEdges.length > 0 &&
                    <>
                      <SyntaxHighlighter
                        showLineNumbers={false}
                        code={filter}
                        language="python"
                      />

                      <Button
                        variant="contained"
                        className={`${styles.bigButton}`}
                        onClick={handleSetFilter}
                      >
                        Set Filter
                      </Button>
                    </>
                  }
                  {
                    legendFilter &&
                    <>
                      <SyntaxHighlighter
                        showLineNumbers={false}
                        code={legendFilter}
                        language="python"
                      />

                      <Button
                        variant="contained"
                        className={`${styles.bigButton}`}
                        onClick={handleSetFilter}
                      >
                        Set Filter
                      </Button>
                    </>
                  }
                </CardContent>}
              </Card>

              <ForceGraph
                graph={graphData}
                options={graphOptions}
                events={events}
                modalRef={modalRef}
                setSelectedNodes={setSelectedNodes}
                setSelectedEdges={setSelectedEdges}
                selection={{
                  nodes: selectedNodes,
                  edges: selectedEdges,
                }}
              />
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
