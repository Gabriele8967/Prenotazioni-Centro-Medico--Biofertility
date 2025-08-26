import { motion } from 'framer-motion'
import { 
  CheckCircle, Calendar, User, MapPin, Clock, CreditCard, 
  Mail, Phone, Download, Plus, Share, Copy
} from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
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
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

const successVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
}

export function BookingSuccess() {
  const { state, resetBooking } = useBooking()

  // Genera codice prenotazione demo
  const bookingCode = Math.random().toString(36).substring(2, 10).toUpperCase()

  // Copia il codice prenotazione
  const copyBookingCode = () => {
    navigator.clipboard.writeText(bookingCode)
    toast.success('Codice prenotazione copiato!')
  }

  // Nuova prenotazione
  const handleNewBooking = () => {
    resetBooking()
  }

  // Durata appuntamento
  const duration = state.service ? Math.round(state.service.duration / 60) : 0

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Success Header */}
      <motion.div variants={itemVariants} className="text-center">
        <motion.div 
          variants={successVariants}
          className="mb-6"
        >
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 medical-pulse">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold gradient-text mb-4"
        >
          Prenotazione Confermata!
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6"
        >
          La tua prenotazione è stata registrata con successo. 
          Riceverai a breve una email di conferma con tutti i dettagli.
        </motion.p>

        <motion.div variants={itemVariants}>
          <GlassCard className="max-w-md mx-auto p-4 bg-green-500/10 border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Codice Prenotazione</p>
                <p className="font-mono font-bold text-lg">{bookingCode}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyBookingCode}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Booking Summary */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <h2 className="font-semibold text-xl mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Riepilogo Appuntamento
          </h2>

          <div className="space-y-6">
            {/* Service & Provider Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{state.service?.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Durata: {duration} minuti
                  </p>
                  <Badge variant="medical" className="mt-2">
                    {state.service && formatPrice(state.service.price)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  {state.provider?.image_url ? (
                    <img
                      src={state.provider.image_url}
                      alt={`${state.provider.first_name} ${state.provider.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {state.provider?.first_name} {state.provider?.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">Specialista</p>
                </div>
              </div>
            </div>

            {/* Date & Location Row */}
            <div className="grid lg:grid-cols-2 gap-6 pt-6 border-t border-border/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {state.date && formatDate(state.date)}
                  </h3>
                  <p className="text-lg font-semibold text-primary mt-1">{state.time}</p>
                  <p className="text-sm text-muted-foreground">
                    Si presenti 10 minuti prima
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{state.location?.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {state.location?.address}
                  </p>
                  <p className="text-sm text-primary font-medium">
                    {state.location?.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="pt-6 border-t border-border/50">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Dati Paziente
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Nome: </span>
                  <span className="font-medium">
                    {state.customer.first_name} {state.customer.last_name}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Telefono: </span>
                  <span className="font-medium">{state.customer.phone}</span>
                </div>
                {state.customer.email && (
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground">Email: </span>
                    <span className="font-medium">{state.customer.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Payment Information */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-700 mb-2">Pagamento</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Riceverai a breve un'email con il link sicuro per effettuare il pagamento online.
                Il pagamento deve essere completato entro 24 ore dalla prenotazione.
              </p>
              <div className="flex items-center justify-between">
                <span className="font-medium">Totale da pagare:</span>
                <Badge variant="medical" className="text-lg font-bold">
                  {state.service && formatPrice(state.service.price)}
                </Badge>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Next Steps */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <h3 className="font-semibold text-lg mb-4">Prossimi Passi</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <p className="text-sm">
                <strong>Email di conferma:</strong> Riceverai tutti i dettagli via email
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <p className="text-sm">
                <strong>Pagamento:</strong> Completa il pagamento tramite il link ricevuto
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <p className="text-sm">
                <strong>Appuntamento:</strong> Presentati 10 minuti prima con un documento d'identità
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <Button
          variant="medical"
          size="lg"
          onClick={handleNewBooking}
          className="px-8"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuova Prenotazione
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={() => window.print()}
          className="px-8"
        >
          <Download className="w-4 h-4 mr-2" />
          Stampa Riepilogo
        </Button>
      </motion.div>

      {/* Contact Info */}
      <motion.div variants={itemVariants} className="text-center pt-8">
        <p className="text-sm text-muted-foreground mb-2">
          Hai domande o necessiti di modifiche?
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
          <a 
            href={`tel:${state.location?.phone}`}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <Phone className="w-4 h-4" />
            {state.location?.phone}
          </a>
          <a 
            href="mailto:info@centromedico.it"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <Mail className="w-4 h-4" />
            info@centromedico.it
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}