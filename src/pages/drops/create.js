import Head from 'next/head'
import { Box, Container } from '@mui/material'
import { DropCreate } from '../../components/drop/drop-create'
import { DashboardLayout } from '../../components/dashboard-layout'

const DropCreatePage = () => {
  return (
    <>
      <Head>
        <title>Drop Create | Nifty Royale Admin</title>
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
            <DropCreate />
          </Box>
        </Container>
      </Box>
    </>
  )
}
DropCreatePage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default DropCreatePage
