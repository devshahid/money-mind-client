import { JSX, useState } from 'react'
import { Box, Skeleton, Typography } from '@mui/material'

import { ITransactionLogs } from '../store/transactionSlice'
import { TransactionCard } from './TransactionCard'
import { spacing } from '../../../shared/theme'

type TransactionCardListProps = {
  transactions: ITransactionLogs[]
  loading?: boolean
}

const TransactionCardList = ({ transactions, loading }: TransactionCardListProps): JSX.Element => {
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

  return (
    <Box sx={{ p: spacing[1] }}>
      {transactions.map(tx => (
        <TransactionCard
          key={tx._id}
          transaction={tx}
          isExpanded={expandedId === tx._id}
          onToggle={() => handleToggle(tx._id)}
        />
      ))}
    </Box>
  )
}

export { TransactionCardList }
