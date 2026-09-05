/**
 * GeminiSettings Page Tests
 *
 * Tests loading/configured/not-configured rendering, the API key field, Test
 * Connection, and Save flows against the real component and real
 * SnackbarProvider. Service functions are mocked at the module boundary.
 *
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SnackbarProvider } from '../../../shared/contexts/SnackBarContext'
import { GlobalSnackbar } from '../../../shared/components/GlobalSnackbar'
import { GeminiSettingsPage } from '../pages/GeminiSettings'
import * as aiConfigService from '../services/aiConfigService'

const renderComponent = () =>
  render(
    <SnackbarProvider>
      <GeminiSettingsPage />
      <GlobalSnackbar />
    </SnackbarProvider>
  )

const selectModel = (model: string): void => {
  fireEvent.mouseDown(screen.getByRole('combobox'))
  fireEvent.click(screen.getByRole('option', { name: model }))
}

describe('GeminiSettingsPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows a loading indicator while fetching the configuration', () => {
    vi.spyOn(aiConfigService, 'getAIConfig').mockReturnValue(new Promise(() => {}))

    renderComponent()

    expect(screen.getByLabelText('Loading AI configuration')).toBeInTheDocument()
  })

  it('shows "Not configured" and a placeholder model option when no config exists', async () => {
    vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({ configured: false })

    renderComponent()

    expect(await screen.findByText('Not configured')).toBeInTheDocument()
    expect(screen.getByText('Select Gemini model')).toBeInTheDocument()
  })

  it('shows "Configured" and preselects the current model when a config exists', async () => {
    vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({
      configured: true,
      provider: 'gemini',
      model: 'gemini-3.6-flash',
      isActive: true,
    })

    renderComponent()

    expect(await screen.findByText('Configured')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveTextContent('gemini-3.6-flash')
  })

  it('lists all supported Gemini models in the dropdown', async () => {
    vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({ configured: false })

    renderComponent()
    await screen.findByText('Not configured')

    fireEvent.mouseDown(screen.getByRole('combobox'))

    expect(await screen.findByRole('option', { name: 'gemini-3.6-flash' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'gemini-3.5-flash-lite' })).toBeInTheDocument()
  })

  it('shows a generic error notification and stops loading when the fetch fails', async () => {
    vi.spyOn(aiConfigService, 'getAIConfig').mockRejectedValue(new Error('secret internal detail'))

    renderComponent()

    expect(await screen.findByText('Failed to load AI configuration. Please try again.')).toBeInTheDocument()
    expect(screen.queryByText('secret internal detail')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.queryByLabelText('Loading AI configuration')).not.toBeInTheDocument())
  })

  describe('API key field', () => {
    it('renders a masked (password-style) API key input', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({ configured: false })

      renderComponent()
      await screen.findByText('Not configured')

      expect(screen.getByLabelText('API Key')).toHaveAttribute('type', 'password')
    })

    it('starts empty even for an already configured account (never shows the saved key)', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({
        configured: true,
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        isActive: true,
      })

      renderComponent()
      await screen.findByText('Configured')

      expect(screen.getByLabelText('API Key')).toHaveValue('')
      expect(screen.getByPlaceholderText('Enter new API key')).toBeInTheDocument()
    })

    it('shows the "Enter API key" placeholder when not yet configured', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({ configured: false })

      renderComponent()

      expect(await screen.findByPlaceholderText('Enter API key')).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('disables Test Connection and Save while no model/API key is provided', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({ configured: false })

      renderComponent()
      await screen.findByText('Not configured')

      expect(screen.getByRole('button', { name: /test connection/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /save configuration/i })).toBeDisabled()
    })

    it('enables Test Connection and Save once a model is selected and an API key is entered', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({ configured: false })

      renderComponent()
      await screen.findByText('Not configured')

      selectModel('gemini-3.6-flash')
      fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'my-new-key' } })

      expect(screen.getByRole('button', { name: /test connection/i })).toBeEnabled()
      expect(screen.getByRole('button', { name: /save configuration/i })).toBeEnabled()
    })

    it('keeps Save disabled for a configured account until a new API key is entered', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({
        configured: true,
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        isActive: true,
      })

      renderComponent()
      await screen.findByText('Configured')

      expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled()
    })
  })

  describe('Test Connection', () => {
    it('calls testAIConfig with the selected model and entered API key', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({ configured: false })
      const testSpy = vi.spyOn(aiConfigService, 'testAIConfig').mockResolvedValue({ success: true })

      renderComponent()
      await screen.findByText('Not configured')

      selectModel('gemini-3.6-flash')
      fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'my-new-key' } })
      fireEvent.click(screen.getByRole('button', { name: /test connection/i }))

      await waitFor(() => expect(testSpy).toHaveBeenCalledWith('gemini-3.6-flash', 'my-new-key'))
    })

    it('shows a success message on a successful test without saving the configuration', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({ configured: false })
      vi.spyOn(aiConfigService, 'testAIConfig').mockResolvedValue({ success: true })
      const saveSpy = vi.spyOn(aiConfigService, 'saveAIConfig')

      renderComponent()
      await screen.findByText('Not configured')

      selectModel('gemini-3.6-flash')
      fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'my-new-key' } })
      fireEvent.click(screen.getByRole('button', { name: /test connection/i }))

      expect(await screen.findByText('Connection successful. Gemini responded correctly.')).toBeInTheDocument()
      expect(saveSpy).not.toHaveBeenCalled()
    })

    it('shows a safe error message on test failure without exposing the raw error', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({ configured: false })
      vi.spyOn(aiConfigService, 'testAIConfig').mockRejectedValue(new Error('Invalid or unauthorized Gemini API key'))

      renderComponent()
      await screen.findByText('Not configured')

      selectModel('gemini-3.6-flash')
      fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'bad-key' } })
      fireEvent.click(screen.getByRole('button', { name: /test connection/i }))

      expect(
        await screen.findByText('Could not connect with the provided model and API key. Please check and try again.')
      ).toBeInTheDocument()
      expect(screen.queryByText('Invalid or unauthorized Gemini API key')).not.toBeInTheDocument()
    })

    it('shows a loading state and disables the buttons while testing', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({ configured: false })
      let resolveTest: (value: { success: true }) => void = () => {}
      vi.spyOn(aiConfigService, 'testAIConfig').mockReturnValue(
        new Promise(resolve => {
          resolveTest = resolve
        })
      )

      renderComponent()
      await screen.findByText('Not configured')

      selectModel('gemini-3.6-flash')
      fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'my-new-key' } })
      fireEvent.click(screen.getByRole('button', { name: /test connection/i }))

      expect(await screen.findByLabelText('Testing connection')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save configuration/i })).toBeDisabled()

      resolveTest({ success: true })
      await waitFor(() => expect(screen.queryByLabelText('Testing connection')).not.toBeInTheDocument())
    })
  })

  describe('Save configuration', () => {
    it('calls saveAIConfig with the selected model and entered API key', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({ configured: false })
      const saveSpy = vi.spyOn(aiConfigService, 'saveAIConfig').mockResolvedValue({
        configured: true,
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        isActive: true,
      })

      renderComponent()
      await screen.findByText('Not configured')

      selectModel('gemini-3.6-flash')
      fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'my-new-key' } })
      fireEvent.click(screen.getByRole('button', { name: /save configuration/i }))

      await waitFor(() => expect(saveSpy).toHaveBeenCalledWith('gemini-3.6-flash', 'my-new-key'))
    })

    it('clears the API key field and refreshes the configuration after a successful save', async () => {
      const getConfigSpy = vi
        .spyOn(aiConfigService, 'getAIConfig')
        .mockResolvedValueOnce({ configured: false })
        .mockResolvedValueOnce({ configured: true, provider: 'gemini', model: 'gemini-3.6-flash', isActive: true })
      vi.spyOn(aiConfigService, 'saveAIConfig').mockResolvedValue({
        configured: true,
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        isActive: true,
      })

      renderComponent()
      await screen.findByText('Not configured')

      selectModel('gemini-3.6-flash')
      fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'my-new-key' } })
      fireEvent.click(screen.getByRole('button', { name: /save configuration/i }))

      expect(await screen.findByText('AI configuration saved successfully.')).toBeInTheDocument()
      expect(screen.getByLabelText('API Key')).toHaveValue('')
      await waitFor(() => expect(getConfigSpy).toHaveBeenCalledTimes(2))
      expect(await screen.findByText('Configured')).toBeInTheDocument()
    })

    it('shows a safe error message on save failure without exposing the raw error', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({ configured: false })
      vi.spyOn(aiConfigService, 'saveAIConfig').mockRejectedValue(new Error('duplicate key error at db layer'))

      renderComponent()
      await screen.findByText('Not configured')

      selectModel('gemini-3.6-flash')
      fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'my-new-key' } })
      fireEvent.click(screen.getByRole('button', { name: /save configuration/i }))

      expect(await screen.findByText('Failed to save AI configuration. Please try again.')).toBeInTheDocument()
      expect(screen.queryByText('duplicate key error at db layer')).not.toBeInTheDocument()
      // The API key must remain in memory only on failure — never cleared silently, never persisted.
      expect(screen.getByLabelText('API Key')).toHaveValue('my-new-key')
    })

    it('shows a loading state and disables the buttons while saving', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({ configured: false })
      let resolveSave: (value: { configured: true }) => void = () => {}
      vi.spyOn(aiConfigService, 'saveAIConfig').mockReturnValue(
        new Promise(resolve => {
          resolveSave = resolve
        })
      )

      renderComponent()
      await screen.findByText('Not configured')

      selectModel('gemini-3.6-flash')
      fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'my-new-key' } })
      fireEvent.click(screen.getByRole('button', { name: /save configuration/i }))

      expect(await screen.findByLabelText('Saving configuration')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /test connection/i })).toBeDisabled()

      resolveSave({ configured: true })
      await waitFor(() => expect(screen.queryByLabelText('Saving configuration')).not.toBeInTheDocument())
    })
  })

  describe('Delete Configuration', () => {
    it('does not show the delete button when not configured', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({ configured: false })

      renderComponent()
      await screen.findByText('Not configured')

      expect(screen.queryByRole('button', { name: /delete configuration/i })).not.toBeInTheDocument()
    })

    it('shows the delete button when configured', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({
        configured: true,
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        isActive: true,
      })

      renderComponent()

      expect(await screen.findByRole('button', { name: /delete configuration/i })).toBeInTheDocument()
    })

    it('opens a confirmation dialog when the delete button is clicked', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({
        configured: true,
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        isActive: true,
      })
      const deleteSpy = vi.spyOn(aiConfigService, 'deleteAIConfig')

      renderComponent()
      fireEvent.click(await screen.findByRole('button', { name: /delete configuration/i }))

      expect(await screen.findByText('Delete Gemini configuration?')).toBeInTheDocument()
      expect(deleteSpy).not.toHaveBeenCalled()
    })

    it('cancel closes the dialog without calling deleteAIConfig', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({
        configured: true,
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        isActive: true,
      })
      const deleteSpy = vi.spyOn(aiConfigService, 'deleteAIConfig')

      renderComponent()
      fireEvent.click(await screen.findByRole('button', { name: /delete configuration/i }))
      await screen.findByText('Delete Gemini configuration?')

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      await waitFor(() => expect(screen.queryByText('Delete Gemini configuration?')).not.toBeInTheDocument())
      expect(deleteSpy).not.toHaveBeenCalled()
    })

    it('confirming calls deleteAIConfig, shows success, and resets the UI to Not configured', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({
        configured: true,
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        isActive: true,
      })
      const deleteSpy = vi.spyOn(aiConfigService, 'deleteAIConfig').mockResolvedValue(undefined)

      renderComponent()
      fireEvent.click(await screen.findByRole('button', { name: /delete configuration/i }))
      await screen.findByText('Delete Gemini configuration?')

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

      await waitFor(() => expect(deleteSpy).toHaveBeenCalledTimes(1))
      expect(await screen.findByText('AI configuration deleted successfully.')).toBeInTheDocument()
      expect(await screen.findByText('Not configured')).toBeInTheDocument()
      expect(screen.getByLabelText('API Key')).toHaveValue('')
      expect(screen.queryByRole('button', { name: /delete configuration/i })).not.toBeInTheDocument()
    })

    it('shows a safe error message when delete fails and keeps the configuration', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({
        configured: true,
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        isActive: true,
      })
      vi.spyOn(aiConfigService, 'deleteAIConfig').mockRejectedValue(new Error('internal db failure'))

      renderComponent()
      fireEvent.click(await screen.findByRole('button', { name: /delete configuration/i }))
      await screen.findByText('Delete Gemini configuration?')

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

      expect(await screen.findByText('Failed to delete AI configuration. Please try again.')).toBeInTheDocument()
      expect(screen.queryByText('internal db failure')).not.toBeInTheDocument()
      expect(screen.getByText('Configured')).toBeInTheDocument()
    })

    it('shows a loading state and disables actions while deleting', async () => {
      vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({
        configured: true,
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        isActive: true,
      })
      let resolveDelete: () => void = () => {}
      vi.spyOn(aiConfigService, 'deleteAIConfig').mockReturnValue(
        new Promise(resolve => {
          resolveDelete = resolve
        })
      )

      renderComponent()
      fireEvent.click(await screen.findByRole('button', { name: /delete configuration/i }))
      await screen.findByText('Delete Gemini configuration?')

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

      expect(await screen.findByLabelText('Deleting configuration')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()

      resolveDelete()
      await waitFor(() => expect(screen.queryByLabelText('Deleting configuration')).not.toBeInTheDocument())
    })
  })
})
