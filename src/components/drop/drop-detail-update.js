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
  Switch,
  Typography,
} from '@mui/material'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import DateTimePicker from '@mui/lab/DateTimePicker'
import { updateDrop } from 'src/services/apis'
import { InfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'
import { useWeb3React } from '../../hooks'

const types = [
  {
    value: 'old',
    label: 'Old',
  },
  {
    value: 'replace',
    label: 'Replace Prize',
  },
  {
    value: 'mint',
    label: 'Minting Prize',
  },
  {
    value: 'noPrize',
    label: 'External Prize',
  },
  {
    value: 'random',
    label: 'Random',
  },
  {
    value: 'erc721a',
    label: 'ERC721A',
  },
  {
    value: 'presale',
    label: 'Presale',
  },
]

const STATUS = [
  {
    value: '0',
    label: 'Initialized',
  },
  {
    value: '1',
    label: 'Started',
  },
  {
    value: '2',
    label: 'Ended',
  },
]

export const DropDetailUpdate = (props) => {
  const { account } = useWeb3React()
  const ethNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID === '1' ? 'mainnet' : 'rinkeby'
  const polyNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_POLYGON_NETWORK_CHAIN_ID === '137' ? 'polygon' : 'mumbai'
  const [values, setValues] = useState({
    name: props.drop.name,
    artist: props.drop.artist,
    creator: props.drop.creator,
    address: props.drop.address,
    type: props.drop.type,
    polygonContractAddress: props.drop.polygonContractAddress,
    queueId: props.drop.queueId,
    prizeContractAddress: props.drop.prizeContractAddress,
    prizeTokenId: props.drop.prizeTokenId,
    battleStatus: props.drop.battleStatus ? props.drop.battleStatus : '0',
    defaultMetadata: props.drop.defaultMetadata,
    prizeMetadata: props.drop.prizeMetadata,
    defaultNFTUri: props.drop.defaultNFTUri,
    battleMessage: props.drop.battleMessage,
    description: props.drop.description,
    prizeDescription: props.drop.prizeDescription,
    threshold: props.drop.threshold,
    previewMedia: JSON.stringify(props.drop.previewMedia),
    whitelist: props.drop.whitelist,
    created_at: props.drop.created_at,
    ethereumAbi: props.drop.ethereumAbi,
    polygonAbi: props.drop.polygonAbi,
  })

  const [checkboxValues, setCheckboxValues] = useState({
    isDefaultNFTImage: props.drop.isDefaultNFTImage,
    isFutureDrop: props.drop.isFutureDrop,
  })

  const [presaleDate, setPresaleDate] = useState(props.drop.presaleDate)
  const [dropDate, setDropDate] = useState(props.drop.dropDate)
  const [battleDate, setBattleDate] = useState(props.drop.battleDate)

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

  const handlePresaleDateChange = (newDate) => {
    setPresaleDate(newDate)
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
  const toastInProgress = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.INFO, message: MESSAGE.DROP_UPDATE_PROGRESS })
  }
  const successToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.DROP_UPDATED })
  }
  const failedToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.ERROR, message: MESSAGE.FAILED })
  }
  const notAdminToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.WARNING, message: MESSAGE.NOT_ADMIN })
  }

  const handleUpdateDrop = async () => {
    if (
      account.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_ACCOUNT.toLowerCase() ||
      account.toLowerCase() === process.env.NEXT_PUBLIC_MANAGER_ACCOUNT.toLowerCase()
    ) {
      const data = {
        name: values.name,
        artist: values.artist,
        creator: values.creator,
        address: values.address,
        type: values.type,
        network: ethNetwork,
        polygonNetwork: polyNetwork,
        polygonContractAddress: values.polygonContractAddress,
        queueId: values.queueId,
        prizeContractAddress: values.prizeContractAddress,
        prizeTokenId: values.prizeTokenId,
        battleStatus: values.battleStatus,
        battleMessage: values.battleMessage,
        description: values.description,
        prizeDescription: values.prizeDescription,
        defaultMetadata: values.defaultMetadata,
        prizeMetadata: values.prizeMetadata,
        defaultNFTUri: values.defaultNFTUri,
        previewMedia: JSON.parse(values.previewMedia ? values.previewMedia : '{}'),
        threshold: values.threshold,
        whitelist: values.whitelist,
        created_at: values.created_at,
        ethereumAbi: values.ethereumAbi,
        polygonAbi: values.polygonAbi,

        isDefaultNFTImage: checkboxValues.isDefaultNFTImage,
        isFutureDrop: checkboxValues.isFutureDrop,

        presaleDate,
        dropDate,
        battleDate,
      }
      toastInProgress()
      const updatedDrop = await updateDrop(props.drop._id, data)
      if (!!updatedDrop) successToast()
      else failedToast()
    } else {
      notAdminToast()
    }
  }

  return (
    <>
      <InfoToast info={toastInfo} isToast={isToast} handleClose={handleClose} />
      <form autoComplete="off">
        <Card>
          <CardHeader subheader="The information can be edited" title="Drop Details" />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
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
                  label="Prize Contract Address"
                  name="prizeContractAddress"
                  onChange={handleInputChange}
                  value={values.prizeContractAddress}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Prize Token Id"
                  name="prizeTokenId"
                  onChange={handleInputChange}
                  value={values.prizeTokenId}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={4} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Presale Date"
                    value={presaleDate}
                    onChange={handlePresaleDateChange}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item md={4} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Drop Date"
                    value={dropDate}
                    onChange={handleDropDateChange}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item md={4} xs={12}>
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
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isFutureDrop"
                        checked={checkboxValues.isFutureDrop}
                        onChange={handleCheckboxChange}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                    }
                    label="Only Show on Future Drop Carousel?"
                  />
                </FormGroup>
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
                  <Typography>Image ** Default NFT Media File Type</Typography>
                </Box>
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
                <TextField
                  fullWidth
                  label="Select Battle Status"
                  name="battleStatus"
                  onChange={handleInputChange}
                  select
                  value={values.battleStatus}
                  variant="outlined"
                >
                  {STATUS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Default Token Metadata"
                  name="defaultMetadata"
                  onChange={handleInputChange}
                  value={values.defaultMetadata}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Prize Token Metadata"
                  name="prizeMetadata"
                  onChange={handleInputChange}
                  value={values.prizeMetadata}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Whitelist"
                  name="whitelist"
                  onChange={handleInputChange}
                  value={values.whitelist}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Minimum NFT counts to start battle"
                  name="threshold"
                  onChange={handleInputChange}
                  value={values.threshold}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  label="Battle Message"
                  name="battleMessage"
                  rows={1}
                  onChange={handleInputChange}
                  value={values.battleMessage}
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
                  label="Prize Description"
                  name="prizeDescription"
                  rows={3}
                  onChange={handleInputChange}
                  value={values.prizeDescription}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  label="Object of Media files for random version"
                  helperText="It can be used for heavy video files"
                  name="previewMedia"
                  rows={5}
                  onChange={handleInputChange}
                  value={values.previewMedia}
                  variant="outlined"
                  placeholder='{"white": "https://niftyroyale.mypinata.cloud/ipfs/QmRb7A3cEyDqscqf1bN4aBXtDDQan7hpKr9zJAr4QkY116"}'
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  label="Ethereum Contract ABI"
                  name="ethereumAbi"
                  rows={5}
                  onChange={handleInputChange}
                  value={values.ethereumAbi}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  label="Polygon Contract ABI"
                  name="polygonAbi"
                  rows={5}
                  onChange={handleInputChange}
                  value={values.polygonAbi}
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
