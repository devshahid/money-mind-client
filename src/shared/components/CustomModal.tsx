import { Box, IconButton, Modal } from '@mui/material'
import { JSX } from 'react'
import CancelIcon from '@mui/icons-material/Cancel'
import { borderRadius, spacing } from '../theme'

type Props = {
  modalOpen: boolean
  onClose: (x?: string) => void
  children: JSX.Element
}

const CustomModal = ({ modalOpen, onClose, children }: Props): JSX.Element => {
  return (
    <Modal
      open={modalOpen}
      onClose={(_, reason) => onClose(reason)}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: { xs: spacing[3], md: spacing[4] },
          width: { xs: '95%', md: '600px' },
          maxWidth: { xs: 500, md: 600 },
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: borderRadius.base,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={() => onClose()}
          aria-label='Close dialog'
          sx={{
            position: 'absolute',
            top: spacing[1],
            right: spacing[1],
            color: theme => theme.palette.grey[500],
          }}
        >
          <CancelIcon />
        </IconButton>
        {children}
      </Box>
    </Modal>
  )
}

export { CustomModal }
