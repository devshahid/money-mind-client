/**
 * Unit Tests — Transaction Filter Logic
 *
 * Tests that the filter cleanup logic correctly:
 * - Strips 'all' values (which mean "no filter")
 * - Strips empty strings and empty arrays
 * - Preserves valid filter values
 * - Keeps pagination parameters (page, limit) intact
 * - Preserves keyword across pagination changes
 */

import { describe, it, expect } from 'vitest'

type ITransactionFilters = {
  dateFrom: string
  dateTo: string
  amount: string
  bankName: string
  transactionType: string
  category: string[]
  labels: string[]
  type: string
}

/**
 * Replicates the cleanUpFilters logic from TransactionLogs.tsx
 * This is the function under test — extracted for testability.
 */
const cleanUpFilters = (filters: ITransactionFilters): Record<string, string | string[]> => {
  const cleaned: Record<string, string | string[]> = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) cleaned[key] = value
    } else if (typeof value === 'string' && value.trim().length > 0 && value !== 'all') {
      cleaned[key] = value
    }
  })
  return cleaned
}

/**
 * Replicates the payload construction from the useEffect in TransactionLogs.tsx
 */
const buildListPayload = (
  filters: ITransactionFilters,
  page: string,
  limit: string,
  keyword: string
): Record<string, string | string[]> => {
  const payload: Record<string, string | string[]> = {
    ...cleanUpFilters(filters),
    page: (parseInt(page) + 1).toString(),
    limit,
  }
  if (keyword.trim().length > 0) {
    payload.keyword = keyword
  }
  return payload
}

describe('cleanUpFilters', () => {
  const emptyFilters: ITransactionFilters = {
    dateFrom: '',
    dateTo: '',
    amount: '',
    bankName: '',
    transactionType: '',
    category: [],
    labels: [],
    type: '',
  }

  describe('stripping empty values', () => {
    it('should return empty object when all filters are empty', () => {
      const result = cleanUpFilters(emptyFilters)
      expect(result).toEqual({})
    })

    it('should strip empty strings', () => {
      const result = cleanUpFilters({ ...emptyFilters, bankName: '' })
      expect(result.bankName).toBeUndefined()
    })

    it('should strip whitespace-only strings', () => {
      const result = cleanUpFilters({ ...emptyFilters, bankName: '   ' })
      expect(result.bankName).toBeUndefined()
    })

    it('should strip empty arrays', () => {
      const result = cleanUpFilters({ ...emptyFilters, category: [], labels: [] })
      expect(result.category).toBeUndefined()
      expect(result.labels).toBeUndefined()
    })
  })

  describe('stripping "all" values', () => {
    it('should strip transactionType when set to "all"', () => {
      const result = cleanUpFilters({ ...emptyFilters, transactionType: 'all' })
      expect(result.transactionType).toBeUndefined()
    })

    it('should strip type when set to "all"', () => {
      const result = cleanUpFilters({ ...emptyFilters, type: 'all' })
      expect(result.type).toBeUndefined()
    })

    it('should strip any field set to "all"', () => {
      const result = cleanUpFilters({ ...emptyFilters, bankName: 'all' })
      expect(result.bankName).toBeUndefined()
    })
  })

  describe('preserving valid values', () => {
    it('should preserve transactionType "online"', () => {
      const result = cleanUpFilters({ ...emptyFilters, transactionType: 'online' })
      expect(result.transactionType).toBe('online')
    })

    it('should preserve transactionType "cash"', () => {
      const result = cleanUpFilters({ ...emptyFilters, transactionType: 'cash' })
      expect(result.transactionType).toBe('cash')
    })

    it('should preserve type "credit"', () => {
      const result = cleanUpFilters({ ...emptyFilters, type: 'credit' })
      expect(result.type).toBe('credit')
    })

    it('should preserve type "debit"', () => {
      const result = cleanUpFilters({ ...emptyFilters, type: 'debit' })
      expect(result.type).toBe('debit')
    })

    it('should preserve non-empty category array', () => {
      const result = cleanUpFilters({ ...emptyFilters, category: ['Food & Drinks', 'Transport'] })
      expect(result.category).toEqual(['Food & Drinks', 'Transport'])
    })

    it('should preserve non-empty labels array', () => {
      const result = cleanUpFilters({ ...emptyFilters, labels: ['bills'] })
      expect(result.labels).toEqual(['bills'])
    })

    it('should preserve valid bankName', () => {
      const result = cleanUpFilters({ ...emptyFilters, bankName: 'HDFC' })
      expect(result.bankName).toBe('HDFC')
    })

    it('should preserve valid amount', () => {
      const result = cleanUpFilters({ ...emptyFilters, amount: '5000' })
      expect(result.amount).toBe('5000')
    })

    it('should preserve valid dateFrom', () => {
      const result = cleanUpFilters({ ...emptyFilters, dateFrom: '2024-01-01' })
      expect(result.dateFrom).toBe('2024-01-01')
    })

    it('should preserve valid dateTo', () => {
      const result = cleanUpFilters({ ...emptyFilters, dateTo: '2024-12-31' })
      expect(result.dateTo).toBe('2024-12-31')
    })
  })

  describe('combined filters', () => {
    it('should handle mix of valid and invalid filters', () => {
      const result = cleanUpFilters({
        dateFrom: '2024-01-01',
        dateTo: '',
        amount: '',
        bankName: 'SBI',
        transactionType: 'all',
        category: ['Food & Drinks'],
        labels: [],
        type: 'debit',
      })
      expect(result).toEqual({
        dateFrom: '2024-01-01',
        bankName: 'SBI',
        category: ['Food & Drinks'],
        type: 'debit',
      })
    })

    it('should correctly combine transactionType and type', () => {
      const result = cleanUpFilters({
        ...emptyFilters,
        transactionType: 'online',
        type: 'credit',
      })
      expect(result).toEqual({
        transactionType: 'online',
        type: 'credit',
      })
    })
  })
})

