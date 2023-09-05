import CardHeader from 'src/components/CardHeader'
import Footer from 'src/components/Footer'
interface Props {
  children?: React.ReactNode
}
export default function CardLayout({ children }: Props) {
  return (
    <div>
      <CardHeader></CardHeader>
      {children}
      <Footer></Footer>
    </div>
  )
}
