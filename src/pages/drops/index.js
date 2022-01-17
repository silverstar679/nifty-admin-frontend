import Head from 'next/head'
import { Box, Container } from '@mui/material'
import { DropListResults } from '../../components/drop/drop-list-results'
import { DropListToolbar } from '../../components/drop/drop-list-toolbar'
import { DashboardLayout } from '../../components/dashboard-layout'

const Drops = () => {
  return (
    <>
      <Head>
        <title>Drops | Nifty Royale Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth={false}>
          <DropListToolbar />
          <Box sx={{ mt: 3 }}>
            <DropListResults />
          </Box>
        </Container>
      </Box>
    </>
  )
}
Drops.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Drops
