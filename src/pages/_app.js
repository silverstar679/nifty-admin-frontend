import Head from 'next/head'
import dynamic from 'next/dynamic'
import { CacheProvider } from '@emotion/react'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { createEmotionCache } from '../utils/create-emotion-cache'
import { theme } from '../theme'
import { Web3ReactProvider } from '@web3-react/core'
import getLibrary from '../utils/getLibrary'
import Web3ReactManager from '../components/Web3ReactManager'
import { Provider } from 'react-redux'
import store from '../store'

const Web3ProviderPolygonNetwork = dynamic(() => import('../components/PolygonNetworkProvider'), {
  ssr: false,
})
const Web3ProviderEthereumNetwork = dynamic(() => import('../components/EthereumNetworkProvider'), {
  ssr: false,
})

const clientSideEmotionCache = createEmotionCache()

const App = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderEthereumNetwork getLibrary={getLibrary}>
        <Web3ProviderPolygonNetwork getLibrary={getLibrary}>
          <Provider store={store}>
            <CacheProvider value={emotionCache}>
              <Head>
                <title>Nifty Royale Admin</title>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
              </Head>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  <Web3ReactManager>{getLayout(<Component {...pageProps} />)}</Web3ReactManager>
                </ThemeProvider>
              </LocalizationProvider>
            </CacheProvider>
          </Provider>
        </Web3ProviderPolygonNetwork>
      </Web3ProviderEthereumNetwork>
    </Web3ReactProvider>
  )
}

export default App
