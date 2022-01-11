import PropTypes from 'prop-types'
import styled from '@emotion/styled'
import { AppBar, Box, IconButton, Toolbar, Button } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useEthereumWeb3React } from '../hooks'
import { displayAddress } from '../utils/displayAddress'
import { injected } from '../connectors'

const DashboardNavbarRoot = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}))

const WalletButton = styled(Button)({
  fontSize: '16px',
  textTransform: 'capitalize',
  border: '1px solid',
  borderRadius: '24px',
})

export const DashboardNavbar = (props) => {
  const { onSidebarOpen, ...other } = props
  const { deactivate, account, activate, active } = useEthereumWeb3React()

  const handleConnectWallet = () => {
    active ? deactivate() : activate(injected)
  }

  return (
    <>
      <DashboardNavbarRoot
        sx={{
          left: {
            lg: 280,
          },
          width: {
            lg: 'calc(100% - 280px)',
          },
        }}
        {...other}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: 64,
            left: 0,
            px: 2,
          }}
        >
          <IconButton
            onClick={onSidebarOpen}
            sx={{
              display: {
                xs: 'inline-flex',
                lg: 'none',
              },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <WalletButton variant="outlined" onClick={handleConnectWallet}>
            {active ? displayAddress(account) : 'Connect Wallet'}
          </WalletButton>
        </Toolbar>
      </DashboardNavbarRoot>
    </>
  )
}

DashboardNavbar.propTypes = {
  onSidebarOpen: PropTypes.func,
}
