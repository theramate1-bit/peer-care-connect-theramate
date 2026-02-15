import Layout from '../components/Layout'
import BulkVideoGenerator from '../components/BulkVideoGenerator'
import ApiTestPanel from '../components/ApiTestPanel'

export default function Home() {
  return (
    <Layout>
      <ApiTestPanel />
      <BulkVideoGenerator />
    </Layout>
  )
}