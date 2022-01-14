import { useState } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import PropTypes from 'prop-types'
import { format } from 'date-fns'
import {
  Box,
  Card,
  Checkbox,
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
import { deleteDrop } from 'src/services/apis'

export const DropListResults = ({ drops, ...rest }) => {
  const [selectedDropIds, setSelectedDropIds] = useState([])
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedId, setSelectedId] = useState('')

  const handleClickOpen = (id) => {
    setOpenDialog(true)
    setSelectedId(id)
  }

  const handleDialogClose = () => {
    setOpenDialog(false)
  }

  const handleDeleteDrop = async () => {
    const deletedDrop = await deleteDrop(selectedId)
    setOpenDialog(false)
  }

  const handleSelectAll = (event) => {
    let newSelectedDropIds

    if (event.target.checked) {
      newSelectedDropIds = drops.map((drop) => drop.id)
    } else {
      newSelectedDropIds = []
    }

    setSelectedDropIds(newSelectedDropIds)
  }

  const handleSelectOne = (event, id) => {
    const selectedIndex = selectedDropIds.indexOf(id)
    let newSelectedDropIds = []

    if (selectedIndex === -1) {
      newSelectedDropIds = newSelectedDropIds.concat(selectedDropIds, id)
    } else if (selectedIndex === 0) {
      newSelectedDropIds = newSelectedDropIds.concat(selectedDropIds.slice(1))
    } else if (selectedIndex === selectedDropIds.length - 1) {
      newSelectedDropIds = newSelectedDropIds.concat(selectedDropIds.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelectedDropIds = newSelectedDropIds.concat(
        selectedDropIds.slice(0, selectedIndex),
        selectedDropIds.slice(selectedIndex + 1)
      )
    }

    setSelectedDropIds(newSelectedDropIds)
  }

  const handleLimitChange = (event) => {
    setLimit(event.target.value)
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  return (
    <>
      <Card {...rest}>
        <PerfectScrollbar>
          <Box sx={{ minWidth: 1050 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedDropIds.length === drops.length}
                      color="primary"
                      indeterminate={
                        selectedDropIds.length > 0 && selectedDropIds.length < drops.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>ETH Address</TableCell>
                  <TableCell>Polygon Address</TableCell>
                  <TableCell>Queue ID</TableCell>
                  <TableCell>Network</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Drop Status</TableCell>
                  <TableCell>Drop Date</TableCell>
                  <TableCell>Battle Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drops.slice(0, limit).map((drop) => (
                  <TableRow
                    hover
                    key={drop._id}
                    selected={selectedDropIds.indexOf(drop._id) !== -1}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedDropIds.indexOf(drop._id) !== -1}
                        onChange={(event) => handleSelectOne(event, drop._id)}
                        value="true"
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                        }}
                      >
                        <Typography color="textPrimary" variant="body1">
                          <NextLink
                            href={{
                              pathname: '/drops/[address]',
                              query: { address: drop.address },
                            }}
                          >
                            <a>{drop.name}</a>
                          </NextLink>
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{displayAddress(drop.address)}</TableCell>
                    <TableCell>{displayAddress(drop.polygonContractAddress)}</TableCell>
                    <TableCell>{drop.queueId}</TableCell>
                    <TableCell>{drop.network}</TableCell>
                    <TableCell>{drop.type}</TableCell>
                    <TableCell>{drop.isDropEnded ? 'Done' : 'Pending'}</TableCell>
                    <TableCell>{format(new Date(drop.dropDate), 'MM/dd/yyyy - hh:mm')}</TableCell>
                    <TableCell>{drop.isBattleEnded ? 'Done' : 'Pending'}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <NextLink
                          href={{
                            pathname: '/drops/[address]',
                            query: { address: drop.address },
                          }}
                        >
                          <IconButton size="small">
                            <EditIcon fontSize="small" color="primary" />
                          </IconButton>
                        </NextLink>

                        <IconButton size="small" onClick={() => handleClickOpen(drop._id)}>
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
          count={drops.length}
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
            Are you sure to delete this drop permanently?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteDrop} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

DropListResults.propTypes = {
  drops: PropTypes.array.isRequired,
}
