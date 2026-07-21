import { JSX, useState } from 'react'
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
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  type SelectChangeEvent,
} from '@mui/material'
import {
  AutoAwesome,
  CheckCircle,
  Info,
  ThumbUp,
  ThumbDown,
  SelectAll,
  DeselectOutlined,
  Edit,
} from '@mui/icons-material'
import {
  getSuggestedCategories,
  applyCategorySuggestions,
  type CategorySuggestion,
} from '../../ai-chat/services/aiService'
import { getExpenseCategories } from '../../../constants'
import { useResponsive } from '../../../shared/hooks/useResponsive'
import { spacing } from '../../../shared/theme'

type Props = {
  open: boolean
  onClose: () => void
  transactionIds?: string[]
  categorizeAll?: boolean
  onSuccess?: () => void
}

const AISuggestionReviewDialog = ({
  open,
  onClose,
  transactionIds,
  categorizeAll = false,
  onSuccess,
}: Props): JSX.Element => {
  const { isMobile } = useResponsive()
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([])
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'initial' | 'review' | 'applied'>('initial')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [userOverrides, setUserOverrides] = useState<Set<string>>(new Set())

  const categories = getExpenseCategories()

  const handleGetSuggestions = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const response = await getSuggestedCategories(categorizeAll ? undefined : transactionIds, categorizeAll)
      setSuggestions(response.suggestions)
      const autoSelect = new Set(response.suggestions.filter(s => s.confidence >= 0.7).map(s => s.transactionId))
      setSelectedSuggestions(autoSelect)
      setStep('review')
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { message?: string } } }
      if (error.response?.status === 504) {
        setError('AI took too long to respond. Please try again with fewer transactions.')
      } else {
        setError(error.response?.data?.message || 'Failed to get AI suggestions')
      }
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
          confidence: userOverrides.has(s.transactionId) ? 1 : s.confidence,
          userOverride: userOverrides.has(s.transactionId),
        }))

      await applyCategorySuggestions(toApply)
      setStep('applied')
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { message?: string } } }
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

  const handleCategoryChange = (transactionId: string, newCategory: string): void => {
    setSuggestions(prev =>
      prev.map(s => (s.transactionId === transactionId ? { ...s, suggestedCategory: newCategory } : s))
    )
    setUserOverrides(prev => new Set(prev).add(transactionId))
    setSelectedSuggestions(prev => new Set(prev).add(transactionId))
    setEditingId(null)
  }

  const handleClose = (): void => {
    onClose()
    setTimeout(() => {
      setSuggestions([])
      setSelectedSuggestions(new Set())
      setUserOverrides(new Set())
      setEditingId(null)
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

  // --- Mobile Card View for Suggestions ---
  const renderMobileSuggestions = (): JSX.Element => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
      {suggestions.map(suggestion => {
        const isSelected = selectedSuggestions.has(suggestion.transactionId)
        const isEditing = editingId === suggestion.transactionId
        const isOverridden = userOverrides.has(suggestion.transactionId)

        return (
          <Card
            key={suggestion.transactionId}
            elevation={1}
          >
            <CardContent sx={{ p: spacing[3], '&:last-child': { pb: spacing[3] } }}>
              {/* Top row: checkbox + narration */}
              <Box sx={{ display: 'flex', gap: spacing[2], alignItems: 'flex-start' }}>
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
                  sx={{ mt: -0.5, flexShrink: 0 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant='body2'
                    sx={{ mb: spacing[1] }}
                  >
                    {suggestion.narration}
                  </Typography>
                  <Typography
                    variant='body1'
                    fontWeight='bold'
                    color={suggestion.isCredit ? 'success.main' : 'error.main'}
                  >
                    ₹{suggestion.amount.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: spacing[2] }} />

              {/* Category + Confidence row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: spacing[2] }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                  >
                    →
                  </Typography>
                  {isEditing ? (
                    <Select
                      value={suggestion.suggestedCategory}
                      onChange={(e: SelectChangeEvent) =>
                        handleCategoryChange(suggestion.transactionId, e.target.value)
                      }
                      size='small'
                      fullWidth
                      autoFocus
                      onBlur={() => setEditingId(null)}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                    >
                      {categories.map(cat => (
                        <MenuItem
                          key={cat.name}
                          value={cat.name}
                        >
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <Chip
                      label={suggestion.suggestedCategory}
                      size='small'
                      color={isOverridden ? 'secondary' : 'primary'}
                      onClick={() => setEditingId(suggestion.transactionId)}
                      onDelete={() => setEditingId(suggestion.transactionId)}
                      deleteIcon={<Edit sx={{ fontSize: '14px !important' }} />}
                      sx={{ cursor: 'pointer' }}
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                  {isOverridden ? (
                    <Chip
                      label='User'
                      size='small'
                      color='secondary'
                      variant='outlined'
                    />
                  ) : (
                    <Chip
                      label={`${Math.round(suggestion.confidence * 100)}%`}
                      size='small'
                      color={getConfidenceColor(suggestion.confidence)}
                      variant='outlined'
                    />
                  )}
                </Box>
              </Box>

              {/* Reasoning shown directly on mobile */}
              {suggestion.reasoning && !isOverridden && (
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mt: spacing[1], display: 'block', fontStyle: 'italic' }}
                >
                  💡 {suggestion.reasoning}
                </Typography>
              )}
            </CardContent>
          </Card>
        )
      })}
    </Box>
  )

  // --- Desktop Table View for Suggestions ---
  const renderDesktopSuggestions = (): JSX.Element => (
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
            <TableCell>→ Category</TableCell>
            <TableCell>Confidence</TableCell>
            <TableCell>Reasoning</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {suggestions.map(suggestion => {
            const isSelected = selectedSuggestions.has(suggestion.transactionId)
            const isEditing = editingId === suggestion.transactionId
            const isOverridden = userOverrides.has(suggestion.transactionId)
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
                <TableCell sx={{ fontWeight: 'bold', color: suggestion.isCredit ? 'success.main' : 'error.main' }}>
                  ₹{suggestion.amount.toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={suggestion.currentCategory || 'None'}
                    size='small'
                    variant='outlined'
                    color='default'
                  />
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Select
                      value={suggestion.suggestedCategory}
                      onChange={(e: SelectChangeEvent) =>
                        handleCategoryChange(suggestion.transactionId, e.target.value)
                      }
                      size='small'
                      autoFocus
                      onBlur={() => setEditingId(null)}
                      sx={{ minWidth: 160 }}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                    >
                      {categories.map(cat => (
                        <MenuItem
                          key={cat.name}
                          value={cat.name}
                        >
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <Chip
                      label={suggestion.suggestedCategory}
                      size='small'
                      color={isOverridden ? 'secondary' : 'primary'}
                      onClick={() => setEditingId(suggestion.transactionId)}
                      onDelete={() => setEditingId(suggestion.transactionId)}
                      deleteIcon={
                        <Edit
                          fontSize='small'
                          sx={{ fontSize: '14px !important' }}
                        />
                      }
                      sx={{ cursor: 'pointer' }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {isOverridden ? (
                    <Chip
                      label='User'
                      size='small'
                      color='secondary'
                      variant='outlined'
                    />
                  ) : (
                    <Chip
                      label={`${Math.round(suggestion.confidence * 100)}%`}
                      size='small'
                      color={getConfidenceColor(suggestion.confidence)}
                      variant='outlined'
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip
                    title={isOverridden ? 'Manually changed by you' : suggestion.reasoning}
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
  )

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullScreen
      sx={{ zIndex: 1300 }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesome color='primary' />
        <Typography
          variant='h6'
          component='span'
          sx={{ flex: 1 }}
        >
          AI Category Suggestions
        </Typography>
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
                <li>AI analyzes transaction narrations and suggests categories</li>
                <li>You can review each suggestion individually</li>
                <li>Click on a suggested category to change it manually</li>
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: spacing[2],
                mb: 2,
              }}
            >
              <Typography variant='h6'>Review ({totalCount})</Typography>
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
                  Deselect
                </Button>
              </Box>
            </Box>

            <Alert
              severity='success'
              sx={{ mb: 2 }}
            >
              {selectedCount} of {totalCount} selected
              {userOverrides.size > 0 && ` (${userOverrides.size} manually changed)`}
            </Alert>

            {isMobile ? renderMobileSuggestions() : renderDesktopSuggestions()}
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
              {selectedCount} transactions have been categorized
            </Typography>
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

      <DialogActions sx={{ px: spacing[3], pb: spacing[3] }}>
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
            Get Suggestions
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
            Apply {selectedCount} Suggestions
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export { AISuggestionReviewDialog }
