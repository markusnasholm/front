import React, { useEffect, useRef } from "react";
import {
  Box,
  Fade,
  Modal,
  Backdrop,
  Tabs,
  Tab,
  Button,
  Grid,
  IconButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import styles from './JobsModal.module.sass'
import { HubBaseUrl, HubScriptLogsWsUrl } from "../../../consts";
import { LazyLog } from 'react-lazylog';
import { toast } from "react-toastify";
import useKeyPress from "../../../hooks/useKeyPress"
import shortcutsKeyboard from "../../../configs/shortcutsKeyboard"

const modalStyle = {
  position: 'absolute',
  top: '4%',
  left: '50%',
  transform: 'translate(-50%, 0%)',
  width: '92vw',
  height: '92vh',
  bgcolor: '#F0F5FF',
  borderRadius: '5px',
  boxShadow: 24,
  color: '#000',
  padding: "1px 1px"
};

interface TabPanelProps {
  index: number;
  selected: number;
  job: Job;
  fetchJobs: () => void;
}

function TabPanel(props: TabPanelProps) {
  const { index, selected, job, fetchJobs } = props;

  const handleClickRunJob = () => {
    fetch(
      `${HubBaseUrl}/jobs/${job.worker}/run/${job.tag}`,
      {
        method: 'POST',
      },
    )
      .then(response => response.ok ? response : response.text().then(err => Promise.reject(err)))
      .catch(err => {
        console.error(err);
        toast.error(err.toString(), {
          theme: "colored"
        });
      });
  };

  const handleClickDeleteJob = () => {
    fetch(
      `${HubBaseUrl}/jobs/${job.worker}/${job.tag}`,
      {
        method: 'DELETE',
      },
    )
      .then(response => response.ok ? response : response.text().then(err => Promise.reject(err)))
      .then(() => fetchJobs())
      .catch(err => {
        console.error(err);
        toast.error(err.toString(), {
          theme: "colored"
        });
      })
  };

  return (
    <>
      {index === selected &&  <div
        role="tabpanel"
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        style={{ width: '100%', height: "100%" }}
      >
        <Box sx={{ p: 3, height: "100%" }}>
          <Button
            variant="contained"
            onClick={handleClickRunJob}
            style={{ margin: 10 }}
          >
            Run
          </Button>
          <Button
            variant="contained"
            onClick={handleClickDeleteJob}
            color="error"
            style={{ margin: 10 }}
          >
            Delete
          </Button>
        </Box>
      </div>}
    </>
  );
}

interface Job {
  worker: string;
  node: string;
  tag: string;
  lastRun: string;
  nextRun: string;
  runCount: number;
  scheduledAtTimes: string[];
  isRunning: boolean;
}

type Jobs = Job[];

interface JobsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JobsModal: React.FC<JobsModalProps> = ({ isOpen, onClose }) => {

  const [selected, setSelected] = React.useState(0);
  const [jobs, setJobs] = React.useState([] as Jobs);

  const [follow, setFollow] = React.useState(true);
  const lazyLogFollow = useRef(null);

  const handleChange = (event: React.SyntheticEvent, newKey: number) => {
    setSelected(newKey);
  };

  const fetchJobs = () => {
    fetch(`${HubBaseUrl}/jobs`)
      .then(response => response.ok || response.status === 425 ? response : response.text().then(err => Promise.reject(err)))
      .then(response => response.json())
      .then((data) => {
        setJobs(data.jobs ? data.jobs : []);
      })
      .catch(err => {
        console.error(err);
        toast.error(err.toString(), {
          theme: "colored"
        });
      });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useKeyPress(shortcutsKeyboard.pageDown, () => { setFollow(true) }, lazyLogFollow.current);

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={isOpen}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}>
      <Fade in={isOpen}>
        <Box sx={modalStyle}>
          <div className={styles.headerContainer}>
            <Grid container spacing={2}>
              <Grid item xs={11}>
                <div className={styles.headerSection}>
                  <span className={styles.title}>Jobs</span>
                </div>
              </Grid>
              <Grid item xs={1}>
                <IconButton onClick={() => {
                  fetchJobs();
                  onClose();
                }} style={{
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
                    jobs.map(function(job, i) {
                      console.log(jobs);
                      return <Tab
                        key={i}
                        label={`[${job.node}] ${job.tag}`}
                        style={{ textTransform: "none" }}
                      />
                    })
                  }
                </Tabs>
                <Grid container spacing={2} style={{ height: "100%", width: "100%", marginTop: "0px" }}>
                  <Grid item xs={12} style={{ height: "70%", overflow: "hidden", paddingTop: "0px" }}>
                    {
                      jobs.map(function(job, i) {
                        return <TabPanel
                          key={i}
                          index={i}
                          selected={selected}
                          job={job}
                          fetchJobs={fetchJobs}
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
