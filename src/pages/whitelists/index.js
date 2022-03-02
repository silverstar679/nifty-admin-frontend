import Head from 'next/head'
import { Box, Container } from '@mui/material'
import { WhitelistListResults } from '../../components/whitelist/whitelist-list-results'
import { WhitelistListToolbar } from '../../components/whitelist/whitelist-list-toolbar'
import { DashboardLayout } from '../../components/dashboard-layout'

const Whitelists = () => {
  return (
    <>
      <Head>
        <title>Whitelists | Nifty Royale Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth={false}>
          <WhitelistListToolbar />
          <Box sx={{ mt: 3 }}>
            <WhitelistListResults />
          </Box>
        </Container>
      </Box>
    </>
  )
}
Whitelists.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Whitelists
