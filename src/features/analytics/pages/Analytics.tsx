import { Box, Typography } from '@mui/material'
import { JSX, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { LayoutContextType } from '../../../layouts/main'

const AnalyticsPage = (): JSX.Element => {
  const { setHeader } = useOutletContext<LayoutContextType>()

  useEffect(() => {
    setHeader('Analytics', 'Charts and summaries of your financial data')
  }, [setHeader])

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h5'>Analytics</Typography>
    </Box>
  )
}

export { AnalyticsPage }
