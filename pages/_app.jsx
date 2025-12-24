import '../src/styles/global.css'
import '../src/styles/mobile-responsive.css'
import { AppProvider } from '../src/context/AppContext'
import Layout from '../src/components/Layout'

export default function MyApp({ Component, pageProps }) {
  return (
    <AppProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppProvider>
  )
}
