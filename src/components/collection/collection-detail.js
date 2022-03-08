import { useState, useEffect } from 'react'
import { Box, Tab } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { CollectionDetailUpdate } from './collection-detail-update'
import { MerkleRootGenerator } from './merkleroot-generator'
import { getAllCollections } from '../../services/apis'
import _ from 'lodash'

export const CollectionDetail = (props) => {
  const [value, setValue] = useState('1')
  const [collection, setCollection] = useState(null)
  const id = props.id

  useEffect(() => {
    async function getCollections() {
      const collections = await getAllCollections()
      const selectedCollection = _.find(collections, { _id: id })
      setCollection(selectedCollection)
    }
    getCollections()
  }, [id, value])

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  if (collection === null) return null

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="Collection Detail Tabs">
            <Tab label="Collection Detail Update" value="1" />
            <Tab label="Merkle Root" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <CollectionDetailUpdate collection={collection} />
        </TabPanel>
        <TabPanel value="2">
          <MerkleRootGenerator collection={collection} />
        </TabPanel>
      </TabContext>
    </Box>
  )
}
