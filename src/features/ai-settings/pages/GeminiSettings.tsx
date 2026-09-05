import { ChangeEvent, JSX, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

import { spacing } from '../../../shared/theme/spacing'
import { useSnackbar } from '../../../shared/contexts/SnackBarContext'
import { deleteAIConfig, getAIConfig, saveAIConfig, testAIConfig } from '../services/aiConfigService'
import { GEMINI_MODELS, type AIConfigResponse, type GeminiModel } from '../types'

function GeminiSettings(): JSX.Element {
  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<AIConfigResponse>({ configured: false })
  const [selectedModel, setSelectedModel] = useState<GeminiModel | ''>('')
  // API key is local-only: never dispatched to Redux, persisted to storage, or logged.
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const refreshConfig = async (): Promise<void> => {
    try {
      const response = await getAIConfig()
      setConfig(response)
      setSelectedModel(response.model ?? '')
    } catch {
      // Never surface raw API/network errors to the user.
      showErrorSnackbar('Failed to load AI configuration. Please try again.')
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchConfig = async (): Promise<void> => {
      try {
        const response = await getAIConfig()
        if (!isMounted) return
        setConfig(response)
        setSelectedModel(response.model ?? '')
      } catch {
        if (isMounted) showErrorSnackbar('Failed to load AI configuration. Please try again.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void fetchConfig()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleModelChange = (event: SelectChangeEvent): void => {
    setSelectedModel(event.target.value as GeminiModel)
  }

  const handleApiKeyChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setApiKey(event.target.value)
  }

  const isBusy = loading || testing || saving || deleting
  const canSubmit = Boolean(selectedModel) && apiKey.trim().length > 0

  const handleTestConnection = async (): Promise<void> => {
    if (!canSubmit || isBusy) return
    setTesting(true)
    try {
      await testAIConfig(selectedModel as GeminiModel, apiKey)
      showSuccessSnackbar('Connection successful. Gemini responded correctly.')
    } catch {
      showErrorSnackbar('Could not connect with the provided model and API key. Please check and try again.')
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async (): Promise<void> => {
    if (!canSubmit || isBusy) return
    setSaving(true)
    try {
      await saveAIConfig(selectedModel as GeminiModel, apiKey)
      setApiKey('')
      showSuccessSnackbar('AI configuration saved successfully.')
      await refreshConfig()
    } catch {
      showErrorSnackbar('Failed to save AI configuration. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    setDeleting(true)
    try {
      await deleteAIConfig()
      setConfig({ configured: false })
      setSelectedModel('')
      setApiKey('')
      setDeleteDialogOpen(false)
      showSuccessSnackbar('AI configuration deleted successfully.')
    } catch {
      showErrorSnackbar('Failed to delete AI configuration. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <Typography
        variant='h4'
        sx={{ mb: spacing[4] }}
      >
        Settings
      </Typography>

      <Card sx={{ maxWidth: 480 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant='h6'>Google Gemini</Typography>
            {loading ? (
              <CircularProgress
                size={20}
                aria-label='Loading AI configuration'
              />
            ) : config.configured ? (
              <Chip
                icon={<CheckCircleIcon fontSize='small' />}
                label='Configured'
                color='success'
                size='small'
                variant='outlined'
              />
            ) : (
              <Chip
                icon={<RadioButtonUncheckedIcon fontSize='small' />}
                label='Not configured'
                size='small'
                variant='outlined'
              />
            )}
          </Box>

          <FormControl
            fullWidth
            disabled={loading}
          >
            <InputLabel id='gemini-model-label'>Model</InputLabel>
            <Select
              labelId='gemini-model-label'
              label='Model'
              value={selectedModel}
              onChange={handleModelChange}
              displayEmpty
            >
              <MenuItem
                value=''
                disabled
              >
                Select Gemini model
              </MenuItem>
              {GEMINI_MODELS.map(model => (
                <MenuItem
                  key={model}
                  value={model}
                >
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            disabled={isBusy}
          >
            <InputLabel htmlFor='gemini-api-key'>API Key</InputLabel>
            <OutlinedInput
              id='gemini-api-key'
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder={config.configured ? 'Enter new API key' : 'Enter API key'}
              label='API Key'
              autoComplete='off'
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    onClick={() => setShowApiKey(show => !show)}
                    edge='end'
                  >
                    {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>

          <Box sx={{ display: 'flex', gap: spacing[2] }}>
            <Button
              variant='outlined'
              onClick={() => void handleTestConnection()}
              disabled={!canSubmit || isBusy}
              startIcon={
                testing ? (
                  <CircularProgress
                    size={16}
                    aria-label='Testing connection'
                  />
                ) : undefined
              }
            >
              Test Connection
            </Button>
            <Button
              variant='contained'
              onClick={() => void handleSave()}
              disabled={!canSubmit || isBusy}
              startIcon={
                saving ? (
                  <CircularProgress
                    size={16}
                    aria-label='Saving configuration'
                  />
                ) : undefined
              }
            >
              {config.configured ? 'Save Changes' : 'Save Configuration'}
            </Button>
            {config.configured && (
              <Button
                variant='outlined'
                color='error'
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isBusy}
              >
                Delete Configuration
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Gemini configuration?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently remove your saved Gemini model and API key. You will need to enter a new API key to
            use Gemini again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            color='error'
            onClick={() => void handleDeleteConfirm()}
            disabled={deleting}
            startIcon={
              deleting ? (
                <CircularProgress
                  size={16}
                  aria-label='Deleting configuration'
                />
              ) : undefined
            }
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export { GeminiSettings as GeminiSettingsPage }
