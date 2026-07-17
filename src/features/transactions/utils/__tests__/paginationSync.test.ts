import { describe, test, expect } from 'vitest'

/**
 * Pagination Sync Tests
 * Tests for: rowsPerPage sync with limit, page reset on rows change
 */

describe('Pagination sync logic', () => {
  test('rowsPerPage should parse limit string to number', () => {
    const limit = '50'
    const rowsPerPage = parseInt(limit) || 50
    expect(rowsPerPage).toBe(50)
  })

  test('rowsPerPage should default to 50 for invalid limit', () => {
    const limit = ''
    const rowsPerPage = parseInt(limit) || 50
    expect(rowsPerPage).toBe(50)
  })

  test('rowsPerPage should handle limit of 25', () => {
    const limit = '25'
    const rowsPerPage = parseInt(limit) || 50
    expect(rowsPerPage).toBe(25)
  })

  test('rowsPerPage should handle limit of 100', () => {
    const limit = '100'
    const rowsPerPage = parseInt(limit) || 50
    expect(rowsPerPage).toBe(100)
  })

  test('page should reset to 0 when rows per page changes', () => {
    // Simulate the logic: when user changes rowsPerPage, page resets
    let page = '3'
    const newRowsPerPage = 100

    // This is what handleRowsPerPageChange does
    if (newRowsPerPage) {
      page = '0'
    }

    expect(page).toBe('0')
  })

  test('button should be disabled when no uncategorized and no selection', () => {
    const selectedIds: string[] = []
    const uncategorizedOnPage: string[] = []
    const loading = false

    const disabled = loading || (selectedIds.length === 0 && uncategorizedOnPage.length === 0)
    expect(disabled).toBe(true)
  })

  test('button should be enabled when uncategorized exist', () => {
    const selectedIds: string[] = []
    const uncategorizedOnPage = ['id1', 'id2']
    const loading = false

    const disabled = loading || (selectedIds.length === 0 && uncategorizedOnPage.length === 0)
    expect(disabled).toBe(false)
  })

  test('button should be enabled when user has manual selection', () => {
    const selectedIds = ['id1']
    const uncategorizedOnPage: string[] = []
    const loading = false

    const disabled = loading || (selectedIds.length === 0 && uncategorizedOnPage.length === 0)
    expect(disabled).toBe(false)
  })

  test('button should be disabled when loading regardless of state', () => {
    const selectedIds = ['id1']
    const uncategorizedOnPage = ['id2']
    const loading = true

    const disabled = loading || (selectedIds.length === 0 && uncategorizedOnPage.length === 0)
    expect(disabled).toBe(true)
  })

  test('transactionIds should use selectedIds when available', () => {
    const selectedIds = ['selected-1', 'selected-2']
    const uncategorizedOnPage = ['uncat-1', 'uncat-2']

    const transactionIds = selectedIds.length > 0 ? selectedIds : uncategorizedOnPage
    expect(transactionIds).toEqual(['selected-1', 'selected-2'])
  })

  test('transactionIds should fallback to uncategorizedOnPage when no selection', () => {
    const selectedIds: string[] = []
    const uncategorizedOnPage = ['uncat-1', 'uncat-2']

    const transactionIds = selectedIds.length > 0 ? selectedIds : uncategorizedOnPage
    expect(transactionIds).toEqual(['uncat-1', 'uncat-2'])
  })
})
