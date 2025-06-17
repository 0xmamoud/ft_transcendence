DC = docker compose

BLUE = \033[0;34m
GREEN = \033[0;32m
RED = \033[0;31m
RESET = \033[0m

.PHONY: help dev prod down clean logs restart install

help:
	@echo "$(BLUE)Commandes disponibles:$(RESET)"
	@echo "  make install      - Installer les dépendances du backend et frontend"
	@echo "  make dev          - Démarrer le backend et le frontend en mode développement"
	@echo "  make prod         - Démarrer en mode production"
	@echo "  make down         - Arrêter les conteneurs"
	@echo "  make clean        - Supprimer les conteneurs et volumes"
	@echo "  make logs         - Afficher les logs des conteneurs"
	@echo "  make restart      - Redémarrer les conteneurs"

install:
	@echo "$(GREEN)Installation des dépendances...$(RESET)"
	@cd apps/backend && pnpm install
	@cd apps/frontend && pnpm install
	@echo "$(GREEN)Dépendances installées !$(RESET)"

dev:
	@echo "$(GREEN)Démarrage en mode développement...$(RESET)"
	@cd apps/backend && pnpm dev & \
	cd apps/frontend && pnpm dev & \
	wait

prod:
	@echo "$(BLUE)Démarrage en mode production...$(RESET)"
	@$(DC) up --build
	@echo "$(GREEN)Les conteneurs sont démarrés en mode production et sont accessible sur http://localhost:3000 !$(RESET)"

down:
	@echo "$(RED)Arrêt des conteneurs...$(RESET)"
	@$(DC) down
	@echo "$(RED)Les conteneurs sont arrêtés.$(RESET)"

clean:
	@echo "$(RED)Suppression des conteneurs et volumes...$(RESET)"
	@$(DC) down -v --remove-orphans
	@echo "$(RED)Nettoyage complet effectué.$(RESET)"

logs:
	@echo "$(BLUE)Affichage des logs des conteneurs...$(RESET)"
	@$(DC) logs -f

restart:
	@echo "$(BLUE)Redémarrage des conteneurs...$(RESET)"
	@$(DC) restart
	@echo "$(GREEN)Les conteneurs ont été redémarrés !$(RESET)" 