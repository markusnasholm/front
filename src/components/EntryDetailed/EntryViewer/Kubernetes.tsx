import React from "react";
import { EntryBodySection } from "../EntrySections/EntrySections";
import YAML from 'yaml';

export interface Resolution {
  pod: Record<string, unknown>;
  endpoint: Record<string, unknown>;
  service: Record<string, unknown>;
}

interface KubernetesProps {
  source: Resolution;
  destination: Resolution;
  color: string;
}

const Kubernetes: React.FC<KubernetesProps> = ({ source, destination, color }) => {
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

    if (source.endpoint) {
      sections.push(
        <EntryBodySection
          key={sections.length}
          title="Source Endpoint"
          color={color}
          content={YAML.stringify(source.endpoint)}
          contentType="application/yaml"
          selector="src.endpoint"
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

    if (destination.endpoint) {
      sections.push(
        <EntryBodySection
          key={sections.length}
          title="Destination Endpoint"
          color={color}
          content={YAML.stringify(destination.endpoint)}
          contentType="application/yaml"
          selector="dst.endpoint"
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

export default Kubernetes
