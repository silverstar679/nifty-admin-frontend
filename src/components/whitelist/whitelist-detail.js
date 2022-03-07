import { useState, useEffect } from 'react'
import { Box, Tab } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { WhitelistDetailUpdate } from './whitelist-detail-update'
import { MerkleRootGenerator } from './merkleroot-generator'
import { getAllCollections } from '../../services/apis'
import _ from 'lodash'

export const WhitelistDetail = (props) => {
  const [value, setValue] = useState('1')
  const [whitelist, setWhitelist] = useState(null)
  const id = props.id

  useEffect(() => {
    async function getWhitelists() {
      const whitelists = await getAllCollections()
      const selectedWhitelist = _.find(whitelists, { _id: id })
      setWhitelist(selectedWhitelist)
    }
    getWhitelists()
  }, [id, value])

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  if (whitelist === null) return null

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="Whitelist Detail Tabs">
            <Tab label="Whitelist Detail Update" value="1" />
            <Tab label="Merkle Root" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <WhitelistDetailUpdate whitelist={whitelist} />
        </TabPanel>
        <TabPanel value="2">
          <MerkleRootGenerator whitelist={whitelist} />
        </TabPanel>
      </TabContext>
    </Box>
  )
}
