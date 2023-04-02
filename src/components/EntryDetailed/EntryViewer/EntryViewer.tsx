import React from 'react';
import { AutoRepresentation } from './AutoRepresentation';
import { Resolution } from "./Kubernetes";

interface Props {
  representation: string;
  source: Resolution;
  destination: Resolution;
  color: string;
}

const EntryViewer: React.FC<Props> = ({ representation, source, destination, color }) => {
  return <AutoRepresentation
    representation={representation}
    source={source}
    destination={destination}
    color={color}
  />
};

export default EntryViewer;
