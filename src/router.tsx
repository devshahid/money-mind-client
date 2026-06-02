/* eslint-disable react-refresh/only-export-components */
import React from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { AppRoute } from './routes'
import { ProtectedRoute } from './features/auth/components/ProtectedRoute'
import { GuestRoute } from './features/auth/components/GuestRoute'
import { Layout } from './layouts/main'

// Lazy-loaded page imports for code splitting
const LazyDashboard = async (): Promise<{ Component: React.ComponentType }> => {
  const { DashboardPage } = await import('./features/dashboard/pages/Dashboard')
  return { Component: DashboardPage }
}

const LazyTransactionLogs = async (): Promise<{ Component: React.ComponentType }> => {
  const { TransactionLogs } = await import('./features/transactions/pages/TransactionLogs')
  return { Component: TransactionLogs }
}

const LazyDebts = async (): Promise<{ Component: React.ComponentType }> => {
  const { DebtsPage } = await import('./features/debts/pages/Debts')
  return { Component: DebtsPage }
}

const LazyGoals = async (): Promise<{ Component: React.ComponentType }> => {
  const { GoalsPage } = await import('./features/goals/pages/Goals')
  return { Component: GoalsPage }
}

const LazyBudget = async (): Promise<{ Component: React.ComponentType }> => {
  const { BudgetPage } = await import('./features/budget/pages/Budget')
  return { Component: BudgetPage }
}

const LazyAnalytics = async (): Promise<{ Component: React.ComponentType }> => {
  const { AnalyticsPage } = await import('./features/analytics/pages/Analytics')
  return { Component: AnalyticsPage }
}

const LazyAIChat = async (): Promise<{ Component: React.ComponentType }> => {
  const { AIChatPage } = await import('./features/ai-chat/pages/AIChat')
  return { Component: AIChatPage }
}

const LazyAccount = async (): Promise<{ Component: React.ComponentType }> => {
  const { AccountPage } = await import('./features/account/pages/Account')
  return { Component: AccountPage }
}

const LazyLogin = async (): Promise<{ Component: React.ComponentType }> => {
  const { LoginPage } = await import('./features/auth/pages/Login')
  return { Component: LoginPage }
}

const LazyRegister = async (): Promise<{ Component: React.ComponentType }> => {
  const { RegisterPage } = await import('./features/auth/pages/Register')
  return { Component: RegisterPage }
}

export const router = createBrowserRouter([
  {
    path: AppRoute.Root,
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            lazy: LazyDashboard,
          },
          {
            path: AppRoute.Transactions,
            lazy: LazyTransactionLogs,
          },
          {
            path: AppRoute.Debts,
            lazy: LazyDebts,
          },
          {
            path: AppRoute.Goals,
            lazy: LazyGoals,
          },
          {
            path: AppRoute.Budget,
            lazy: LazyBudget,
          },
          {
            path: AppRoute.Analytics,
            lazy: LazyAnalytics,
          },
          {
            path: AppRoute.AIChat,
            lazy: LazyAIChat,
          },
          {
            path: AppRoute.Settings,
            lazy: (): Promise<{ Component: React.ComponentType }> =>
              Promise.resolve({
                Component: () => <h1 className='title'>Settings</h1>,
              }),
          },
          {
            path: AppRoute.Account,
            lazy: LazyAccount,
          },
        ],
      },
    ],
  },
  {
    path: AppRoute.Login,
    element: <GuestRoute />,
    children: [
      {
        index: true,
        lazy: LazyLogin,
      },
    ],
  },
  {
    path: AppRoute.Register,
    element: <GuestRoute />,
    children: [
      {
        index: true,
        lazy: LazyRegister,
      },
    ],
  },
])
