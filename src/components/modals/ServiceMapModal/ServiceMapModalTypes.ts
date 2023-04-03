import { ProtocolInterface } from "../../UI/Protocol/Protocol";

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export interface Node {
  id: number;
  value: number;
  label: string;
  title?: string;
  color?: string;
}

export interface Edge {
  from: number;
  to: number;
  value: number;
  label: string;
  title?: string;
  color?: string;
}

export interface LegendData {
  [key: string]: ProtocolInterface;
}
