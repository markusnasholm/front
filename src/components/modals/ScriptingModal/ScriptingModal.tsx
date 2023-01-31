import React from "react";
import { Box, Fade, Modal, Backdrop } from "@mui/material";
import closeIcon from "./assets/close.svg"
import styles from './ScriptingModal.module.sass'

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

interface ScriptingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScriptingModal: React.FC<ScriptingModalProps> = ({ isOpen, onClose }) => {

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
              </div>
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
