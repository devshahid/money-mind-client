import { JSX, useState } from 'react'
import { Box, Checkbox, FormControlLabel, Skeleton, Typography } from '@mui/material'

import { ITransactionLogs } from '../store/transactionSlice'
import { TransactionCard } from './TransactionCard'
import { spacing } from '../../../shared/theme'

type TransactionCardListProps = {
  transactions: ITransactionLogs[]
  loading?: boolean
  selectedIds?: string[]
  isSelected?: (id: string) => boolean
  handleSelectOne?: (id: string) => void
  handleSelectAll?: () => void
  editButtonClickEvents?: (tx: ITransactionLogs) => void
}

const TransactionCardList = ({
  transactions,
  loading,
  selectedIds,
  isSelected,
  handleSelectOne,
  handleSelectAll,
  editButtonClickEvents,
}: TransactionCardListProps): JSX.Element => {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleToggle = (id: string): void => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  if (loading) {
    return (
      <Box sx={{ p: spacing[2] }}>
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton
            key={idx}
            variant='rounded'
            height={80}
            sx={{ mb: spacing[2], borderRadius: 2 }}
          />
        ))}
      </Box>
    )
  }

  if (transactions.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: spacing[10],
        }}
      >
        <Typography
          variant='h6'
          color='text.secondary'
          align='center'
        >
          No transactions found.
        </Typography>
      </Box>
    )
  }

  const allSelected = selectedIds && transactions.length > 0 && selectedIds.length === transactions.length

  return (
    <Box sx={{ p: spacing[1] }}>
      {/* Select All control */}
      {handleSelectAll && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: spacing[2],
            px: spacing[1],
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={allSelected}
                indeterminate={selectedIds && selectedIds.length > 0 && !allSelected}
                onChange={handleSelectAll}
                size='small'
              />
            }
            label={
              <Typography
                variant='caption'
                color='text.secondary'
              >
                {selectedIds && selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select all'}
              </Typography>
            }
          />
        </Box>
      )}

      {transactions.map(tx => (
        <TransactionCard
          key={tx._id}
          transaction={tx}
          isExpanded={expandedId === tx._id}
          onToggle={() => handleToggle(tx._id)}
          isSelected={isSelected ? isSelected(tx._id) : undefined}
          onSelect={handleSelectOne}
          onEdit={editButtonClickEvents}
        />
      ))}
    </Box>
  )
}

export { TransactionCardList }
