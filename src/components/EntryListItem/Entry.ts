import { ProtocolInterface } from "../UI/Protocol/Protocol"

export interface Node {
  ip: string;
  name: string;
}

interface Resolution {
  ip: string;
  port: string;
  name: string;
  namespace: string;
  // eslint-disable-next-line
  pod?: any;
  // eslint-disable-next-line
  endpointSlice?: any;
  // eslint-disable-next-line
  service?: any;
}

export interface Entry {
  key: string;
  id: string;
  index?: number;
  stream: string;
  node: Node;
  worker: string;
  proto: ProtocolInterface;
  tls: boolean;
  method?: string;
  methodQuery?: string;
  summary: string;
  summaryQuery: string;
  status?: number;
  statusQuery?: string;
  timestamp: Date;
  src: Resolution;
  dst: Resolution;
  outgoing: boolean;
  requestSize: number;
  responseSize: number;
  elapsedTime: number;
  passed: boolean;
  failed: boolean;
}
