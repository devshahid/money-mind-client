import React, { useState } from 'react'
import { Alert, Button, TextField, Typography } from '@mui/material'
import { CustomModal } from '../../../shared/components/CustomModal'
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/slice-hooks'
import { createGroup, isTransactionGrouped } from '../store/transactionGroupSlice'
import { RootState } from '../../../store'

interface CreateGroupModalProps {
  open: boolean
  onClose: () => void
  selectedTransactionIds: string[]
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ open, onClose, selectedTransactionIds }) => {
  const [groupName, setGroupName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const dispatch = useAppDispatch()
  const groups = useAppSelector((state: RootState) => state.transactionGroups.groups)

  const alreadyGroupedIds = selectedTransactionIds.filter(id => isTransactionGrouped(groups, id))

  const handleCreate = (): void => {
    if (!groupName.trim()) {
      setError('Group name is required.')
      return
    }
    if (selectedTransactionIds.length < 2) {
      setError('Select at least 2 transactions to create a group.')
      return
    }
    if (alreadyGroupedIds.length > 0) {
      setError(`${alreadyGroupedIds.length} selected transaction(s) already belong to a group.`)
      return
    }

    void dispatch(createGroup({ name: groupName.trim(), transactionIds: selectedTransactionIds }))
    setGroupName('')
    setError(null)
    onClose()
  }

  const handleClose = (): void => {
    setGroupName('')
    setError(null)
    onClose()
  }

  return (
    <CustomModal
      modalOpen={open}
      onClose={handleClose}
    >
      <>
        <Typography
          variant='h6'
          mb={2}
        >
          Create Transaction Group
        </Typography>

        {alreadyGroupedIds.length > 0 && (
          <Alert
            severity='warning'
            sx={{ mb: 2 }}
          >
            {alreadyGroupedIds.length} selected transaction(s) already belong to another group and cannot be added.
          </Alert>
        )}

        {selectedTransactionIds.length < 2 && (
          <Alert
            severity='info'
            sx={{ mb: 2 }}
          >
            Select at least 2 transactions to create a group.
          </Alert>
        )}

        <Typography
          variant='body2'
          color='text.secondary'
          mb={2}
        >
          {selectedTransactionIds.length} transaction(s) selected
        </Typography>

        <TextField
          fullWidth
          label='Group Name'
          value={groupName}
          onChange={e => {
            setGroupName(e.target.value)
            setError(null)
          }}
          error={!!error}
          helperText={error}
          sx={{ mb: 2 }}
          autoFocus
        />

        <Button
          fullWidth
          variant='contained'
          onClick={handleCreate}
          disabled={selectedTransactionIds.length < 2 || alreadyGroupedIds.length > 0}
        >
          Create Group
        </Button>
      </>
    </CustomModal>
  )
}

export { CreateGroupModal }
