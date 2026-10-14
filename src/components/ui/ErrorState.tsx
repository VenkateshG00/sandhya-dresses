import { AlertCircle } from 'lucide-react'
import Button from './Button'

interface Props {
  title?: string
  message?: string
  retry?: () => void
}

export default function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again.',
  retry,
}: Props) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-500" aria-hidden />
      </div>
      <h3 className="font-serif text-xl text-charcoal-800 mb-2">{title}</h3>
      <p className="text-sm text-charcoal-500 max-w-sm mb-6">{message}</p>
      {retry && (
        <Button variant="secondary" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  )
}
