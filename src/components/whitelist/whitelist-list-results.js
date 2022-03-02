import { useState, useEffect } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import { displayAddress } from '../../utils/displayAddress'
import NextLink from 'next/link'
import { InfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'
import { getAllWhitelists, deleteWhitelist } from '../../services/apis'
import _ from 'lodash'
import { useWeb3React } from '../../hooks'

export const WhitelistListResults = () => {
  const { account } = useWeb3React()

  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

  const [whitelists, setWhitelists] = useState([])

  useEffect(() => {
    let mounted = true
    async function getWhitelists() {
      const whitelists = await getAllWhitelists()
      const sortedWhitelists = _.reverse(_.sortBy(whitelists, ['created_at']))
      if (mounted) {
        setWhitelists(sortedWhitelists)
      }
    }
    getWhitelists()
    return () => {
      mounted = false
    }
  }, [])

  const handleClickOpen = (id) => {
    setOpenDialog(true)
    setSelectedId(id)
  }

  const handleDialogClose = () => {
    setOpenDialog(false)
  }

  const handleClose = () => {
    setIsToast(false)
  }

  const handleDeleteWhitelist = async () => {
    if (
      account.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_ACCOUNT.toLowerCase() ||
      account.toLowerCase() === process.env.NEXT_PUBLIC_MANAGER_ACCOUNT.toLowerCase()
    ) {
      setOpenDialog(false)

      setIsToast(false)
      setIsToast(true)
      setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.DROP_DELETING })
      const deletedWhitelist = await deleteWhitelist(selectedId)
      if (!!deletedWhitelist) {
        const filteredWhitelists = _.filter(whitelists, function (o) {
          return o._id !== selectedId
        })
        setWhitelists(filteredWhitelists)

        setIsToast(false)
        setIsToast(true)
        setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.DROP_DELETED })
      } else {
        setIsToast(false)
        setIsToast(true)
        setToastInfo({ severity: SEVERITY.ERROR, message: MESSAGE.FAILED })
      }
    } else {
      setIsToast(false)
      setIsToast(true)
      setToastInfo({ severity: SEVERITY.WARNING, message: MESSAGE.NOT_ADMIN })
    }
  }

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }
  if (whitelists === []) return null
  return (
    <>
      <InfoToast info={toastInfo} isToast={isToast} handleClose={handleClose} />

      <Card>
        <PerfectScrollbar>
          <Box sx={{ minWidth: 1050 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>ETH Address</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {whitelists.slice(page * limit, page * limit + limit).map((whitelist, index) => (
                  <TableRow hover key={whitelist._id}>
                    <TableCell>{page * limit + index + 1}</TableCell>
                    <TableCell>
                      <Typography color="textPrimary" variant="body1">
                        {whitelist.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{whitelist.address && displayAddress(whitelist.address)}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <NextLink
                          href={{
                            pathname: '/whitelists/[id]',
                            query: { id: whitelist._id },
                          }}
                        >
                          <IconButton size="small">
                            <EditIcon fontSize="small" color="primary" />
                          </IconButton>
                        </NextLink>

                        <IconButton size="small" onClick={() => handleClickOpen(whitelist._id)}>
                          <DeleteForeverIcon fontSize="small" color="error" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </PerfectScrollbar>
        <TablePagination
          component="div"
          count={whitelists.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleLimitChange}
          page={page}
          rowsPerPage={limit}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Confirm'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure to delete this whitelist permanently?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteWhitelist} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
