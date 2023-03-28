import React, { useRef } from "react";
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
  Typography,
  Divider,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import styles from './JobsModal.module.sass'
import { HubBaseUrl, HubScriptLogsWsUrl } from "../../../consts";
import { LazyLog } from 'react-lazylog';
import { toast } from "react-toastify";
import useKeyPress from "../../../hooks/useKeyPress"
import shortcutsKeyboard from "../../../configs/shortcutsKeyboard"
import { useInterval } from "../../../helpers/interval";

const modalStyle = {
  position: 'absolute',
  top: '2%',
  left: '50%',
  transform: 'translate(-50%, 0%)',
  width: '96vw',
  height: '96vh',
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

  const [scheduler, setScheduler] = React.useState({} as Scheduler);

  const handleClickRunJob = () => {
    fetch(
      `${HubBaseUrl}/jobs/${job.worker}/run/${job.tag}`,
      {
        method: 'POST',
      },
    )
      .then(response => response.ok ? response : response.text().then(err => Promise.reject(err)))
      .then(() => fetchJobs())
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

  const fetchScheduler = () => {
    fetch(`${HubBaseUrl}/jobs/${job.worker}/scheduler/status`)
      .then(response => response.ok || response.status === 425 ? response : response.text().then(err => Promise.reject(err)))
      .then(response => response.json())
      .then((data) => {
        setScheduler(data);
      })
      .catch(err => {
        console.error(err);
        toast.error(err.toString(), {
          theme: "colored"
        });
      });
  };

  const handleClickStartScheduler = () => {
    fetch(
      `${HubBaseUrl}/jobs/${job.worker}/scheduler/start`,
      {
        method: 'POST',
      },
    )
      .then(response => response.ok || response.status === 425 ? response : response.text().then(err => Promise.reject(err)))
      .then(() => fetchJobs())
      .catch(err => {
        console.error(err);
        toast.error(err.toString(), {
          theme: "colored"
        });
      });
  };

  const handleClickStopScheduler = () => {
    fetch(
      `${HubBaseUrl}/jobs/${job.worker}/scheduler/stop`,
      {
        method: 'POST',
      },
    )
      .then(response => response.ok || response.status === 425 ? response : response.text().then(err => Promise.reject(err)))
      .then(() => fetchJobs())
      .catch(err => {
        console.error(err);
        toast.error(err.toString(), {
          theme: "colored"
        });
      });
  };

  const handleClickRunTag = () => {
    fetch(
      `${HubBaseUrl}/jobs/workers/run/${job.tag}`,
      {
        method: 'POST',
      },
    )
      .then(response => response.ok ? response : response.text().then(err => Promise.reject(err)))
      .then(() => fetchJobs())
      .catch(err => {
        console.error(err);
        toast.error(err.toString(), {
          theme: "colored"
        });
      });
  };

  const handleClickDeleteTag = () => {
    fetch(
      `${HubBaseUrl}/jobs/workers/${job.tag}`,
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

  const handleClickRunAllJobs = () => {
    fetch(
      `${HubBaseUrl}/jobs/run`,
      {
        method: 'POST',
      },
    )
      .then(response => response.ok ? response : response.text().then(err => Promise.reject(err)))
      .then(() => fetchJobs())
      .catch(err => {
        console.error(err);
        toast.error(err.toString(), {
          theme: "colored"
        });
      });
  };

  const handleClickDeleteAllJobs = () => {
    fetch(
      `${HubBaseUrl}/jobs`,
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

  useInterval(async () => {
    fetchScheduler();
  }, 1000, true);

  return (
    <>
      {index === selected &&  <div
        role="tabpanel"
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        style={{ width: '100%', height: "100%" }}
      >
        <Box sx={{ height: "100%" }}>
          <Grid sx={{ p: 3 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
            <Grid item xs={7}>
              <Grid item xs={12}>
                <Typography variant="h4" component="h4">
                  {`[${job.node}] ${job.tag}`}
                </Typography>
              </Grid>
              <Grid item xs={12} sx={{ display: "flex" }}>
                <Typography><b>Job Status:</b> {job.isRunning ? "Running" : job.isPending ? "Pending" : "Waiting" }</Typography>
                <div style={{ marginTop: "2px" }}>{getJobIndicator(job)}</div>
              </Grid>
              <Grid item xs={12}>
                <Typography><b>Worker:</b> {job.worker}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><b>Node:</b> {job.node}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><b>Tag:</b> {job.tag}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><b>Last Run:</b> {job.lastRun}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><b>Next Run:</b> {job.nextRun}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><b>Run Count:</b> {job.runCount}</Typography>
              </Grid>
              <Typography style={{ marginTop: "20px" }}><i>Note: Jobs that are <u>shorter than a second</u> will always appear as &quot;Waiting&quot;.</i></Typography>
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
                style={{ margin: 10, marginLeft: 24 }}
              >
                Delete
              </Button>
            </Grid>
            <Divider orientation="vertical" flexItem />
            <Grid item xs={4}>
              <Grid item xs={12}>
                <Grid item xs={12} sx={{ display: "flex" }}>
                  <Typography><b>Scheduler Status:</b> {scheduler.isRunning ? "Running" : "Stopped" }</Typography>
                  <div style={{ marginTop: "2px" }}>{getSchedulerIndicator(scheduler)}</div>
                </Grid>
                <Grid sx={{ marginTop: "10px" }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                  <Grid item xs={3} sx={{ margin: "auto" }}>
                    <Typography><b>Scheduler:</b></Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Button
                      variant="contained"
                      onClick={handleClickStartScheduler}
                      color="success"
                      style={{ margin: 10 }}
                    >
                      Start
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      onClick={handleClickStopScheduler}
                      color="error"
                      style={{ margin: 10 }}
                    >
                      Stop
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      onClick={handleClickRunTag}
                      style={{ margin: 10 }}
                    >
                      Run This Tag
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      onClick={handleClickDeleteTag}
                      color="error"
                      style={{ margin: 10 }}
                    >
                      Delete This Tag
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      onClick={handleClickRunAllJobs}
                      style={{ margin: 10 }}
                    >
                      Run All Jobs
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      onClick={handleClickDeleteAllJobs}
                      color="error"
                      style={{ margin: 10 }}
                    >
                      Delete All Jobs
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
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
  isPending: boolean;
}

interface Scheduler {
  isRunning: boolean;
}

type Jobs = Job[];

interface JobsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getJobIndicator = (job: Job) => {
  if (job.isRunning)
    return <div
      className={`${styles.indicatorContainer} ${styles.greenIndicatorContainer}`}>
      <div className={`${styles.indicator} ${styles.greenIndicator}`} />
    </div>

  if (job.isPending)
    return <div
      className={`${styles.indicatorContainer} ${styles.orangeIndicatorContainer}`}>
      <div className={`${styles.indicator} ${styles.orangeIndicator}`} />
    </div>

  return <div
    className={`${styles.indicatorContainer} ${styles.greyIndicatorContainer}`}>
    <div className={`${styles.indicator} ${styles.greyIndicator}`} />
  </div>
}

const getSchedulerIndicator = (scheduler: Scheduler) => {
  if (scheduler.isRunning)
    return <div
      className={`${styles.indicatorContainer} ${styles.greenIndicatorContainer}`}>
      <div className={`${styles.indicator} ${styles.greenIndicator}`} />
    </div>

  return <div
    className={`${styles.indicatorContainer} ${styles.redIndicatorContainer}`}>
    <div className={`${styles.indicator} ${styles.redIndicator}`} />
  </div>
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

  useInterval(async () => {
    fetchJobs();
  }, 1000, true);

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
                  sx={{ borderRight: 1, borderColor: 'divider', minWidth: '400px' }}
                >
                  {
                    jobs.map(function(job, i) {
                      return <Tab
                        key={i}
                        label={`[${job.node}] ${job.tag}`}
                        style={{
                          textTransform: "none",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "400px",
                          textAlign: "left",
                          justifyContent: "start",
                          minHeight: "42px",
                          paddingLeft: "0px",
                          paddingRight: "0px",
                        }}
                        icon={getJobIndicator(job)}
                        iconPosition="start"
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
