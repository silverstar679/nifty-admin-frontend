import Head from 'next/head'
import { Box, Container } from '@mui/material'
import { CollectionDetail } from '../../components/collection/collection-detail'
import { DashboardLayout } from '../../components/dashboard-layout'
import { useRouter } from 'next/router'

const CollectionListDetail = () => {
  const router = useRouter()
  const id = router.query.id

  return (
    <>
      <Head>
        <title>Collection Detail | Nifty Royale Admin</title>
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
            <CollectionDetail id={id} />
          </Box>
        </Container>
      </Box>
    </>
  )
}
CollectionListDetail.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default CollectionListDetail
