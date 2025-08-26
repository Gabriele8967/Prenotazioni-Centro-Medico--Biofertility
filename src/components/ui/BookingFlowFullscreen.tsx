import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft, ArrowRight, Check, Home } from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
import { Button } from './button'
import { CategorySelection } from '../steps/CategorySelection'
import { ProviderSelection } from '../steps/ProviderSelection'
import { DateTimeSelection } from '../steps/DateTimeSelection'
import { CustomerForm } from '../steps/CustomerForm'
import { BookingConfirmation } from '../steps/BookingConfirmation'
import { BookingSuccess } from '../steps/BookingSuccess'

interface BookingFlowFullscreenProps {
  isOpen: boolean
  onClose: () => void
  steps: Array<{ id: number; title: string; description: string }>
}

const pageVariants = {
  enter: {
    opacity: 0,
    x: 50,
    scale: 0.98
  },
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.4
    }
  },
  exit: {
    opacity: 0,
    x: -50,
    scale: 0.98,
    transition: {
      duration: 0.3
    }
  }
}

const progressBarVariants = {
  initial: { scaleX: 0 },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: {
      duration: 0.8,
      ease: "easeInOut"
    }
  })
}

export function BookingFlowFullscreen({ isOpen, onClose, steps }: BookingFlowFullscreenProps) {
  const { state, goBack, reset } = useBooking()
  const [isClosing, setIsClosing] = useState(false)

  // Ottimizza la chiusura
  const handleClose = useCallback(() => {
    if (state.currentStep > 1 && state.currentStep < 6) {
      if (confirm('Sei sicuro di voler uscire? I dati inseriti andranno persi.')) {
        setIsClosing(true)
        setTimeout(() => {
          reset()
          onClose()
          setIsClosing(false)
        }, 300)
      }
    } else {
      onClose()
    }
  }, [state.currentStep, reset, onClose])

  // Gestisce il pulsante indietro
  const handleBack = useCallback(() => {
    if (state.currentStep > 1) {
      goBack()
    } else {
      handleClose()
    }
  }, [state.currentStep, goBack, handleClose])

  // Renderizza il contenuto dello step corrente
  const renderStepContent = useMemo(() => {
    switch (state.currentStep) {
      case 1:
        return <CategorySelection />
      case 2:
        return <ProviderSelection />
      case 3:
        return <DateTimeSelection />
      case 4:
        return <CustomerForm />
      case 5:
        return <BookingConfirmation />
      case 6:
        return <BookingSuccess />
      default:
        return null
    }
  }, [state.currentStep])

  // Progress percentage
  const progressPercentage = useMemo(() => {
    return Math.round((state.currentStep / 6) * 100)
  }, [state.currentStep])

  // Current step info
  const currentStepInfo = useMemo(() => {
    return steps.find(step => step.id === state.currentStep)
  }, [steps, state.currentStep])

  if (!isOpen) return null

  return (
    <AnimatePresence mode="wait">
      {(isOpen && !isClosing) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-hidden"
        >
          {/* Fullscreen Container */}
          <div className="h-screen w-screen flex flex-col">
            
            {/* Top Bar - Compatto */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 backdrop-blur-md bg-background/80 shrink-0">
              {/* Left - Step Info */}
              <div className="flex items-center gap-4">
                {/* Progress Circle Compatto */}
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="stroke-muted-foreground/20"
                      strokeDasharray="100, 100"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <motion.path
                      className="stroke-primary"
                      strokeDasharray={`${progressPercentage}, 100`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: `${progressPercentage}, 100` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{state.currentStep}</span>
                  </div>
                </div>

                {/* Step Title */}
                <div>
                  <h1 className="text-lg font-bold text-foreground">
                    {currentStepInfo?.title || 'Caricamento...'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {currentStepInfo?.description || ''}
                  </p>
                </div>
              </div>

              {/* Center - Progress Bar */}
              <div className="flex-1 max-w-md mx-8">
                <div className="relative h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-blue-400 rounded-full"
                    variants={progressBarVariants}
                    initial="initial"
                    animate="animate"
                    custom={progressPercentage}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Step {state.currentStep} di 6</span>
                  <span>{progressPercentage}%</span>
                </div>
              </div>

              {/* Right - Actions */}
              <div className="flex items-center gap-3">
                {state.currentStep > 1 && state.currentStep < 6 && (
                  <Button variant="outline" size="sm" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Indietro
                  </Button>
                )}
                
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  {state.currentStep === 6 ? (
                    <>
                      <Home className="w-4 h-4 mr-2" />
                      Home
                    </>
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Main Content Area - Fullscreen */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <div className="min-h-full flex items-center justify-center p-6">
                  <div className="w-full max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={state.currentStep}
                        variants={pageVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="w-full"
                      >
                        {renderStepContent}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Bar - Solo per step attivi */}
            {state.currentStep > 0 && state.currentStep < 6 && (
              <motion.div 
                className="border-t border-border/30 px-6 py-3 backdrop-blur-md bg-background/80 shrink-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  {/* Progress Steps Mini */}
                  <div className="flex items-center gap-2">
                    {steps.slice(0, 6).map((step, index) => (
                      <div
                        key={step.id}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          step.id <= state.currentStep
                            ? 'bg-primary shadow-md'
                            : step.id === state.currentStep + 1
                            ? 'bg-primary/50'
                            : 'bg-muted-foreground/20'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Center Info */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Centro Infertilità - Biofertility
                    </p>
                  </div>

                  {/* Status */}
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Prenotazione in corso...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Success Footer */}
            {state.currentStep === 6 && (
              <motion.div 
                className="border-t border-border/30 p-6 backdrop-blur-md bg-gradient-to-r from-green-500/10 to-primary/10 shrink-0 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-center gap-6">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="px-8"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Torna alla Home
                  </Button>
                  
                  <Button
                    variant="default"
                    onClick={() => window.location.href = 'https://www.centroinfertilita.it/'}
                    className="px-8 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Visita il Nostro Sito
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}