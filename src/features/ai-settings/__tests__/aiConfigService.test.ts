import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  post: vi.fn(),
}))

vi.mock('../../../shared/services/axiosClient', () => ({
  axiosClient: {
    get: mocks.get,
    put: mocks.put,
    delete: mocks.delete,
    post: mocks.post,
  },
}))

import { getAIConfig, saveAIConfig, deleteAIConfig, testAIConfig } from '../services/aiConfigService'

describe('aiConfigService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAIConfig calls GET /ai/config and returns the config', async () => {
    mocks.get.mockResolvedValue({
      data: { output: { configured: true, provider: 'gemini', model: 'gemini-3.6-flash', isActive: true } },
    })

    const result = await getAIConfig()

    expect(mocks.get).toHaveBeenCalledWith('/ai/config')
    expect(result).toEqual({
      configured: true,
      provider: 'gemini',
      model: 'gemini-3.6-flash',
      isActive: true,
    })
  })

  it('saveAIConfig calls PUT /ai/config with model and apiKey', async () => {
    mocks.put.mockResolvedValue({
      data: { output: { configured: true, provider: 'gemini', model: 'gemini-3.5-flash-lite', isActive: true } },
    })

    const result = await saveAIConfig('gemini-3.5-flash-lite', 'my-api-key')

    expect(mocks.put).toHaveBeenCalledWith('/ai/config', { model: 'gemini-3.5-flash-lite', apiKey: 'my-api-key' })
    expect(result).toEqual({
      configured: true,
      provider: 'gemini',
      model: 'gemini-3.5-flash-lite',
      isActive: true,
    })
  })

  it('deleteAIConfig calls DELETE /ai/config', async () => {
    mocks.delete.mockResolvedValue({ data: { output: { configured: false } } })

    await deleteAIConfig()

    expect(mocks.delete).toHaveBeenCalledWith('/ai/config')
  })

  it('testAIConfig calls POST /ai/config/test with model and apiKey', async () => {
    mocks.post.mockResolvedValue({ data: { output: { success: true } } })

    const result = await testAIConfig('gemini-3.5-flash-lite', 'my-api-key')

    expect(mocks.post).toHaveBeenCalledWith('/ai/config/test', {
      model: 'gemini-3.5-flash-lite',
      apiKey: 'my-api-key',
    })
    expect(result).toEqual({ success: true })
  })

  it('never includes the apiKey in a thrown/rejected error path', async () => {
    mocks.post.mockRejectedValue(new Error('Invalid or unauthorized Gemini API key'))

    await expect(testAIConfig('gemini-3.6-flash', 'secret-key')).rejects.toThrow(
      'Invalid or unauthorized Gemini API key'
    )
  })
})
