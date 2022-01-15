import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material'

const networks = [
  {
    value: 'mainnet',
    label: 'Mainnet',
  },
  {
    value: 'rinkeby',
    label: 'Rinkeby',
  },
]

export const DropDetailUpdate = (props) => {
  const [values, setValues] = useState({
    address: props.drop.address,
    artist: props.drop.artist,
    created_at: props.drop.created_at,
    creator: props.drop.creator,
    defaultMetadata: props.drop.defaultMetadata,
    defaultNFTUri: props.drop.defaultNFTUri,
    description: props.drop.description,
    dropDate: props.drop.dropDate,
    extra: props.drop.extra,
    name: props.drop.name,
    network: props.drop.network,
    polygonContractAddress: props.drop.polygonContractAddress,
    prizeMetadata: props.drop.prizeMetadata,
    queueId: props.drop.queueId,
    type: props.drop.type,
  })

  const [checkboxValues, setCheckboxValues] = useState({
    isDropEnded: props.drop.isDropEnded,
    isBattleEnded: props.drop.isBattleEnded,
    isDefaultNFTImage: props.drop.isDefaultNFTImage,
  })

  const handleInputChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    })
  }

  const handleCheckboxChange = (event) => {
    setCheckboxValues({
      ...checkboxValues,
      [event.target.name]: event.target.checked,
    })
  }

  return (
    <form autoComplete="off" noValidate {...props}>
      <Card>
        <CardHeader subheader="The information can be edited" title="Drop Details" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                onChange={handleInputChange}
                value={values.name}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                onChange={handleInputChange}
                value={values.address}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Artist"
                name="artist"
                onChange={handleInputChange}
                value={values.artist}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Creator"
                name="creator"
                onChange={handleInputChange}
                value={values.creator}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Polygon Contract Address"
                name="polygonContractAddress"
                onChange={handleInputChange}
                value={values.polygonContractAddress}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Queue ID"
                name="queueId"
                onChange={handleInputChange}
                type="number"
                value={values.queueId}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Select Network"
                name="network"
                onChange={handleInputChange}
                select
                SelectProps={{ native: true }}
                value={values.network}
                variant="outlined"
              >
                {networks.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Type"
                name="type"
                onChange={handleInputChange}
                value={values.type}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Queue ID"
                name="queueId"
                onChange={handleInputChange}
                type="number"
                value={values.queueId}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isDropEnded"
                      checked={isDropEnded}
                      onChange={handleCheckboxChange}
                      inputProps={{ 'aria-label': 'controlled' }}
                    />
                  }
                  label="Is Drop Ended?"
                />
              </FormGroup>
            </Grid>
            <Grid item md={6} xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isBattleEnded"
                      checked={isBattleEnded}
                      onChange={handleCheckboxChange}
                      inputProps={{ 'aria-label': 'controlled' }}
                    />
                  }
                  label="Is Battle Ended?"
                />
              </FormGroup>
            </Grid>
            <Grid item md={6} xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isDefaultNFTImage"
                      checked={isDefaultNFTImage}
                      onChange={handleCheckboxChange}
                      inputProps={{ 'aria-label': 'controlled' }}
                    />
                  }
                  label="Is Default NFT Image?"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2,
          }}
        >
          <Button color="primary" variant="contained">
            Save details
          </Button>
        </Box>
      </Card>
    </form>
  )
}
