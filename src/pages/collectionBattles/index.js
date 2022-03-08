import Head from 'next/head'
import { Box, Container } from '@mui/material'
import { CollectionBattleListResults } from '../../components/collectionBattle/collection-battle-list-results'
import { CollectionBattleListToolbar } from '../../components/collectionBattle/collection-battle-list-toolbar'
import { DashboardLayout } from '../../components/dashboard-layout'

const CollectionBattles = () => {
  return (
    <>
      <Head>
        <title>Collection Battles | Nifty Royale Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth={false}>
          <CollectionBattleListToolbar />
          <Box sx={{ mt: 3 }}>
            <CollectionBattleListResults />
          </Box>
        </Container>
      </Box>
    </>
  )
}
CollectionBattles.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default CollectionBattles
