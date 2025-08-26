#!/bin/bash

# ===========================================
# SCRIPT MONITORAGGIO SISTEMA
# Sistema Prenotazioni Centro Medico
# ===========================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_system_status() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗"
    echo -e "║              STATO SISTEMA PRENOTAZIONI                 ║"
    echo -e "╚══════════════════════════════════════════════════════════╝${NC}\n"

    # Check Docker services
    log_info "Controllo servizi Docker..."
    
    if docker-compose ps | grep -q "Up"; then
        log_success "Servizi Docker attivi"
        docker-compose ps
    else
        log_error "Alcuni servizi Docker non sono attivi"
        docker-compose ps
    fi
    
    echo ""
    
    # Check application health
    log_info "Controllo health check applicazione..."
    
    if curl -sf http://localhost/health > /dev/null 2>&1; then
        log_success "Applicazione raggiungibile"
        curl -s http://localhost/health | jq '.'
    else
        log_error "Applicazione non raggiungibile"
    fi
    
    echo ""
    
    # Check database
    log_info "Controllo database MySQL..."
    
    if docker-compose exec mysql mysqladmin ping -h localhost --silent; then
        log_success "Database MySQL attivo"
    else
        log_error "Database MySQL non risponde"
    fi
    
    echo ""
    
    # Check SSL certificates
    log_info "Controllo certificati SSL..."
    
    if [ -f "nginx/ssl/cert.pem" ]; then
        CERT_EXPIRY=$(openssl x509 -in nginx/ssl/cert.pem -noout -enddate | cut -d= -f2)
        CERT_DAYS=$(( ($(date -d "$CERT_EXPIRY" +%s) - $(date +%s)) / 86400 ))
        
        if [ $CERT_DAYS -gt 30 ]; then
            log_success "Certificato SSL valido (scade in $CERT_DAYS giorni)"
        elif [ $CERT_DAYS -gt 0 ]; then
            log_warning "Certificato SSL scade tra $CERT_DAYS giorni"
        else
            log_error "Certificato SSL scaduto!"
        fi
    else
        log_warning "Certificato SSL non trovato"
    fi
    
    echo ""
}

show_system_resources() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗"
    echo -e "║                RISORSE SISTEMA                          ║"
    echo -e "╚══════════════════════════════════════════════════════════╝${NC}\n"
    
    # CPU e Memoria
    echo -e "${BLUE}💻 CPU e Memoria:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
    echo ""
    
    # Spazio disco
    echo -e "${BLUE}💾 Spazio Disco:${NC}"
    df -h | grep -E "/$|/opt"
    echo ""
    
    # Docker volumes
    echo -e "${BLUE}📦 Volumi Docker:${NC}"
    docker system df
    echo ""
}

show_logs() {
    SERVICE=${1:-app}
    LINES=${2:-50}
    
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗"
    echo -e "║                    LOGS $SERVICE                         ║"
    echo -e "╚══════════════════════════════════════════════════════════╝${NC}\n"
    
    docker-compose logs --tail=$LINES $SERVICE
}

show_connections() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗"
    echo -e "║              CONNESSIONI ATTIVE                         ║"
    echo -e "╚══════════════════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${BLUE}🌐 Connessioni HTTP:${NC}"
    netstat -tulnp | grep :80
    netstat -tulnp | grep :443
    echo ""
    
    echo -e "${BLUE}🗄️ Connessioni Database:${NC}"
    netstat -tulnp | grep :3306
    echo ""
}

maintenance_mode() {
    ACTION=$1
    
    if [ "$ACTION" = "on" ]; then
        log_info "Attivazione modalità manutenzione..."
        
        # Crea pagina manutenzione
        cat > maintenance.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Manutenzione - Centro Medico</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        h1 { color: #1788FB; }
    </style>
</head>
<body>
    <h1>🔧 Sito in Manutenzione</h1>
    <p>Il sistema è temporaneamente non disponibile per manutenzione.</p>
    <p>Torneremo online al più presto.</p>
    <p>Per urgenze: +39 06 123 4567</p>
</body>
</html>
EOF
        
        # Stop applicazione, mantieni nginx
        docker-compose stop app
        docker-compose exec nginx cp /app/maintenance.html /usr/share/nginx/html/
        
        log_success "Modalità manutenzione attivata"
        
    elif [ "$ACTION" = "off" ]; then
        log_info "Disattivazione modalità manutenzione..."
        
        # Riavvia applicazione
        docker-compose start app
        rm -f maintenance.html
        
        log_success "Modalità manutenzione disattivata"
    else
        echo "Uso: $0 maintenance [on|off]"
    fi
}

show_usage() {
    echo "Sistema di Monitoraggio - Centro Medico"
    echo ""
    echo "Utilizzo: $0 [comando] [opzioni]"
    echo ""
    echo "Comandi disponibili:"
    echo "  status       - Mostra stato generale del sistema"
    echo "  resources    - Mostra utilizzo risorse (CPU, RAM, Disco)"
    echo "  logs [srv]   - Mostra logs (default: app)"
    echo "  connections  - Mostra connessioni di rete attive"
    echo "  maintenance  - Modalità manutenzione [on|off]"
    echo ""
    echo "Esempi:"
    echo "  $0 status"
    echo "  $0 logs mysql"
    echo "  $0 maintenance on"
}

# Main
case "$1" in
    status)
        check_system_status
        ;;
    resources)
        show_system_resources
        ;;
    logs)
        show_logs "$2" "$3"
        ;;
    connections)
        show_connections
        ;;
    maintenance)
        maintenance_mode "$2"
        ;;
    *)
        show_usage
        exit 1
        ;;
esac