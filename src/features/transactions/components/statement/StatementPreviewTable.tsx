import React, { useContext } from 'react'
import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import dayjs from 'dayjs'
import { ColorModeContext } from '../../../../shared/contexts/ThemeContext'
import { commonTableHeadingStyles } from '../../../../constants'

export interface PreviewRow {
  transactionDate: string
  narration: string
  amount: string
  isCredit: boolean
  bankName: string
  isDuplicate: boolean
  /** "skip" or "overwrite" — only meaningful when isDuplicate is true */
  duplicateAction: 'skip' | 'overwrite'
}

interface StatementPreviewTableProps {
  rows: PreviewRow[]
  onDuplicateActionChange: (index: number, action: 'skip' | 'overwrite') => void
}

const StatementPreviewTable: React.FC<StatementPreviewTableProps> = ({ rows, onDuplicateActionChange }) => {
  const { mode } = useContext(ColorModeContext)

  const headingStyle = commonTableHeadingStyles(mode)

  return (
    <TableContainer sx={{ maxHeight: '60vh' }}>
      <Table
        stickyHeader
        aria-label='statement preview table'
        size='small'
      >
        <TableHead>
          <TableRow>
            <TableCell sx={headingStyle}>Date</TableCell>
            <TableCell sx={headingStyle}>Narration</TableCell>
            <TableCell sx={headingStyle}>Type</TableCell>
            <TableCell sx={headingStyle}>Amount</TableCell>
            <TableCell sx={headingStyle}>Bank</TableCell>
            <TableCell sx={headingStyle}>Status</TableCell>
            <TableCell sx={headingStyle}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={index}
              sx={{
                backgroundColor: row.isDuplicate
                  ? mode === 'dark'
                    ? 'rgba(255, 152, 0, 0.08)'
                    : 'rgba(255, 152, 0, 0.06)'
                  : 'inherit',
              }}
            >
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{dayjs(row.transactionDate).format('DD/MM/YYYY')}</TableCell>
              <TableCell sx={{ maxWidth: 300 }}>
                <Typography
                  variant='body2'
                  noWrap
                  title={row.narration}
                >
                  {row.narration}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{row.isCredit ? 'Credit' : 'Debit'}</TableCell>
              <TableCell
                sx={{
                  whiteSpace: 'nowrap',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: row.isCredit ? '#4CAF50' : '#F44336',
                }}
              >
                ₹ {Number(row.amount).toFixed(2)}
              </TableCell>
              <TableCell>{row.bankName}</TableCell>
              <TableCell>
                {row.isDuplicate ? (
                  <Chip
                    icon={<WarningAmberIcon />}
                    label='Duplicate'
                    size='small'
                    color='warning'
                    variant='outlined'
                  />
                ) : (
                  <Chip
                    label='New'
                    size='small'
                    color='success'
                    variant='outlined'
                  />
                )}
              </TableCell>
              <TableCell>
                {row.isDuplicate ? (
                  <ToggleButtonGroup
                    value={row.duplicateAction}
                    exclusive
                    size='small'
                    onChange={(_, value: 'skip' | 'overwrite' | null) => {
                      if (value !== null) {
                        onDuplicateActionChange(index, value)
                      }
                    }}
                  >
                    <ToggleButton
                      value='skip'
                      aria-label='skip duplicate'
                    >
                      Skip
                    </ToggleButton>
                    <ToggleButton
                      value='overwrite'
                      aria-label='overwrite duplicate'
                    >
                      Overwrite
                    </ToggleButton>
                  </ToggleButtonGroup>
                ) : (
                  <Box sx={{ pl: 1 }}>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      Import
                    </Typography>
                  </Box>
                )}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                sx={{ textAlign: 'center', py: 4 }}
              >
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  No rows to preview.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export { StatementPreviewTable }
