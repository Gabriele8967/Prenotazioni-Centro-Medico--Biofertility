import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Stethoscope, ArrowRight, Search, Filter, Loader2 } from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
import { useCategoriesApi, useServicesApi, api } from '@/hooks/useApi'
import { MedicalCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MedicalInput } from '@/components/ui/input'
import { StepSummaryModal } from '@/components/ui/StepSummaryModal'
import { formatPrice } from '@/lib/utils'
import type { Category, Service } from '@/types/booking'

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

export function CategorySelection() {
  const { setService, goNext } = useBooking()
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  // Rimuovo il modal interno - ora gestito dal flusso principale

  // Carica categorie all'inizializzazione
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.getCategories()
        if (response.success) {
          setCategories(response.data)
        }
      } catch (error) {
        console.error('Errore caricamento categorie:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Carica servizi quando viene selezionata una categoria
  const handleCategorySelect = async (category: Category) => {
    setSelectedCategory(category)
    setSelectedService(null)
    setIsLoadingServices(true)

    try {
      const response = await api.getCategoryServices(category.id)
      if (response.success) {
        setServices(response.data)
      }
    } catch (error) {
      console.error('Errore caricamento servizi:', error)
    } finally {
      setIsLoadingServices(false)
    }
  }

  // Gestisce la selezione del servizio
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
  }

  // Conferma la selezione e va al passo successivo automaticamente
  const handleServiceConfirm = (service: Service) => {
    setService(service)
    // Piccolo delay per UX fluida
    setTimeout(() => {
      goNext()
    }, 300)
  }

  // Filtra i servizi in base alla ricerca
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoadingCategories) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Caricamento categorie...</p>
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
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold gradient-text">
            Seleziona il Servizio
          </h2>
        </div>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          Scegli la categoria di servizio che ti interessa e poi seleziona la prestazione specifica
        </p>
      </motion.div>

      {/* Categorie */}
      {!selectedCategory && (
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-semibold mb-6">Categorie di Servizi</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MedicalCard
                  className="cursor-pointer h-full card-hover-effect"
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="p-6 h-full flex flex-col">
                    {category.image_url && (
                      <div className="w-full h-32 mb-4 rounded-lg overflow-hidden">
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">{category.name}</h4>
                      {category.description && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <Badge variant="secondary" className="text-xs">
                        {category.service_count} servizi
                      </Badge>
                      {category.average_price > 0 && (
                        <span className="text-sm text-primary font-medium">
                          da {formatPrice(category.average_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </MedicalCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Servizi */}
      {selectedCategory && (
        <motion.div variants={itemVariants}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h3 className="text-xl font-semibold">{selectedCategory.name}</h3>
              <p className="text-muted-foreground">
                Seleziona il servizio specifico di cui hai bisogno
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory(null)
                setSelectedService(null)
                setServices([])
              }}
            >
              Cambia categoria
            </Button>
          </div>

          {/* Ricerca servizi */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <MedicalInput
              placeholder="Cerca un servizio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista servizi */}
          {isLoadingServices ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
                <p className="text-muted-foreground">Caricamento servizi...</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MedicalCard
                    className="cursor-pointer card-hover-effect transition-all duration-300"
                    selected={selectedService?.id === service.id}
                    onClick={() => {
                      handleServiceSelect(service)
                      handleServiceConfirm(service)
                    }}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-lg flex-1 pr-2">
                          {service.name}
                        </h4>
                        <Badge variant="medical" className="shrink-0">
                          {formatPrice(service.price)}
                        </Badge>
                      </div>
                      
                      {service.description && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {service.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Durata: {Math.round(service.duration / 60)} min
                        </span>
                        {selectedService?.id === service.id && (
                          <Badge variant="success" className="text-xs">
                            Selezionato
                          </Badge>
                        )}
                      </div>
                    </div>
                  </MedicalCard>
                </motion.div>
              ))}
            </div>
          )}

          {filteredServices.length === 0 && !isLoadingServices && (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Nessun servizio trovato</h3>
              <p className="text-muted-foreground">
                Prova a modificare i termini di ricerca
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Mostra selezione corrente */}
      {selectedService && (
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
                {selectedService.name} selezionato
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}