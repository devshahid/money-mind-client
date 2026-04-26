import { JSX, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Alert,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { CustomModal } from '../../../shared/components/CustomModal'
import { computeGroupSummary } from '../utils/groupUtils'
import { calculateSettlements } from '../utils/splitCalculations'
import { SPLIT_TYPE_LABELS } from '../types/splitTypes'
import type { ITransactionGroup } from '../store/groupSlice'
import type { ITransactionLogs } from '../store/transactionSlice'

interface GroupSummaryViewProps {
  group: ITransactionGroup
  transactions: ITransactionLogs[]
  onRemoveTransaction: (transactionId: string) => void
  onEditGroup: () => void
  onDeleteGroup: () => void
  onClose: () => void
}

const GroupSummaryView = ({
  group,
  transactions,
  onRemoveTransaction,
  onEditGroup,
  onDeleteGroup,
  onClose,
}: GroupSummaryViewProps): JSX.Element => {
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(false)
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)

  const summary = computeGroupSummary(group, transactions)
  const txMap = new Map(transactions.map(tx => [tx._id, tx]))
  const settlements = calculateSettlements(group.members || [])

  const getNetLabel = (net: number): string => {
    if (net > 0) return 'Owed to you'
    if (net < 0) return 'You owe'
    return ''
  }

  const getMemberNetLabel = (net: number): string => {
    if (net > 0) return 'You owe them'
    if (net < 0) return 'They owe you'
    return 'Settled'
  }

  const handleRemove = (txId: string): void => {
    if (group.transactionIds.length <= 2) {
      setPendingRemoveId(txId)
    } else {
      onRemoveTransaction(txId)
    }
  }

  return (
    <>
      <CustomModal
        modalOpen={true}
        onClose={onClose}
      >
        <Box>
          {/* Header */}
          <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'
            mb={1}
            pr={4}
          >
            <Typography variant='h6'>{group.name}</Typography>
            <Box>
              <IconButton
                size='small'
                onClick={onEditGroup}
                aria-label='Edit group'
              >
                <EditIcon fontSize='small' />
              </IconButton>
              <IconButton
                size='small'
                onClick={() => setConfirmDeleteGroup(true)}
                aria-label='Delete group'
                color='error'
              >
                <DeleteOutlineIcon fontSize='small' />
              </IconButton>
            </Box>
          </Box>

          {group.involvedParty && (
            <Typography
              variant='body2'
              color='text.secondary'
              mb={1}
            >
              Members: {group.involvedParty}
            </Typography>
          )}

          {/* Split Type Badge */}
          {group.splitType && (
            <Box mb={2}>
              <Chip
                label={SPLIT_TYPE_LABELS[group.splitType] || 'Custom Split'}
                size='small'
                color='primary'
                variant='outlined'
              />
            </Box>
          )}

          {/* Settlement Suggestions */}
          {settlements.length > 0 && summary.status === 'Unsettled' && (
            <Alert
              severity='info'
              sx={{ mb: 2 }}
            >
              <Typography
                variant='subtitle2'
                mb={1}
              >
                Settlement Suggestions:
              </Typography>
              {settlements.map((settlement, idx) => (
                <Box
                  key={idx}
                  display='flex'
                  alignItems='center'
                  gap={1}
                  mb={0.5}
                >
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 500 }}
                  >
                    {settlement.from}
                  </Typography>
                  <ArrowForwardIcon fontSize='small' />
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 500 }}
                  >
                    {settlement.to}
                  </Typography>
                  <Typography variant='body2'>₹{settlement.amount.toFixed(2)}</Typography>
                </Box>
              ))}
            </Alert>
          )}

          {/* Per-member settlement */}
          {summary.memberSettlements.length > 0 && (
            <Box mb={2}>
              <Typography
                variant='subtitle2'
                mb={0.5}
              >
                Settlement Breakdown
              </Typography>
              {summary.memberSettlements.map(ms => (
                <Box
                  key={ms.name}
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                  py={0.5}
                  px={1}
                  sx={{ borderRadius: 1, bgcolor: 'action.hover', mb: 0.5 }}
                >
                  <Typography variant='body2'>{ms.name}</Typography>
                  <Box
                    display='flex'
                    gap={1}
                    alignItems='center'
                  >
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Share: ₹{ms.share.toFixed(2)}
                    </Typography>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Paid: ₹{ms.paid.toFixed(2)}
                    </Typography>
                    <Chip
                      label={`₹${Math.abs(ms.net).toFixed(2)} ${getMemberNetLabel(ms.net)}`}
                      size='small'
                      color={ms.net === 0 ? 'success' : ms.net > 0 ? 'error' : 'warning'}
                      variant='outlined'
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* Summary */}
          <Box
            display='flex'
            gap={1}
            flexWrap='wrap'
            mb={2}
          >
            <Chip
              label={`Debits: ₹${summary.totalDebits.toFixed(2)}`}
              color='error'
              variant='outlined'
              size='small'
            />
            <Chip
              label={`Credits: ₹${summary.totalCredits.toFixed(2)}`}
              color='success'
              variant='outlined'
              size='small'
            />
            <Chip
              label={`Net: ₹${Math.abs(summary.netSettlement).toFixed(2)}${summary.netSettlement !== 0 ? ` (${getNetLabel(summary.netSettlement)})` : ''}`}
              color={summary.status === 'Settled' ? 'success' : 'warning'}
              size='small'
            />
            <Chip
              label={summary.status}
              color={summary.status === 'Settled' ? 'success' : 'warning'}
              variant='outlined'
              size='small'
            />
          </Box>

          {group.notes && (
            <Typography
              variant='body2'
              color='text.secondary'
              mb={2}
            >
              {group.notes}
            </Typography>
          )}

          <Divider sx={{ mb: 2 }} />

          {/* Transaction list */}
          <Typography
            variant='subtitle2'
            mb={1}
          >
            Transactions ({group.transactionIds.length})
          </Typography>
          <List
            dense
            disablePadding
          >
            {group.transactionIds.map(txId => {
              const tx = txMap.get(txId)
              if (!tx) {
                return (
                  <ListItem
                    key={txId}
                    secondaryAction={
                      <IconButton
                        edge='end'
                        size='small'
                        onClick={() => handleRemove(txId)}
                        aria-label='Remove transaction'
                      >
                        <RemoveCircleOutlineIcon fontSize='small' />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography
                          variant='body2'
                          color='error'
                        >
                          Transaction not found
                        </Typography>
                      }
                      secondary={txId}
                    />
                  </ListItem>
                )
              }
              return (
                <ListItem
                  key={txId}
                  secondaryAction={
                    <IconButton
                      edge='end'
                      size='small'
                      onClick={() => handleRemove(txId)}
                      aria-label='Remove transaction'
                    >
                      <RemoveCircleOutlineIcon fontSize='small' />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={tx.narration || 'No narration'}
                    secondary={`${tx.transactionDate} · ${tx.isCredit ? 'Credit' : 'Debit'} · ₹${tx.amount}`}
                  />
                </ListItem>
              )
            })}
          </List>
        </Box>
      </CustomModal>

      {/* Confirm delete group dialog */}
      <Dialog
        open={confirmDeleteGroup}
        onClose={() => setConfirmDeleteGroup(false)}
      >
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{group.name}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteGroup(false)}>Cancel</Button>
          <Button
            color='error'
            onClick={() => {
              setConfirmDeleteGroup(false)
              onDeleteGroup()
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm remove transaction (would leave < 2) */}
      <Dialog
        open={!!pendingRemoveId}
        onClose={() => setPendingRemoveId(null)}
      >
        <DialogTitle>Remove Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Removing this transaction would leave the group with fewer than 2 transactions. Would you like to delete the
            entire group instead?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingRemoveId(null)}>Cancel</Button>
          <Button
            onClick={() => {
              setPendingRemoveId(null)
              onRemoveTransaction(pendingRemoveId!)
            }}
          >
            Remove Anyway
          </Button>
          <Button
            color='error'
            onClick={() => {
              setPendingRemoveId(null)
              onDeleteGroup()
            }}
          >
            Delete Group
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export { GroupSummaryView }
