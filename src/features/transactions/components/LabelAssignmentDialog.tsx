import { JSX, useState } from 'react'
import { Autocomplete, Box, Button, Chip, TextField, Typography } from '@mui/material'
import { CustomModal } from '../../../shared/components/CustomModal'

interface LabelAssignmentDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (labels: string[]) => void
  availableLabels: string[]
}

const LabelAssignmentDialog = ({
  open,
  onClose,
  onConfirm,
  availableLabels,
}: LabelAssignmentDialogProps): JSX.Element => {
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])

  const handleClose = (): void => {
    setSelectedLabels([])
    onClose()
  }

  const handleConfirm = (): void => {
    if (selectedLabels.length === 0) {
      handleClose()
      return
    }
    onConfirm(selectedLabels)
    setSelectedLabels([])
  }

  return (
    <CustomModal
      modalOpen={open}
      onClose={handleClose}
    >
      <Box>
        <Typography
          variant='h6'
          mb={2}
        >
          Assign Labels
        </Typography>
        <Autocomplete
          multiple
          freeSolo
          options={availableLabels}
          value={selectedLabels}
          onChange={(_, newValue) => {
            setSelectedLabels(newValue.filter((v): v is string => v !== null))
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const tagProps = getTagProps({ index })
              return (
                <Chip
                  {...tagProps}
                  key={option + index}
                  variant='outlined'
                  label={option}
                />
              )
            })
          }
          renderInput={params => (
            <TextField
              {...params}
              label='Labels'
              placeholder='Select or type labels'
            />
          )}
          sx={{ mb: 2 }}
        />
        <Button
          fullWidth
          variant='contained'
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </Box>
    </CustomModal>
  )
}

export { LabelAssignmentDialog }
