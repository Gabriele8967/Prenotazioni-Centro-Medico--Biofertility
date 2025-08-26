import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, ArrowLeft, CreditCard, Calendar, User, MapPin, 
  Clock, Phone, Mail, FileText, Shield, Loader2, AlertCircle 
} from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
import { api } from '@/hooks/useApi'
import { GlassCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatTime, formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

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

export function BookingConfirmation() {
  const { state, goBack, goToStep, setLoading } = useBooking()
  const [isConfirming, setIsConfirming] = useState(false)

  // Conferma la prenotazione
  const handleConfirmBooking = async () => {
    setIsConfirming(true)

    try {
      // Prepara i dati per l'API
      const bookingPayload = {
        service_id: state.service!.id,
        provider_id: state.provider!.id,
        location_id: state.location!.id,
        start_datetime: state.startDatetime!,
        customer_data: state.customer,
        persons: 1,
        notes: '', // TODO: Get notes from form
        custom_fields: {
          booking_source: 'modern_react_app',
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        }
      }

      const response = await api.createBooking(bookingPayload)

      if (response.success) {
        // Successo - vai alla pagina di successo
        goToStep(6)
        toast.success('Prenotazione confermata con successo!')
      } else {
        throw new Error(response.message || 'Errore nella conferma della prenotazione')
      }
    } catch (error) {
      console.error('Errore conferma prenotazione:', error)
      toast.error(
        error instanceof Error ? error.message : 'Errore nella conferma della prenotazione'
      )
    } finally {
      setIsConfirming(false)
    }
  }

  // Calcola la durata dell'appuntamento
  const duration = state.service ? Math.round(state.service.duration / 60) : 0

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/20 rounded-full">
            <CheckCircle className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold gradient-text">
            Conferma Prenotazione
          </h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Controlla tutti i dettagli del tuo appuntamento prima di confermare
        </p>
      </motion.div>

      {/* Appointment Details */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Dettagli Appuntamento
          </h3>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Service & Provider */}
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-muted-foreground text-sm mb-2">SERVIZIO</h4>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{state.service?.name}</p>
                    {state.service?.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {state.service.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="medical" className="ml-3">
                    {state.service && formatPrice(state.service.price)}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-muted-foreground text-sm mb-2">MEDICO</h4>
                <div className="flex items-center gap-3">
                  {state.provider?.image_url ? (
                    <img
                      src={state.provider.image_url}
                      alt={`${state.provider.first_name} ${state.provider.last_name}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">
                      {state.provider?.first_name} {state.provider?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">Specialista</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Date, Time & Location */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-muted-foreground text-sm mb-2">DATA</h4>
                  <p className="font-semibold">
                    {state.date && formatDate(state.date)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground text-sm mb-2">ORARIO</h4>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{state.time}</span>
                    <Badge variant="outline" className="text-xs">
                      {duration} min
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-muted-foreground text-sm mb-2">SEDE</h4>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">{state.location?.name}</p>
                    <p className="text-sm text-muted-foreground">{state.location?.address}</p>
                    <p className="text-sm text-muted-foreground">{state.location?.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Customer Details */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            I tuoi Dati
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-muted-foreground text-sm mb-1">NOME E COGNOME</h4>
                <p className="font-semibold">
                  {state.customer.first_name} {state.customer.last_name}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-muted-foreground text-sm mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  TELEFONO
                </h4>
                <p className="font-semibold">{state.customer.phone}</p>
              </div>
            </div>

            <div className="space-y-4">
              {state.customer.email && (
                <div>
                  <h4 className="font-medium text-muted-foreground text-sm mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    EMAIL
                  </h4>
                  <p className="font-semibold">{state.customer.email}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Privacy accettata</span>
                </div>
                {state.customer.marketing_consent && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-600">Marketing accettato</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Payment Info */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6 border-primary/30">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Pagamento
          </h3>
          
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded-lg border border-green-500/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-700 mb-2">Pagamento Sicuro Online</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Dopo la conferma riceverai un'email con il link per effettuare il pagamento sicuro 
                  tramite la piattaforma del centro medico.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Totale da pagare:</span>
                  <Badge variant="medical" className="text-base font-bold">
                    {state.service && formatPrice(state.service.price)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Important Info */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Informazioni Importanti
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
              <p>
                <strong>Conferma automatica:</strong> Riceverai una email di conferma immediatamente
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
              <p>
                <strong>Presentarsi 10 minuti prima</strong> dell'orario previsto
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
              <p>
                <strong>Documento richiesto:</strong> Porta con te un documento d'identità valido
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
              <p>
                <strong>Per modifiche o disdette</strong> contatta la segreteria al {state.location?.phone}
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Navigation */}
      <motion.div variants={itemVariants} className="flex justify-between pt-8">
        <Button
          variant="outline"
          size="lg"
          onClick={goBack}
          disabled={isConfirming}
          className="px-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Modifica dati
        </Button>

        <Button
          size="xl"
          variant="medical"
          onClick={handleConfirmBooking}
          disabled={isConfirming}
          className="px-12"
        >
          {isConfirming ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Confermando...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Conferma Prenotazione
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  )
}