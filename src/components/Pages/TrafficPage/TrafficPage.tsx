import React from "react";
import { TrafficViewer } from "../../TrafficViewer/TrafficViewer"
import "../../../index.sass"
import { Entry } from "../../EntryListItem/Entry";
import { useCommonStyles } from "../../../helpers/commonStyle"
import { useSetRecoilState } from "recoil";
import serviceMapModalOpenAtom from "../../../recoil/serviceMapModalOpen";
import scriptingModalOpenAtom from "../../../recoil/scriptingModalOpen";
import { Button } from "@mui/material";
import serviceMapIcon from "../../../assets/serviceMap.svg";
import TerminalIcon from '@mui/icons-material/Terminal';

interface TrafficPageProps {
  entries: Entry[];
  setEntries: React.Dispatch<React.SetStateAction<Entry[]>>;
  setLastUpdated: React.Dispatch<React.SetStateAction<number>>;
  getLicense: () => void;
  licenseProValid: boolean;
}

export const TrafficPage: React.FC<TrafficPageProps> = ({ entries, setEntries, setLastUpdated, getLicense, licenseProValid }) => {
  const commonClasses = useCommonStyles();
  const setServiceMapModalOpen = useSetRecoilState(serviceMapModalOpenAtom);
  const setScriptingModalOpen = useSetRecoilState(scriptingModalOpenAtom);

  const handleServiceMapModal = () => {
    setServiceMapModalOpen(true);
  }

  const handleScriptingModal = () => {
    setScriptingModalOpen(true);
  }

  const actionButtons = <div style={{ display: 'flex', height: "100%" }}>
    {licenseProValid && <Button
      startIcon={<TerminalIcon />}
      size="large"
      variant="contained"
      className={commonClasses.outlinedButton + " " + commonClasses.imagedButton}
      onClick={handleScriptingModal}
      style={{ textTransform: 'unset', marginRight: "20px" }}>
      Scripting
    </Button>}
    <Button
      startIcon={<img className="custom" src={serviceMapIcon} alt="service-map" style={{ marginRight: "8%" }} />}
      size="large"
      variant="contained"
      className={commonClasses.outlinedButton + " " + commonClasses.imagedButton}
      onClick={handleServiceMapModal}
      style={{ textTransform: 'unset' }}>
      Service Map
    </Button>
  </div>

  return (
    <>
      <TrafficViewer
        entries={entries}
        setEntries={setEntries}
        setLastUpdated={setLastUpdated}
        getLicense={getLicense}
        actionButtons={actionButtons}
      />
    </>
  );
};
