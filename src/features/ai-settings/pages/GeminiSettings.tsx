import { JSX, useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'

import { spacing } from '../../../shared/theme/spacing'
import { useSnackbar } from '../../../shared/contexts/SnackBarContext'
import { getAIConfig } from '../services/aiConfigService'
import { GEMINI_MODELS, type AIConfigResponse, type GeminiModel } from '../types'

function GeminiSettings(): JSX.Element {
  const { showErrorSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<AIConfigResponse>({ configured: false })
  const [selectedModel, setSelectedModel] = useState<GeminiModel | ''>('')

  useEffect(() => {
    let isMounted = true

    const fetchConfig = async (): Promise<void> => {
      try {
        const response = await getAIConfig()
        if (!isMounted) return
        setConfig(response)
        setSelectedModel(response.model ?? '')
      } catch {
        // Never surface raw API/network errors to the user.
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
        </CardContent>
      </Card>
    </div>
  )
}

export { GeminiSettings as GeminiSettingsPage }
