import Head from 'next/head'
import { Box, Container } from '@mui/material'
import { CollectionListResults } from '../../components/collection/collection-list-results'
import { CollectionListToolbar } from '../../components/collection/collection-list-toolbar'
import { DashboardLayout } from '../../components/dashboard-layout'

const Collections = () => {
  return (
    <>
      <Head>
        <title>Collections | Nifty Royale Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth={false}>
          <CollectionListToolbar />
          <Box sx={{ mt: 3 }}>
            <CollectionListResults />
          </Box>
        </Container>
      </Box>
    </>
  )
}
Collections.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Collections
