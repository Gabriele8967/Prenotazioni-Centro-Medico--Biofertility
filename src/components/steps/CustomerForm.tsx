import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, ArrowRight, ArrowLeft, Shield, Mail, Phone, FileText, AlertCircle } from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
import { GlassCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MedicalInput } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StepSummaryModal } from '@/components/ui/StepSummaryModal'
import { formatDate, formatTime, formatPrice } from '@/lib/utils'
import type { Customer } from '@/types/booking'

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

interface FormErrors {
  [key: string]: string
}

export function CustomerForm() {
  const { state, setCustomer, goNext, goBack } = useBooking()
  
  // Form state
  const [formData, setFormData] = useState<Partial<Customer>>({
    first_name: state.customer.first_name || '',
    last_name: state.customer.last_name || '',
    email: state.customer.email || '',
    phone: state.customer.phone || '',
    privacy_consent: state.customer.privacy_consent || false,
    marketing_consent: state.customer.marketing_consent || false,
    country_code: 'it',
    timezone: 'Europe/Rome'
  })
  
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isValidating, setIsValidating] = useState(false)
  // Rimuovo il modal interno - ora gestito dal flusso principale

  // Validazione form
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {}

    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'Il nome è obbligatorio'
    }

    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Il cognome è obbligatorio'
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Il numero di telefono è obbligatorio'
    } else if (!/^[\+]?[\d\s\-\(\)]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Inserire un numero di telefono valido'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Inserire un indirizzo email valido'
    }

    if (!formData.privacy_consent) {
      newErrors.privacy_consent = 'È necessario accettare l\'informativa privacy'
    }

    return newErrors
  }

  // Gestisce i cambi degli input
  const handleInputChange = (field: keyof Customer, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Rimuovi l'errore quando l'utente inizia a digitare
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Validazione e continua automaticamente
  const handleContinue = async () => {
    setIsValidating(true)
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsValidating(false)
      return
    }

    // Salva i dati del cliente
    const customerData: Customer = {
      first_name: formData.first_name!,
      last_name: formData.last_name!,
      email: formData.email || undefined,
      phone: formData.phone!,
      country_code: 'it',
      timezone: 'Europe/Rome',
      privacy_consent: formData.privacy_consent!,
      marketing_consent: formData.marketing_consent!
    }

    setCustomer(customerData)
    setIsValidating(false)
    
    // Piccolo delay per UX fluida
    setTimeout(() => {
      goNext()
    }, 300)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      {/* Header - Più grande per fullscreen */}
      <motion.div variants={itemVariants} className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-4 bg-primary/20 rounded-full">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold gradient-text">
            I tuoi Dati
          </h2>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Inserisci i tuoi dati per completare la prenotazione
        </p>
      </motion.div>

      {/* Appointment Summary */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Riepilogo Appuntamento
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Servizio</p>
              <p className="font-semibold">{state.service?.name}</p>
              <Badge variant="medical" className="text-xs mt-1">
                {state.service && formatPrice(state.service.price)}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Medico</p>
              <p className="font-semibold">{state.provider?.first_name} {state.provider?.last_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Data e Ora</p>
              <p className="font-semibold">
                {state.date && formatDate(state.date)}
              </p>
              <p className="text-sm text-primary font-medium">
                {state.time}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Sede</p>
              <p className="font-semibold text-sm">{state.location?.name}</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Customer Form */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-6">Dati Personali</h3>
          
          <div className="space-y-6">
            {/* Nome e Cognome */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  Nome <span className="text-destructive">*</span>
                </label>
                <MedicalInput
                  id="firstName"
                  placeholder="Il tuo nome"
                  value={formData.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className={errors.first_name ? 'border-destructive' : ''}
                />
                {errors.first_name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Cognome <span className="text-destructive">*</span>
                </label>
                <MedicalInput
                  id="lastName"
                  placeholder="Il tuo cognome"
                  value={formData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className={errors.last_name ? 'border-destructive' : ''}
                />
                {errors.last_name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            {/* Email e Telefono */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <MedicalInput
                    id="email"
                    type="email"
                    placeholder="tua@email.it"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Telefono <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <MedicalInput
                    id="phone"
                    type="tel"
                    placeholder="+39 xxx xxx xxxx"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Note (opzionale)
              </label>
              <textarea
                id="notes"
                placeholder="Eventuali note o richieste particolari..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="flex w-full rounded-lg border border-input bg-card/50 backdrop-blur-sm px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-primary/50 focus-visible:border-primary hover:bg-card/70 medical-shadow resize-none"
              />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Privacy & GDPR */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6 border-primary/30">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Privacy e Consensi
          </h3>

          <div className="space-y-4">
            {/* Consenso Privacy Obbligatorio */}
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.privacy_consent || false}
                  onChange={(e) => handleInputChange('privacy_consent', e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary bg-transparent border-2 border-primary rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">
                    Consenso Privacy (Obbligatorio) <span className="text-destructive">*</span>
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ho preso visione dell'
                    <a 
                      href="https://www.centroinfertilita.it/privacy-policy/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      informativa privacy
                    </a>{' '}
                    e acconsento al trattamento dei miei dati personali per la gestione della 
                    prenotazione sanitaria, in conformità al Regolamento UE 2016/679 (GDPR).
                  </p>
                </div>
              </label>
              {errors.privacy_consent && (
                <p className="text-xs text-destructive flex items-center gap-1 ml-7">
                  <AlertCircle className="w-3 h-3" />
                  {errors.privacy_consent}
                </p>
              )}
            </div>

            {/* Consenso Marketing Opzionale */}
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.marketing_consent || false}
                  onChange={(e) => handleInputChange('marketing_consent', e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary bg-transparent border-2 border-input rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">Consenso Marketing (Opzionale)</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Acconsento a ricevere comunicazioni promozionali e di marketing 
                    da parte di Centro Infertilità - Biofertility.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* GDPR Info */}
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Tutela dei dati:</p>
                <p>
                  I suoi dati sono trattati in sicurezza secondo le normative GDPR. 
                  Ha diritto di accesso, rettifica, cancellazione e portabilità dei dati.
                  <br />
                  <strong>Titolare:</strong> Centro Infertilità - Biofertility, Via Velletri 7, Roma.
                  <br />
                  <strong>Per esercitare i suoi diritti:</strong>{' '}
                  <a 
                    href="mailto:info@centromedico.it" 
                    className="text-primary hover:underline"
                  >
                    info@centromedico.it
                  </a>
                </p>
              </div>
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
          className="px-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Indietro
        </Button>

        <Button
          size="lg"
          variant="medical"
          onClick={handleContinue}
          disabled={isValidating}
          className="px-8"
        >
          {isValidating ? 'Controllo...' : 'Continua alla Conferma'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>

      {/* Indicatore validazione */}
      {isValidating && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="glass-card p-4 border border-primary/30 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Validazione dati in corso...
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}