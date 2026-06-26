import { useState } from 'react'
import {
  Paper,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Chip,
  TextField,
} from '@mui/material'
import { Brain, ChevronDown, TrendingUp, Lightbulb } from 'lucide-react'

import { spacing, colors } from '../../../shared/theme'
import type { IDebtStrategy } from '../types/debt'

interface DebtStrategyPanelProps {
  strategy: IDebtStrategy | null
  loading: boolean
  error: string | null
  onFetchStrategy: (monthlyIncome?: number, monthlyExpenses?: number) => void
}

export const DebtStrategyPanel = ({ strategy, loading, error, onFetchStrategy }: DebtStrategyPanelProps) => {
  const [monthlyIncome, setMonthlyIncome] = useState<string>('')
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>('')
  const [showInputs, setShowInputs] = useState<boolean>(false)

  const handleFetchStrategy = () => {
    const income = monthlyIncome ? parseFloat(monthlyIncome) : undefined
    const expenses = monthlyExpenses ? parseFloat(monthlyExpenses) : undefined
    onFetchStrategy(income, expenses)
    setShowInputs(false)
  }

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

  return (
    <Paper sx={{ p: spacing[3], mb: spacing[3] }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: spacing[2] }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
          <Brain
            size={24}
            color={colors.accent.purple}
          />
          <Typography
            variant='h6'
            sx={{ fontWeight: 700 }}
          >
            AI Debt Repayment Strategy
          </Typography>
        </Box>
        <Button
          variant='outlined'
          onClick={() => setShowInputs(!showInputs)}
          disabled={loading}
        >
          {showInputs ? 'Cancel' : 'Get AI Strategy'}
        </Button>
      </Box>

      {showInputs && (
        <Box
          sx={{
            display: 'flex',
            gap: spacing[2],
            mb: spacing[2],
            flexWrap: 'wrap',
          }}
        >
          <TextField
            label='Monthly Income (Optional)'
            type='number'
            value={monthlyIncome}
            onChange={e => setMonthlyIncome(e.target.value)}
            sx={{ flex: '1 1 200px' }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: spacing[1] }}>₹</Typography>,
            }}
          />
          <TextField
            label='Monthly Expenses (Optional)'
            type='number'
            value={monthlyExpenses}
            onChange={e => setMonthlyExpenses(e.target.value)}
            sx={{ flex: '1 1 200px' }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: spacing[1] }}>₹</Typography>,
            }}
          />
          <Button
            variant='contained'
            onClick={handleFetchStrategy}
            disabled={loading}
            sx={{ alignSelf: 'center' }}
          >
            Analyze
          </Button>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: spacing[4] }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity='error'>{error}</Alert>}

      {!loading && !error && strategy && strategy.monthlyRecommendation && (
        <Box>
          <Alert
            severity='success'
            icon={<TrendingUp size={20} />}
            sx={{ mb: spacing[2] }}
          >
            <Typography
              variant='body1'
              sx={{ fontWeight: 600 }}
            >
              Recommended Method: {strategy.recommendedMethod}
            </Typography>
            <Typography variant='body2'>{strategy.strategyExplanation}</Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: spacing[2], mb: spacing[2], flexWrap: 'wrap' }}>
            <Paper
              sx={{
                p: spacing[2],
                flex: '1 1 200px',
                backgroundColor: theme =>
                  theme.palette.mode === 'light' ? colors.background.lavender : theme.palette.action.selected,
              }}
            >
              <Typography
                variant='body2'
                color='text.secondary'
              >
                Minimum Payments
              </Typography>
              <Typography
                variant='h6'
                sx={{ fontWeight: 700 }}
              >
                {formatCurrency(strategy.monthlyRecommendation.minimumPayments)}
              </Typography>
            </Paper>
            <Paper
              sx={{
                p: spacing[2],
                flex: '1 1 200px',
                backgroundColor: theme =>
                  theme.palette.mode === 'light' ? colors.background.lavender : theme.palette.action.selected,
              }}
            >
              <Typography
                variant='body2'
                color='text.secondary'
              >
                Extra Payment Suggested
              </Typography>
              <Typography
                variant='h6'
                sx={{ fontWeight: 700, color: 'success.main' }}
              >
                {formatCurrency(strategy.monthlyRecommendation.extraPaymentSuggestion)}
              </Typography>
            </Paper>
            <Paper
              sx={{
                p: spacing[2],
                flex: '1 1 200px',
                backgroundColor: theme =>
                  theme.palette.mode === 'light' ? colors.background.lavender : theme.palette.action.selected,
              }}
            >
              <Typography
                variant='body2'
                color='text.secondary'
              >
                Potential Savings
              </Typography>
              <Typography
                variant='h6'
                sx={{ fontWeight: 700, color: 'info.main' }}
              >
                {formatCurrency(strategy.potentialSavings)}
              </Typography>
            </Paper>
          </Box>

          <Accordion>
            <AccordionSummary expandIcon={<ChevronDown />}>
              <Typography sx={{ fontWeight: 600 }}>Priority Payment Order</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {strategy.priorityOrder.map(item => (
                  <ListItem key={item.debtId}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                          <Chip
                            label={`#${item.order}`}
                            size='small'
                            color='primary'
                          />
                          <Typography>{item.debtName}</Typography>
                        </Box>
                      }
                      secondary={item.reason}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ChevronDown />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                <Lightbulb size={20} />
                <Typography sx={{ fontWeight: 600 }}>Expert Tips</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {strategy.tips.map((tip, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Alert
            severity='info'
            sx={{ mt: spacing[2] }}
          >
            <Typography variant='body2'>
              <strong>Estimated Timeline:</strong> {strategy.estimatedPayoffTimeline}
            </Typography>
          </Alert>
        </Box>
      )}

      {!strategy && !loading && !error && (
        <Alert severity='info'>
          Click &ldquo;Get AI Strategy&rdquo; to receive personalized debt repayment recommendations.
        </Alert>
      )}
    </Paper>
  )
}
