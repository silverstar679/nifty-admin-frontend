import Head from 'next/head'
import { Box, Container } from '@mui/material'
import { CollectionCreate } from '../../components/collection/collection-create'
import { DashboardLayout } from '../../components/dashboard-layout'

const CollectionCreatePage = () => {
  return (
    <>
      <Head>
        <title>Collection Create | Nifty Royale Admin</title>
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
            <CollectionCreate />
          </Box>
        </Container>
      </Box>
    </>
  )
}
CollectionCreatePage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default CollectionCreatePage
