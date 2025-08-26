import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = "Elaborazione in corso..." }: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8 rounded-2xl text-center max-w-sm mx-4"
      >
        <div className="mb-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Attendere prego</h3>
        <p className="text-muted-foreground">{message}</p>
      </motion.div>
    </motion.div>
  )
}