import React from 'react'
import { Box, Chip, IconButton, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/slice-hooks'
import { acceptSuggestion, rejectSuggestion } from '../../ai-chat/store/aiSlice'
import { setTransaction } from '../store/transactionSlice'
import { IAISuggestion } from '../../ai-chat/types/ai'

interface AIAnnotationSuggestionProps {
  transactionId: string | undefined
  onAccept?: (category: string, labels: string[]) => void
}

const AIAnnotationSuggestion: React.FC<AIAnnotationSuggestionProps> = ({ transactionId, onAccept }) => {
  const dispatch = useAppDispatch()

  const suggestion = useAppSelector(state => {
    const suggestions = (state as unknown as { ai: { annotationSuggestions: IAISuggestion[] } }).ai
      .annotationSuggestions
    return suggestions.find((s: IAISuggestion) => s.transactionId === transactionId)
  })

  // Don't render if no suggestion, or already accepted/rejected
  if (!suggestion || suggestion.accepted !== undefined) {
    return null
  }

  const confidencePercent = Math.round(suggestion.confidence * 100)
  const isLowConfidence = suggestion.confidence < 0.5

  const handleAccept = (): void => {
    if (!transactionId) return

    dispatch(acceptSuggestion(transactionId))
    dispatch(
      setTransaction({
        _id: transactionId,
        category: suggestion.suggestedCategory,
        label: suggestion.suggestedLabels,
      })
    )

    onAccept?.(suggestion.suggestedCategory, suggestion.suggestedLabels)
  }

  const handleReject = (): void => {
    if (!transactionId) return
    dispatch(rejectSuggestion(transactionId))
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
        p: 1.5,
        mb: 2,
        borderRadius: 1,
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <AutoAwesomeIcon
        color='primary'
        fontSize='small'
      />
      <Typography
        variant='body2'
        sx={{ fontWeight: 500, mr: 0.5 }}
      >
        AI Suggestion
      </Typography>
      <Chip
        label={`Confidence: ${confidencePercent}%`}
        size='small'
        color={isLowConfidence ? 'warning' : 'success'}
        variant='outlined'
      />

      {suggestion.suggestedCategory && (
        <Chip
          label={suggestion.suggestedCategory}
          size='small'
          color='primary'
          variant='outlined'
        />
      )}

      {suggestion.suggestedLabels.map(label => (
        <Chip
          key={label}
          label={label}
          size='small'
          variant='outlined'
        />
      ))}

      <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
        <IconButton
          size='small'
          color='success'
          onClick={handleAccept}
          aria-label='Accept AI suggestion'
        >
          <CheckCircleIcon fontSize='small' />
        </IconButton>
        <IconButton
          size='small'
          color='error'
          onClick={handleReject}
          aria-label='Reject AI suggestion'
        >
          <CancelIcon fontSize='small' />
        </IconButton>
      </Box>
    </Box>
  )
}

export { AIAnnotationSuggestion }
