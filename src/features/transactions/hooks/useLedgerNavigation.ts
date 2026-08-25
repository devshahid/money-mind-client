/**
 * useLedgerNavigation Hook
 *
 * Provides utilities for navigating between transactions and ledger views.
 * Abstracts away the complexity of Redux selection and navigation logic.
 */

import { useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/shared/hooks/slice-hooks'
import { RootState } from '@/store'
import { selectTransactionLedgerMap, selectLedgerById, selectLedger } from '../store/ledgerSlice'

/**
 * Hook for ledger navigation
 * Returns functions to navigate from transaction to ledger and vice versa
 */
export const useLedgerNavigation = () => {
  const dispatch = useAppDispatch()
  const transactionLedgerMap = useAppSelector((state: RootState) => selectTransactionLedgerMap(state))
  const ledgersState = useAppSelector((state: RootState) => state.ledgers)

  /**
   * Navigate to ledger from transaction
   * Looks up which ledger (if any) the transaction belongs to
   */
  const navigateToLedgerFromTransaction = useCallback(
    (transactionId: string) => {
      const ledgerId = transactionLedgerMap.get(transactionId)
      if (ledgerId) {
        dispatch(selectLedger(ledgerId))
      }
    },
    [transactionLedgerMap, dispatch]
  )

  /**
   * Navigate to a specific ledger
   */
  const navigateToLedger = useCallback(
    (ledgerId: string) => {
      dispatch(selectLedger(ledgerId))
    },
    [dispatch]
  )

  /**
   * Get the ledger ID for a specific transaction (if any)
   */
  const getLedgerIdForTransaction = useCallback(
    (transactionId: string) => {
      return transactionLedgerMap.get(transactionId) || null
    },
    [transactionLedgerMap]
  )

  /**
   * Get ledger details by ID
   */
  const getLedgerById = useCallback(
    (ledgerId: string) => {
      return selectLedgerById({ ledgers: ledgersState }, ledgerId)
    },
    [ledgersState]
  )

  return {
    navigateToLedgerFromTransaction,
    navigateToLedger,
    getLedgerIdForTransaction,
    getLedgerById,
  }
}