describe('buildListPayload', () => {
  const emptyFilters: ITransactionFilters = {
    dateFrom: '',
    dateTo: '',
    amount: '',
    bankName: '',
    transactionType: '',
    category: [],
    labels: [],
    type: '',
  }

  describe('pagination parameters', () => {
    it('should include page (1-indexed) and limit', () => {
      const result = buildListPayload(emptyFilters, '0', '50', '')
      expect(result.page).toBe('1')
      expect(result.limit).toBe('50')
    })

    it('should convert 0-based page to 1-based for API', () => {
      const result = buildListPayload(emptyFilters, '2', '50', '')
      expect(result.page).toBe('3')
    })

    it('should use the provided limit', () => {
      const result = buildListPayload(emptyFilters, '0', '25', '')
      expect(result.limit).toBe('25')
    })
  })

  describe('keyword preservation across pagination', () => {
    it('should include keyword when non-empty', () => {
      const result = buildListPayload(emptyFilters, '0', '50', 'grocery')
      expect(result.keyword).toBe('grocery')
    })

    it('should preserve keyword on page 2', () => {
      const result = buildListPayload(emptyFilters, '1', '50', 'rent')
      expect(result.keyword).toBe('rent')
      expect(result.page).toBe('2')
    })

    it('should not include keyword when empty', () => {
      const result = buildListPayload(emptyFilters, '0', '50', '')
      expect(result.keyword).toBeUndefined()
    })

    it('should not include keyword when whitespace only', () => {
      const result = buildListPayload(emptyFilters, '0', '50', '   ')
      expect(result.keyword).toBeUndefined()
    })
  })

  describe('filters combined with pagination and keyword', () => {
    it('should merge filters, pagination, and keyword', () => {
      const filters: ITransactionFilters = {
        ...emptyFilters,
        transactionType: 'cash',
        type: 'debit',
        bankName: 'HDFC',
      }
      const result = buildListPayload(filters, '1', '25', 'salary')
      expect(result).toEqual({
        transactionType: 'cash',
        type: 'debit',
        bankName: 'HDFC',
        page: '2',
        limit: '25',
        keyword: 'salary',
      })
    })

    it('should strip "all" values from filters while preserving pagination', () => {
      const filters: ITransactionFilters = {
        ...emptyFilters,
        transactionType: 'all',
        type: 'all',
      }
      const result = buildListPayload(filters, '0', '50', 'test')
      expect(result).toEqual({
        page: '1',
        limit: '50',
        keyword: 'test',
      })
    })
  })
})
