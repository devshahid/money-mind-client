/**
 * GeminiSettings Page Tests
 *
 * Tests loading/configured/not-configured rendering against the real component
 * and real SnackbarProvider. `getAIConfig` is mocked at the service boundary.
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
      model: 'gemini-2.5-pro',
      isActive: true,
    })

    renderComponent()

    expect(await screen.findByText('Configured')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveTextContent('gemini-2.5-pro')
  })

  it('lists all supported Gemini models in the dropdown', async () => {
    vi.spyOn(aiConfigService, 'getAIConfig').mockResolvedValue({ configured: false })

    renderComponent()
    await screen.findByText('Not configured')

    fireEvent.mouseDown(screen.getByRole('combobox'))

    expect(await screen.findByRole('option', { name: 'gemini-2.5-pro' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'gemini-2.5-flash' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'gemini-2.5-flash-lite' })).toBeInTheDocument()
  })

  it('shows a generic error notification and stops loading when the fetch fails', async () => {
    vi.spyOn(aiConfigService, 'getAIConfig').mockRejectedValue(new Error('secret internal detail'))

    renderComponent()

    expect(await screen.findByText('Failed to load AI configuration. Please try again.')).toBeInTheDocument()
    expect(screen.queryByText('secret internal detail')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.queryByLabelText('Loading AI configuration')).not.toBeInTheDocument())
  })
})
