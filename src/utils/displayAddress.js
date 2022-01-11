export const displayAddress = (address) => {
  return (
    address.slice(0, 2) +
    address.slice(2).toLowerCase().slice(0, 4) +
    '...' +
    address.toLowerCase().slice(-4)
  )
}
