import PreparedPage from '@/modules/discovery/pages/prepared'

interface DynamicPageProps {
  params: Promise<{ path: string[] }>
}

const DynamicPage = async (props: DynamicPageProps) => {
  const { path } = await props.params

  return <PreparedPage path={path?.join('/')} />
}

export default DynamicPage
