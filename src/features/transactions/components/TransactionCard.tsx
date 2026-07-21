import { JSX } from 'react'
import { Box, Card, CardContent, Checkbox, Chip, Collapse, Divider, IconButton, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import dayjs from 'dayjs'

import { ITransactionLogs } from '../store/transactionSlice'
import { getExpenseCategories } from '../../../constants'
import { spacing } from '../../../shared/theme'

type TransactionCardProps = {
  transaction: ITransactionLogs
  isExpanded: boolean
  onToggle: () => void
  isSelected?: boolean
  onSelect?: (id: string) => void
  onEdit?: (tx: ITransactionLogs) => void
}

const TransactionCard = ({
  transaction,
  isExpanded,
  onToggle,
  isSelected,
  onSelect,
  onEdit,
}: TransactionCardProps): JSX.Element => {
  const categoryData = getExpenseCategories().find(cat => cat.name === transaction.category)
  const displayCategory = transaction.category
    ? transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)
    : '—'

  return (
    <Card
      elevation={1}
      sx={{
        mb: spacing[2],
        cursor: 'pointer',
        '&:active': { opacity: 0.9 },
        ...(isSelected && { borderLeft: '3px solid', borderColor: 'primary.main' }),
      }}
    >
      <CardContent sx={{ p: spacing[3], '&:last-child': { pb: spacing[3] } }}>
        {/* Summary Row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: spacing[1] }}>
          {/* Checkbox */}
          {onSelect && (
            <Checkbox
              checked={isSelected}
              onChange={e => {
                e.stopPropagation()
                onSelect(transaction._id)
              }}
              onClick={e => e.stopPropagation()}
              size='small'
              sx={{ mt: -0.5, flexShrink: 0 }}
            />
          )}

          {/* Content - tappable to expand */}
          <Box
            sx={{ flex: 1, minWidth: 0 }}
            onClick={onToggle}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing[2] }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                >
                  {transaction.transactionDate ? dayjs(transaction.transactionDate).format('DD/MM/YYYY') : '—'}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ mt: 0.5 }}
                >
                  {transaction.narration || '—'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography
                  variant='body1'
                  fontWeight='bold'
                  color={transaction.isCredit ? 'success.main' : 'error.main'}
                >
                  ₹{Number(transaction.amount || 0).toFixed(2)}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                >
                  {transaction.isCredit ? 'Credit' : 'Debit'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Expanded Details */}
        <Collapse in={isExpanded}>
          <Divider sx={{ my: spacing[2] }} />

          {/* Category */}
          {transaction.category && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: spacing[3] }}>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ minWidth: 70 }}
              >
                Category:
              </Typography>
              {categoryData ? (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    backgroundColor: categoryData.backgroundColor,
                    px: spacing[2],
                    py: spacing[1],
                    borderRadius: '12px',
                    color: '#000',
                  }}
                >
                  <categoryData.icon style={{ color: categoryData.color, fontSize: 16 }} />
                  <Typography
                    variant='caption'
                    sx={{ color: '#000' }}
                  >
                    {displayCategory}
                  </Typography>
                </Box>
              ) : (
                <Typography variant='body2'>{displayCategory}</Typography>
              )}
            </Box>
          )}

          {/* Notes */}
          {transaction.notes && (
            <Box sx={{ display: 'flex', gap: 1, mb: spacing[3] }}>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ minWidth: 70 }}
              >
                Notes:
              </Typography>
              <Typography variant='body2'>{transaction.notes}</Typography>
            </Box>
          )}

          {/* Labels */}
          {transaction.label && transaction.label.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, mb: spacing[3], flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ minWidth: 70 }}
              >
                Labels:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {transaction.label.map((label, idx) => (
                  <Chip
                    key={idx}
                    label={label}
                    size='small'
                    variant='outlined'
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Bank */}
          {transaction.bankName && (
            <Box sx={{ display: 'flex', gap: 1, mb: spacing[3] }}>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ minWidth: 70 }}
              >
                Bank:
              </Typography>
              <Typography variant='body2'>{transaction.bankName}</Typography>
            </Box>
          )}

          {/* Edit button */}
          {onEdit && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: spacing[1] }}>
              <IconButton
                color='primary'
                onClick={e => {
                  e.stopPropagation()
                  onEdit(transaction)
                }}
                sx={{ minWidth: 44, minHeight: 44 }}
                aria-label='Edit transaction'
              >
                <EditIcon />
              </IconButton>
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  )
}

export { TransactionCard }
