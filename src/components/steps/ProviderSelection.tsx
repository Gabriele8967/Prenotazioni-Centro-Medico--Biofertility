import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, ArrowRight, ArrowLeft, Loader2, User, Star, Clock } from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
import { api } from '@/hooks/useApi'
import { MedicalCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StepSummaryModal } from '@/components/ui/StepSummaryModal'
import type { Provider } from '@/types/booking'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function ProviderSelection() {
  const { state, setProvider, goNext, goBack } = useBooking()
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(state.provider)
  const [isLoading, setIsLoading] = useState(true)
  // Rimuovo il modal interno - ora gestito dal flusso principale

  // Carica i provider all'inizializzazione
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await api.getProviders(state.service?.id)
        if (response.success) {
          setProviders(response.data)
        }
      } catch (error) {
        console.error('Errore caricamento provider:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProviders()
  }, [state.service?.id])

  // Gestisce la selezione del provider
  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider)
  }

  // Conferma la selezione e va al passo successivo automaticamente
  const handleProviderConfirm = (provider: Provider) => {
    setProvider(provider)
    // Piccolo delay per UX fluida
    setTimeout(() => {
      goNext()
    }, 300)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Caricamento medici...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-6xl mx-auto space-y-8"
    >
      {/* Header - Più grande per fullscreen */}
      <motion.div variants={itemVariants} className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-4 bg-primary/20 rounded-full">
            <UserCheck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold gradient-text">
            Seleziona il Medico
          </h2>
        </div>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          Scegli il professionista che preferisci per il tuo appuntamento di <strong>{state.service?.name}</strong>
        </p>
      </motion.div>

      {/* Service Info */}
      {state.service && (
        <motion.div variants={itemVariants}>
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Servizio selezionato</h3>
                <p className="font-semibold">{state.service.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Durata</p>
                <p className="font-medium">{Math.round(state.service.duration / 60)} min</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Provider Grid */}
      <motion.div variants={itemVariants}>
        {providers.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nessun medico disponibile</h3>
            <p className="text-muted-foreground">
              Al momento non ci sono medici disponibili per questo servizio.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {providers.map((provider) => (
              <motion.div
                key={provider.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MedicalCard
                  className="cursor-pointer h-full card-hover-effect transition-all duration-300"
                  selected={selectedProvider?.id === provider.id}
                  onClick={() => {
                    handleProviderSelect(provider)
                    handleProviderConfirm(provider)
                  }}
                >
                  <div className="p-6 h-full flex flex-col">
                    {/* Provider Photo */}
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-muted/20 mr-4 shrink-0">
                        {provider.image_url ? (
                          <img
                            src={provider.image_url}
                            alt={`${provider.first_name} ${provider.last_name}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/20">
                            <User className="w-8 h-8 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">
                          {provider.first_name} {provider.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Specialista
                        </p>
                      </div>
                    </div>

                    {/* Provider Description */}
                    {provider.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                        {provider.description}
                      </p>
                    )}

                    {/* Provider Stats */}
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Servizi</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {provider.service_count} disponibili
                        </Badge>
                      </div>

                      {/* Specializations */}
                      {provider.specializations && provider.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {provider.specializations.slice(0, 2).map((spec, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {provider.specializations.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{provider.specializations.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Selection indicator */}
                      {selectedProvider?.id === provider.id && (
                        <div className="flex items-center gap-2 text-primary text-sm font-medium">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          Selezionato
                        </div>
                      )}
                    </div>
                  </div>
                </MedicalCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <motion.div variants={itemVariants} className="flex justify-between pt-8">
        <Button
          variant="outline"
          size="lg"
          onClick={goBack}
          className="px-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Indietro
        </Button>

        {/* Indicatore selezione */}
        <div className="w-24"></div> {/* Spacer per bilanciare */}
      </motion.div>

      {/* Mostra selezione corrente */}
      {selectedProvider && (
        <motion.div
          variants={itemVariants}
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="glass-card p-4 border border-primary/30 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Dr. {selectedProvider.first_name} {selectedProvider.last_name} selezionato
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}