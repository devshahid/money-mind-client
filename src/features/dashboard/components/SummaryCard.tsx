import { Card, CardContent, Box, Typography } from '@mui/material'
import { JSX, ElementType } from 'react'
import { colors, spacing, borderRadius } from '../../../shared/theme'

interface SummaryCardProps {
  title: string
  value: string
  icon: ElementType
  color?: string
  subHeading?: string
}

const SummaryCard = ({
  title,
  value,
  icon: Icon,
  color = colors.primary.blue,
  subHeading,
}: SummaryCardProps): JSX.Element => {
  return (
    <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[1], mb: spacing[1] }}>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: borderRadius.base,
              p: spacing[1],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              size={28}
              color={color}
            />
          </Box>
          <Typography variant='h6'>{title}</Typography>
        </Box>
        <Typography
          variant='h4'
          sx={{ fontWeight: 700 }}
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
