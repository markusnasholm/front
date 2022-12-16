import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import styles from './Filters.module.sass';
import { Button, Grid, Modal, Box, Typography, Backdrop, Fade, Divider, debounce } from "@mui/material";
import CodeEditor from '@uiw/react-textarea-code-editor';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { SyntaxHighlighter } from "../UI/SyntaxHighlighter";
import filterUIExample1 from "./assets/filter-ui-example-1.png"
import filterUIExample2 from "./assets/filter-ui-example-2.png"
import variables from '../../variables.module.scss';
import useKeyPress from "../../hooks/useKeyPress"
import shortcutsKeyboard from "../../configs/shortcutsKeyboard"
import { useRecoilValue, useSetRecoilState } from "recoil";
import queryAtom from "../../recoil/query";
import queryBuildAtom from "../../recoil/queryBuild";
import { toast } from "react-toastify";

interface FiltersProps {
  reopenConnection: () => void;
  onQueryChange?: (query: string) => void
}

export const Filters: React.FC<FiltersProps> = ({ reopenConnection, onQueryChange }) => {
  return <div className={styles.container}>
    <QueryForm
      reopenConnection={reopenConnection}
      onQueryChange={onQueryChange}
    />
  </div>;
};

type OnQueryChange = { valid: boolean, message: string, query: string }

interface QueryFormProps {
  reopenConnection?: () => void;
  onQueryChange?: (q: string) => void
  onValidationChanged?: (event: OnQueryChange) => void
}

export const modalStyle = {
  position: 'absolute',
  top: '10%',
  left: '50%',
  transform: 'translate(-50%, 0%)',
  width: '80vw',
  bgcolor: 'background.paper',
  borderRadius: '5px',
  boxShadow: 24,
  outline: "none",
  p: 4,
  color: '#000',
};

