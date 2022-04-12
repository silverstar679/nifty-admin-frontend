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
  MenuItem,
  Switch,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import DateTimePicker from '@mui/lab/DateTimePicker'
import { createDrop } from 'src/services/apis'
import { InfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'
import { useWeb3React } from '../../hooks'
import fetchEthereumABI from '../../services/fetchEthereumABI'
import fetchPolygonABI from '../../services/fetchPolygonABI'
import {
  useEthereumNetworkContract,
  usePolygonNetworkContract,
  usePolygonContract,
} from '../../hooks/useContract'
import { BigNumber } from '@ethersproject/bignumber'

const types = [
  {
    value: 'replace',
    label: 'Replace Prize',
  },
  {
    value: 'noPrize',
    label: 'External Prize',
  },
  {
    value: 'mint',
    label: 'Minting Prize',
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
    value: 0,
    label: 'Initialized',
  },
  {
    value: 1,
    label: 'Started',
  },
  {
    value: 2,
    label: 'Ended',
  },
]

export const DropCreate = (props) => {
  const { active, account, chainId } = useWeb3React()
  const ethNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID === '1' ? 'mainnet' : 'rinkeby'
  const polyNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_POLYGON_NETWORK_CHAIN_ID === '137' ? 'polygon' : 'mumbai'
  const [values, setValues] = useState({
    address: '',
    polygonContractAddress: '',
    queueId: '',
    prizeContractAddress: '',
    prizeTokenId: '',
    battleStatus: '0',
    defaultMetadata: '',
    prizeMetadata: '',
    defaultNFTUri: '',
    battleMessage: '',
    name: '',
    artist: '',
    creator: '',
    description: '',
    prizeDescription: '',
    type: 'erc721a',
    threshold: '',
    previewMedia: '',
  })

  const [checkboxValues, setCheckboxValues] = useState({
    isDefaultNFTImage: false,
    isFutureDrop: false,
  })

  const [presaleDate, setPresaleDate] = useState(new Date(Date.now()).toISOString())
  const [dropDate, setDropDate] = useState(new Date(Date.now()).toISOString())
  const [battleDate, setBattleDate] = useState(new Date(Date.now()).toISOString())

  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

  const [ownerPolygon, setOwnerPolygon] = useState('')
  const [ethereumAbi, setEthereumAbi] = useState([])
  const [polygonAbi, setPolygonAbi] = useState([])

  useEffect(() => {
    let mounted = true

    async function getABI() {
      const abi = await fetchEthereumABI(values.address)
      if (mounted) {
        setEthereumAbi(abi)
      }
    }
    if (values.address) {
      getABI()
    }

    return () => {
      mounted = false
    }
  }, [values.address])

  useEffect(() => {
    let mounted = true

    async function getABI() {
      const abi = await fetchPolygonABI(values.polygonContractAddress)
      if (mounted) {
        setPolygonAbi(abi)
      }
    }
    if (values.polygonContractAddress) {
      getABI()
    }
    return () => {
      mounted = false
    }
  }, [values.polygonContractAddress])

  const ethereumContract = useEthereumNetworkContract(values.address, ethereumAbi, true)
  const polygonContract = usePolygonNetworkContract(values.polygonContractAddress, polygonAbi, true)
  const polygonInjectedContract = usePolygonContract(
    values.polygonContractAddress,
    polygonAbi,
    true
  )

  useEffect(() => {
    let mounted = true

    async function getDropInfo() {
      Promise.all([ethereumContract.name()]).then(([name]) => {
        if (mounted) {
          setValues((prevValues) => ({
            ...prevValues,
            name: name.split(':')[1],
            artist: name.split(':')[0].split('X')[1],
            creator: name.split(':')[0].split('X')[0],
          }))
        }
      })
    }
    if (ethereumContract && ethereumContract.provider && ethereumAbi.length !== 0) {
      getDropInfo()
    }
    return () => {
      mounted = false
    }
  }, [ethereumContract, ethereumAbi])

  useEffect(() => {
    let mounted = true
    async function getQueueId() {
      Promise.all([polygonContract.battleQueueLength(), polygonContract.owner()]).then(
        ([queueId, ownerAddress]) => {
          if (mounted) {
            setValues((prevValues) => ({
              ...prevValues,
              queueId: BigNumber.from(queueId).toNumber(),
            }))
            setOwnerPolygon(ownerAddress)
          }
        }
      )
    }
    if (polygonContract && polygonContract.provider && polygonAbi.length !== 0) {
      getQueueId()
    }

    return () => {
      mounted = false
    }
  }, [polygonContract, polygonAbi])

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
    setPresaleDate(new Date(newDate).toISOString())
  }

  const handleDropDateChange = (newDate) => {
    setDropDate(new Date(newDate).toISOString())
  }

  const handleBattleDateChange = (newDate) => {
    setBattleDate(new Date(newDate).toISOString())
  }

  const handleClose = () => {
    setIsToast(false)
  }

  const toastInProgress = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.INFO, message: MESSAGE.DROP_CREATE_PROGRESS })
  }
  const failedToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.ERROR, message: MESSAGE.FAILED })
  }

  const successToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.DROP_CREATED })
  }
  const notAdminToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.WARNING, message: MESSAGE.NOT_ADMIN })
  }

  const incorrectNetwork = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.ERROR, message: MESSAGE.INCORRECT_NETWORK })
  }

  const toastCompleted = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.COMPLETED })
  }

  const toastNotOwner = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.WARNING, message: MESSAGE.NOT_OWNER })
  }

  const connectedToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.CONNECTED })
  }

  const notConnectedToast = () => {
    setIsToast(false)
    setIsToast(true)
    setToastInfo({ severity: SEVERITY.ERROR, message: MESSAGE.NOT_CONNECTED_WALLET })
  }

  useEffect(() => {
    if (active) {
      connectedToast()
    } else {
      notConnectedToast()
    }
  }, [active])

  const handleCreateDrop = async () => {
    if (
      account.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_ACCOUNT.toLowerCase() ||
      account.toLowerCase() === process.env.NEXT_PUBLIC_MANAGER_ACCOUNT.toLowerCase()
    ) {
      const data = {
        name: values.name,
        address: values.address,
        artist: values.artist,
        creator: values.creator,
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
        created_at: values.created_at,

        isDefaultNFTImage: checkboxValues.isDefaultNFTImage,
        isFutureDrop: checkboxValues.isFutureDrop,

        presaleDate,
        dropDate,
        battleDate,
      }
      toastInProgress()
      const createdDrop = await createDrop(data)
      if (!!createdDrop) successToast()
      else failedToast()
    } else {
      notAdminToast()
    }
  }

  const handleCreateDropContract = async () => {
    if (chainId === parseInt(parseInt(process.env.NEXT_PUBLIC_DEFAULT_POLYGON_NETWORK_CHAIN_ID))) {
      if (account === ownerPolygon) {
        toastInProgress()
        const tx = await polygonInjectedContract.initializeBattle(
          values.address,
          values.prizeContractAddress,
          values.prizeTokenId
        )
        await tx.wait()
        toastCompleted()
      } else {
        toastNotOwner()
      }
    } else {
      incorrectNetwork()
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
                  rows={1}
                  label="Battle Message"
                  name="battleMessage"
                  onChange={handleInputChange}
                  value={values.battleMessage}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  name="description"
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
                  name="previewMedia"
                  rows={5}
                  onChange={handleInputChange}
                  value={values.previewMedia}
                  helperText="It can be used for heavy video files"
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
            <Box sx={{ pr: 2 }}>
              <Button color="primary" variant="contained" onClick={handleCreateDropContract}>
                Initialize Battle on Polygon Contract
              </Button>
            </Box>
            <Box>
              <Button color="primary" variant="contained" onClick={handleCreateDrop}>
                Create Drop
              </Button>
            </Box>
          </Box>
        </Card>
      </form>
    </>
  )
}
