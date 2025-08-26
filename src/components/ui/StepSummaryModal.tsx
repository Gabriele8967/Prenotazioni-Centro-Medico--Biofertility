import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Calendar, User, MapPin, Clock, Euro, CheckCircle } from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
import { GlassCard } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { formatDate, formatTime, formatPrice } from '@/lib/utils'

interface StepSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
  currentStep: number
  title: string
  description: string
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8, 
    y: 50 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: 50,
    transition: {
      duration: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

export function StepSummaryModal({ 
  isOpen, 
  onClose, 
  onContinue, 
  currentStep, 
  title, 
  description 
}: StepSummaryModalProps) {
  const { state } = useBooking()

  const getStepIcon = () => {
    switch (currentStep) {
      case 1: return <Calendar className="w-6 h-6 text-primary" />
      case 2: return <User className="w-6 h-6 text-primary" />
      case 3: return <Clock className="w-6 h-6 text-primary" />
      case 4: return <CheckCircle className="w-6 h-6 text-primary" />
      default: return <Calendar className="w-6 h-6 text-primary" />
    }
  }

  const getNextStepText = () => {
    switch (currentStep) {
      case 1: return "Scegli il Medico"
      case 2: return "Seleziona Data e Ora"
      case 3: return "Inserisci i tuoi Dati"
      case 4: return "Conferma Prenotazione"
      default: return "Continua"
    }
  }

  const getCompletionPercentage = () => {
    return Math.round((currentStep / 5) * 100)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard className="p-6 border-primary/20">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {getStepIcon()}
                  <div>
                    <h2 className="text-xl font-bold text-primary">{title}</h2>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progresso</span>
                  <span className="text-sm text-primary font-bold">{getCompletionPercentage()}%</span>
                </div>
                <div className="w-full bg-muted/20 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-primary to-blue-400 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${getCompletionPercentage()}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Riepilogo Selections */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-lg">📋 Riepilogo Selezioni</h3>
                
                <motion.div 
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {/* Servizio */}
                  {state.service && (
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{state.service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.round(state.service.duration / 60)} min
                          </p>
                        </div>
                      </div>
                      <Badge variant="medical">
                        {formatPrice(state.service.price)}
                      </Badge>
                    </div>
                  )}

                  {/* Provider */}
                  {state.provider && (
                    <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-500/20">
                          {state.provider.image_url ? (
                            <img
                              src={state.provider.image_url}
                              alt={`${state.provider.first_name} ${state.provider.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {state.provider.first_name} {state.provider.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">Specialista</p>
                        </div>
                      </div>
                      <Badge variant="outline">Selezionato</Badge>
                    </div>
                  )}

                  {/* Data e Ora */}
                  {state.date && state.time && (
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">
                            {formatDate(state.date)}
                          </p>
                          <p className="text-sm text-green-600 font-medium">
                            Ore {state.time}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-700 border-green-600">
                        Confermato
                      </Badge>
                    </div>
                  )}

                  {/* Location */}
                  {state.location && (
                    <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="font-medium">{state.location.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {state.location.phone}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-orange-700 border-orange-600">
                        Sede
                      </Badge>
                    </div>
                  )}

                  {/* Dati Cliente */}
                  {state.customer.first_name && (
                    <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium">
                            {state.customer.first_name} {state.customer.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {state.customer.phone} {state.customer.email && `• ${state.customer.email}`}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-purple-700 border-purple-600">
                        Paziente
                      </Badge>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Totale */}
              {state.service && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg border border-primary/30 mb-6">
                  <div className="flex items-center gap-2">
                    <Euro className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Totale da pagare:</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(state.service.price)}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={onClose}>
                  Modifica
                </Button>
                <Button
                  variant="medical"
                  onClick={() => {
                    onContinue()
                    onClose()
                  }}
                  className="px-6"
                >
                  {getNextStepText()}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}