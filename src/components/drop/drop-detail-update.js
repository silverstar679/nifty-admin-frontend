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
    label: 'Old Version',
  },
  {
    value: 'noPrize',
    label: 'Battle Royale No Prize',
  },
  {
    value: 'replace',
    label: 'Battle Royale',
  },
  {
    value: 'mint',
    label: 'Battle Royale Minting New',
  },
  {
    value: 'random',
    label: 'Battle Royale Random Part',
  },
]

export const DropDetailUpdate = (props) => {
  const { account } = useWeb3React()
  const ethNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID === '1' ? 'mainnet' : 'rinkeby'
  const [values, setValues] = useState({
    name: props.drop.name,
    artist: props.drop.artist,
    creator: props.drop.creator,
    address: props.drop.address,
    type: props.drop.type,
    polygonContractAddress: props.drop.polygonContractAddress,
    queueId: props.drop.queueId,
    defaultMetadata: props.drop.defaultMetadata,
    prizeMetadata: props.drop.prizeMetadata,
    defaultNFTUri: props.drop.defaultNFTUri,
    battleMessage: props.drop.battleMessage,
    description: props.drop.description,
    prizeDescription: props.drop.prizeDescription,
    threshold: props.drop.threshold,
    previewMedia: JSON.stringify(props.drop.previewMedia),
    created_at: props.drop.created_at,
  })

  const [checkboxValues, setCheckboxValues] = useState({
    isDropEnded: props.drop.isDropEnded,
    isBattleEnded: props.drop.isBattleEnded,
    isDefaultNFTImage: props.drop.isDefaultNFTImage,
    isFutureDrop: props.drop.isFutureDrop,
  })

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
      account === process.env.NEXT_PUBLIC_ADMIN_ACCOUNT ||
      account === process.env.NEXT_PUBLIC_MANAGER_ACCOUNT
    ) {
      const data = {
        name: values.name,
        artist: values.artist,
        creator: values.creator,
        address: values.address,
        type: values.type,
        network: ethNetwork,
        polygonContractAddress: values.polygonContractAddress,
        queueId: values.queueId,
        battleMessage: values.battleMessage,
        description: values.description,
        prizeDescription: values.prizeDescription,
        defaultMetadata: values.defaultMetadata,
        prizeMetadata: values.prizeMetadata,
        defaultNFTUri: values.defaultNFTUri,
        previewMedia: JSON.parse(values.previewMedia ? values.previewMedia : '{}'),
        threshold: values.threshold,

        created_at: values.created_at,

        isDropEnded: checkboxValues.isDropEnded,
        isBattleEnded: checkboxValues.isBattleEnded,
        isDefaultNFTImage: checkboxValues.isDefaultNFTImage,
        isFutureDrop: checkboxValues.isFutureDrop,

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
                    label="Only show on Future Drop, not on Drop and Battle List page?"
                  />
                </FormGroup>
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
                  helperText="It can be used for heavy video files to show in home, drop list and battle list pages"
                  name="previewMedia"
                  rows={5}
                  onChange={handleInputChange}
                  value={values.previewMedia}
                  variant="outlined"
                  placeholder='{"white": "https://niftyroyale.mypinata.cloud/ipfs/QmRb7A3cEyDqscqf1bN4aBXtDDQan7hpKr9zJAr4QkY116"}'
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
