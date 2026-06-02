import {
  Box,
  Checkbox,
  Chip,
  IconButton,
  PaperTypeMap,
  Popover,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { JSX, useContext, useState } from 'react'
import { ColorModeContext } from '../../../shared/contexts/ThemeContext'
import { columnHeaderOptions, commonTableHeadingStyles, getExpenseCategories } from '../../../constants'
import { ITransactionLogs } from '../store/transactionSlice'
import { ITransactionGroup, selectTransactionGroupMap } from '../store/groupSlice'
import { computeGroupSummary } from '../utils/groupUtils'
import EditIcon from '@mui/icons-material/Edit'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useAppSelector } from '../../../shared/hooks/slice-hooks'
import { RootState } from '../../../store'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import dayjs from 'dayjs'

type Props = {
  type: 'mini' | 'full'
  selectedIds?: string[]
  isSelected?: (x: string) => boolean
  handleSelectOne?: (x: string) => void
  editButtonClickEvents?: (x: ITransactionLogs) => void
  handleSelectAll?: () => void
  sx?: SxProps<Theme>
  component?: OverridableComponent<PaperTypeMap<object, 'div'>>
  groups?: ITransactionGroup[]
  onGroupBadgeClick?: (groupId: string) => void
  onGroupInfoClick?: (event: React.MouseEvent, transactionId: string) => void
}

