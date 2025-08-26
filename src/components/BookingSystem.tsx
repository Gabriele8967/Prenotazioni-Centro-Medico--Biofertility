import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBooking } from '@/context/BookingContext'
import { BookingFlowFullscreen } from './ui/BookingFlowFullscreen'
import { LoadingOverlay } from './ui/LoadingOverlay'
import { ErrorBoundary } from './ui/ErrorBoundary'

const steps = [
  { id: 1, title: 'Servizio', description: 'Seleziona il servizio' },
  { id: 2, title: 'Medico', description: 'Scegli il professionista' },
  { id: 3, title: 'Data & Ora', description: 'Prenota il tuo appuntamento' },
  { id: 4, title: 'I tuoi dati', description: 'Inserisci le informazioni' },
  { id: 5, title: 'Conferma', description: 'Verifica e completa' },
  { id: 6, title: 'Successo', description: 'Prenotazione completata' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
}

export function BookingSystem() {
  const { state, hasProgress, loadProgress } = useBooking()
  const [showBookingFlow, setShowBookingFlow] = useState(false)
  const [showResumeDialog, setShowResumeDialog] = useState(false)

  // Memoizza il contenuto per evitare re-render inutili
  const welcomeScreen = useMemo(() => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-screen flex flex-col items-center justify-center text-center px-4"
    >
      <motion.div variants={itemVariants} className="mb-12">
        <div className="p-6 bg-primary/20 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center">
          <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-6">
          Centro Infertilità
        </h1>
        <h2 className="text-2xl md:text-3xl font-light text-primary mb-8">
          Biofertility
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
          Prenota il tuo appuntamento in modo semplice e veloce. Il nostro team di specialisti è qui per offrirti le migliori cure personalizzate.
        </p>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <motion.button
          onClick={() => setShowBookingFlow(true)}
          className="bg-gradient-to-r from-primary to-blue-500 text-white px-12 py-6 rounded-2xl font-semibold text-xl hover:shadow-2xl transition-all duration-300 medical-glow"
          whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
          whileTap={{ scale: 0.95 }}
        >
          {hasProgress() ? 'Continua Prenotazione' : 'Inizia Prenotazione'}
        </motion.button>
      </motion.div>
    </motion.div>
  ), [])

  const handleCloseBookingFlow = () => {
    setShowBookingFlow(false)
  }

  // Controlla se c'è progresso salvato all'avvio
  React.useEffect(() => {
    if (hasProgress()) {
      setShowResumeDialog(true)
    }
  }, [])

  const handleResumeBooking = () => {
    if (loadProgress()) {
      setShowResumeDialog(false)
      setShowBookingFlow(true)
    }
  }

  const handleStartNew = () => {
    setShowResumeDialog(false)
    setShowBookingFlow(true)
  }

  return (
    <ErrorBoundary>
      <div className="h-screen w-screen bg-background medical-pattern relative overflow-hidden">
        {/* Animated background elements - ottimizzato con will-change */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none will-change-transform">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl floating-animation will-change-transform" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl floating-animation will-change-transform" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl floating-animation will-change-transform" style={{ animationDelay: '-6s' }} />
        </div>

        {/* Fullscreen Content */}
        <div className="relative z-10 h-full">
          {/* Welcome Screen */}
          {!showBookingFlow ? (
            welcomeScreen
          ) : (
            <BookingFlowFullscreen
              isOpen={showBookingFlow}
              onClose={handleCloseBookingFlow}
              steps={steps}
            />
          )}
        </div>

        {/* Resume Dialog */}
        {showResumeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-background border border-primary/20 rounded-2xl p-8 max-w-md mx-auto shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Prenotazione Precedente</h3>
                <p className="text-muted-foreground mb-6">
                  Abbiamo trovato una prenotazione iniziata in precedenza. Vuoi continuare da dove hai lasciato?
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleStartNew}
                    className="px-6 py-3 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    Ricomincia
                  </button>
                  <button
                    onClick={handleResumeBooking}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Continua
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Loading Overlay */}
        {state.isLoading && <LoadingOverlay />}

        {/* Background Medical Grid - ottimizzato */}
        <div className="fixed inset-0 medical-grid opacity-10 pointer-events-none will-change-transform" />
      </div>
    </ErrorBoundary>
  )
}