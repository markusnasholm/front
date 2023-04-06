import React from "react";
import { EntryBodySection } from "../EntrySections/EntrySections";
import YAML from 'yaml';

export interface Resolution {
  pod: Record<string, unknown>;
  endpointSlice: Record<string, unknown>;
  service: Record<string, unknown>;
}

interface ManifestProps {
  source: Resolution;
  destination: Resolution;
  color: string;
}

const Manifest: React.FC<ManifestProps> = ({ source, destination, color }) => {
  const sections = []

  if (source) {
    if (source.pod) {
      sections.push(
        <EntryBodySection
          key={sections.length}
          title="Source Pod"
          color={color}
          content={YAML.stringify(source.pod)}
          contentType="application/yaml"
          selector="src.pod"
        />
      );
    }

    if (source.endpointSlice) {
      sections.push(
        <EntryBodySection
          key={sections.length}
          title="Source EndpointSlice"
          color={color}
          content={YAML.stringify(source.endpointSlice)}
          contentType="application/yaml"
          selector="src.endpointSlice"
        />
      );
    }

    if (source.service) {
      sections.push(
        <EntryBodySection
          key={sections.length}
          title="Source Service"
          color={color}
          content={YAML.stringify(source.service)}
          contentType="application/yaml"
          selector="src.service"
        />
      );
    }
  }

  if (destination) {
    if (destination.pod) {
      sections.push(
        <EntryBodySection
          key={sections.length}
          title="Destination Pod"
          color={color}
          content={YAML.stringify(destination.pod)}
          contentType="application/yaml"
          selector="dst.pod"
        />
      );
    }

    if (destination.endpointSlice) {
      sections.push(
        <EntryBodySection
          key={sections.length}
          title="Destination EndpointSlice"
          color={color}
          content={YAML.stringify(destination.endpointSlice)}
          contentType="application/yaml"
          selector="dst.endpointSlice"
        />
      );
    }

    if (destination.service) {
      sections.push(
        <EntryBodySection
          key={sections.length}
          title="Destination Service"
          color={color}
          content={YAML.stringify(destination.service)}
          contentType="application/yaml"
          selector="dst.service"
        />
      );
    }
  }

  return <React.Fragment>{sections}</React.Fragment>;
}

export default Manifest
