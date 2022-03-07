import { useState, useEffect } from 'react'
import { Box, Tab } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { ContractInteraction } from './contract-interaction'
import { CollectionBattleDetailUpdate } from './collection-battle-detail-update'
import { getAllCollectionBattles } from '../../services/apis'
import _ from 'lodash'

export const CollectionBattleDetail = (props) => {
  const [value, setValue] = useState('1')
  const [collectionBattle, setCollectionBattle] = useState(null)
  const id = props.id

  useEffect(() => {
    async function getCollectionBattles() {
      const collectionBattles = await getAllCollectionBattles()
      const selectedCollectionBattle = _.find(collectionBattles, { _id: id })
      setCollectionBattle(selectedCollectionBattle)
    }
    getCollectionBattles()
  }, [id, value])

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  if (collectionBattle === null) return null

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="CollectionBattle Detail Tabs">
            <Tab label="CollectionBattle Detail Update" value="1" />
            {collectionBattle &&
              collectionBattle.address !== '' &&
              collectionBattle.type !== 'old' && <Tab label="Contract Interaction" value="2" />}
          </TabList>
        </Box>
        <TabPanel value="1">
          <CollectionBattleDetailUpdate collectionBattle={collectionBattle} />
        </TabPanel>
        {collectionBattle && collectionBattle.address !== '' && collectionBattle.type !== 'old' && (
          <TabPanel value="2">
            <ContractInteraction collectionBattle={collectionBattle} />
          </TabPanel>
        )}
      </TabContext>
    </Box>
  )
}
