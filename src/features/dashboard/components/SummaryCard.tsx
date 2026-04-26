import { Card, CardContent, Box, Typography } from '@mui/material'
import { JSX, ElementType } from 'react'

interface SummaryCardProps {
  title: string
  value: string
  icon: ElementType
  color?: string
  subHeading?: string
}

const SummaryCard = ({ title, value, icon: Icon, color = '#1976d2', subHeading }: SummaryCardProps): JSX.Element => {
  return (
    <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={22} />
          </Box>
          <Typography variant='h6'>{title}</Typography>
        </Box>
        <Typography
          variant='h5'
          sx={{ fontWeight: 600 }}
        >
          {value}
        </Typography>
        {subHeading && (
          <Typography
            variant='body2'
            color='text.secondary'
          >
            {subHeading}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export { SummaryCard }
