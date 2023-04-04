import React, { Component } from "react";
import Graph from "react-graph-vis";

let ctx;
let network;
let container;
let canvas;
let nodes;
let rect = [];
var drawingSurfaceImageData;

class ForceGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drag: false,
    };
    this.canvasWrapperRef = React.createRef();
  }

  componentDidMount() {
    // ref on graph <Graph/> to add listeners to, maybe?
    console.log("ref:", this.canvasWrapperRef.current.Network.body.nodes);

    container = this.canvasWrapperRef.current.Network.canvas.frame;
    network = this.canvasWrapperRef.current.Network;
    canvas = this.canvasWrapperRef.current.Network.canvas.frame.canvas;
    nodes = this.props.graph.nodes;
    ctx = canvas.getContext("2d");

    container.oncontextmenu = function() {
      return false;
    };

    this.saveDrawingSurface();

    // add event watching for canvas box drawing
    container.addEventListener("mousedown", e => {
      e.preventDefault();

      if (e.button == 2) {
        this.saveDrawingSurface();
        rect.startX =
          e.pageX -
          this.canvasWrapperRef.current.Network.body.container.offsetLeft -
          this.props.modalRef.current.getBoundingClientRect().left;
        rect.startY =
          e.pageY -
          this.canvasWrapperRef.current.Network.body.container.offsetTop -
          this.props.modalRef.current.getBoundingClientRect().top;
        this.state.drag = true;
        container.style.cursor = "crosshair";
        this.selectNodesFromHighlight();
      }
    });

    container.addEventListener("mousemove", e => {
      if (this.state.drag) {
        this.restoreDrawingSurface();
        rect.w =
          e.pageX -
          this.canvasWrapperRef.current.Network.body.container.offsetLeft - this.props.modalRef.current.getBoundingClientRect().left -
          rect.startX;
        rect.h =
          e.pageY -
          this.canvasWrapperRef.current.Network.body.container.offsetTop - this.props.modalRef.current.getBoundingClientRect().top -
          rect.startY;

        ctx.setLineDash([5]);
        ctx.strokeStyle = "rgb(0, 102, 0)";
        ctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
        ctx.fillRect(rect.startX, rect.startY, rect.w, rect.h);
      }
    });

    container.addEventListener("mouseup", e => {
      if (e.button == 2) {
        this.restoreDrawingSurface();
        this.state.drag = false;
        container.style.cursor = "default";
        this.selectNodesFromHighlight();
      }
    });
  }

  saveDrawingSurface() {
    drawingSurfaceImageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  restoreDrawingSurface() {
    ctx.putImageData(drawingSurfaceImageData, 0, 0);
  }

  selectNodesFromHighlight() {
    var fromX, toX, fromY, toY;
    var nodesIdInDrawing = [];
    var xRange = this.getStartToEnd(rect.startX, rect.w);
    var yRange = this.getStartToEnd(rect.startY, rect.h);
    var allNodes = nodes;
    for (var i = 0; i < allNodes.length; i++) {
      var curNode = allNodes[i];
      var nodePosition = network.getPositions([curNode.id]);
      var nodeXY = network.canvasToDOM({
        x: nodePosition[curNode.id].x,
        y: nodePosition[curNode.id].y
      });
      if (
        xRange.start <= nodeXY.x &&
        nodeXY.x <= xRange.end &&
        yRange.start <= nodeXY.y &&
        nodeXY.y <= yRange.end
      ) {
        nodesIdInDrawing.push(curNode.id);
      }
    }
    network.selectNodes(nodesIdInDrawing);
  }

  getStartToEnd(start, theLen) {
    return theLen > 0
      ? {
          start: start,
          end: start + theLen
        }
      : {
          start: start + theLen,
          end: start
        };
  }

  render() {
    return (
      <div
        id="graph"
        style={{ height: "100%", width: "100%" }}
      >
        <Graph
          ref={this.canvasWrapperRef}
          graph={this.props.graph}
          options={this.props.options}
          events={this.props.events}
        />
      </div>
    );
  }
}

export default ForceGraph;
