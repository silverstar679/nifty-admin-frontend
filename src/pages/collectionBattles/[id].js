import Head from 'next/head'
import { Box, Container } from '@mui/material'
import { CollectionBattleDetail } from '../../components/collectionBattle/collection-battle-detail'
import { DashboardLayout } from '../../components/dashboard-layout'
import { useRouter } from 'next/router'

const CollectionBattleListDetail = () => {
  const router = useRouter()
  const id = router.query.id

  return (
    <>
      <Head>
        <title>Collection Battle Detail | Nifty Royale Admin</title>
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
            <CollectionBattleDetail id={id} />
          </Box>
        </Container>
      </Box>
    </>
  )
}
CollectionBattleListDetail.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default CollectionBattleListDetail
