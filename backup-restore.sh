#!/bin/bash

# ===========================================
# SCRIPT BACKUP E RESTORE
# Sistema Prenotazioni Centro Medico
# ===========================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BACKUP_DIR="/opt/backups/prenotazioni"
DATE=$(date +%Y%m%d_%H%M%S)

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

show_usage() {
    echo "Utilizzo: $0 [backup|restore|list|cleanup]"
    echo ""
    echo "Comandi:"
    echo "  backup   - Crea backup completo del sistema"
    echo "  restore  - Ripristina da backup (richiede filename)"
    echo "  list     - Lista backup disponibili"
    echo "  cleanup  - Rimuove backup più vecchi di 30 giorni"
    echo ""
    echo "Esempi:"
    echo "  $0 backup"
    echo "  $0 restore backup_20240126_143022.tar.gz"
    echo "  $0 list"
    echo "  $0 cleanup"
}

create_backup() {
    log_info "Avvio backup del sistema..."
    
    # Creazione directory backup
    mkdir -p "$BACKUP_DIR"
    
    BACKUP_FILE="$BACKUP_DIR/backup_${DATE}.tar.gz"
    
    # Backup database
    log_info "Backup database MySQL..."
    docker-compose exec -T mysql mysqldump \
        -u root -p${MYSQL_ROOT_PASSWORD:-PrenotazioniRoot2024!} \
        --all-databases \
        --single-transaction \
        --routines \
        --triggers > "$BACKUP_DIR/db_${DATE}.sql"
    
    # Backup file applicazione
    log_info "Backup file applicazione..."
    tar -czf "$BACKUP_FILE" \
        --exclude='node_modules' \
        --exclude='nginx/logs' \
        --exclude='.git' \
        --exclude='*.log' \
        . \
        "$BACKUP_DIR/db_${DATE}.sql"
    
    # Rimozione file SQL temporaneo
    rm "$BACKUP_DIR/db_${DATE}.sql"
    
    # Informazioni backup
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log_success "Backup completato: $BACKUP_FILE ($BACKUP_SIZE)"
    
    # Verifica integrità
    if tar -tzf "$BACKUP_FILE" > /dev/null 2>&1; then
        log_success "Backup verificato - integrità OK"
    else
        log_error "Errore: backup corrotto!"
        exit 1
    fi
}

restore_backup() {
    if [ -z "$1" ]; then
        log_error "Specificare il file di backup da ripristinare"
        echo "Backup disponibili:"
        list_backups
        exit 1
    fi
    
    BACKUP_FILE="$BACKUP_DIR/$1"
    
    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "File di backup non trovato: $BACKUP_FILE"
        exit 1
    fi
    
    log_warning "ATTENZIONE: Il ripristino sovrascriverà tutti i dati esistenti!"
    read -p "Continuare? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Operazione annullata"
        exit 0
    fi
    
    log_info "Avvio ripristino da: $BACKUP_FILE"
    
    # Stop dei servizi
    log_info "Arresto servizi..."
    docker-compose down
    
    # Estrazione backup
    log_info "Estrazione file..."
    tar -xzf "$BACKUP_FILE" --overwrite
    
    # Ripristino database
    DB_FILE=$(tar -tzf "$BACKUP_FILE" | grep "db_.*\.sql$" | head -1)
    if [ -n "$DB_FILE" ]; then
        log_info "Ripristino database..."
        
        # Avvio solo MySQL per ripristino
        docker-compose up -d mysql
        
        # Attesa avvio MySQL
        sleep 30
        
        # Ripristino database
        docker-compose exec -T mysql mysql \
            -u root -p${MYSQL_ROOT_PASSWORD:-PrenotazioniRoot2024!} \
            < "$DB_FILE"
        
        rm -f "$DB_FILE"
        log_success "Database ripristinato"
    fi
    
    # Riavvio servizi
    log_info "Riavvio servizi..."
    docker-compose up -d
    
    log_success "Ripristino completato!"
}

list_backups() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log_warning "Directory backup non trovata: $BACKUP_DIR"
        return
    fi
    
    echo -e "${BLUE}Backup disponibili:${NC}"
    echo "----------------------------------------"
    
    if ls "$BACKUP_DIR"/backup_*.tar.gz 1> /dev/null 2>&1; then
        for backup in "$BACKUP_DIR"/backup_*.tar.gz; do
            filename=$(basename "$backup")
            size=$(du -h "$backup" | cut -f1)
            date=$(stat -c %y "$backup" | cut -d'.' -f1)
            echo -e "${GREEN}$filename${NC} - $size - $date"
        done
    else
        log_warning "Nessun backup trovato"
    fi
}

cleanup_backups() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log_warning "Directory backup non trovata"
        return
    fi
    
    log_info "Pulizia backup più vecchi di 30 giorni..."
    
    deleted=0
    for backup in "$BACKUP_DIR"/backup_*.tar.gz; do
        if [ -f "$backup" ] && [ $(find "$backup" -mtime +30 | wc -l) -eq 1 ]; then
            rm -f "$backup"
            log_success "Eliminato: $(basename "$backup")"
            ((deleted++))
        fi
    done
    
    log_success "Pulizia completata - $deleted file eliminati"
}

# Main
case "$1" in
    backup)
        create_backup
        ;;
    restore)
        restore_backup "$2"
        ;;
    list)
        list_backups
        ;;
    cleanup)
        cleanup_backups
        ;;
    *)
        show_usage
        exit 1
        ;;
esac