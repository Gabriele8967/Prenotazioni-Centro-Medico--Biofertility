import React, { createContext, useContext, useReducer, ReactNode, useMemo, useEffect } from 'react';
import type { BookingState, BookingStep, Service, Provider, Location, Customer } from '@/types/booking';

interface BookingContextType {
  state: BookingState;
  setService: (service: Service) => void;
  setProvider: (provider: Provider) => void;
  setLocation: (location: Location) => void;
  setDateTime: (date: string, time: string, startDatetime: string) => void;
  setCustomer: (customer: Customer) => void;
  setCurrentStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearErrors: () => void;
  resetBooking: () => void;
  goToStep: (step: number) => void;
  goNext: () => void;
  goBack: () => void;
  reset: () => void;
  saveProgress: () => void;
  loadProgress: () => boolean;
  hasProgress: () => boolean;
  clearProgress: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

type BookingAction =
  | { type: 'SET_SERVICE'; payload: Service }
  | { type: 'SET_PROVIDER'; payload: Provider }
  | { type: 'SET_LOCATION'; payload: Location }
  | { type: 'SET_DATE_TIME'; payload: { date: string; time: string; startDatetime: string } }
  | { type: 'SET_CUSTOMER'; payload: Customer }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { field: string; error: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET_BOOKING' }
  | { type: 'LOAD_PROGRESS'; payload: BookingState };

const initialState: BookingState = {
  service: null,
  provider: null,
  location: null,
  date: null,
  time: null,
  startDatetime: null,
  customer: {},
  currentStep: 1,
  isLoading: false,
  errors: {},
};

// Chiave per localStorage
const BOOKING_PROGRESS_KEY = 'booking_progress_v1';

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_SERVICE':
      return { ...state, service: action.payload };
    case 'SET_PROVIDER':
      return { ...state, provider: action.payload };
    case 'SET_LOCATION':
      return { ...state, location: action.payload };
    case 'SET_DATE_TIME':
      return { 
        ...state, 
        date: action.payload.date,
        time: action.payload.time,
        startDatetime: action.payload.startDatetime
      };
    case 'SET_CUSTOMER':
      return { ...state, customer: action.payload };
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { 
        ...state, 
        errors: { ...state.errors, [action.payload.field]: action.payload.error } 
      };
    case 'CLEAR_ERROR':
      const { [action.payload]: removed, ...restErrors } = state.errors;
      return { ...state, errors: restErrors };
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    case 'RESET_BOOKING':
      return initialState;
    case 'LOAD_PROGRESS':
      return { ...action.payload, isLoading: false, errors: {} };
    default:
      return state;
  }
}

interface BookingProviderProps {
  children: ReactNode;
}

export function BookingProvider({ children }: BookingProviderProps) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Auto-salva il progresso quando cambia lo stato
  useEffect(() => {
    if (state.currentStep > 1) {
      saveProgress();
    }
  }, [state]);

  // Carica il progresso salvato all'inizializzazione
  useEffect(() => {
    loadProgress();
  }, []);

  const setService = (service: Service) => {
    dispatch({ type: 'SET_SERVICE', payload: service });
  };

  const setProvider = (provider: Provider) => {
    dispatch({ type: 'SET_PROVIDER', payload: provider });
  };

  const setLocation = (location: Location) => {
    dispatch({ type: 'SET_LOCATION', payload: location });
  };

  const setDateTime = (date: string, time: string, startDatetime: string) => {
    dispatch({ type: 'SET_DATE_TIME', payload: { date, time, startDatetime } });
  };

  const setCustomer = (customer: Customer) => {
    dispatch({ type: 'SET_CUSTOMER', payload: customer });
  };

  const setCurrentStep = (step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (field: string, error: string) => {
    dispatch({ type: 'SET_ERROR', payload: { field, error } });
  };

  const clearError = (field: string) => {
    dispatch({ type: 'CLEAR_ERROR', payload: field });
  };

  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  const resetBooking = () => {
    dispatch({ type: 'RESET_BOOKING' });
  };

  // Ottimizzate - rimuovo scroll automatico
  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const goNext = () => {
    const nextStep = Math.min(state.currentStep + 1, 6);
    setCurrentStep(nextStep);
  };

  const goBack = () => {
    const prevStep = Math.max(state.currentStep - 1, 1);
    setCurrentStep(prevStep);
  };

  const reset = () => {
    dispatch({ type: 'RESET_BOOKING' });
    clearProgress();
  };

  // Salva il progresso in localStorage
  const saveProgress = () => {
    try {
      const progressData = {
        ...state,
        timestamp: Date.now(),
        version: 1
      };
      localStorage.setItem(BOOKING_PROGRESS_KEY, JSON.stringify(progressData));
    } catch (error) {
      console.warn('Impossibile salvare il progresso:', error);
    }
  };

  // Carica il progresso da localStorage
  const loadProgress = (): boolean => {
    try {
      const savedProgress = localStorage.getItem(BOOKING_PROGRESS_KEY);
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        
        // Verifica se il progresso è valido (non più vecchio di 24 ore)
        const isValid = progressData.timestamp && 
                       (Date.now() - progressData.timestamp) < 24 * 60 * 60 * 1000;
        
        if (isValid && progressData.currentStep > 1) {
          dispatch({ type: 'LOAD_PROGRESS', payload: progressData });
          return true;
        } else {
          // Rimuovi progresso scaduto
          clearProgress();
        }
      }
      return false;
    } catch (error) {
      console.warn('Impossibile caricare il progresso:', error);
      return false;
    }
  };

  // Controlla se c'è progresso salvato
  const hasProgress = (): boolean => {
    try {
      const savedProgress = localStorage.getItem(BOOKING_PROGRESS_KEY);
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        const isValid = progressData.timestamp && 
                       (Date.now() - progressData.timestamp) < 24 * 60 * 60 * 1000;
        return isValid && progressData.currentStep > 1;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // Cancella il progresso salvato
  const clearProgress = () => {
    try {
      localStorage.removeItem(BOOKING_PROGRESS_KEY);
    } catch (error) {
      console.warn('Impossibile cancellare il progresso:', error);
    }
  };

  // Memoizza il valore del context per evitare re-render inutili
  const value: BookingContextType = useMemo(() => ({
    state,
    setService,
    setProvider,
    setLocation,
    setDateTime,
    setCustomer,
    setCurrentStep,
    setLoading,
    setError,
    clearError,
    clearErrors,
    resetBooking,
    goToStep,
    goNext,
    goBack,
    reset,
    saveProgress,
    loadProgress,
    hasProgress,
    clearProgress,
  }), [state]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

export { BookingContext };