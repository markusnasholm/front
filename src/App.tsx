import './App.sass';
import React, { useState } from "react";
import { Header } from "./components/Header/Header";
import { TrafficPage } from "./components/Pages/TrafficPage/TrafficPage";
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material';
import { useRecoilState } from "recoil";
import serviceMapModalOpenAtom from "./recoil/serviceMapModalOpen";
import scriptingModalOpenAtom from "./recoil/scriptingModalOpen";
import { ServiceMapModal } from './components/modals/ServiceMapModal/ServiceMapModal';
import { ScriptingModal } from './components/modals/ScriptingModal/ScriptingModal';
import { Entry } from "./components/EntryListItem/Entry";
import { HubBaseUrl } from "./consts";

const App: React.FC = () => {

  const [entries, setEntries] = useState([] as Entry[]);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [serviceMapModalOpen, setServiceMapModalOpen] = useRecoilState(serviceMapModalOpenAtom);
  const [scriptingModalOpen, setScriptingModalOpen] = useRecoilState(scriptingModalOpenAtom);

  const [licenseEdition, setLicenseEdition] = useState("community");
  const [licenseExpired, setLicenseExpired] = useState(false);
  const [licenseEnd, setLicenseEnd] = useState(Date.now());

  const [licenseProValid, setLicenseProValid] = useState(false);

  const getLicense = () => {
    fetch(`${HubBaseUrl}/license`)
      .then(response => response.json())
      .then(data => {
        setLicenseEdition(data.doc.edition);
        setLicenseExpired(data.expired);
        setLicenseEnd(data.doc.end);
        setLicenseProValid(!data.expired && data.doc.edition === "pro")
      })
      .catch(err => console.error(err));
  };

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={createTheme(({}))}>
        <div className="kubesharkApp">
          <Header
            licenseEdition={licenseEdition}
            licenseExpired={licenseExpired}
            licenseEnd={licenseEnd}
          />
          <TrafficPage
            entries={entries}
            setEntries={setEntries}
            setLastUpdated={setLastUpdated}
            getLicense={getLicense}
            licenseProValid={licenseProValid}
          />
          <ServiceMapModal
            entries={entries}
            lastUpdated={lastUpdated}
            isOpen={serviceMapModalOpen}
            onClose={() => setServiceMapModalOpen(false)}
          />
          <ScriptingModal
            isOpen={scriptingModalOpen}
            onClose={() => setScriptingModalOpen(false)}
          />
        </div>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
