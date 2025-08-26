// Configurazione API
const API_BASE_URL = 'http://localhost:3000/api';

// Stato della prenotazione
let bookingData = {
    service: null,
    provider: null,
    location: null,
    date: null,
    time: null,
    customer: {}
};

// Caricamento iniziale
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setMinDate();
});

// Inizializzazione della pagina
async function initializePage() {
    try {
        await loadCategories();
        await loadLocations();
    } catch (error) {
        console.error('Errore inizializzazione:', error);
        showAlert('Errore nel caricamento dei dati. Riprova più tardi.', 'danger');
    }
}

// Caricamento categorie
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/with-counts`);
        const data = await response.json();
        
        if (data.success) {
            displayCategories(data.data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Errore caricamento categorie:', error);
        throw error;
    }
}

// Visualizzazione categorie
function displayCategories(categories) {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = '';

    categories.forEach(category => {
        const categoryCard = `
            <div class="col-md-6 col-lg-3 mb-3">
                <div class="card h-100 category-card" onclick="loadServicesByCategory(${category.id})" 
                     style="cursor: pointer; border-left: 4px solid ${category.color};">
                    <div class="card-body text-center">
                        <h5 class="card-title">${category.name}</h5>
                        <p class="text-muted">${category.service_count} servizi</p>
                        ${category.average_price > 0 ? `<small class="text-success">Da €${parseFloat(category.average_price).toFixed(2)}</small>` : ''}
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += categoryCard;
    });
}

// Caricamento servizi per categoria
async function loadServicesByCategory(categoryId) {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/services`);
        const data = await response.json();
        
        if (data.success) {
            displayServices(data.data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Errore caricamento servizi:', error);
        showAlert('Errore nel caricamento dei servizi. Riprova più tardi.', 'danger');
    }
}

// Visualizzazione servizi
function displayServices(services) {
    const container = document.getElementById('servicesContainer');
    container.innerHTML = '<div class="col-12"><h5>Seleziona un servizio:</h5></div>';

    services.forEach(service => {
        const serviceCard = `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card service-card h-100" onclick="selectService(${service.id})" data-service-id="${service.id}">
                    <div class="card-body">
                        <h6 class="card-title">${service.name}</h6>
                        <p class="card-text text-muted small">${service.description || 'Nessuna descrizione'}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-success fw-bold">€${parseFloat(service.price).toFixed(2)}</span>
                            <small class="text-muted">${Math.round(service.duration / 60)} min</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += serviceCard;
    });
}

// Selezione servizio
async function selectService(serviceId) {
    try {
        // Rimuovi selezioni precedenti
        document.querySelectorAll('.service-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Aggiungi selezione al servizio corrente
        document.querySelector(`[data-service-id="${serviceId}"]`).classList.add('selected');

        // Carica i dettagli del servizio
        const response = await fetch(`${API_BASE_URL}/services/${serviceId}`);
        const data = await response.json();
        
        if (data.success) {
            bookingData.service = data.data;
            
            // Carica i provider per questo servizio
            await loadProviders(serviceId);
            
            // Vai al passo successivo dopo un breve ritardo
            setTimeout(() => goToStep(2), 500);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Errore selezione servizio:', error);
        showAlert('Errore nella selezione del servizio. Riprova.', 'danger');
    }
}

// Caricamento provider
async function loadProviders(serviceId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/providers?service_id=${serviceId}`);
        const data = await response.json();
        
        if (data.success) {
            displayProviders(data.data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Errore caricamento provider:', error);
        throw error;
    }
}

// Visualizzazione provider
function displayProviders(providers) {
    const container = document.getElementById('providersContainer');
    container.innerHTML = '';

    if (providers.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-warning">Nessun medico disponibile per questo servizio.</div></div>';
        return;
    }

    providers.forEach(provider => {
        const providerCard = `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card provider-card h-100" onclick="selectProvider(${provider.id})" data-provider-id="${provider.id}">
                    <div class="card-body text-center">
                        ${provider.image_url ? 
                            `<img src="${provider.image_url}" class="rounded-circle mb-3" width="80" height="80" alt="${provider.first_name} ${provider.last_name}">` :
                            `<div class="bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 80px; height: 80px;">
                                <i class="fas fa-user-md text-white fa-2x"></i>
                            </div>`
                        }
                        <h6 class="card-title">${provider.first_name} ${provider.last_name}</h6>
                        ${provider.description ? `<p class="card-text text-muted small">${provider.description.substring(0, 100)}...</p>` : ''}
                        <small class="text-muted">${provider.service_count} servizi disponibili</small>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += providerCard;
    });
}

