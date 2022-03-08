import { useState, useEffect } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { format } from 'date-fns'
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
import { deleteCollectionBattle } from 'src/services/apis'
import { InfoToast } from '../Toast'
import { MESSAGE, SEVERITY } from '../../constants/toast'
import { getAllCollectionBattles } from '../../services/apis'
import _ from 'lodash'
import { useWeb3React } from '../../hooks'

const STATUS = ['Initialized', 'Started', 'Ended']

export const CollectionBattleListResults = () => {
  const { account } = useWeb3React()

  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const [isToast, setIsToast] = useState(false)
  const [toastInfo, setToastInfo] = useState({})

  const [collectionBattles, setCollectionBattles] = useState([])

  useEffect(() => {
    let mounted = true
    async function getCollectionBattles() {
      const collectionBattles = await getAllCollectionBattles()
      const sortedCollectionBattles = _.reverse(_.sortBy(collectionBattles, ['created_at']))
      if (mounted) {
        setCollectionBattles(sortedCollectionBattles)
      }
    }
    getCollectionBattles()
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

  const handleDeleteCollectionBattle = async () => {
    if (
      account.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_ACCOUNT.toLowerCase() ||
      account.toLowerCase() === process.env.NEXT_PUBLIC_MANAGER_ACCOUNT.toLowerCase()
    ) {
      setOpenDialog(false)

      setIsToast(false)
      setIsToast(true)
      setToastInfo({ severity: SEVERITY.SUCCESS, message: MESSAGE.DROP_DELETING })
      const deletedCollectionBattle = await deleteCollectionBattle(selectedId)
      if (!!deletedCollectionBattle) {
        const filteredCollectionBattles = _.filter(collectionBattles, function (o) {
          return o._id !== selectedId
        })
        setCollectionBattles(filteredCollectionBattles)

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
  if (collectionBattles === []) return null
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
                  <TableCell>Poly Address</TableCell>
                  <TableCell>Queue ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collectionBattles
                  .slice(page * limit, page * limit + limit)
                  .map((collectionBattle, index) => (
                    <TableRow hover key={collectionBattle._id}>
                      <TableCell>{page * limit + index + 1}</TableCell>
                      <TableCell>
                        <Typography color="textPrimary" variant="body1">
                          {collectionBattle.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {collectionBattle.address && displayAddress(collectionBattle.address)}
                      </TableCell>
                      <TableCell>
                        {collectionBattle.polygonContractAddress &&
                          displayAddress(collectionBattle.polygonContractAddress)}
                      </TableCell>
                      <TableCell>{collectionBattle.queueId}</TableCell>
                      <TableCell>{STATUS[collectionBattle.battleStatus]}</TableCell>
                      <TableCell>
                        {format(new Date(collectionBattle.battleDate), 'MM/dd/yyyy - hh:mm')}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                          }}
                        >
                          <NextLink
                            href={{
                              pathname: '/collectionBattles/[id]',
                              query: { id: collectionBattle._id },
                            }}
                          >
                            <IconButton size="small">
                              <EditIcon fontSize="small" color="primary" />
                            </IconButton>
                          </NextLink>

                          <IconButton
                            size="small"
                            onClick={() => handleClickOpen(collectionBattle._id)}
                          >
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
          count={collectionBattles.length}
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
            Are you sure to delete this collection Battle permanently?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteCollectionBattle} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
