import { useState, useEffect } from 'react'
import { Box, Tab } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { ContractInteraction } from './contract-interaction'
import { DropDetailUpdate } from './drop-detail-update'
import { getAllDrops } from '../../services/apis'
import _ from 'lodash'

export const DropDetail = (props) => {
  const [value, setValue] = useState('1')
  const [drop, setDrop] = useState(null)
  const id = props.id

  useEffect(() => {
    async function getDrops() {
      const drops = await getAllDrops()
      const selectedDrop = _.find(drops, { _id: id })
      setDrop(selectedDrop)
    }
    getDrops()
  }, [id])

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  if (drop === null) return null

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="Drop Detail Tabs">
            <Tab label="Drop Detail Update" value="1" />
            {drop && drop.address !== '' && drop.type !== 'old' && (
              <Tab label="Contract Interaction" value="2" />
            )}
          </TabList>
        </Box>
        <TabPanel value="1">
          <DropDetailUpdate drop={drop} />
        </TabPanel>
        {drop && drop.address !== '' && drop.type !== 'old' && (
          <TabPanel value="2">
            <ContractInteraction drop={drop} />
          </TabPanel>
        )}
      </TabContext>
    </Box>
  )
}
