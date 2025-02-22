DC = docker compose

BLUE = \033[0;34m
GREEN = \033[0;32m
RED = \033[0;31m
RESET = \033[0m

.PHONY: help dev prod down-dev down-prod clean-dev clean-prod logs-dev logs-prod restart-dev restart-prod

help:
	@echo "$(BLUE)Commandes disponibles:$(RESET)"
	@echo "  make dev          - Démarrer en mode développement"
	@echo "  make prod         - Démarrer en mode production"
	@echo "  make down-dev     - Arrêter les conteneurs de dev"
	@echo "  make down-prod    - Arrêter les conteneurs de prod"
	@echo "  make clean-dev    - Supprimer les conteneurs et volumes de dev"
	@echo "  make clean-prod   - Supprimer les conteneurs et volumes de prod"
	@echo "  make logs-dev     - Afficher les logs des conteneurs de dev"
	@echo "  make logs-prod    - Afficher les logs des conteneurs de prod"
	@echo "  make restart-dev  - Redémarrer les conteneurs de dev"
	@echo "  make restart-prod - Redémarrer les conteneurs de prod"

dev:
	@echo "$(GREEN)Démarrage en mode développement...$(RESET)"
	@$(DC) -f docker-compose.dev.yml up -d --build
	@echo "$(GREEN)Les conteneurs sont démarrés en mode développement !$(RESET)"

prod:
	@echo "$(BLUE)Démarrage en mode production...$(RESET)"
	@$(DC) -f docker-compose.prod.yml up -d --build
	@echo "$(GREEN)Les conteneurs sont démarrés en mode production !$(RESET)"

down-dev:
	@echo "$(RED)Arrêt des conteneurs de développement...$(RESET)"
	@$(DC) -f docker-compose.dev.yml down
	@echo "$(RED)Les conteneurs de développement sont arrêtés.$(RESET)"

down-prod:
	@echo "$(RED)Arrêt des conteneurs de production...$(RESET)"
	@$(DC) -f docker-compose.prod.yml down
	@echo "$(RED)Les conteneurs de production sont arrêtés.$(RESET)"

clean-dev:
	@echo "$(RED)Suppression des conteneurs et volumes de développement...$(RESET)"
	@$(DC) -f docker-compose.dev.yml down -v --remove-orphans
	@echo "$(RED)Nettoyage dev complet effectué.$(RESET)"

clean-prod:
	@echo "$(RED)Suppression des conteneurs et volumes de production...$(RESET)"
	@$(DC) -f docker-compose.prod.yml down -v --remove-orphans
	@echo "$(RED)Nettoyage prod complet effectué.$(RESET)"

logs-dev:
	@echo "$(BLUE)Affichage des logs des conteneurs de développement...$(RESET)"
	@$(DC) -f docker-compose.dev.yml logs -f

logs-prod:
	@echo "$(BLUE)Affichage des logs des conteneurs de production...$(RESET)"
	@$(DC) -f docker-compose.prod.yml logs -f

restart-dev:
	@echo "$(BLUE)Redémarrage des conteneurs de développement...$(RESET)"
	@$(DC) -f docker-compose.dev.yml restart
	@echo "$(GREEN)Les conteneurs de développement ont été redémarrés !$(RESET)"

restart-prod:
	@echo "$(BLUE)Redémarrage des conteneurs de production...$(RESET)"
	@$(DC) -f docker-compose.prod.yml restart
	@echo "$(GREEN)Les conteneurs de production ont été redémarrés !$(RESET)" 