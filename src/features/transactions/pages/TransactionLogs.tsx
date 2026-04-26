import React, { JSX, useContext, useEffect, useState } from 'react'
import {
  Typography,
  Box,
  Backdrop,
  CircularProgress,
  Button,
  TextField,
  Chip,
  Autocomplete,
  Paper,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TablePagination,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material'
import SyncIcon from '@mui/icons-material/Sync'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { useOutletContext } from 'react-router-dom'

import {
  addCashTransaction,
  ITransactionLogs,
  listTransactions,
  setIsLocalTransactions,
  setLabels,
  setTransaction,
  updateLimit,
  updatePage,
} from '../store/transactionSlice'
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/slice-hooks'
import { RootState } from '../../../store'
import {
  loadGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addTransactionsToGroup,
  removeTransactionFromGroup,
  syncGroups,
  resetGroupSyncStatus,
  ITransactionGroup,
  IMember,
} from '../store/groupSlice'
import { SplitType } from '../types/splitTypes'
import { mergeLabels } from '../utils/groupUtils'
import { indexDBTransaction } from '../helpers/indexDB/transactionStore'
import { TableControls } from '../components/TransactionControls'
import { getExpenseCategories } from '../../../constants'
import { ColorModeContext } from '../../../shared/contexts/ThemeContext'
import { LayoutContextType } from '../../../layouts/main'
import { CustomModal as CustomModel } from '../../../shared/components/CustomModal'
import { CustomTable } from '../components/Table'
import { BulkActionToolbar } from '../components/BulkActionToolbar'
import { LabelAssignmentDialog } from '../components/LabelAssignmentDialog'
import { GroupDialog } from '../components/GroupDialog'
import { GroupSummaryView } from '../components/GroupSummaryView'
import { GroupListView } from '../components/GroupListView'
import { useSnackbar } from '../../../shared/contexts/SnackBarContext'

export interface ITransactionFilters {
  dateFrom: string
  dateTo: string
  amount: string
  bankName: string
  transactionType: string
  category: string[]
  labels: string[]
  type: string
}

const TransactionLogs = (): JSX.Element => {
  const { mode } = useContext(ColorModeContext)
  const { setHeader } = useOutletContext<LayoutContextType>()

  // Local State
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Partial<ITransactionLogs> | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [actionType, setActionType] = useState<'add' | 'edit' | null>(null)
  const [errors, setErrors] = useState({
    narration: '',
    category: '',
    label: '',
    transactionDate: '',
    isCredit: '',
  })
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [activeTab, setActiveTab] = useState(0)

  // Dialog states
  const [labelDialogOpen, setLabelDialogOpen] = useState(false)
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [groupDialogMode, setGroupDialogMode] = useState<'create' | 'edit'>('create')
  const [editingGroup, setEditingGroup] = useState<ITransactionGroup | null>(null)
  const [summaryGroup, setSummaryGroup] = useState<ITransactionGroup | null>(null)

  const [filters, setFilters] = useState<ITransactionFilters>({
    dateFrom: '',
    dateTo: '',
    amount: '',
    bankName: '',
    transactionType: '',
    category: [] as string[],
    labels: [] as string[],
    type: '',
  })

  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar()

  const dispatch = useAppDispatch()
  const { transactions, loading, labels, page, limit, totalCount } = useAppSelector(
    (state: RootState) => state.transactions
  )
  const groups: ITransactionGroup[] = useAppSelector(
    (state: RootState) => (state as { groups: { groups: ITransactionGroup[] } }).groups.groups
  )
  const isLocalGroups = useAppSelector(
    (state: RootState) => (state as { groups: { isLocalGroups: boolean } }).groups.isLocalGroups
  )
  const groupSyncStatus = useAppSelector(
    (state: RootState) =>
      (state as { groups: { groupSyncStatus: 'idle' | 'success' | 'error' } }).groups.groupSyncStatus
  )
  const groupLoading = useAppSelector((state: RootState) => (state as { groups: { loading: boolean } }).groups.loading)

  const [groupSyncLoader, setGroupSyncLoader] = useState(false)

  // Load groups on mount (fetches from API + merges local, sets isLocalGroups automatically)
  useEffect(() => {
    void dispatch(loadGroups())
  }, [dispatch])

  // Track group sync loading
  useEffect(() => {
    if (isLocalGroups) {
      setGroupSyncLoader(groupLoading)
    }
  }, [groupLoading, isLocalGroups])

  // Handle group sync status
  useEffect(() => {
    if (groupSyncStatus === 'success') {
      showSuccessSnackbar('Groups synced successfully')
      void dispatch(resetGroupSyncStatus())
    } else if (groupSyncStatus === 'error') {
      showErrorSnackbar('Failed to sync groups')
      void dispatch(resetGroupSyncStatus())
    }
  }, [dispatch, groupSyncStatus, showSuccessSnackbar, showErrorSnackbar])

  useEffect(() => {
    setHeader('Transactions', 'Overview of your activities')
  }, [setHeader])

  useEffect(() => {
    void dispatch(listTransactions({ ...filters, page: (parseInt(page) + 1).toString(), limit }))
  }, [dispatch, page, filters, limit])

  // Reset selection when page, filters, or limit change
  useEffect(() => {
    setSelectedIds([])
  }, [page, filters, limit])

  useEffect(() => {
    if (actionType === 'add') {
      setEditingTransaction(
        prev =>
          ({
            ...prev,
            isCredit: false,
          }) as ITransactionLogs
      )
    }
  }, [actionType])

  const validateFields = (): boolean => {
    let newErrors = { ...errors }
    if (!editingTransaction?.narration) {
      newErrors.narration = 'Narration is required.'
    }
    if (!editingTransaction?.category) {
      newErrors.category = 'Category is required.'
    }
    if (!editingTransaction?.label || editingTransaction?.label.length === 0) {
      newErrors.label = 'At least one label is required.'
    }
    setErrors(newErrors)
    return Object.values(newErrors).every(error => error === '')
  }

  const handleUpdateTransaction = async (): Promise<void> => {
    if (!validateFields() || !editingTransaction) {
      showErrorSnackbar('Please enter all the required fields')
      return
    }

    if (!editingTransaction.transactionDate) {
      editingTransaction.transactionDate = dayjs().format('MM/DD/YYYY')
    }
    if (actionType === 'add') {
      const formattedDate = dayjs(editingTransaction.transactionDate, 'MM/DD/YYYY').format('DD/MM/YYYY')
      void dispatch(
        addCashTransaction({ ...editingTransaction, isCash: true, transactionDate: formattedDate, bankName: 'Cash' })
      )
    } else {
      const res = await indexDBTransaction.saveTransaction(editingTransaction)
      if (res) {
        dispatch(setIsLocalTransactions(true))
      }
      void dispatch(setTransaction(editingTransaction))
      const allLabels = await indexDBTransaction.getAllLabels()
      dispatch(setLabels(allLabels))
    }

    setEditModalOpen(false)
  }

  const handleSelectAll = (): void => {
    const allIds = transactions.map(tx => tx._id)
    if (selectedIds.length === transactions.length) {
      setSelectedIds([])
    } else setSelectedIds(allIds.filter((id): id is string => id !== undefined))
  }

  const handleSelectOne = (id: string): void => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(selectedId => selectedId !== id))
    else setSelectedIds([...selectedIds, id])
  }

  const isSelected = (id: string): boolean => selectedIds.includes(id)

  const editButtonClickEvents = (tx: ITransactionLogs): void => {
    setEditingTransaction(tx)
    setEditModalOpen(true)
    setActionType('edit')
  }

  const handleAddEditModalState = (
    e: React.SyntheticEvent<Element, Event> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    name?: string,
    value?: null | string | string[] | boolean
  ): void => {
    if (editingTransaction || actionType === 'add') {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement
      setEditingTransaction({ ...editingTransaction, [name ?? target.name]: value ?? target.value } as ITransactionLogs)
      setErrors({ ...errors, [name ?? target.name]: '' })
    }
  }

  const handlePageChange = (newPage: string): void => {
    void dispatch(updatePage(newPage))
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10))
    void dispatch(updateLimit(event.target.value))
  }

  // --- Bulk action handlers ---

  const handleAttachToLogs = (): void => {
    setLabelDialogOpen(true)
  }

  const handleLabelConfirm = async (newLabels: string[]): Promise<void> => {
    setLabelDialogOpen(false)
    for (const id of selectedIds) {
      const tx = transactions.find(t => t._id === id)
      if (!tx) continue
      const merged = mergeLabels(tx.label, newLabels)
      const updated = { ...tx, label: merged }
      const res = await indexDBTransaction.saveTransaction(updated)
      if (res) {
        dispatch(setIsLocalTransactions(true))
      }
      void dispatch(setTransaction(updated))
    }
    const allLabels = await indexDBTransaction.getAllLabels()
    dispatch(setLabels(allLabels))
    setSelectedIds([])
  }

  const handleCreateGroup = (): void => {
    setGroupDialogMode('create')
    setEditingGroup(null)
    setGroupDialogOpen(true)
  }

  const handleGroupDialogSubmit = (data: {
    name: string
    involvedParty: string
    members: IMember[]
    notes: string
    splitType: SplitType
  }): void => {
    if (groupDialogMode === 'create') {
      void dispatch(
        createGroup({
          name: data.name,
          involvedParty: data.involvedParty,
          members: data.members,
          notes: data.notes,
          transactionIds: selectedIds,
        })
      )
      setSelectedIds([])
    } else if (editingGroup) {
      void dispatch(
        updateGroup({
          id: editingGroup.id,
          name: data.name,
          involvedParty: data.involvedParty,
          members: data.members,
          notes: data.notes,
          splitType: data.splitType,
        })
      )
    }
    setGroupDialogOpen(false)
    setEditingGroup(null)
  }

  const handleAddToGroup = (groupId: string): void => {
    void dispatch(addTransactionsToGroup({ groupId, transactionIds: selectedIds }))
    setSelectedIds([])
  }

  // --- Group summary handlers ---

  const handleGroupBadgeClick = (groupId: string): void => {
    const group = groups.find(g => g.id === groupId)
    if (group) setSummaryGroup(group)
  }

  const handleGroupListClick = (groupId: string): void => {
    const group = groups.find(g => g.id === groupId)
    if (group) setSummaryGroup(group)
  }

  const handleEditGroupFromSummary = (): void => {
    if (!summaryGroup) return
    setEditingGroup(summaryGroup)
    setGroupDialogMode('edit')
    setSummaryGroup(null)
    setGroupDialogOpen(true)
  }

  const handleDeleteGroupFromSummary = (): void => {
    if (!summaryGroup) return
    void dispatch(deleteGroup(summaryGroup.id))
    setSummaryGroup(null)
  }

  const handleDeleteGroupFromList = (groupId: string): void => {
    void dispatch(deleteGroup(groupId))
  }

  const handleRemoveTransactionFromGroup = (transactionId: string): void => {
    if (!summaryGroup) return
    void dispatch(removeTransactionFromGroup({ groupId: summaryGroup.id, transactionId })).then(result => {
      if (removeTransactionFromGroup.fulfilled.match(result)) {
        setSummaryGroup(result.payload)
      }
    })
  }

  return (
    <Box style={{ padding: '10px', backgroundColor: mode === 'dark' ? '#000' : '#fff' }}>
      <TableControls
        setActionType={setActionType}
        setEditModalOpen={setEditModalOpen}
        filters={filters}
        setFilters={setFilters}
      />

      <Tabs
        value={activeTab}
        onChange={(_, newValue: number) => setActiveTab(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab label='All Transactions' />
        <Tab label='Grouped Transactions' />
      </Tabs>

      {activeTab === 0 && (
        <>
          {selectedIds.length > 0 && (
            <BulkActionToolbar
              selectedIds={selectedIds}
              onClearSelection={() => setSelectedIds([])}
              onAttachToLogs={handleAttachToLogs}
              onCreateGroup={handleCreateGroup}
              onAddToGroup={handleAddToGroup}
              groups={groups}
            />
          )}

          {!loading && transactions.length === 0 ? (
            <EmptyTransactionContainer />
          ) : (
            <div style={{ width: '100%', borderRadius: 6, border: '1px solid #ccc' }}>
              <Box sx={{ overflowX: 'auto' }}>
                <CustomTable
                  type='full'
                  editButtonClickEvents={editButtonClickEvents}
                  selectedIds={selectedIds}
                  isSelected={isSelected}
                  handleSelectOne={handleSelectOne}
                  handleSelectAll={handleSelectAll}
                  groups={groups}
                  onGroupBadgeClick={handleGroupBadgeClick}
                  sx={{
                    maxHeight: '100vh',
                    '&::-webkit-scrollbar': {
                      display: 'none',
                    },
                  }}
                  component={Paper}
                />
              </Box>
              <TablePagination
                component='div'
                count={totalCount}
                page={parseInt(page, 0)}
                onPageChange={(_, newPage) => handlePageChange(newPage.toString())}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[25, 50, 100]}
              />
              {loading && <LoadingBackDrop />}
            </div>
          )}
        </>
      )}

      {activeTab === 1 && (
        <>
          <Box
            display='flex'
            justifyContent='flex-end'
            alignItems='center'
            mb={1}
            gap={1}
          >
            {isLocalGroups && (
              <Tooltip
                title='Sync Groups to Database'
                arrow
              >
                <IconButton
                  color='primary'
                  onClick={() => void dispatch(syncGroups())}
                  sx={
                    groupSyncLoader
                      ? {
                          animation: 'spinReverse 1s linear infinite',
                          '@keyframes spinReverse': {
                            '0%': { transform: 'rotate(360deg)' },
                            '100%': { transform: 'rotate(0deg)' },
                          },
                        }
                      : {}
                  }
                >
                  <SyncIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <GroupListView
            groups={groups}
            transactions={transactions}
            onGroupClick={handleGroupListClick}
            onDeleteGroup={handleDeleteGroupFromList}
          />
        </>
      )}

      {/* Edit transaction modal */}
      {(editingTransaction || actionType === 'add') && (
        <CustomModel
          modalOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setEditingTransaction(null)
            setActionType(null)
          }}
        >
          <>
            <Typography
              variant='h6'
              mb={2}
            >
              {actionType === 'edit' ? 'Edit Transaction' : 'Add Cash Memo'}
            </Typography>

            <TextField
              fullWidth
              label='Narration'
              disabled={actionType === 'add' ? false : true}
              value={editingTransaction?.narration || ''}
              onChange={handleAddEditModalState}
              sx={{ mb: 2 }}
              name='narration'
              error={!!errors.narration}
              helperText={errors.narration}
            />
            <TextField
              fullWidth
              label='Notes'
              value={editingTransaction?.notes || ''}
              onChange={handleAddEditModalState}
              sx={{ mb: 2 }}
              name='notes'
            />

            <Autocomplete
              freeSolo
              options={getExpenseCategories().map(c => c.name)}
              onChange={(e, newValue) => handleAddEditModalState(e, 'category', newValue)}
              onInputChange={(e, newValue) => handleAddEditModalState(e, 'category', newValue)}
              value={editingTransaction?.category}
              renderInput={params => (
                <TextField
                  {...params}
                  label='Category'
                  placeholder='Select or type Category'
                  fullWidth
                  sx={{ mb: 2 }}
                  name='category'
                  error={!!errors.category}
                  helperText={errors.category}
                />
              )}
            />

            <Autocomplete
              multiple
              freeSolo
              options={labels.map(l => l.labelName)}
              value={editingTransaction?.label || []}
              onChange={(e, newValue) => {
                handleAddEditModalState(
                  e,
                  'label',
                  newValue.filter((value): value is string => value !== null)
                )
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const tagProps = getTagProps({ index })
                  return (
                    <Chip
                      {...tagProps}
                      key={option + index}
                      variant='outlined'
                      label={option}
                    />
                  )
                })
              }
              renderInput={params => (
                <TextField
                  {...params}
                  label='Labels'
                  placeholder='Add Labels'
                  name='label'
                  error={!!errors.label}
                  helperText={errors.label}
                />
              )}
              sx={{ mb: 2 }}
            />

            {actionType === 'add' && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 4,
                  flexWrap: 'nowrap',
                  mb: 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <TextField
                  label='Amount'
                  value={editingTransaction?.amount || ''}
                  onChange={handleAddEditModalState}
                  sx={{ mb: 2 }}
                  name='amount'
                />
                <FormControl component='fieldset'>
                  <RadioGroup
                    row
                    value={editingTransaction?.isCredit ? 'credit' : 'debit'}
                    name='isCredit'
                  >
                    <FormControlLabel
                      value='credit'
                      control={<Radio />}
                      label='Credit'
                      onChange={e => handleAddEditModalState(e, 'isCredit', true)}
                    />
                    <FormControlLabel
                      value='debit'
                      control={<Radio />}
                      label='Debit'
                      onChange={e => handleAddEditModalState(e, 'isCredit', false)}
                    />
                  </RadioGroup>
                  {errors.isCredit && (
                    <Typography
                      color='error'
                      variant='caption'
                    >
                      {errors.isCredit}
                    </Typography>
                  )}
                </FormControl>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label='Transaction Date'
                    value={editingTransaction?.transactionDate ? dayjs(editingTransaction?.transactionDate) : dayjs()}
                    maxDate={dayjs()}
                    onChange={(newValue: dayjs.Dayjs | null) => {
                      const formattedValue = newValue ? newValue.format('MM/DD/YYYY') : ''
                      handleAddEditModalState({
                        target: { name: 'transactionDate', value: formattedValue },
                      } as unknown as React.ChangeEvent<HTMLInputElement>)
                    }}
                    name='transactionDate'
                    slotProps={{
                      textField: {
                        error: !!errors.transactionDate,
                        helperText: errors.transactionDate,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>
            )}

            <Button
              fullWidth
              variant='contained'
              onClick={() => {
                void handleUpdateTransaction()
              }}
            >
              Save Changes
            </Button>
          </>
        </CustomModel>
      )}

      {/* Label assignment dialog */}
      <LabelAssignmentDialog
        open={labelDialogOpen}
        onClose={() => setLabelDialogOpen(false)}
        onConfirm={(newLabels: string[]) => {
          void handleLabelConfirm(newLabels)
        }}
        availableLabels={labels.map(l => l.labelName)}
      />

      {/* Group create/edit dialog */}
      <GroupDialog
        transactions={
          editingGroup
            ? transactions.filter(tx => editingGroup.transactionIds.includes(tx._id ?? ''))
            : transactions.filter(tx => selectedIds.includes(tx._id ?? ''))
        }
        open={groupDialogOpen}
        onClose={() => {
          setGroupDialogOpen(false)
          setEditingGroup(null)
        }}
        onSubmit={handleGroupDialogSubmit}
        mode={groupDialogMode}
        initialData={
          editingGroup
            ? {
                name: editingGroup.name,
                involvedParty: editingGroup.involvedParty,
                members: editingGroup.members || [],
                notes: editingGroup.notes,
                splitType: editingGroup.splitType,
              }
            : undefined
        }
      />

      {/* Group summary view */}
      {summaryGroup && (
        <GroupSummaryView
          group={summaryGroup}
          transactions={transactions}
          onRemoveTransaction={handleRemoveTransactionFromGroup}
          onEditGroup={handleEditGroupFromSummary}
          onDeleteGroup={handleDeleteGroupFromSummary}
          onClose={() => setSummaryGroup(null)}
        />
      )}
    </Box>
  )
}

const LoadingBackDrop = (): JSX.Element => {
  return (
    <Backdrop
      open
      sx={{
        zIndex: theme => theme.zIndex.drawer + 1,
        color: '#fff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <CircularProgress
          color='inherit'
          style={{ marginRight: 10 }}
        />
        Please wait...
      </div>
    </Backdrop>
  )
}

const EmptyTransactionContainer = (): JSX.Element => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <Typography
        variant='h6'
        align='center'
      >
        No transactions found.
      </Typography>
    </Box>
  )
}

export { TransactionLogs }
