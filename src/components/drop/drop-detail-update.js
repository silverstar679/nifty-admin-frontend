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
import { updateDrop } from 'src/services/apis'
import { InfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'
import { useEthereumWeb3React } from '../../hooks'
import fetchPolygonABI from '../../services/fetchPolygonABI'
import fetchEthereumABI from '../../services/fetchEthereumABI'
import { useEthereumNetworkContract, usePolygonNetworkContract } from '../../hooks/useContract'
import { BigNumber } from '@ethersproject/bignumber'
import { ethers } from 'ethers'

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
    label: 'Old Version',
  },
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

export const DropDetailUpdate = (props) => {
  const { active, account, chainId } = useEthereumWeb3React()
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
    description: props.drop.description,
    threshold: props.drop.threshold,
    previewMedia: JSON.stringify(props.drop.previewMedia),
    created_at: props.drop.created_at,
  })

  const [checkboxValues, setCheckboxValues] = useState({
    isDropEnded: props.drop.isDropEnded,
    isBattleEnded: props.drop.isBattleEnded,
    isDefaultNFTImage: props.drop.isDefaultNFTImage,
  })

  const [dropDate, setDropDate] = useState(props.drop.dropDate)
  const [battleDate, setBattleDate] = useState(props.drop.battleDate)

  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

  const [ethereumAbi, setEthereumAbi] = useState([])

  const [polygonAbi, setPolygonAbi] = useState([])
  const [recommendedQueueId, setRecommendedQueueId] = useState(null)

  useEffect(() => {
    async function getABI() {
      const abi = await fetchEthereumABI(values.address)
      setEthereumAbi(abi)
    }
    if (values.address) {
      getABI()
    }
  }, [values.address])

  useEffect(() => {
    async function getABI() {
      const abi = await fetchPolygonABI(values.polygonContractAddress)
      setPolygonAbi(abi)
    }
    if (values.polygonContractAddress) {
      getABI()
    }
  }, [values.polygonContractAddress])

  const ethereumContract = useEthereumNetworkContract(values.address, ethereumAbi, true)

  const polygonContract = usePolygonNetworkContract(values.polygonContractAddress, polygonAbi, true)

  const [battleState, setBattleState] = useState(null)
  useEffect(() => {
    async function getQueueId() {
      Promise.all([polygonContract.battleQueueLength(), ethereumContract.battleState()]).then(
        ([queueId, battleState]) => {
          setRecommendedQueueId(parseInt(queueId, 10))
          setBattleState(battleState)
        }
      )
    }
    if (
      ethereumContract &&
      ethereumContract.provider &&
      ethereumAbi.length !== 0 &&
      polygonContract &&
      polygonContract.provider &&
      polygonAbi.length !== 0
    ) {
      getQueueId()
    }
  }, [polygonContract, ethereumContract, polygonAbi, ethereumAbi])

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
    setToastInfo({ severity: SEVERITY.INFO, message: MESSAGE.DROP_CREATE_PROGRESS })
  }
  const handleUpdateDrop = async () => {
    if (account === process.env.NEXT_PUBLIC_ADMIN_ACCOUNT) {
      const data = {
        name: values.name,
        artist: values.artist,
        creator: values.creator,
        address: values.address,
        type: values.type,
        network: ethNetwork,
        polygonContractAddress: values.polygonContractAddress,
        queueId: values.queueId,
        description: values.description,
        defaultMetadata: values.defaultMetadata,
        prizeMetadata: values.prizeMetadata,
        defaultNFTUri: values.defaultNFTUri,
        previewMedia: JSON.parse(values.previewMedia ? values.previewMedia : '{}'),
        threshold: values.threshold,

        created_at: values.created_at,

        isDropEnded: checkboxValues.isDropEnded,
        isBattleEnded: checkboxValues.isBattleEnded,
        isDefaultNFTImage: checkboxValues.isDefaultNFTImage,

        dropDate,
        battleDate,
      }
      toastInProgress()
      const updatedDrop = await updateDrop(props.drop._id, data)
      setIsToast(false)
      setIsToast(true)
      setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.DROP_UPDATED })
    } else {
      setIsToast(false)
      setIsToast(true)
      setToastInfo({ severity: SEVERITY.WARNING, message: MESSAGE.NOT_ADMIN })
    }
  }

  if (recommendedQueueId === null) return null

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
                  error={
                    battleState === 0 && recommendedQueueId !== parseInt(values.queueId)
                      ? true
                      : false
                  }
                  fullWidth
                  label="Queue ID for polygon contract"
                  name="queueId"
                  onChange={handleInputChange}
                  value={values.queueId}
                  helperText={
                    battleState === 0 &&
                    recommendedQueueId !== parseInt(values.queueId) &&
                    `* Please update queue ID with ${recommendedQueueId}`
                  }
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
