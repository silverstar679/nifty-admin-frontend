import { useState } from 'react'
import { Box, Tab } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { ContractInteraction } from './contract-interaction'
import { DropDetailView } from './drop-detail-view'
import { DropDetailUpdate } from './drop-detail-update'

export const DropDetail = (props) => {
  const [value, setValue] = useState('1')

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="Drop Detail Tabs">
            <Tab label="Drop Detail View" value="1" />
            <Tab label="Drop Detail Update" value="2" />
            {props.drop && props.drop.type !== 'old' && (
              <Tab label="Contract Interaction" value="3" />
            )}
          </TabList>
        </Box>
        <TabPanel value="1">
          <DropDetailView drop={props.drop} />
        </TabPanel>
        <TabPanel value="2">
          <DropDetailUpdate drop={props.drop} />
        </TabPanel>
        {props.drop && props.drop.type !== 'old' && (
          <TabPanel value="3">
            <ContractInteraction drop={props.drop} />
          </TabPanel>
        )}
      </TabContext>
    </Box>
  )
}
