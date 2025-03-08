import { Button } from '@/ui/button'
import { useFormStatus } from 'react-dom'
import Spinner from './spinner'

export default function SubmitButton({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className={className}>
      {text}
      {pending && <Spinner />}
    </Button>
  )
}
