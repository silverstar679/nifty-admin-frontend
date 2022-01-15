import Head from 'next/head'
import { Box, Container } from '@mui/material'
import { DropCreate } from '../../components/drop/drop-create'
import { DashboardLayout } from '../../components/dashboard-layout'
import { useSelector } from 'react-redux'
import { selectDrops } from '../../store/drops/dropsSlice'
import { useRouter } from 'next/router'
import _ from 'lodash'

const DropCreatePage = () => {
  const router = useRouter()
  const address = router.query.address
  const { status, drops } = useSelector(selectDrops)
  const drop = drops && _.find(drops, { address: address })

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
