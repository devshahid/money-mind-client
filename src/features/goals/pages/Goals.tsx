import { JSX, useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Chip, LinearProgress, Skeleton, TextField, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useOutletContext } from 'react-router-dom'

import { LayoutContextType } from '../../../layouts/main'
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/slice-hooks'
import { listGoals, createGoal } from '../store/goalSlice'
import { IGoal } from '../types/goal'
import { CustomModal } from '../../../shared/components/CustomModal'
import { spacing } from '../../../shared/theme'

type GoalSliceState = {
  goals: { goals: IGoal[]; loading: boolean }
}

const GoalsPage = (): JSX.Element => {
  const { setHeader } = useOutletContext<LayoutContextType>()
  const dispatch = useAppDispatch()
  const goals = useAppSelector((state: unknown) => (state as GoalSliceState).goals.goals)
  const loading = useAppSelector((state: unknown) => (state as GoalSliceState).goals.loading)

  const [openModal, setOpenModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', targetAmount: '', deadline: '', description: '' })

  useEffect(() => {
    setHeader('Goals', 'Track your savings goals')
  }, [setHeader])

  useEffect(() => {
    void dispatch(listGoals())
  }, [dispatch])

  const handleCreateGoal = (): void => {
    if (!formData.name || !formData.targetAmount) return
    void dispatch(
      createGoal({
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        deadline: formData.deadline || undefined,
        description: formData.description || undefined,
      })
    )
    setOpenModal(false)
    setFormData({ name: '', targetAmount: '', deadline: '', description: '' })
  }

  const formatCurrency = (n: number): string => `₹${n.toLocaleString('en-IN')}`

  if (loading && goals.length === 0) {
    return (
      <Box sx={{ p: spacing[2] }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: spacing[2] }}>
          <Skeleton
            variant='rounded'
            width={120}
            height={40}
          />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: spacing[3],
          }}
        >
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton
              key={idx}
              variant='rounded'
              height={160}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ p: spacing[2] }}>
      {/* Header Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: spacing[3] }}>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ minHeight: 44 }}
        >
          Add Goal
        </Button>
      </Box>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Box sx={{ py: spacing[10], textAlign: 'center' }}>
          <Typography
            variant='h6'
            color='text.secondary'
          >
            No goals yet. Create your first savings goal!
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: spacing[3],
          }}
        >
          {goals.map((goal: IGoal) => {
            const progress =
              goal.targetAmount > 0 ? Math.min((goal.currentSavedAmount / goal.targetAmount) * 100, 100) : 0

            return (
              <Card
                key={goal._id}
                elevation={1}
              >
                <CardContent sx={{ p: spacing[3] }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: spacing[2] }}
                  >
                    <Typography
                      variant='body1'
                      fontWeight={600}
                      sx={{ flex: 1 }}
                    >
                      {goal.name}
                    </Typography>
                    <Chip
                      label={goal.isAchieved ? 'Achieved' : 'Active'}
                      size='small'
                      color={goal.isAchieved ? 'success' : 'primary'}
                    />
                  </Box>

                  {goal.description && (
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block', mb: spacing[2] }}
                    >
                      {goal.description}
                    </Typography>
                  )}

                  {/* Progress bar */}
                  <Box sx={{ mb: spacing[1] }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                      >
                        {formatCurrency(goal.currentSavedAmount)}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                      >
                        {formatCurrency(goal.targetAmount)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ mt: 0.5, display: 'block' }}
                    >
                      {progress.toFixed(0)}% complete
                    </Typography>
                  </Box>

                  {goal.deadline && (
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </Box>
      )}

      {/* Create Goal Modal */}
      <CustomModal
        modalOpen={openModal}
        onClose={() => setOpenModal(false)}
      >
        <Box>
          <Typography
            variant='h6'
            sx={{ mb: spacing[3] }}
          >
            Create Goal
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
            <TextField
              label='Goal Name'
              fullWidth
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label='Target Amount'
              type='number'
              fullWidth
              value={formData.targetAmount}
              onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
            />
            <TextField
              label='Deadline'
              type='date'
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.deadline}
              onChange={e => setFormData({ ...formData, deadline: e.target.value })}
            />
            <TextField
              label='Description'
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
            <Button
              variant='contained'
              fullWidth
              onClick={handleCreateGoal}
              sx={{ mt: spacing[1], minHeight: 44 }}
            >
              Create Goal
            </Button>
          </Box>
        </Box>
      </CustomModal>
    </Box>
  )
}

export { GoalsPage }
