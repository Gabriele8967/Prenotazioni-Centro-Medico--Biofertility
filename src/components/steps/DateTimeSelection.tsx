import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowRight, ArrowLeft, Loader2, MapPin } from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
import { api } from '@/hooks/useApi'
import { MedicalCard, GlassCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StepSummaryModal } from '@/components/ui/StepSummaryModal'
import { formatDate, formatTime } from '@/lib/utils'
import type { Location, TimeSlot } from '@/types/booking'

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

export function DateTimeSelection() {
  const { state, setLocation, setDateTime, goNext, goBack } = useBooking()
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(state.location)
  const [selectedDate, setSelectedDate] = useState<string>(state.date || '')
  const [selectedTime, setSelectedTime] = useState<string>(state.time || '')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoadingLocations, setIsLoadingLocations] = useState(true)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  // Rimuovo il modal interno - ora gestito dal flusso principale

  // Carica le location all'inizializzazione
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await api.getLocations()
        if (response.success) {
          setLocations(response.data)
          // Seleziona la prima location se ce n'è una sola
          if (response.data.length === 1) {
            setSelectedLocation(response.data[0])
          }
        }
      } catch (error) {
        console.error('Errore caricamento location:', error)
      } finally {
        setIsLoadingLocations(false)
      }
    }

    loadLocations()
  }, [])

  // Carica gli slot quando cambiano data, location, servizio o provider
  useEffect(() => {
    if (selectedDate && selectedLocation && state.service && state.provider) {
      loadTimeSlots()
    }
  }, [selectedDate, selectedLocation, state.service, state.provider])

  const loadTimeSlots = async () => {
    if (!selectedDate || !selectedLocation || !state.service || !state.provider) return

    setIsLoadingSlots(true)
    setSelectedTime('')

    try {
      const response = await api.getAvailableSlots({
        provider_id: state.provider.id,
        service_id: state.service.id,
        date: selectedDate,
        location_id: selectedLocation.id
      })
      
      if (response.success) {
        setTimeSlots(response.data)
      }
    } catch (error) {
      console.error('Errore caricamento slot:', error)
    } finally {
      setIsLoadingSlots(false)
    }
  }

  // Gestisce la selezione della location
  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
  }

  // Gestisce la selezione della data
  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
  }

  // Gestisce la selezione dell'orario
  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedTime(slot.formatted_time)
    // Auto-continua dopo la selezione
    handleTimeConfirm(slot)
  }

  // Conferma la selezione dell'orario e va avanti automaticamente
  const handleTimeConfirm = (slot: TimeSlot) => {
    if (selectedLocation && selectedDate && state.service) {
      setLocation(selectedLocation)
      
      // Crea la data/ora completa
      const startDatetime = `${selectedDate} ${slot.formatted_time}:00`
      setDateTime(selectedDate, slot.formatted_time, startDatetime)
      
      // Piccolo delay per UX fluida
      setTimeout(() => {
        goNext()
      }, 500)
    }
  }

  // Genera le date disponibili (prossimi 30 giorni, escludendo domenica)
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Esclude le domeniche
      if (date.getDay() !== 0) {
        dates.push(date.toISOString().split('T')[0])
      }
    }
    
    return dates
  }

  const availableDates = getAvailableDates()

  if (isLoadingLocations) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Caricamento sedi...</p>
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
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold gradient-text">
            Seleziona Data e Orario
          </h2>
        </div>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          Scegli quando vuoi prenotare il tuo appuntamento con <strong>{state.provider?.first_name} {state.provider?.last_name}</strong>
        </p>
      </motion.div>

      {/* Booking Summary */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Servizio</h3>
              <p className="font-semibold">{state.service?.name}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Medico</h3>
              <p className="font-semibold">{state.provider?.first_name} {state.provider?.last_name}</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Location Selection */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Sede
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {locations.map((location) => (
            <MedicalCard
              key={location.id}
              className="cursor-pointer card-hover-effect"
              selected={selectedLocation?.id === location.id}
              onClick={() => handleLocationSelect(location)}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold">{location.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{location.address}</p>
                    <p className="text-sm text-muted-foreground mt-1">{location.phone}</p>
                  </div>
                  {selectedLocation?.id === location.id && (
                    <Badge variant="success" className="text-xs">
                      Selezionata
                    </Badge>
                  )}
                </div>
              </div>
            </MedicalCard>
          ))}
        </div>
      </motion.div>

      {/* Date Selection */}
      {selectedLocation && (
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Data
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {availableDates.slice(0, 14).map((date) => (
              <motion.div
                key={date}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={selectedDate === date ? "medical" : "outline"}
                  className="w-full h-auto p-3 flex flex-col"
                  onClick={() => handleDateSelect(date)}
                >
                  <span className="text-xs">
                    {new Date(date).toLocaleDateString('it-IT', { weekday: 'short' })}
                  </span>
                  <span className="font-semibold">
                    {new Date(date).getDate()}
                  </span>
                  <span className="text-xs">
                    {new Date(date).toLocaleDateString('it-IT', { month: 'short' })}
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Time Selection */}
      {selectedDate && selectedLocation && (
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Orario per {formatDate(selectedDate)}
          </h3>

          {isLoadingSlots ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
                <p className="text-muted-foreground">Caricamento orari...</p>
              </div>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Nessun orario disponibile</h3>
              <p className="text-muted-foreground">
                Non ci sono slot liberi per la data selezionata. Prova con un'altra data.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {timeSlots.map((slot) => (
                <motion.div
                  key={slot.start_datetime}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={selectedTime === slot.formatted_time ? "medical" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => handleTimeSelect(slot)}
                    disabled={!slot.available}
                  >
                    {slot.formatted_time}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Selected Summary */}
      {selectedLocation && selectedDate && selectedTime && (
        <motion.div variants={itemVariants}>
          <GlassCard className="p-4 border-primary/50">
            <h3 className="font-semibold mb-3 text-primary">Riepilogo Appuntamento</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Sede</p>
                <p className="font-medium">{selectedLocation.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Data</p>
                <p className="font-medium">{formatDate(selectedDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Orario</p>
                <p className="font-medium">{selectedTime}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

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

        {/* Indicatore completamento */}
        <div className="w-24"></div> {/* Spacer per bilanciare */}
      </motion.div>

      {/* Mostra selezione corrente */}
      {selectedLocation && selectedDate && selectedTime && (
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
                {formatDate(selectedDate)} - {selectedTime} selezionato
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}