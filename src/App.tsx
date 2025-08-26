import { BookingProvider } from '@/context/BookingContext'
import { BookingSystem } from '@/components/BookingSystem'
import { Toaster } from 'sonner'
import './App.css'

function App() {
  return (
    <BookingProvider>
      <div className="min-h-screen bg-background text-foreground">
        <BookingSystem />
        <Toaster 
          theme="dark" 
          position="top-right"
          richColors
          closeButton
          duration={5000}
        />
      </div>
    </BookingProvider>
  )
}

export default App