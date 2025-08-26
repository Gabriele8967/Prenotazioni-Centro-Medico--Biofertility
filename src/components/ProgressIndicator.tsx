import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: number
  title: string
  description: string
}

interface ProgressIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-muted/30 -z-10">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-blue-400"
            initial={{ width: '0%' }}
            animate={{ 
              width: `${Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 100)}%` 
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          const isUpcoming = currentStep < step.id

          return (
            <div key={step.id} className="flex flex-col items-center relative">
              {/* Step Circle */}
              <motion.div
                className={cn(
                  "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  isCompleted && "bg-primary border-primary text-primary-foreground medical-glow",
                  isCurrent && "bg-primary/20 border-primary text-primary scale-110 medical-pulse",
                  isUpcoming && "bg-muted/30 border-muted text-muted-foreground"
                )}
                initial={{ scale: 0 }}
                animate={{ scale: isCompleted || isCurrent ? 1.1 : 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <span className="font-semibold text-sm">{step.id}</span>
                )}
              </motion.div>

              {/* Step Info */}
              <div className="mt-3 text-center min-w-0">
                <motion.h3
                  className={cn(
                    "font-medium text-sm transition-colors duration-300",
                    isCurrent && "text-primary font-semibold",
                    isCompleted && "text-foreground",
                    isUpcoming && "text-muted-foreground"
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {step.title}
                </motion.h3>
                <motion.p
                  className={cn(
                    "text-xs mt-1 transition-colors duration-300 hidden sm:block",
                    isCurrent && "text-primary/80",
                    isCompleted && "text-muted-foreground",
                    isUpcoming && "text-muted-foreground/60"
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
                >
                  {step.description}
                </motion.p>
              </div>

              {/* Active indicator */}
              {isCurrent && (
                <motion.div
                  className="absolute -bottom-2 w-2 h-2 bg-primary rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile Progress Bar */}
      <div className="mt-6 sm:hidden">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Passo {currentStep} di {steps.length}</span>
          <span>{Math.round((currentStep / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-muted/20 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-primary to-blue-400 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  )
}