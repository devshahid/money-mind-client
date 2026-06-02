import React from 'react'
import { Alert, Box, Button, Chip, Typography } from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/slice-hooks'
import { createGroup, dismissGroupSuggestion } from '../store/transactionGroupSlice'
import { RootState } from '../../../store'
import { IAIGroupSuggestion } from '../../ai-chat/types/ai'
import { ITransactionLogs } from '../store/transactionSlice'

const AIGroupSuggestion: React.FC = () => {
  const dispatch = useAppDispatch()
  const suggestions = useAppSelector((state: RootState) => state.transactionGroups.aiGroupSuggestions)
  const transactions = useAppSelector((state: RootState) => state.transactions.transactions)

  const activeSuggestions = suggestions.filter(s => !s.dismissed)

  if (activeSuggestions.length === 0) return null

  const handleAccept = (suggestion: IAIGroupSuggestion): void => {
    void dispatch(
      createGroup({
        name: suggestion.suggestedName,
        transactionIds: suggestion.transactionIds,
      })
    )
    dispatch(dismissGroupSuggestion(suggestion.transactionIds))
  }

  const handleDismiss = (suggestion: IAIGroupSuggestion): void => {
    dispatch(dismissGroupSuggestion(suggestion.transactionIds))
  }

  const getNarration = (txId: string): string => {
    const tx = transactions.find((t: ITransactionLogs) => t._id === txId)
    return tx?.narration ?? txId
  }

  return (
    <Box sx={{ mb: 2 }}>
      {activeSuggestions.map((suggestion, idx) => {
        const confidencePercent = Math.round(suggestion.confidence * 100)
        const isLowConfidence = suggestion.confidence < 0.5

        return (
          <Alert
            key={idx}
            severity='info'
            icon={<AutoAwesomeIcon />}
            sx={{ mb: 1 }}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size='small'
                  variant='contained'
                  onClick={() => handleAccept(suggestion)}
                >
                  Accept
                </Button>
                <Button
                  size='small'
                  onClick={() => handleDismiss(suggestion)}
                >
                  Dismiss
                </Button>
              </Box>
            }
          >
            <Typography
              variant='body2'
              fontWeight={500}
            >
              AI suggests grouping: &quot;{suggestion.suggestedName}&quot;
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5, alignItems: 'center' }}>
              <Chip
                label={`Confidence: ${confidencePercent}%`}
                size='small'
                color={isLowConfidence ? 'warning' : 'success'}
                variant='outlined'
              />
              {suggestion.transactionIds.slice(0, 3).map(txId => (
                <Chip
                  key={txId}
                  label={getNarration(txId)}
                  size='small'
                  variant='outlined'
                />
              ))}
              {suggestion.transactionIds.length > 3 && (
                <Typography
                  variant='caption'
                  color='text.secondary'
                >
                  +{suggestion.transactionIds.length - 3} more
                </Typography>
              )}
            </Box>
          </Alert>
        )
      })}
    </Box>
  )
}

export { AIGroupSuggestion }
