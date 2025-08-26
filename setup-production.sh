#!/bin/bash

# ===========================================
# SETUP AUTOMATICO PRODUZIONE
# Sistema Prenotazioni - Centro Infertilità
# ===========================================

echo "🚀 Setup Automatico Sistema Prenotazioni - Produzione"
echo "================================================="

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Controllo dipendenze
echo -e "${BLUE}📦 Controllo dipendenze...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js non installato!${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ NPM non installato!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js e NPM trovati${NC}"

# 2. Installa dipendenze
echo -e "${BLUE}📦 Installazione dipendenze...${NC}"
npm install --production
echo -e "${GREEN}✅ Dipendenze installate${NC}"

# 3. Build frontend
echo -e "${BLUE}🏗️  Build frontend per produzione...${NC}"
npm run build
echo -e "${GREEN}✅ Frontend buildato${NC}"

# 4. Controlla file necessari
echo -e "${BLUE}📋 Controllo file configurazione...${NC}"

files_to_check=(
    "package.json"
    "server.js"
    "vercel.json"
    ".env.production"
    "localhost.sql"
    "dist/index.html"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file mancante!${NC}"
        exit 1
    fi
done

# 5. Crea file di ambiente se mancante
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Copiando .env.production in .env${NC}"
    cp .env.production .env
fi

# 6. Test build locale
echo -e "${BLUE}🧪 Test build locale...${NC}"
PORT=3001 NODE_ENV=production node server.js &
SERVER_PID=$!
sleep 5

# Check se server è attivo
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✅ Server funziona correttamente${NC}"
    kill $SERVER_PID
else
    echo -e "${RED}❌ Errore nel server${NC}"
    kill $SERVER_PID
    exit 1
fi

# 7. Informazioni per deploy
echo ""
echo -e "${GREEN}🎉 SETUP COMPLETATO!${NC}"
echo "================================================="
echo -e "${BLUE}📋 File pronti per il deploy:${NC}"
echo "   ✅ Frontend buildato in ./dist/"
echo "   ✅ Backend configurato (server.js)"
echo "   ✅ Database schema (localhost.sql)"
echo "   ✅ Configurazione Vercel (vercel.json)"
echo ""

echo -e "${YELLOW}🚀 PROSSIMI PASSI:${NC}"
echo ""
echo -e "${BLUE}OPZIONE 1 - Deploy Vercel (Raccomandato):${NC}"
echo "1. npm i -g vercel"
echo "2. vercel login"
echo "3. vercel --prod"
echo "4. Configura variabili ambiente nella dashboard"
echo ""

echo -e "${BLUE}OPZIONE 2 - Deploy Railway:${NC}"
echo "1. Vai su railway.app"
echo "2. Connect GitHub repo"
echo "3. Deploy automatico!"
echo ""

echo -e "${BLUE}OPZIONE 3 - Deploy Render:${NC}"
echo "1. Vai su render.com"
echo "2. New Web Service"
echo "3. Connect GitHub repo"
echo "4. Auto-deploy!"
echo ""

echo -e "${GREEN}✨ Il tuo sistema sarà online in meno di 10 minuti!${NC}"
echo ""
echo -e "${YELLOW}📧 IMPORTANTE:${NC} Ricordati di configurare:"
echo "   • Google Calendar API credentials"
echo "   • Gmail App Password per email"
echo "   • Database connection string"
echo ""
echo -e "${GREEN}🎯 Consulta deploy-guide.md per istruzioni dettagliate${NC}"