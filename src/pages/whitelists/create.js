import Head from 'next/head'
import { Box, Container } from '@mui/material'
import { WhitelistCreate } from '../../components/whitelist/whitelist-create'
import { DashboardLayout } from '../../components/dashboard-layout'

const WhitelistCreatePage = () => {
  return (
    <>
      <Head>
        <title>Whitelist Create | Nifty Royale Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth={false}>
          <Box sx={{ mt: 3 }}>
            <WhitelistCreate />
          </Box>
        </Container>
      </Box>
    </>
  )
}
WhitelistCreatePage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default WhitelistCreatePage
