import React, { useRef, useEffect, useState, type FormEvent } from 'react'
import { Box, TextField, IconButton, Typography, Paper, CircularProgress } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'

import { useAppDispatch, useAppSelector } from '../../../shared/hooks/slice-hooks'
import { sendChatMessage, addUserMessage } from '../store/aiSlice'
import { IAIChatMessage } from '../types/ai'
import { useResponsive } from '../../../shared/hooks/useResponsive'
import { useKeyboardHeight } from '../../../shared/hooks/useKeyboardHeight'
import { spacing } from '../../../shared/theme'

interface AISliceState {
  chatHistory: IAIChatMessage[]
  loading: boolean
}

const AIChatPanel = (): React.ReactElement => {
  const dispatch = useAppDispatch()
  const chatHistory = useAppSelector(state => (state as unknown as { ai: AISliceState }).ai.chatHistory)
  const loading = useAppSelector(state => (state as unknown as { ai: AISliceState }).ai.loading)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { isMobile, isTablet } = useResponsive()
  const { keyboardHeight, isKeyboardVisible } = useKeyboardHeight()

  const bubbleMaxWidth = isMobile ? '85%' : isTablet ? '75%' : '70%'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) return

    dispatch(addUserMessage(trimmed))
    void dispatch(sendChatMessage(trimmed))
    setInput('')
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        ...(isKeyboardVisible && {
          maxHeight: `calc(100dvh - ${keyboardHeight}px)`,
        }),
      }}
    >
      {/* Messages area — independently scrollable */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: { xs: spacing[2], sm: spacing[4] },
          py: spacing[2],
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          minHeight: '120px',
        }}
      >
        {chatHistory.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>
            <SmartToyIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant='body1'>Ask me anything about your finances.</Typography>
          </Box>
        )}

        {chatHistory.map((msg, idx) => {
          const isUser = msg.role === 'user'
          return (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                gap: 1,
              }}
            >
              {!isUser && (
                <SmartToyIcon
                  color='primary'
                  sx={{ mt: 0.5, flexShrink: 0 }}
                />
              )}
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  maxWidth: bubbleMaxWidth,
                  bgcolor: isUser ? 'primary.main' : 'background.paper',
                  color: isUser ? 'primary.contrastText' : 'text.primary',
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant='body2'
                  sx={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.content}
                </Typography>
              </Paper>
              {isUser && (
                <PersonIcon
                  color='action'
                  sx={{ mt: 0.5, flexShrink: 0 }}
                />
              )}
            </Box>
          )
        })}

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToyIcon
              color='primary'
              sx={{ flexShrink: 0 }}
            />
            <CircularProgress size={20} />
            <Typography
              variant='body2'
              color='text.secondary'
            >
              Thinking…
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input area — pinned to bottom */}
      <Box
        component='form'
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          gap: 1,
          px: { xs: spacing[2], sm: spacing[4] },
          py: spacing[2],
          borderTop: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <TextField
          fullWidth
          size='small'
          placeholder='Type a message…'
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
          aria-label='Chat message input'
          autoComplete='off'
        />
        <IconButton
          type='submit'
          color='primary'
          disabled={!input.trim() || loading}
          aria-label='Send message'
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  )
}

export { AIChatPanel }
