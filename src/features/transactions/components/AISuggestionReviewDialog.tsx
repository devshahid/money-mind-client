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
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material'
import { AutoAwesome, CheckCircle, Info, ThumbUp, ThumbDown, SelectAll, DeselectOutlined } from '@mui/icons-material'
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

export const AISuggestionReviewDialog: React.FC<Props> = ({
  open,
  onClose,
  transactionIds,
  categorizeAll = false,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([])
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'initial' | 'review' | 'applied'>('initial')

  const handleGetSuggestions = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const response = await getSuggestedCategories(categorizeAll ? undefined : transactionIds, categorizeAll)
      setSuggestions(response.suggestions)
      // Auto-select suggestions with confidence > 70%
      const autoSelect = new Set(response.suggestions.filter(s => s.confidence >= 0.7).map(s => s.transactionId))
      setSelectedSuggestions(autoSelect)
      setStep('review')
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Failed to get AI suggestions')
    } finally {
      setLoading(false)
    }
  }

  const handleApplySuggestions = async (): Promise<void> => {
    setApplying(true)
    setError(null)

    try {
      const toApply = suggestions
        .filter(s => selectedSuggestions.has(s.transactionId))
        .map(s => ({
          transactionId: s.transactionId,
          category: s.suggestedCategory,
          confidence: s.confidence,
        }))

      await applyCategorySuggestions(toApply)
      setStep('applied')
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Failed to apply suggestions')
    } finally {
      setApplying(false)
    }
  }

  const handleToggle = (transactionId: string): void => {
    const newSelected = new Set(selectedSuggestions)
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId)
    } else {
      newSelected.add(transactionId)
    }
    setSelectedSuggestions(newSelected)
  }

  const handleSelectAll = (): void => {
    setSelectedSuggestions(new Set(suggestions.map(s => s.transactionId)))
  }

  const handleDeselectAll = (): void => {
    setSelectedSuggestions(new Set())
  }

  const handleClose = (): void => {
    onClose()
    setTimeout(() => {
      setSuggestions([])
      setSelectedSuggestions(new Set())
      setStep('initial')
      setError(null)
    }, 300)
  }

  const getConfidenceColor = (confidence: number): 'success' | 'warning' | 'error' => {
    if (confidence >= 0.8) return 'success'
    if (confidence >= 0.6) return 'warning'
    return 'error'
  }

  const selectedCount = selectedSuggestions.size
  const totalCount = suggestions.length

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullScreen
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesome color='primary' />
        AI Category Suggestions
      </DialogTitle>

      <DialogContent>
        {/* Initial Step */}
        {step === 'initial' && !loading && (
          <Box>
            <Typography
              variant='body1'
              gutterBottom
            >
              {categorizeAll
                ? 'Get AI suggestions for all uncategorized transactions'
                : `Get AI suggestions for ${transactionIds?.length || 0} selected transactions`}
            </Typography>
            <Alert
              severity='info'
              sx={{ mt: 2 }}
            >
              <Typography variant='body2'>
                <strong>How it works:</strong>
              </Typography>
              <ul>
                <li>AI analyzes transaction narrations and suggests appropriate categories</li>
                <li>You can review each suggestion individually</li>
                <li>Accept or reject suggestions - apply only what makes sense</li>
                <li>Transactions with confidence {'>'} 70% are auto-selected</li>
              </ul>
            </Alert>
          </Box>
        )}

        {/* Loading */}
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

        {/* Review Step */}
        {step === 'review' && !loading && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='h6'>Review Suggestions ({totalCount})</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size='small'
                  startIcon={<SelectAll />}
                  onClick={handleSelectAll}
                  disabled={selectedCount === totalCount}
                >
                  Select All
                </Button>
                <Button
                  size='small'
                  startIcon={<DeselectOutlined />}
                  onClick={handleDeselectAll}
                  disabled={selectedCount === 0}
                >
                  Deselect All
                </Button>
              </Box>
            </Box>

            <Alert
              severity='success'
              sx={{ mb: 2 }}
            >
              {selectedCount} of {totalCount} suggestions selected for application
            </Alert>

            <TableContainer
              component={Paper}
              sx={{ maxHeight: 'calc(100vh - 320px)' }}
            >
              <Table
                stickyHeader
                size='small'
              >
                <TableHead>
                  <TableRow>
                    <TableCell padding='checkbox'>Apply</TableCell>
                    <TableCell sx={{ minWidth: 300 }}>Narration</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Current</TableCell>
                    <TableCell>→ AI Suggested</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Reasoning</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suggestions.map(suggestion => {
                    const isSelected = selectedSuggestions.has(suggestion.transactionId)
                    return (
                      <TableRow
                        key={suggestion.transactionId}
                        hover
                      >
                        <TableCell padding='checkbox'>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleToggle(suggestion.transactionId)}
                            icon={
                              <ThumbDown
                                fontSize='small'
                                color='action'
                              />
                            }
                            checkedIcon={
                              <ThumbUp
                                fontSize='small'
                                color='success'
                              />
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 300, maxWidth: 500 }}>
                          <Typography
                            variant='body2'
                            sx={{ wordBreak: 'break-word' }}
                          >
                            {suggestion.narration}
                          </Typography>
                        </TableCell>
                        <TableCell>₹{suggestion.amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Chip
                            label={suggestion.currentCategory || 'None'}
                            size='small'
                            variant='outlined'
                            color='default'
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={suggestion.suggestedCategory}
                            size='small'
                            color='primary'
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${Math.round(suggestion.confidence * 100)}%`}
                            size='small'
                            color={getConfidenceColor(suggestion.confidence)}
                            variant='outlined'
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip
                            title={suggestion.reasoning}
                            arrow
                          >
                            <IconButton size='small'>
                              <Info fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Applied Step */}
        {step === 'applied' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography
              variant='h5'
              gutterBottom
            >
              Successfully Applied!
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
            >
              {selectedCount} transactions have been categorized with AI
            </Typography>
            <Alert
              severity='success'
              sx={{ mt: 2 }}
            >
              Transactions are marked as AI-suggested for your records
            </Alert>
          </Box>
        )}

        {/* Error */}
        {error && (
          <Alert
            severity='error'
            sx={{ mt: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Applying Progress */}
        {applying && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography
              variant='body2'
              sx={{ mt: 1, textAlign: 'center' }}
            >
              Applying {selectedCount} suggestions...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={loading || applying}
        >
          {step === 'applied' ? 'Close' : 'Cancel'}
        </Button>

        {step === 'initial' && (
          <Button
            onClick={() => void handleGetSuggestions()}
            disabled={loading}
            variant='contained'
            startIcon={<AutoAwesome />}
          >
            Get AI Suggestions
          </Button>
        )}

        {step === 'review' && (
          <Button
            onClick={() => void handleApplySuggestions()}
            disabled={applying || selectedCount === 0}
            variant='contained'
            color='success'
            startIcon={applying ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            Apply {selectedCount} Suggestion{selectedCount !== 1 ? 's' : ''}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
