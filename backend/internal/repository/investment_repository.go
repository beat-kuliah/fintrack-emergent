package repository

import (
	"fmt"
	"time"

	"github.com/financial-tracker/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type InvestmentRepository struct {
	db *sqlx.DB
}

func NewInvestmentRepository(db *sqlx.DB) *InvestmentRepository {
	return &InvestmentRepository{db: db}
}

func (r *InvestmentRepository) Create(investment *models.Investment) error {
	investment.ID = uuid.New()
	investment.CreatedAt = time.Now()
	investment.UpdatedAt = time.Now()

	query := `
		INSERT INTO investments (id, user_id, investment_type, name, purchase_value, current_value, quantity, purchase_date, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.Exec(query, investment.ID, investment.UserID, investment.InvestmentType, investment.Name, investment.PurchaseValue, investment.CurrentValue, investment.Quantity, investment.PurchaseDate, investment.CreatedAt, investment.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create investment: %w", err)
	}

	return nil
}

func (r *InvestmentRepository) GetByUserID(userID uuid.UUID) ([]models.Investment, error) {
	var investments []models.Investment
	query := `SELECT id, user_id, investment_type, name, purchase_value, current_value, quantity, purchase_date, created_at, updated_at FROM investments WHERE user_id = $1 ORDER BY created_at DESC`
	err := r.db.Select(&investments, query, userID)
	if err != nil {
		return nil, err
	}
	return investments, nil
}

func (r *InvestmentRepository) GetByID(id uuid.UUID) (*models.Investment, error) {
	var investment models.Investment
	query := `SELECT id, user_id, investment_type, name, purchase_value, current_value, quantity, purchase_date, created_at, updated_at FROM investments WHERE id = $1`
	err := r.db.Get(&investment, query, id)
	if err != nil {
		return nil, err
	}
	return &investment, nil
}

func (r *InvestmentRepository) Update(investment *models.Investment) error {
	investment.UpdatedAt = time.Now()
	query := `UPDATE investments SET investment_type = $1, name = $2, current_value = $3, quantity = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.Exec(query, investment.InvestmentType, investment.Name, investment.CurrentValue, investment.Quantity, investment.UpdatedAt, investment.ID)
	return err
}

func (r *InvestmentRepository) Delete(id uuid.UUID) error {
	query := `DELETE FROM investments WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}
