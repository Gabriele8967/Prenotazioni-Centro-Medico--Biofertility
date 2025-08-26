import { motion } from 'framer-motion'
import { CalendarHeart, Shield, Clock, Users } from 'lucide-react'
import { Badge } from './ui/badge'

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 }
}

export function Header() {
  return (
    <motion.header 
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className="relative"
    >
      {/* Main Header Section */}
      <div className="medical-gradient relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute top-20 right-20 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="text-center text-white">
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full medical-pulse">
                <CalendarHeart className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Centro Infertilità
                </h1>
                <p className="text-xl text-white/90 font-medium">
                  Biofertility
                </p>
              </div>
            </motion.div>

            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Prenota la tua visita specialistica in modo <span className="font-semibold">semplice</span>, <span className="font-semibold">veloce</span> e <span className="font-semibold">sicuro</span>
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-4 mb-6"
            >
              <Badge variant="glass" className="px-4 py-2 text-sm">
                <Shield className="w-4 h-4 mr-2" />
                GDPR Compliant
              </Badge>
              <Badge variant="glass" className="px-4 py-2 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                Prenotazione immediata
              </Badge>
              <Badge variant="glass" className="px-4 py-2 text-sm">
                <Users className="w-4 h-4 mr-2" />
                Team specializzato
              </Badge>
            </motion.div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg
            className="relative block w-full h-12"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
              className="fill-background"
            />
          </svg>
        </div>
      </div>

      {/* Quick Info Bar */}
      <motion.div 
        variants={itemVariants}
        className="bg-card/50 backdrop-blur-sm border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-6 mb-2 sm:mb-0">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Online ora
              </span>
              <span>📍 Roma - Via Velletri 7 & Viale degli Eroi</span>
            </div>
            <div className="flex items-center gap-4">
              <span>📞 +39 06 8415269</span>
              <span>✉️ centrimanna2@gmail.com</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.header>
  )
}