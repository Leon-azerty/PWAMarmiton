import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/dialog'

interface IDialogWrapperProps {
  content: JSX.Element
  trigger: JSX.Element
  title: string
  description: string
  variant?: 'default' | 'secondary' | 'destructive'
  open?: boolean
  setOpen?: (open: boolean) => void
  synchronizing?: boolean
}

export default function DialogWrapper(props: IDialogWrapperProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <Button asChild variant={props.variant} disabled={props.synchronizing}>
        <DialogTrigger>{props.trigger}</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        {props.content}
      </DialogContent>
    </Dialog>
  )
}
