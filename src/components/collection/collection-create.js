import { useState } from 'react'
import { Box, Button, Card, CardContent, CardHeader, Divider, Grid, TextField } from '@mui/material'
import { createCollection } from 'src/services/apis'
import { InfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'
import { useWeb3React } from '../../hooks'

export const CollectionCreate = (props) => {
  const { account } = useWeb3React()
  const ethNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_ETHEREUM_NETWORK_CHAIN_ID === '1' ? 'mainnet' : 'goerli'
  const [values, setValues] = useState({
    name: '',
    address: '',
    collection: '',
  })

  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

  const handleInputChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    })
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

  const handleCreateCollection = async () => {
    if (
      account.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_ACCOUNT.toLowerCase() ||
      account.toLowerCase() === process.env.NEXT_PUBLIC_MANAGER_ACCOUNT.toLowerCase()
    ) {
      const data = {
        name: values.name,
        address: values.address,
        network: ethNetwork,
        collection: values.collection,
        created_at: values.created_at,
      }
      toastInProgress()
      const createdCollection = await createCollection(data)
      if (!!createdCollection) successToast()
      else failedToast()
    } else {
      notAdminToast()
    }
  }

  return (
    <>
      <InfoToast info={toastInfo} isToast={isToast} handleClose={handleClose} />

      <form autoComplete="off" noValidate {...props}>
        <Card>
          <CardHeader subheader="The information can be edited" title="New Collection Details" />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Collection Name"
                  name="name"
                  onChange={handleInputChange}
                  value={values.name}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Collection Address"
                  name="collection"
                  onChange={handleInputChange}
                  value={values.collection}
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
            <Button color="primary" variant="contained" onClick={handleCreateCollection}>
              Create Collection
            </Button>
          </Box>
        </Card>
      </form>
    </>
  )
}
