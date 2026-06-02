import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  Chip,
  IconButton,
} from '@mui/material'
import { AutoAwesome, CheckCircle, Error as ErrorIcon, Close } from '@mui/icons-material'
import {
  getSuggestedCategories,
  applyCategorySuggestions,
  type CategorySuggestion,
} from '../../ai-chat/services/aiService'

interface Props {
  open: boolean
  onClose: () => void
  transactionIds?: string[]
  categorizeAll?: boolean
  onSuccess?: () => void
}

export const BulkCategorizationDialog: React.FC<Props> = ({
  open,
  onClose,
  transactionIds,
  categorizeAll = false,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CategorySuggestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleCategorize = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await getSuggestedCategories(categorizeAll ? undefined : transactionIds, categorizeAll)
      const suggestions = response.suggestions.map(s => ({
        transactionId: s.transactionId,
        category: s.suggestedCategory,
        confidence: s.confidence,
      }))
      await applyCategorySuggestions(suggestions)
      setResults(response.suggestions)
      setSuccess(true)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Failed to categorize transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = (): void => {
    onClose()
    // Reset state after animation
    setTimeout(() => {
      setResults([])
      setError(null)
      setSuccess(false)
    }, 300)
  }

  const getConfidenceColor = (confidence: number): 'success' | 'warning' | 'error' => {
    if (confidence >= 0.8) return 'success'
    if (confidence >= 0.6) return 'warning'
    return 'error'
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome color='primary' />
          <Typography variant='h6'>AI-Powered Transaction Categorization</Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          size='small'
          aria-label='close'
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {!success && !loading && (
          <Box>
            <Typography
              variant='body1'
              gutterBottom
            >
              {categorizeAll
                ? 'This will categorize all transactions without a category using AI.'
                : `This will categorize ${transactionIds?.length || 0} selected transactions using AI.`}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ mt: 2 }}
            >
              The AI will analyze transaction narrations and automatically assign appropriate categories. Only
              categorizations with confidence {'>'} 60% will be applied.
            </Typography>
            <Alert
              severity='info'
              sx={{ mt: 2 }}
            >
              <Typography variant='body2'>
                <strong>Note:</strong> You can review and modify categories after AI categorization.
              </Typography>
            </Alert>
          </Box>
        )}

        {loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} />
            <Typography
              variant='body1'
              sx={{ mt: 2 }}
            >
              AI is analyzing your transactions...
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
            >
              This may take a few moments
            </Typography>
          </Box>
        )}

        {error && (
          <Alert
            severity='error'
            icon={<ErrorIcon />}
          >
            {error}
          </Alert>
        )}

        {success && results.length > 0 && (
          <Box>
            <Alert
              severity='success'
              icon={<CheckCircle />}
              sx={{ mb: 2 }}
            >
              Successfully categorized {results.length} transactions!
            </Alert>

            <Typography
              variant='h6'
              gutterBottom
            >
              Categorization Results
            </Typography>

            <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
              {results.map((result, index) => (
                <ListItem
                  key={result.transactionId}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    borderBottom: index < results.length - 1 ? '1px solid #eee' : 'none',
                    py: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, width: '100%' }}>
                    <Chip
                      label={result.suggestedCategory}
                      color='primary'
                      size='small'
                    />
                    <Chip
                      label={`${Math.round(result.confidence * 100)}% confident`}
                      color={getConfidenceColor(result.confidence)}
                      size='small'
                      variant='outlined'
                    />
                  </Box>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                  >
                    {result.reasoning}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {success && results.length === 0 && (
          <Alert severity='info'>No transactions were categorized. All transactions may already have categories.</Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={loading}
        >
          {success ? 'Close' : 'Cancel'}
        </Button>
        {!success && !loading && (
          <Button
            onClick={() => void handleCategorize()}
            variant='contained'
            startIcon={<AutoAwesome />}
          >
            Categorize with AI
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
