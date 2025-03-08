import Logout from './components/logout/logout'
import { PushNotificationManager } from './pushNotificationManager'

export default function Page() {
  return (
    <section className="flex w-full flex-col">
      <h1 className="text-5xl">Settings</h1>
      <PushNotificationManager />
      <Logout />
    </section>
  )
}
