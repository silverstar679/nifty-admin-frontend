import Head from 'next/head'
import { Box, Container, Grid } from '@mui/material'
import { TotalDrops } from '../components/dashboard/total-drops'
import { DashboardLayout } from '../components/dashboard-layout'

const Dashboard = () => (
  <>
    <Head>
      <title>Dashboard | Nifty Royale Admin</title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8,
      }}
    >
      <Container maxWidth={false}>
        <Grid container spacing={3}>
          <Grid item xl={3} lg={3} sm={6} xs={12}>
            <TotalDrops />
          </Grid>
        </Grid>
      </Container>
    </Box>
  </>
)

Dashboard.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Dashboard
