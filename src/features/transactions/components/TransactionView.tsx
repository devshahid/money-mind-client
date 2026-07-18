import { JSX } from 'react'
import { SxProps, Theme } from '@mui/material'
import { PaperTypeMap } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'

import { useResponsive } from '../../../shared/hooks/useResponsive'
import { ITransactionLogs } from '../store/transactionSlice'
import { ITransactionGroup } from '../store/groupSlice'
import { TransactionCardList } from './TransactionCardList'
import { TransactionCompactTable } from './TransactionCompactTable'
import { CustomTable } from './Table'

type TransactionViewProps = {
  transactions: ITransactionLogs[]
  loading?: boolean
  // Full table props (desktop)
  type?: 'mini' | 'full'
  selectedIds?: string[]
  isSelected?: (x: string) => boolean
  handleSelectOne?: (x: string) => void
  editButtonClickEvents?: (x: ITransactionLogs) => void
  handleSelectAll?: () => void
  sx?: SxProps<Theme>
  component?: OverridableComponent<PaperTypeMap<object, 'div'>>
  groups?: ITransactionGroup[]
  onGroupBadgeClick?: (groupId: string) => void
}

const TransactionView = ({
  transactions,
  loading,
  type = 'full',
  selectedIds,
  isSelected,
  handleSelectOne,
  editButtonClickEvents,
  handleSelectAll,
  sx,
  component,
  groups,
  onGroupBadgeClick,
}: TransactionViewProps): JSX.Element => {
  const { tier } = useResponsive()

  switch (tier) {
    case 'mobile':
      return (
        <TransactionCardList
          transactions={transactions}
          loading={loading}
        />
      )
    case 'tablet':
      return <TransactionCompactTable transactions={transactions} />
    case 'desktop':
      return (
        <CustomTable
          type={type}
          selectedIds={selectedIds}
          isSelected={isSelected}
          handleSelectOne={handleSelectOne}
          editButtonClickEvents={editButtonClickEvents}
          handleSelectAll={handleSelectAll}
          sx={sx}
          component={component}
          groups={groups}
          onGroupBadgeClick={onGroupBadgeClick}
        />
      )
  }
}

export { TransactionView }
