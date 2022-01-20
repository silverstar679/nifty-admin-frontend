import { useState, useEffect } from 'react'
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
  Switch,
  Typography,
} from '@mui/material'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import DateTimePicker from '@mui/lab/DateTimePicker'
import { createDrop } from 'src/services/apis'
import { InfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'
import { useEthereumWeb3React } from '../../hooks'
import { getAllDrops } from '../../services/apis'
import _ from 'lodash'

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
    value: 'replace',
    label: 'BattleRoyale',
  },
  {
    value: 'mint',
    label: 'BattleRoyaleMintingNew',
  },
  {
    value: 'random',
    label: 'BattleRoyaleRandomPart',
  },
]

export const DropCreate = (props) => {
  const { active, account, chainId } = useEthereumWeb3React()

  const [values, setValues] = useState({
    address: '',
    artist: '',
    creator: 'Nifty Royale',
    defaultMetadata: '',
    defaultNFTUri: '',
    description: '',
    name: '',
    network: 'mainnet',
    polygonContractAddress: '',
    prizeMetadata: '',
    queueId: '',
    type: 'random',
    threshold: '',
    previewMedia: '',
  })

  const [checkboxValues, setCheckboxValues] = useState({
    isDropEnded: false,
    isBattleEnded: false,
    isDefaultNFTImage: false,
  })

  const [dropDate, setDropDate] = useState(Date.now())
  const [battleDate, setBattleDate] = useState(Date.now())

  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

  const [drops, setDrops] = useState([])

  useEffect(() => {
    async function getDrops() {
      const drops = await getAllDrops()
      setDrops(drops)
    }
    getDrops()
  }, [])

  useEffect(() => {
    if (drops.length !== 0 && values.polygonContractAddress !== '') {
      const nextQueueId =
        parseInt(
          _.last(
            _.sortBy(
              _.filter(drops, {
                polygonContractAddress: values.polygonContractAddress,
              }),
              ['queueId']
            )
          ).queueId
        ) + 1
      setValues({
        ...values,
        queueId: nextQueueId,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drops, values.polygonContractAddress])

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

  const handleBattleDateChange = (newDate) => {
    setBattleDate(newDate)
  }

  const handleClose = () => {
    setIsToast(false)
  }

  const handleCreateDrop = async () => {
    if (account === process.env.NEXT_PUBLIC_ADMIN_ACCOUNT) {
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
        previewMedia: JSON.parse(values.previewMedia),
        threshold: values.threshold,
        created_at: values.created_at,

        isDropEnded: checkboxValues.isDropEnded,
        isBattleEnded: checkboxValues.isBattleEnded,
        isDefaultNFTImage: checkboxValues.isDefaultNFTImage,

        dropDate,
        battleDate,
      }
      setIsToast(false)
      const createdDrop = await createDrop(data)
      setIsToast(true)
      setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.DROP_CREATED })
    } else {
      setIsToast(false)
      setIsToast(true)
      setToastInfo({ severity: SEVERITY.WARNING, message: MESSAGE.NOT_ADMIN })
    }
  }

  return (
    <>
      <InfoToast info={toastInfo} isToast={isToast} handleClose={handleClose} />

      <form autoComplete="off" noValidate {...props}>
        <Card>
          <CardHeader subheader="The information can be edited" title="New Drop Details" />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Drop Name"
                  name="name"
                  onChange={handleInputChange}
                  value={values.name}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Artist Name"
                  name="artist"
                  onChange={handleInputChange}
                  value={values.artist}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Creator Name"
                  name="creator"
                  onChange={handleInputChange}
                  value={values.creator}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Ethereum Contract Address"
                  name="address"
                  onChange={handleInputChange}
                  value={values.address}
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
                  label="Queue ID for polygon contract"
                  name="queueId"
                  onChange={handleInputChange}
                  value={values.queueId}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Select Ethereum Network"
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
                  label="Select Battle Type"
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
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Battle Date"
                    value={battleDate}
                    onChange={handleBattleDateChange}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Minimum NFT counts to start battle"
                  name="threshold"
                  onChange={handleInputChange}
                  value={values.threshold}
                  variant="outlined"
                />
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
                    label="Drop Ended?"
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
                    label="Battle Ended?"
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
                  label="Default NFT Media URI for home, drop list and battle list page"
                  name="defaultNFTUri"
                  onChange={handleInputChange}
                  value={values.defaultNFTUri}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography>Video</Typography>
                  <Switch
                    name="isDefaultNFTImage"
                    checked={checkboxValues.isDefaultNFTImage}
                    onChange={handleCheckboxChange}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                  <Typography>Image</Typography>
                </Box>
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
                  label="Preview media for random version"
                  name="previewMedia"
                  rows={5}
                  onChange={handleInputChange}
                  value={values.previewMedia}
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
            <Button color="primary" variant="contained" onClick={handleCreateDrop}>
              Create Drop
            </Button>
          </Box>
        </Card>
      </form>
    </>
  )
}
