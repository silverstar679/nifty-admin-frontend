import { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { DashboardNavbar } from './dashboard-navbar'
import { DashboardSidebar } from './dashboard-sidebar'
import { useWeb3React } from '@web3-react/core'
import { InfoToast } from './Toast'
import { MESSAGE, SEVERITY } from '../constants/toast'

const DashboardLayoutRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flex: '1 1 auto',
  maxWidth: '100%',
  paddingTop: 64,
  [theme.breakpoints.up('lg')]: {
    paddingLeft: 280,
  },
}))

export const DashboardLayout = (props) => {
  const { children } = props
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const { active, account } = useWeb3React()

  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

  const handleClose = () => {
    setIsToast(false)
  }

  const toastNotOwner = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.WARNING, message: MESSAGE.NOT_OWNER })
  }

  const connectedToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.CONNECTED })
  }

  const notConnectedToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.ERROR, message: MESSAGE.NOT_CONNECTED_WALLET })
  }

  useEffect(() => {
    if (active) {
      if (
        account === process.env.NEXT_PUBLIC_ADMIN_ACCOUNT ||
        account === process.env.NEXT_PUBLIC_MANAGER_ACCOUNT
      ) {
        connectedToast()
      } else {
        toastNotOwner()
      }
    } else {
      notConnectedToast()
    }
  }, [active, account])

  return (
    <>
      <InfoToast info={toastInfo} isToast={isToast} handleClose={handleClose} />

      {active &&
        (account === process.env.NEXT_PUBLIC_ADMIN_ACCOUNT ||
          account === process.env.NEXT_PUBLIC_MANAGER_ACCOUNT) && (
          <DashboardLayoutRoot>
            <Box
              sx={{
                display: 'flex',
                flex: '1 1 auto',
                flexDirection: 'column',
                width: '100%',
              }}
            >
              {children}
            </Box>
          </DashboardLayoutRoot>
        )}

      <DashboardNavbar onSidebarOpen={() => setSidebarOpen(true)} />
      <DashboardSidebar onClose={() => setSidebarOpen(false)} open={isSidebarOpen} />
    </>
  )
}
