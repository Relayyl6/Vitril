import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'

type AlertType = 'error' | 'success' | 'info'

interface AlertState {
  visible: boolean
  title: string
  message: string
  type: AlertType
}

interface AlertActions {
  show: (title: string, message: string, type?: AlertType) => void
  hide: () => void
}

const AlertStateContext = createContext<AlertState | undefined>(undefined)
const AlertActionsContext = createContext<AlertActions | undefined>(undefined)

const initialState: AlertState = {
  visible: false,
  title: '',
  message: '',
  type: 'info',
}

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AlertState>(initialState)

  // useCallback => stable function identity across renders.
  // This is what lets AlertActionsContext's value stay referentially equal,
  // so components that only consume `actions` never re-render.
  const show = useCallback((title: string, message: string, type: AlertType = 'info') => {
    setState({ visible: true, title, message, type })
  }, [])

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }))
  }, [])

  const actions = useMemo(() => ({ show, hide }), [show, hide])

  return (
    <AlertActionsContext.Provider value={actions}>
      <AlertStateContext.Provider value={state}>
        {children}
      </AlertStateContext.Provider>
    </AlertActionsContext.Provider>
  )
}

/** Use this from anywhere that just needs to TRIGGER an alert (hooks, handlers). */
export const useAlertActions = () => {
  const ctx = useContext(AlertActionsContext)
  if (!ctx) throw new Error('useAlertActions must be used within an AlertProvider')
  return ctx
}

/** Use this ONLY from the component that renders the modal UI itself. */
export const useAlertState = () => {
  const ctx = useContext(AlertStateContext)
  if (!ctx) throw new Error('useAlertState must be used within an AlertProvider')
  return ctx
}