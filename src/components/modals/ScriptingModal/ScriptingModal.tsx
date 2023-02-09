import React, { useEffect, useRef } from "react";
import {
  Box,
  Fade,
  Modal,
  Backdrop,
  Tabs,
  Tab,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  IconButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import styles from './ScriptingModal.module.sass'
import CodeEditor from '@uiw/react-textarea-code-editor';
import { HubBaseUrl, HubScriptLogsWsUrl } from "../../../consts";
import { LazyLog } from 'react-lazylog';
import { toast } from "react-toastify";
import { SelectChangeEvent } from '@mui/material/Select';
import { DEFAULT_TITLE, DEFAULT_SCRIPT, EXAMPLE_SCRIPTS, EXAMPLE_SCRIPT_TITLES } from "./ScriptingExamples";
import useKeyPress from "../../../hooks/useKeyPress"
import shortcutsKeyboard from "../../../configs/shortcutsKeyboard"

const modalStyle = {
  position: 'absolute',
  top: '4%',
  left: '50%',
  transform: 'translate(-50%, 0%)',
  width: '92vw',
  height: '85vh',
  bgcolor: '#F0F5FF',
  borderRadius: '5px',
  boxShadow: 24,
  p: 4,
  color: '#000',
  padding: "1px 1px",
  paddingBottom: "15px"
};

interface TabPanelProps {
  index: number;
  selected: number;
  scriptKey: number;
  script: Script;
  setUpdated: React.Dispatch<React.SetStateAction<number>>
  setFollow: React.Dispatch<React.SetStateAction<boolean>>
}

function TabPanel(props: TabPanelProps) {
  const { index, selected, scriptKey, script, setUpdated, setFollow } = props;

  const [code, setCode] = React.useState(script.code ? script.code : DEFAULT_SCRIPT);
  const [title, setTitle] = React.useState(script.title);
  const [example, setExample] = React.useState(script.code === DEFAULT_SCRIPT ? "0" : "");

  const formRef = useRef<HTMLFormElement>(null);

  const handleClickSaveScript = () => {
    const obj: Script = {title: title, code: code };
    fetch(
      `${HubBaseUrl}/scripts/${scriptKey}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(obj)
      },
    )
      .then(response => response.ok ? response : response.text().then(err => Promise.reject(err)))
      .then(response => response.json())
      .then(data => {
        setUpdated(data.key);
      })
      .catch(err => {
        console.error(err);
        toast.error(err.toString(), {
          theme: "colored"
        });
      });
  };

  const handleClickDeleteScript = () => {
    fetch(
      `${HubBaseUrl}/scripts/${scriptKey}`,
      {
        method: 'DELETE',
      },
    )
      .then(response => response.ok ? response : response.text().then(err => Promise.reject(err)))
      .then(() => {
        setUpdated(scriptKey);
      })
      .catch(err => {
        console.error(err);
        toast.error(err.toString(), {
          theme: "colored"
        });
      })
  };

  const handleExampleChange = (event: SelectChangeEvent) => {
    setExample(event.target.value as string);
    setCode(EXAMPLE_SCRIPTS[event.target.value]);
    setTitle(EXAMPLE_SCRIPT_TITLES[event.target.value]);
  };

  const handleSubmit = (e) => {
    handleClickSaveScript();
    e.preventDefault();
  }

  useKeyPress(shortcutsKeyboard.ctrlEnter, handleSubmit, formRef.current);

  return (
    <>
      {index === selected &&  <div
        role="tabpanel"
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        style={{ width: '100%', height: "100%" }}
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          style={{ width: '100%', height: "100%" }}
        >
          <Box sx={{ p: 3, height: "100%" }}>
            <TextField
              variant="standard"
              defaultValue={title}
              value={title}
              type="string"
              style={{width: "100%", marginBottom: "20px" }}
              inputProps={{style: {fontSize: 28, fontWeight: 600}}}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography><b>Script Index:</b> {scriptKey}</Typography>
              </Grid>
              <Grid item xs={8}>
                <FormControl fullWidth size="small">
                  <InputLabel id="example-script-select-label">Examples</InputLabel>
                  <Select
                    labelId="example-script-select-label"
                    id="example-script-select"
                    value={example}
                    label="Example"
                    onChange={handleExampleChange}
                  >
                    {EXAMPLE_SCRIPT_TITLES.map((title, i) => {
                      return <MenuItem value={i}>{title}</MenuItem>
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
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
                marginTop: 10,
                marginBottom: 10,
                maxHeight: "64%",
                overflow: "scroll",
              }}
            />
            <Typography>
              {`Write your JavaScript code inside the hooks.`}&nbsp;
              <a className="kbc-button kbc-button-xs">Ctrl</a> + <a className="kbc-button kbc-button-xs">Enter</a> saves the script.&nbsp;
              <a className="kbc-button kbc-button-xs" onClick={() => { setFollow(false) }}>Left-Click</a> in the console stops auto-scroll.&nbsp;
              <a className="kbc-button kbc-button-xs" onClick={() => { setFollow(true) }}>Page Down</a> resumes it.
            </Typography>
            <Button
              variant="contained"
              onClick={handleClickSaveScript}
              style={{ margin: 10 }}
            >
              Save
            </Button>
            <Button
              variant="contained"
              onClick={handleClickDeleteScript}
              color="error"
              style={{ margin: 10 }}
            >
              Delete
            </Button>
          </Box>
        </form>
      </div>}
    </>
  );
}

interface Script {
  title: string;
  code: string;
}

type ScriptMap = {
  [key: number]: Script;
};

interface ScriptingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScriptingModal: React.FC<ScriptingModalProps> = ({ isOpen, onClose }) => {

  const [selected, setSelected] = React.useState(0);
  const [updated, setUpdated] = React.useState(-1);

  const [scriptMap, setScriptMap] = React.useState({} as ScriptMap);

  const [follow, setFollow] = React.useState(true);
  const lazyLogFollow = useRef(null);

  const handleChange = (event: React.SyntheticEvent, newKey: number) => {
    setSelected(newKey);
  };

  const handleClickAddScript = () => {
    const obj: Script = {title: DEFAULT_TITLE, code: DEFAULT_SCRIPT };
    fetch(
      `${HubBaseUrl}/scripts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(obj)
      },
    )
      .then(response => response.ok ? response : response.text().then(err => Promise.reject(err)))
      .then(response => response.json())
      .then(data => {
        setUpdated(data.key);
      })
      .catch(err => {
        console.error(err);
        toast.error(err.toString(), {
          theme: "colored"
        });
      });
  };

  const fetchScripts = () => {
    fetch(`${HubBaseUrl}/scripts`)
      .then((response) => {
        if (response.status === 425) {
          setTimeout(() => {
            fetchScripts();
          }, 1000);
        }

        return response;
      })
      .then(response => response.ok || response.status === 425 ? response : response.text().then(err => Promise.reject(err)))
      .then(response => response.json())
      .then((data: ScriptMap) => {
        setScriptMap(data);
        setUpdated(-1);
      })
      .catch(err => {
        console.error(err);
        toast.error(err.toString(), {
          theme: "colored"
        });
      });
  };

  useEffect(() => {
    fetchScripts();
  }, [updated]);

  useKeyPress(shortcutsKeyboard.pageDown, () => { setFollow(true) }, lazyLogFollow.current);

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
          <div className={styles.headerContainer}>
            <Grid container spacing={2}>
              <Grid item xs={11}>
                <div className={styles.headerSection}>
                  <span className={styles.title}>Scripting</span>
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
              <Box
                sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: '100%' }}
              >
                <Tabs
                  orientation="vertical"
                  variant="scrollable"
                  value={selected}
                  onChange={handleChange}
                  aria-label="Scripts"
                  sx={{ borderRight: 1, borderColor: 'divider', minWidth: '300px' }}
                >
                  {
                    Object.keys(scriptMap).map(function(key) {
                      return <Tab
                        key={key}
                        label={scriptMap[key].title}
                      />
                    })
                  }
                  <Button
                    variant="contained"
                    onClick={handleClickAddScript}
                    title="Add a new script"
                    sx={{ margin: "70px", marginTop: "20px" }}
                  >
                    Add script
                  </Button>
                </Tabs>
                <Grid container spacing={2} style={{ height: "100%", width: "100%", marginTop: "0px" }}>
                  <Grid item xs={12} style={{ height: "70%", overflow: "hidden", paddingTop: "0px" }}>
                    {
                      Object.keys(scriptMap).map(function(key: string, i: number) {
                        return <TabPanel
                          key={key}
                          index={i}
                          selected={selected}
                          scriptKey={Number(key)}
                          script={scriptMap[key]}
                          setUpdated={setUpdated}
                          setFollow={setFollow}
                        />
                      })
                    }
                  </Grid>
                  <Grid item xs={12} style={{ height: "30%", paddingTop: "0px" }} onClick={() => { setFollow(false) }}>
                    <LazyLog
                      extraLines={1}
                      enableSearch
                      url={HubScriptLogsWsUrl}
                      websocket
                      websocketOptions={{}}
                      stream
                      follow={follow}
                      selectableLines
                    />
                  </Grid>
                </Grid>
              </Box>
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
