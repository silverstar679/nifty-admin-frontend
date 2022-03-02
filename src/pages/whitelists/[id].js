import Head from 'next/head'
import { Box, Container } from '@mui/material'
import { WhitelistDetail } from '../../components/whitelist/whitelist-detail'
import { DashboardLayout } from '../../components/dashboard-layout'
import { useRouter } from 'next/router'

const WhiteListListDetail = () => {
  const router = useRouter()
  const id = router.query.id

  return (
    <>
      <Head>
        <title>Whitelist Detail | Nifty Royale Admin</title>
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
            <WhitelistDetail id={id} />
          </Box>
        </Container>
      </Box>
    </>
  )
}
WhiteListListDetail.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default WhiteListListDetail
