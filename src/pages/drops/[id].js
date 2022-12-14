import Head from 'next/head'
import { Box, Container } from '@mui/material'
import { DropDetail } from '../../components/drop/drop-detail'
import { DashboardLayout } from '../../components/dashboard-layout'
import { useRouter } from 'next/router'

const DropListDetail = () => {
  const router = useRouter()
  const id = router.query.id

  return (
    <>
      <Head>
        <title>Drop Detail | Nifty Royale Admin</title>
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
            <DropDetail id={id} />
          </Box>
        </Container>
      </Box>
    </>
  )
}
DropListDetail.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default DropListDetail