// Selezione provider
function selectProvider(providerId) {
    // Rimuovi selezioni precedenti
    document.querySelectorAll('.provider-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Aggiungi selezione al provider corrente
    const selectedCard = document.querySelector(`[data-provider-id="${providerId}"]`);
    selectedCard.classList.add('selected');

    // Salva il provider selezionato
    const providerData = {
        id: providerId,
        name: selectedCard.querySelector('.card-title').textContent
    };
    
    bookingData.provider = providerData;
    
    // Abilita il pulsante per il passo successivo
    document.getElementById('nextToDateBtn').disabled = false;
}

// Caricamento location
async function loadLocations() {
    try {
        const response = await fetch(`${API_BASE_URL}/locations`);
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('locationSelect');
            select.innerHTML = '<option value="">Seleziona una sede</option>';
            
            data.data.forEach(location => {
                const option = `<option value="${location.id}">${location.name}</option>`;
                select.innerHTML += option;
            });
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Errore caricamento location:', error);
        throw error;
    }
}

// Impostazione data minima
function setMinDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateInput = document.getElementById('appointmentDate');
    dateInput.min = tomorrow.toISOString().split('T')[0];
    
    // Aggiungi event listener per il cambio data
    dateInput.addEventListener('change', loadAvailableSlots);
    
    // Aggiungi event listener per il cambio location
    document.getElementById('locationSelect').addEventListener('change', loadAvailableSlots);
}