const CustomTable = ({
  type,
  selectedIds,
  isSelected,
  handleSelectOne,
  editButtonClickEvents,
  handleSelectAll,
  sx,
  component,
  groups,
  onGroupBadgeClick,
}: Props): JSX.Element => {
  const { mode } = useContext(ColorModeContext)

  const { transactions } = useAppSelector((state: RootState) => state.transactions)
  const transactionGroupMap = useAppSelector(selectTransactionGroupMap)

  const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLElement | null>(null)
  const [infoTxId, setInfoTxId] = useState<string | null>(null)

  const handleInfoClick = (event: React.MouseEvent<HTMLElement>, txId: string): void => {
    setInfoAnchorEl(event.currentTarget)
    setInfoTxId(txId)
  }

  const handleInfoClose = (): void => {
    setInfoAnchorEl(null)
    setInfoTxId(null)
  }

  const infoOpen = Boolean(infoAnchorEl)
  const infoGroups = infoTxId ? (transactionGroupMap[infoTxId] ?? []) : []

  const showGroupColumn = !!groups
  const tableLabelStyles = {
    padding: '4px 8px', // Adjusted padding
    borderRadius: '8px', // More rounded corners
    backgroundColor: '#e0e0e0', // Light background for labels
    color: '#424242', // Darker text for contrast
    border: '1px solid #bdbdbd', // Subtle border
    display: 'inline-flex', // Use inline-flex for better alignment
    alignItems: 'center',
    margin: '2px',
  }

  return (
    <>
      <TableContainer
        sx={sx}
        {...(component && { component })}
      >
        <Table
          stickyHeader
          aria-label='sticky table'
        >
          <TableHead>
            <TableRow>
              {selectedIds && type === 'full' && (
                <TableCell sx={{ backgroundColor: mode === 'dark' ? '#222126' : '#F6F5FF' }}>
                  <Checkbox
                    color='primary'
                    indeterminate={selectedIds.length > 0 && selectedIds.length < transactions.length}
                    checked={transactions.length > 0 && selectedIds.length === transactions.length}
                    onChange={handleSelectAll}
                    sx={{
                      color: '#8578e5',
                      '&.Mui-checked': {
                        color: '#8578e5',
                      },
                      '&.MuiCheckbox-indeterminate': {
                        color: '#8578e5',
                      },
                      '&.MuiCheckbox-root:hover': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  />
                </TableCell>
              )}
              {columnHeaderOptions.map((option, i) => (
                <TableCell
                  key={i}
                  sx={{ ...commonTableHeadingStyles(mode) }}
                >
                  {option}
                </TableCell>
              ))}
              {showGroupColumn && <TableCell sx={{ ...commonTableHeadingStyles(mode) }}>Group</TableCell>}
              {type === 'full' && <TableCell sx={{ ...commonTableHeadingStyles(mode) }}>Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx: ITransactionLogs) => (
              <TableRow
                key={tx._id}
                hover
                selected={isSelected ? !!isSelected(tx._id) : false}
              >
                {type === 'full' && (
                  <TableCell>
                    <Checkbox
                      color='primary'
                      checked={isSelected ? isSelected(tx._id) : false}
                      onChange={() => handleSelectOne?.(tx._id)}
                    />
                  </TableCell>
                )}

                <TableCell sx={{ textAlign: 'center', fontSize: '1rem' }}>
                  {dayjs(tx.transactionDate).format('DD/MM/YYYY')}
                </TableCell>
                <TableCell sx={{ fontSize: '1rem' }}>{tx.narration}</TableCell>
                <TableCell sx={{ fontSize: '1rem' }}>{tx.notes}</TableCell>

                {/* Category Component */}
                <CategoryTransactionRow tx={tx} />

                <TableCell>
                  <Tooltip
                    title={
                      <Box>
                        {tx.label.map((label, index) => (
                          <Typography
                            key={index}
                            variant='body2'
                          >
                            {label}
                          </Typography>
                        ))}
                      </Box>
                    }
                    arrow
                    placement='top-start'
                  >
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200, overflow: 'hidden' }}>
                      {tx.label.slice(0, 2).map((label, index) => (
                        <Typography
                          key={index}
                          variant='body2'
                          sx={{
                            ...tableLabelStyles,
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            maxWidth: 100,
                          }}
                        >
                          {label}
                        </Typography>
                      ))}
                      {tx.label.length > 2 && (
                        <Typography
                          variant='body2'
                          sx={{ opacity: 0.6 }}
                        >
                          ...+{tx.label.length - 2}
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                </TableCell>

                <TableCell sx={{ fontSize: '1rem' }}>{tx.bankName}</TableCell>
                <TableCell sx={{ fontSize: '1rem' }}>{tx.isCredit ? 'Credit' : 'Debit'}</TableCell>
                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    fontSize: '1rem',
                    width: { xs: '80px', sm: '100px', md: '150px' },
                  }}
                  style={{ color: tx.isCredit ? '#4CAF50' : '#F44336', textAlign: 'center', fontWeight: 'bold' }}
                >
                  ₹ {Number(tx.amount).toFixed(2)}
                </TableCell>
                {showGroupColumn && (
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                      {(transactionGroupMap[tx._id] ?? []).slice(0, 2).map(g => (
                        <Chip
                          key={g.id}
                          label={g.name}
                          size='small'
                          onClick={() => onGroupBadgeClick?.(g.id)}
                          sx={{
                            backgroundColor: '#E8EAF6',
                            color: '#3F51B5',
                            cursor: 'pointer',
                            fontWeight: 500,
                            '&:hover': { backgroundColor: '#C5CAE9' },
                          }}
                        />
                      ))}
                      {(transactionGroupMap[tx._id] ?? []).length > 2 && (
                        <Typography
                          variant='body2'
                          sx={{ opacity: 0.6, fontSize: '0.8rem' }}
                        >
                          +{(transactionGroupMap[tx._id] ?? []).length - 2}
                        </Typography>
                      )}
                      {(transactionGroupMap[tx._id] ?? []).length > 0 && (
                        <IconButton
                          size='small'
                          onClick={e => handleInfoClick(e, tx._id)}
                          sx={{ color: '#8578e5', ml: 0.5 }}
                        >
                          <InfoOutlinedIcon fontSize='small' />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                )}
                {type === 'full' && (
                  <TableCell align='center'>
                    <IconButton
                      color='primary'
                      onClick={() => editButtonClickEvents?.(tx)}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Popover
        open={infoOpen}
        anchorEl={infoAnchorEl}
        onClose={handleInfoClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, minWidth: 250, maxWidth: 350 }}>
          {infoGroups.map(g => {
            const summary = computeGroupSummary(g, transactions)
            return (
              <Box
                key={g.id}
                sx={{ mb: infoGroups.length > 1 ? 1.5 : 0, '&:last-child': { mb: 0 } }}
              >
                <Typography
                  variant='subtitle2'
                  sx={{
                    color: '#3F51B5',
                    cursor: 'pointer',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                  onClick={() => {
                    handleInfoClose()
                    onGroupBadgeClick?.(g.id)
                  }}
                >
                  {g.name}
                </Typography>
                {g.involvedParty && (
                  <Typography
                    variant='body2'
                    color='text.secondary'
                  >
                    Party: {g.involvedParty}
                  </Typography>
                )}
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Net: ₹{Math.abs(summary.netSettlement).toFixed(2)}{' '}
                  {summary.netSettlement > 0 ? '(Owed to you)' : summary.netSettlement < 0 ? '(You owe)' : ''}
                </Typography>
                <Chip
                  label={summary.status}
                  size='small'
                  sx={{
                    mt: 0.5,
                    backgroundColor: summary.status === 'Settled' ? '#E8F5E9' : '#FFF3E0',
                    color: summary.status === 'Settled' ? '#4CAF50' : '#FF9800',
                    fontWeight: 500,
                  }}
                />
              </Box>
            )
          })}
        </Box>
      </Popover>
    </>
  )
}

const CategoryTransactionRow = ({ tx }: { tx: ITransactionLogs }): JSX.Element => {
  const categoryData = getExpenseCategories().find(cat => cat.name === tx.category)
  const displayCategory = tx.category ? tx.category.charAt(0).toUpperCase() + tx.category.slice(1) : ''
  return (
    <TableCell sx={{ fontSize: '1rem' }}>
      {categoryData && (
        <Box
          display='flex'
          alignItems='center'
          gap={1}
          style={{
            backgroundColor: categoryData.backgroundColor,
            padding: '4px 8px',
            borderRadius: '12px',
            color: '#000',
          }}
        >
          <React.Fragment>
            <categoryData.icon style={{ color: categoryData.color }} />
            <Typography>{displayCategory}</Typography>
          </React.Fragment>
        </Box>
      )}
      {!categoryData && displayCategory}
    </TableCell>
  )
}

export { CustomTable }