export const CodeEditorWrap: FC<QueryFormProps> = ({ onQueryChange, onValidationChanged }) => {
  const [queryBackgroundColor, setQueryBackgroundColor] = useState("#f5f5f5");

  const queryBuild = useRecoilValue(queryBuildAtom);

  const handleQueryChange = useMemo(
    () =>
      debounce(async (query: string) => {
        if (!query) {
          setQueryBackgroundColor("#f5f5f5");
          onValidationChanged && onValidationChanged({ query: query, message: "", valid: true });
        } else {
          fetch(`http://localhost:8898/query/validate?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
              if (data.valid) {
                setQueryBackgroundColor("#d2fad2");
              } else {
                setQueryBackgroundColor("#fad6dc");
              }
              onValidationChanged && onValidationChanged({ query: query, message: data.message, valid: data.valid })
            })
            .catch(err => {
              console.error(err);
              toast.error(err.toString(), {
                theme: "colored"
              });
            });
        }
      }, 100),
    [onValidationChanged]
  ) as (query: string) => void;

  useEffect(() => {
    handleQueryChange(queryBuild);
  }, [queryBuild, handleQueryChange]);

  return <CodeEditor
    value={queryBuild}
    language="py"
    placeholder="Kubeshark Filter Syntax"
    onChange={(event) => onQueryChange(event.target.value)}
    padding={8}
    style={{
      fontSize: 14,
      backgroundColor: `${queryBackgroundColor}`,
      fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
    }}
  />
}

export const QueryForm: React.FC<QueryFormProps> = ({ reopenConnection, onQueryChange, onValidationChanged }) => {

  const formRef = useRef<HTMLFormElement>(null);

  const [openModal, setOpenModal] = useState(false);

  const queryBuild = useRecoilValue(queryBuildAtom);
  const setQuery = useSetRecoilState(queryAtom);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleSubmit = (e) => {
    setQuery(queryBuild);
    reopenConnection();
    e.preventDefault();
  }

  useKeyPress(shortcutsKeyboard.ctrlEnter, handleSubmit, formRef.current);

  return <React.Fragment>
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      style={{
        width: '100%',
      }}
    >
      <Grid container spacing={2}>
        <Grid
          item
          xs={8}
          style={{
            maxHeight: '25vh',
            overflowY: 'auto',
          }}
        >
          <label>
            <CodeEditorWrap onQueryChange={onQueryChange} onValidationChanged={onValidationChanged} />
          </label>
        </Grid>
        <Grid item xs={4}>
          <Button
            type="submit"
            variant="contained"
            style={{
              margin: "2px 0px 0px 0px",
              backgroundColor: variables.blueColor,
              fontWeight: 600,
              borderRadius: "4px",
              color: "#fff",
              textTransform: "none",
            }}
          >
            Apply
          </Button>
          <Button
            title="Open Filtering Guide (Cheatsheet)"
            variant="contained"
            color="primary"
            style={{
              margin: "2px 0px 0px 10px",
              minWidth: "26px",
              backgroundColor: variables.blueColor,
              fontWeight: 600,
              borderRadius: "4px",
              color: "#fff",
              textTransform: "none",
            }}
            onClick={handleOpenModal}
          >
            <MenuBookIcon fontSize="inherit"></MenuBookIcon>
          </Button>
          <Button
            title="Download PCAP Snapshot"
            variant="contained"
            color="primary"
            style={{
              margin: "2px 0px 0px 10px",
              minWidth: "26px",
              backgroundColor: variables.blueColor,
              fontWeight: 600,
              borderRadius: "4px",
              color: "#fff",
              textTransform: "none",
            }}
            href="http://localhost:8898/pcaps/merge"
          >
            <SaveAltIcon fontSize="inherit"></SaveAltIcon>
          </Button>
        </Grid>
      </Grid>
    </form>

    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={openModal}
      onClose={handleCloseModal}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      style={{ overflow: 'auto' }}
    >
      <Fade in={openModal}>
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h5" component="h2" style={{ textAlign: 'center' }}>
            Filtering Guide (Cheatsheet)
          </Typography>
          <Typography component={'span'} id="modal-modal-description">
            <p>Kubeshark has a rich filtering syntax that let&apos;s you query the results both flexibly and efficiently.</p>
            <p>Here are some examples that you can try;</p>
          </Typography>
          <Grid container>
            <Grid item xs style={{ margin: "10px" }}>
              <Typography id="modal-modal-description">
                This is a simple query that matches to HTTP packets with request path &quot;catalogue&quot;:
              </Typography>
              <SyntaxHighlighter
                showLineNumbers={false}
                code={`http and request.path == "/catalogue"`}
                language="python"
              />
              <Typography id="modal-modal-description">
                The same query can be negated for HTTP path and written like this:
              </Typography>
              <SyntaxHighlighter
                showLineNumbers={false}
                code={`http and request.path != "/catalogue"`}
                language="python"
              />
              <Typography id="modal-modal-description">
                The syntax supports regular expressions. Here is a query that matches the HTTP requests that send JSON to a server:
              </Typography>
              <SyntaxHighlighter
                showLineNumbers={false}
                code={`http and request.headers["Accept"] == r"application/json.*"`}
                language="python"
              />
              <Typography id="modal-modal-description">
                Here is another query that matches HTTP responses with status code 4xx:
              </Typography>
              <SyntaxHighlighter
                showLineNumbers={false}
                code={`http and response.status == r"4.*"`}
                language="python"
              />
              <Typography id="modal-modal-description">
                The same exact query can be as integer comparison:
              </Typography>
              <SyntaxHighlighter
                showLineNumbers={false}
                code={`http and response.status >= 400`}
                language="python"
              />
              <Typography id="modal-modal-description">
                The results can be queried based on their timestamps:
              </Typography>
              <SyntaxHighlighter
                showLineNumbers={false}
                code={`timestamp < datetime("10/28/2021, 9:13:02.905 PM")`}
                language="python"
              />
            </Grid>
            <Divider className={styles.divider1} orientation="vertical" flexItem />
            <Grid item xs style={{ margin: "10px" }}>
              <Typography id="modal-modal-description">
                Since Kubeshark supports various protocols like gRPC, AMQP, Kafka and Redis. It&apos;s possible to write complex queries that match multiple protocols like this:
              </Typography>
              <SyntaxHighlighter
                showLineNumbers={false}
                code={`(http and request.method == "PUT") or (amqp and request.queue.startsWith("test"))\n or (kafka and response.payload.errorCode == 2) or (redis and request.key == "example")\n or (grpc and request.headers[":path"] == r".*foo.*")`}
                language="python"
              />
              <Typography id="modal-modal-description">
                By clicking the plus icon that appears beside the queryable UI elements on hovering in both left-pane and right-pane, you can automatically select a field and update the query:
              </Typography>
              <img
                src={filterUIExample1}
                width={600}
                alt="Clicking to UI elements (left-pane)"
                title="Clicking to UI elements (left-pane)"
              />
              <Typography id="modal-modal-description">
                Such that; clicking this icon in left-pane, would append the query below:
              </Typography>
              <SyntaxHighlighter
                showLineNumbers={false}
                code={`and dst.name == "carts.sock-shop"`}
                language="python"
              />
              <Typography id="modal-modal-description">
                Another queriable UI element example, this time from the right-pane:
              </Typography>
              <img
                src={filterUIExample2}
                width={300}
                alt="Clicking to UI elements (right-pane)"
                title="Clicking to UI elements (right-pane)"
              />
              <Typography id="modal-modal-description">
                A query that compares one selector to another is also a valid query:
              </Typography>
              <SyntaxHighlighter
                showLineNumbers={false}
                code={`http and (request.query["x"] == response.headers["y"]\n or response.content.text.contains(request.query["x"]))`}
                language="python"
              />
            </Grid>
            <Divider className={styles.divider2} orientation="vertical" flexItem />
            <Grid item xs style={{ margin: "10px" }}>
              <Typography id="modal-modal-description">
                There are a few helper methods included the in the filter language* to help building queries more easily.
              </Typography>
              <br></br>
              <Typography id="modal-modal-description">
                true if the given selector&apos;s value starts with (similarly <code style={{ fontSize: "14px" }}>endsWith</code>, <code style={{ fontSize: "14px" }}>contains</code>) the string:
              </Typography>
              <SyntaxHighlighter
                showLineNumbers={false}
                code={`request.path.startsWith("something")`}
                language="python"
              />
              <Typography id="modal-modal-description">
                a field that contains a JSON encoded string can be filtered based a JSONPath:
              </Typography>
              <SyntaxHighlighter
                showLineNumbers={false}
                code={`response.content.text.json().some.path == "somevalue"`}
                language="python"
              />
              <Typography id="modal-modal-description">
                fields that contain sensitive information can be redacted:
              </Typography>
              <SyntaxHighlighter
                showLineNumbers={false}
                code={`and redact("request.path", "src.name")`}
                language="python"
              />
              <Typography id="modal-modal-description">
                returns the UNIX timestamp which is the equivalent of the time that&apos;s provided by the string. Invalid input evaluates to false:
              </Typography>
              <SyntaxHighlighter
                showLineNumbers={false}
                code={`timestamp >= datetime("10/19/2021, 6:29:02.593 PM")`}
                language="python"
              />
              <Typography id="modal-modal-description">
                limits the number of records that are streamed back as a result of a query. Always evaluates to true:
              </Typography>
              <SyntaxHighlighter
                showLineNumbers={false}
                code={`and limit(100)`}
                language="python"
              />
            </Grid>
          </Grid>
          <br></br>
          <Typography id="modal-modal-description" style={{ fontSize: 12, fontStyle: 'italic' }}>
            *Please refer to <a href="https://docs.kubeshark.co/en/querying#kfl-syntax-reference"><b>KFL Syntax Reference</b></a> for more information.
          </Typography>
        </Box>
      </Fade>
    </Modal>
  </React.Fragment>
}
