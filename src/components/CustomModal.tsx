import { Box, IconButton, Modal } from "@mui/material";
import { JSX } from "react";
import CancelIcon from "@mui/icons-material/Cancel";

type Props = {
    modalOpen: boolean;
    onClose: (x?: string) => void;
    children: JSX.Element;
};

const CustomModal = ({ modalOpen, onClose, children }: Props): JSX.Element => {
    return (
        <Modal
            open={modalOpen}
            onClose={(_, reason) => onClose(reason)}
            disableEscapeKeyDown
        >
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    width: { xs: "90%", md: "600px" },
                    maxHeight: "90vh",
                    overflowY: "auto",
                    borderRadius: 2,
                }}
            >
                {/* Close Button */}
                <IconButton
                    onClick={() => onClose()}
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CancelIcon />
                </IconButton>
                {children}
            </Box>
        </Modal>
    );
};

export default CustomModal;
