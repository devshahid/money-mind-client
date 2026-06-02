import { Box, Button } from '@mui/material'
import { axiosClient } from '../../../shared/services/axiosClient'
import { JSX } from 'react'

function Account(): JSX.Element {
  const handleDeleteAll = async (): Promise<void> => {
    try {
      const response = await axiosClient.delete('transaction-logs/delete-all-transactions')
      console.log(response.data)
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <div>
      <h1>Account</h1>
      <Box>
        <Button
          variant='outlined'
          onClick={() => void handleDeleteAll()}
        >
          Delete All Transactions
        </Button>
      </Box>
    </div>
  )
}

export { Account as AccountPage }