// Caricamento slot disponibili
async function loadAvailableSlots() {
    const date = document.getElementById('appointmentDate').value;
    const locationId = document.getElementById('locationSelect').value;
    
    if (!date || !locationId || !bookingData.service || !bookingData.provider) {
        return;
    }

    const container = document.getElementById('timeSlotsContainer');
    container.innerHTML = '<div class="text-center"><div class="spinner-border text-primary mb-2"></div><p>Caricamento orari disponibili...</p></div>';
    container.style.display = 'block';

    try {
        const url = `${API_BASE_URL}/bookings/available-slots?provider_id=${bookingData.provider.id}&service_id=${bookingData.service.id}&date=${date}&location_id=${locationId}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            displayTimeSlots(data.data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Errore caricamento slot:', error);
        container.innerHTML = '<div class="alert alert-danger">Errore nel caricamento degli orari. Riprova.</div>';
    }
}

// Visualizzazione slot orari
function displayTimeSlots(slots) {
    const container = document.getElementById('timeSlotsContainer');
    
    if (slots.length === 0) {
        container.innerHTML = '<div class="alert alert-warning">Non ci sono orari disponibili per la data selezionata.</div>';
        return;
    }

    let slotsHtml = '<h6>Orari disponibili:</h6><div class="mt-3">';
    
    slots.forEach(slot => {
        slotsHtml += `
            <span class="time-slot" onclick="selectTimeSlot('${slot.start_datetime}', '${slot.formatted_time}')" 
                  data-start-time="${slot.start_datetime}">
                ${slot.formatted_time}
            </span>
        `;
    });
    
    slotsHtml += '</div>';
    container.innerHTML = slotsHtml;
}

// Selezione slot orario
function selectTimeSlot(startDatetime, formattedTime) {
    // Rimuovi selezioni precedenti
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    // Aggiungi selezione allo slot corrente
    document.querySelector(`[data-start-time="${startDatetime}"]`).classList.add('selected');

    // Salva i dati dell'orario selezionato
    bookingData.date = document.getElementById('appointmentDate').value;
    bookingData.time = formattedTime;
    bookingData.startDatetime = startDatetime;
    bookingData.location = {
        id: document.getElementById('locationSelect').value,
        name: document.getElementById('locationSelect').selectedOptions[0].text
    };
    
    // Abilita il pulsante per il passo successivo
    document.getElementById('nextToDataBtn').disabled = false;
}

// Navigazione tra step
function goToStep(stepNumber) {
    // Nascondi tutti gli step
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });

    // Mostra lo step corrente
    document.getElementById(`step${stepNumber}`).classList.add('active');

    // Aggiorna la progress bar
    const progress = (stepNumber / 5) * 100;
    document.getElementById('progressBar').style.width = progress + '%';

    // Se siamo allo step 5, genera il riepilogo
    if (stepNumber === 5) {
        generateBookingSummary();
    }
}

// Generazione riepilogo prenotazione
function generateBookingSummary() {
    const summaryContainer = document.getElementById('bookingSummary');
    
    const formattedDate = new Date(bookingData.date).toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const summary = `
        <div class="summary-item">
            <strong>Servizio:</strong>
            <span>${bookingData.service.name}</span>
        </div>
        <div class="summary-item">
            <strong>Medico:</strong>
            <span>${bookingData.provider.name}</span>
        </div>
        <div class="summary-item">
            <strong>Data:</strong>
            <span>${formattedDate}</span>
        </div>
        <div class="summary-item">
            <strong>Orario:</strong>
            <span>${bookingData.time}</span>
        </div>
        <div class="summary-item">
            <strong>Sede:</strong>
            <span>${bookingData.location.name}</span>
        </div>
        <div class="summary-item">
            <strong>Durata:</strong>
            <span>${Math.round(bookingData.service.duration / 60)} minuti</span>
        </div>
        <div class="summary-item">
            <strong>Prezzo:</strong>
            <span class="text-success fw-bold">€${parseFloat(bookingData.service.price).toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <strong>Cliente:</strong>
            <span>${document.getElementById('firstName').value} ${document.getElementById('lastName').value}</span>
        </div>
        <div class="summary-item">
            <strong>Telefono:</strong>
            <span>${document.getElementById('phone').value}</span>
        </div>
        ${document.getElementById('email').value ? `
            <div class="summary-item">
                <strong>Email:</strong>
                <span>${document.getElementById('email').value}</span>
            </div>
        ` : ''}
        ${document.getElementById('notes').value ? `
            <div class="summary-item">
                <strong>Note:</strong>
                <span>${document.getElementById('notes').value}</span>
            </div>
        ` : ''}
    `;
    
    summaryContainer.innerHTML = summary;
}

// Conferma prenotazione
async function confirmBooking() {
    // Validazione dati cliente
    const customerForm = document.getElementById('customerForm');
    if (!customerForm.checkValidity()) {
        customerForm.reportValidity();
        goToStep(4);
        return;
    }

    // Validazione consenso privacy GDPR
    const privacyConsent = document.getElementById('privacyConsent');
    if (!privacyConsent.checked) {
        showAlert('È necessario accettare l\'informativa privacy per procedere.', 'warning');
        goToStep(4);
        return;
    }

    // Raccolta dati cliente
    bookingData.customer = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        email: document.getElementById('email').value || null,
        phone: document.getElementById('phone').value,
        country_code: 'it',
        timezone: 'Europe/Rome',
        privacy_consent: true,
        marketing_consent: document.getElementById('marketingConsent').checked
    };

    // Mostra modal di caricamento
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();

    try {
        const bookingPayload = {
            service_id: bookingData.service.id,
            provider_id: bookingData.provider.id,
            location_id: bookingData.location.id,
            start_datetime: bookingData.startDatetime,
            customer_data: bookingData.customer,
            persons: 1,
            notes: document.getElementById('notes').value || null,
            custom_fields: {
                booking_source: 'website',
                user_agent: navigator.userAgent,
                created_at: new Date().toISOString()
            }
        };

        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingPayload)
        });

        const result = await response.json();

        if (result.success) {
            // Successo
            displaySuccessMessage(result.data);
            goToStep(0); // Mostra success step
            document.getElementById('successStep').classList.add('active');
        } else {
            throw new Error(result.message);
        }

    } catch (error) {
        console.error('Errore conferma prenotazione:', error);
        showAlert('Errore nella conferma della prenotazione: ' + error.message, 'danger');
    } finally {
        loadingModal.hide();
    }
}

// Visualizzazione messaggio di successo
function displaySuccessMessage(booking) {
    const container = document.getElementById('successDetails');
    
    const formattedDate = new Date(booking.start_datetime).toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const formattedTime = new Date(booking.start_datetime).toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
    });

    container.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Dettagli Prenotazione</h5>
                <p><strong>Codice Prenotazione:</strong> ${booking.booking_token.toUpperCase()}</p>
                <p><strong>Servizio:</strong> ${booking.service_name}</p>
                <p><strong>Medico:</strong> ${booking.provider_first_name} ${booking.provider_last_name}</p>
                <p><strong>Data e Orario:</strong> ${formattedDate} alle ${formattedTime}</p>
                <p><strong>Sede:</strong> ${booking.location_name}</p>
                
                <div class="alert alert-info mt-3">
                    <i class="fas fa-info-circle"></i>
                    ${booking.status === 'pending' ? 
                        '<strong>La prenotazione è in attesa di conferma.</strong> Ti contatteremo per confermare l\'appuntamento.' :
                        '<strong>Prenotazione confermata!</strong> L\'appuntamento è confermato.'
                    }
                </div>
            </div>
        </div>
    `;
}

// Nuova prenotazione
function newBooking() {
    // Reset dati
    bookingData = {
        service: null,
        provider: null,
        location: null,
        date: null,
        time: null,
        customer: {}
    };

    // Reset form
    document.getElementById('customerForm').reset();
    document.getElementById('appointmentDate').value = '';
    document.getElementById('locationSelect').selectedIndex = 0;
    
    // Reset selezioni
    document.querySelectorAll('.service-card, .provider-card, .time-slot').forEach(el => {
        el.classList.remove('selected');
    });

    // Disabilita pulsanti
    document.getElementById('nextToDateBtn').disabled = true;
    document.getElementById('nextToDataBtn').disabled = true;

    // Torna al primo step
    goToStep(1);
}

// Utility per mostrare alert
function showAlert(message, type = 'danger') {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Inserisci l'alert all'inizio del container
    const container = document.querySelector('.container');
    container.insertAdjacentHTML('afterbegin', alertHtml);
    
    // Rimuovi automaticamente dopo 5 secondi
    setTimeout(() => {
        const alert = document.querySelector('.alert');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}