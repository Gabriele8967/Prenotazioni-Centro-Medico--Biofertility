#!/bin/bash

# ===========================================
# SCRIPT INSTALLAZIONE AUTOMATICA
# Sistema Prenotazioni Centro Medico
# Server Proprietario Privato
# ===========================================

set -e  # Exit on any error

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Banner
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║          SISTEMA PRENOTAZIONI CENTRO MEDICO              ║"
echo "║              INSTALLAZIONE AUTOMATICA                    ║"
echo "║                 Server Proprietario                      ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Funzioni helper
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

# Controllo se è root
if [ "$EUID" -ne 0 ]; then
    log_error "Questo script deve essere eseguito come root (usa sudo)"
    exit 1
fi

# Controllo sistema operativo
log_info "Controllo sistema operativo..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    log_success "Sistema Linux rilevato"
    if command -v apt-get > /dev/null; then
        DISTRO="ubuntu"
        log_info "Sistema Ubuntu/Debian rilevato"
    elif command -v yum > /dev/null; then
        DISTRO="centos"
        log_info "Sistema CentOS/RHEL rilevato"
    else
        log_error "Distribuzione Linux non supportata"
        exit 1
    fi
else
    log_error "Sistema operativo non supportato. Supportati: Linux (Ubuntu/Debian/CentOS)"
    exit 1
fi

# Aggiornamento sistema
log_info "Aggiornamento sistema..."
if [ "$DISTRO" = "ubuntu" ]; then
    apt-get update -qq
    apt-get upgrade -y -qq
elif [ "$DISTRO" = "centos" ]; then
    yum update -y -q
fi
log_success "Sistema aggiornato"

# Installazione Docker
log_info "Installazione Docker..."
if ! command -v docker &> /dev/null; then
    if [ "$DISTRO" = "ubuntu" ]; then
        # Installazione Docker per Ubuntu
        apt-get install -y -qq apt-transport-https ca-certificates curl gnupg lsb-release
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        apt-get update -qq
        apt-get install -y -qq docker-ce docker-ce-cli containerd.io
    elif [ "$DISTRO" = "centos" ]; then
        # Installazione Docker per CentOS
        yum install -y -q yum-utils
        yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        yum install -y -q docker-ce docker-ce-cli containerd.io
    fi
    
    systemctl start docker
    systemctl enable docker
    log_success "Docker installato e avviato"
else
    log_success "Docker già installato"
fi

# Installazione Docker Compose
log_info "Installazione Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    log_success "Docker Compose installato"
else
    log_success "Docker Compose già installato"
fi

# Installazione utilità aggiuntive
log_info "Installazione utilità aggiuntive..."
if [ "$DISTRO" = "ubuntu" ]; then
    apt-get install -y -qq curl wget git nano htop ufw fail2ban certbot nginx-utils
elif [ "$DISTRO" = "centos" ]; then
    yum install -y -q curl wget git nano htop firewalld fail2ban certbot
fi
log_success "Utilità installate"

# Configurazione firewall
log_info "Configurazione firewall..."
if [ "$DISTRO" = "ubuntu" ]; then
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
elif [ "$DISTRO" = "centos" ]; then
    systemctl start firewalld
    systemctl enable firewalld
    firewall-cmd --permanent --zone=public --add-service=ssh
    firewall-cmd --permanent --zone=public --add-service=http
    firewall-cmd --permanent --zone=public --add-service=https
    firewall-cmd --reload
fi
log_success "Firewall configurato"

# Creazione directory progetto
PROJECT_DIR="/opt/prenotazioni"
log_info "Creazione directory progetto in $PROJECT_DIR..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Download del progetto da GitHub (se fornito)
if [ ! -z "$1" ]; then
    log_info "Download progetto da GitHub: $1"
    git clone $1 .
    log_success "Progetto scaricato"
else
    log_warning "Repository GitHub non fornito. Copia manualmente i file del progetto in $PROJECT_DIR"
fi

# Creazione directory per SSL
mkdir -p nginx/ssl
mkdir -p nginx/logs

# Generazione certificati SSL self-signed temporanei
log_info "Generazione certificati SSL temporanei..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/key.pem \
    -out nginx/ssl/cert.pem \
    -subj "/C=IT/ST=Lazio/L=Roma/O=Centro Medico/CN=localhost" &> /dev/null
log_success "Certificati SSL temporanei generati"

# Copia template configurazione
if [ ! -f .env ]; then
    if [ -f .env.production.template ]; then
        cp .env.production.template .env
        log_success "File .env creato da template"
    else
        log_warning "Template .env non trovato. Creane uno manualmente."
    fi
fi

# Configurazione permessi
chown -R $USER:$USER $PROJECT_DIR
chmod +x install-server.sh

log_success "Installazione completata!"

echo -e "\n${PURPLE}╔══════════════════════════════════════════════════════════╗"
echo "║                    INSTALLAZIONE COMPLETA               ║"
echo "╚══════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}🎉 Il sistema è stato installato con successo!${NC}\n"

echo -e "${YELLOW}📋 PROSSIMI PASSI:${NC}"
echo -e "1. Modifica il file ${BLUE}.env${NC} con i tuoi dati:"
echo -e "   ${BLUE}nano $PROJECT_DIR/.env${NC}"
echo ""
echo -e "2. Configura i certificati SSL reali:"
echo -e "   ${BLUE}certbot --nginx -d tuodominio.com${NC}"
echo ""
echo -e "3. Avvia il sistema:"
echo -e "   ${BLUE}cd $PROJECT_DIR${NC}"
echo -e "   ${BLUE}docker-compose up -d${NC}"
echo ""
echo -e "4. Controlla lo stato:"
echo -e "   ${BLUE}docker-compose ps${NC}"
echo -e "   ${BLUE}docker-compose logs -f${NC}"
echo ""
echo -e "${GREEN}🌐 Il tuo sito sarà disponibile su:${NC}"
echo -e "   • HTTP:  ${BLUE}http://tuodominio.com${NC}"
echo -e "   • HTTPS: ${BLUE}https://tuodominio.com${NC}"
echo -e "   • Health: ${BLUE}https://tuodominio.com/health${NC}"
echo ""
echo -e "${GREEN}📚 Gestione del sistema:${NC}"
echo -e "   • Start:   ${BLUE}docker-compose up -d${NC}"
echo -e "   • Stop:    ${BLUE}docker-compose down${NC}"
echo -e "   • Restart: ${BLUE}docker-compose restart${NC}"
echo -e "   • Logs:    ${BLUE}docker-compose logs -f${NC}"
echo -e "   • Update:  ${BLUE}docker-compose pull && docker-compose up -d${NC}"
echo ""
echo -e "${BLUE}📁 Directory progetto: $PROJECT_DIR${NC}"
echo -e "${BLUE}📧 Supporto: configura le variabili email nel file .env${NC}"
echo ""