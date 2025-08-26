import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
import { GlassCard } from './card'
import { Button } from './button'
import { CategorySelection } from '../steps/CategorySelection'
import { ProviderSelection } from '../steps/ProviderSelection'
import { DateTimeSelection } from '../steps/DateTimeSelection'
import { CustomerForm } from '../steps/CustomerForm'
import { BookingConfirmation } from '../steps/BookingConfirmation'
import { BookingSuccess } from '../steps/BookingSuccess'

interface BookingFlowModalProps {
  isOpen: boolean
  onClose: () => void
  steps: Array<{ id: number; title: string; description: string }>
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
}

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    y: 50
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.4
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    y: 50,
    transition: { duration: 0.2 }
  }
}

const stepContentVariants = {
  hidden: { 
    opacity: 0, 
    x: 30
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
      duration: 0.3
    }
  },
  exit: { 
    opacity: 0, 
    x: -30,
    transition: { duration: 0.15 }
  }
}

export function BookingFlowModal({ isOpen, onClose, steps }: BookingFlowModalProps) {
  const { state, goBack, reset } = useBooking()
  const [isClosing, setIsClosing] = useState(false)

  // Ottimizza la chiusura del modal
  const handleClose = useCallback(() => {
    if (state.currentStep > 1 && state.currentStep < 6) {
      // Conferma prima di chiudere se ci sono dati
      if (confirm('Sei sicuro di voler chiudere? I dati inseriti andranno persi.')) {
        setIsClosing(true)
        setTimeout(() => {
          reset()
          onClose()
          setIsClosing(false)
        }, 200)
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

  // Calcola la larghezza del modal in base allo step
  const getModalWidth = useMemo(() => {
    switch (state.currentStep) {
      case 1:
      case 2:
        return 'max-w-5xl'
      case 3:
        return 'max-w-4xl'
      case 4:
      case 5:
        return 'max-w-3xl'
      case 6:
        return 'max-w-2xl'
      default:
        return 'max-w-4xl'
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
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`w-full ${getModalWidth} h-[90vh] flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard className="h-full flex flex-col border-primary/20 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/50 shrink-0">
                <div className="flex items-center gap-4">
                  {/* Progress Circle */}
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="stroke-muted-foreground/20"
                        strokeDasharray="100, 100"
                        strokeWidth="2"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <motion.path
                        className="stroke-primary"
                        strokeDasharray={`${progressPercentage}, 100`}
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        initial={{ strokeDasharray: "0, 100" }}
                        animate={{ strokeDasharray: `${progressPercentage}, 100` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{state.currentStep}</span>
                    </div>
                  </div>

                  {/* Step Info */}
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {currentStepInfo?.title || 'Caricamento...'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {currentStepInfo?.description || ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Progress Steps */}
                  <div className="hidden md:flex items-center gap-2 mr-4">
                    {steps.slice(0, 6).map((step, index) => (
                      <div
                        key={step.id}
                        className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                          step.id <= state.currentStep
                            ? 'bg-primary'
                            : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>

                  <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={state.currentStep}
                      variants={stepContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="h-full"
                    >
                      {renderStepContent}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Footer - solo per step che necessitano navigazione */}
              {state.currentStep > 0 && state.currentStep < 6 && (
                <motion.div 
                  className="border-t border-border/50 p-6 shrink-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {state.currentStep === 1 ? 'Chiudi' : 'Indietro'}
                    </Button>

                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        Step {state.currentStep} di 6
                      </p>
                      <div className="text-sm font-medium text-primary">
                        {progressPercentage}% Completato
                      </div>
                    </div>

                    <div className="w-24"></div> {/* Spacer for balance */}
                  </div>
                </motion.div>
              )}

              {/* Success Footer */}
              {state.currentStep === 6 && (
                <motion.div 
                  className="border-t border-border/50 p-6 shrink-0 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    variant="medical"
                    onClick={handleClose}
                    className="px-8"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Completato
                  </Button>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}