import Head from 'next/head'
import { Box, Container } from '@mui/material'
import { CollectionBattleCreate } from '../../components/collectionBattle/collection-battle-create'
import { DashboardLayout } from '../../components/dashboard-layout'

const CollectionBattleCreatePage = () => {
  return (
    <>
      <Head>
        <title>Battle Create | Nifty Royale Admin</title>
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
            <CollectionBattleCreate />
          </Box>
        </Container>
      </Box>
    </>
  )
}
CollectionBattleCreatePage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default CollectionBattleCreatePage
