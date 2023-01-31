import React from "react";
import { Box, Fade, Modal, Backdrop, Tabs, Tab, Typography, Button } from "@mui/material";
import closeIcon from "./assets/close.svg"
import styles from './ScriptingModal.module.sass'
import CodeEditor from '@uiw/react-textarea-code-editor';

const modalStyle = {
  position: 'absolute',
  top: '6%',
  left: '50%',
  transform: 'translate(-50%, 0%)',
  width: '89vw',
  height: '82vh',
  bgcolor: '#F0F5FF',
  borderRadius: '5px',
  boxShadow: 24,
  p: 4,
  color: '#000',
  padding: "1px 1px",
  paddingBottom: "15px"
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  const [code, setCode] = React.useState(
    `function capturedItem(item) {\n  // Your code goes here\n}`
  );

  const saveScript = () => {
    console.log(code);
  };

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{ width: '100%' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children} {value}</Typography>
          <CodeEditor
            value={code}
            language="js"
            placeholder="Please enter JS code."
            onChange={(event) => setCode(event.target.value)}
            padding={8}
            style={{
              fontSize: 14,
              backgroundColor: "#f5f5f5",
              fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
              margin: 10,
            }}
          />
          <Button
            variant="outlined"
            onClick={saveScript}
          >
            Save Script
          </Button>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

interface ScriptingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScriptingModal: React.FC<ScriptingModalProps> = ({ isOpen, onClose }) => {

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}>
      <Fade in={isOpen}>
        <Box sx={modalStyle}>
          <div className={styles.closeIcon}>
            <img src={closeIcon} alt="close" onClick={() => onClose()} style={{ cursor: "pointer", userSelect: "none" }} />
          </div>
          <div className={styles.headerContainer}>
            <div className={styles.headerSection}>
              <span className={styles.title}>Scripting</span>
            </div>
          </div>

          <div className={styles.modalContainer}>
            <div className={styles.graphSection}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
              </div>
              <div style={{ height: "100%", width: "100%" }}>
                <Box
                  sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: '100%' }}
                >
                  <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{ borderRight: 1, borderColor: 'divider' }}
                  >
                    <Tab label="Item One" {...a11yProps(0)} />
                    <Tab label="Item Two" {...a11yProps(1)} />
                    <Tab label="Item Three" {...a11yProps(2)} />
                    <Tab label="Item Four" {...a11yProps(3)} />
                    <Tab label="Item Five" {...a11yProps(4)} />
                    <Tab label="Item Six" {...a11yProps(5)} />
                    <Tab label="Item Seven" {...a11yProps(6)} />
                  </Tabs>
                  <TabPanel value={value} index={0}>
                    Item One
                  </TabPanel>
                  <TabPanel value={value} index={1}>
                    Item Two
                  </TabPanel>
                  <TabPanel value={value} index={2}>
                    Item Three
                  </TabPanel>
                  <TabPanel value={value} index={3}>
                    Item Four
                  </TabPanel>
                  <TabPanel value={value} index={4}>
                    Item Five
                  </TabPanel>
                  <TabPanel value={value} index={5}>
                    Item Six
                  </TabPanel>
                  <TabPanel value={value} index={6}>
                    Item Seven
                  </TabPanel>
                </Box>
              </div>
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
