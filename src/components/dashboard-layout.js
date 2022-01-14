import { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { DashboardNavbar } from './dashboard-navbar'
import { DashboardSidebar } from './dashboard-sidebar'
import { getAllDrops } from '../services/apis'
import { useDispatch } from 'react-redux'
import { storeDrops } from '../store/drops/dropsSlice'

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
  const dispatch = useDispatch()

  useEffect(() => {
    async function getDrops() {
      const drops = await getAllDrops()
      console.log(drops)
      dispatch(storeDrops(drops))
    }
    getDrops()
  }, [dispatch])

  const { children } = props
  const [isSidebarOpen, setSidebarOpen] = useState(true)

  return (
    <>
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
      <DashboardNavbar onSidebarOpen={() => setSidebarOpen(true)} />
      <DashboardSidebar onClose={() => setSidebarOpen(false)} open={isSidebarOpen} />
    </>
  )
}
