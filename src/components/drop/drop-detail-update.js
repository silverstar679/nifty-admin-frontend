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
  MenuItem,
} from '@mui/material'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import DateTimePicker from '@mui/lab/DateTimePicker'
import { updateDrop } from 'src/services/apis'
import { InfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'

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

const types = [
  {
    value: 'old',
    label: 'Old',
  },
  {
    value: 'replace',
    label: 'Replace',
  },
  {
    value: 'mint',
    label: 'Minting New',
  },
  {
    value: 'random',
    label: 'Random',
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
    extra: JSON.stringify(props.drop.extra),
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

  const [dropDate, setDropDate] = useState(props.drop.dropDate)

  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

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

  const handleDropDateChange = (newDate) => {
    setDropDate(newDate)
  }

  const handleUpdateDrop = async () => {
    const data = {
      name: values.name,
      address: values.address,
      artist: values.artist,
      creator: values.creator,
      type: values.type,
      network: values.network,
      polygonContractAddress: values.polygonContractAddress,
      queueId: values.queueId,
      description: values.description,
      defaultMetadata: values.defaultMetadata,
      prizeMetadata: values.prizeMetadata,
      defaultNFTUri: values.defaultNFTUri,
      extra: JSON.parse(values.extra),
      created_at: values.created_at,

      isDropEnded: checkboxValues.isDropEnded,
      isBattleEnded: checkboxValues.isBattleEnded,
      isDefaultNFTImage: checkboxValues.isDefaultNFTImage,

      dropDate,
    }
    setIsToast(false)
    const updatedDrop = await updateDrop(props.drop._id, data)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.DROP_UPDATED })
  }

  return (
    <>
      <InfoToast info={toastInfo} isToast={isToast} handleClose={handleClose} />
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
                  value={values.network}
                  variant="outlined"
                >
                  {networks.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Select Type"
                  name="type"
                  onChange={handleInputChange}
                  select
                  value={values.type}
                  variant="outlined"
                >
                  {types.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item md={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Drop Date"
                    value={dropDate}
                    onChange={handleDropDateChange}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item md={6} xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isDropEnded"
                        checked={checkboxValues.isDropEnded}
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
                        checked={checkboxValues.isBattleEnded}
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
                        checked={checkboxValues.isDefaultNFTImage}
                        onChange={handleCheckboxChange}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                    }
                    label="Is Default NFT Image?"
                  />
                </FormGroup>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Default Metadata URI"
                  name="defaultMetadata"
                  onChange={handleInputChange}
                  value={values.defaultMetadata}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Prize Metadata URI"
                  name="prizeMetadata"
                  onChange={handleInputChange}
                  value={values.prizeMetadata}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Default NFT URI"
                  name="defaultNFTUri"
                  onChange={handleInputChange}
                  value={values.defaultNFTUri}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  label="Description"
                  name="description"
                  rows={3}
                  onChange={handleInputChange}
                  value={values.description}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  label="Extra"
                  name="extra"
                  rows={5}
                  onChange={handleInputChange}
                  value={values.extra}
                  variant="outlined"
                />
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
            <Button color="primary" variant="contained" onClick={handleUpdateDrop}>
              Update details
            </Button>
          </Box>
        </Card>
      </form>
    </>
  )
}
