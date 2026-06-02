import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Box,
  Alert,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
} from '@mui/material'
import { Psychology, TrendingUp, CheckCircle, PriorityHigh, Timeline, MoneyOff } from '@mui/icons-material'
import { getDebtStrategy, type DebtStrategy } from '../../ai-chat/services/aiService'

export const DebtFreeStrategyCard: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [monthlyIncome, setMonthlyIncome] = useState<number>(200000)
  const [strategy, setStrategy] = useState<DebtStrategy | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const response = await getDebtStrategy(monthlyIncome)
      setStrategy(response.strategy)
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Failed to generate debt strategy')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Psychology
            color='primary'
            fontSize='large'
          />
          <Typography variant='h5'>AI Debt-Free Strategy</Typography>
        </Box>

        <Typography
          variant='body2'
          color='text.secondary'
          gutterBottom
          sx={{ mb: 3 }}
        >
          Get personalized recommendations to become debt-free faster using AI analysis.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            label='Monthly Income (₹)'
            type='number'
            value={monthlyIncome}
            onChange={e => setMonthlyIncome(Number(e.target.value))}
            fullWidth
            variant='outlined'
            disabled={loading}
          />
        </Box>

        <Button
          variant='contained'
          onClick={() => void handleAnalyze()}
          disabled={loading}
          fullWidth
          startIcon={loading ? <CircularProgress size={20} /> : <Psychology />}
          sx={{ mb: 2 }}
        >
          {loading ? 'Analyzing...' : 'Generate Strategy'}
        </Button>

        {error && (
          <Alert
            severity='error'
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {strategy && (
          <Box>
            {/* Financial Overview */}
            <Paper
              elevation={0}
              sx={{ bgcolor: 'primary.50', p: 2, mb: 2 }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                  >
                    Total Debt
                  </Typography>
                  <Typography
                    variant='h6'
                    color='error.main'
                  >
                    ₹{strategy.totalDebt.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                  >
                    Monthly EMI
                  </Typography>
                  <Typography
                    variant='h6'
                    color='warning.main'
                  >
                    ₹{strategy.totalEMI.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                  >
                    Monthly Income
                  </Typography>
                  <Typography
                    variant='h6'
                    color='success.main'
                  >
                    ₹{strategy.monthlyIncome.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                  >
                    Available for Debt
                  </Typography>
                  <Typography
                    variant='h6'
                    color='info.main'
                  >
                    ₹{strategy.availableForDebt.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Strategy */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUp color='primary' />
                <Typography variant='h6'>Strategy</Typography>
              </Box>
              <Typography
                variant='body2'
                sx={{ whiteSpace: 'pre-line' }}
              >
                {strategy.strategy}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Priority Debts */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PriorityHigh color='error' />
                <Typography variant='h6'>Debt Priority</Typography>
              </Box>
              <List dense>
                {strategy.priorityDebts.map(debt => (
                  <ListItem key={debt.debtName}>
                    <ListItemIcon>
                      <Chip
                        label={`#${debt.priority}`}
                        size='small'
                        color='primary'
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={debt.debtName}
                      secondary={debt.reasoning}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Recommendations */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircle color='success' />
                <Typography variant='h6'>Action Items</Typography>
              </Box>
              <List dense>
                {strategy.recommendations.map((rec, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle
                        fontSize='small'
                        color='success'
                      />
                    </ListItemIcon>
                    <ListItemText primary={rec} />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Timeline */}
            <Alert
              severity='info'
              icon={<Timeline />}
            >
              <Typography variant='body2'>
                <strong>Payoff Timeline:</strong> {strategy.payoffTimeline}
              </Typography>
            </Alert>
          </Box>
        )}

        {!strategy && !loading && !error && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <MoneyOff sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography
              variant='body2'
              color='text.secondary'
            >
              Click &quot;Generate Strategy&quot; to get AI-powered debt-free recommendations
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
