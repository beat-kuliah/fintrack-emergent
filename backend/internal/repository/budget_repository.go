package repository

import (
	"fmt"
	"time"

	"github.com/financial-tracker/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type BudgetRepository struct {
	db *sqlx.DB
}

func NewBudgetRepository(db *sqlx.DB) *BudgetRepository {
	return &BudgetRepository{db: db}
}

func (r *BudgetRepository) Create(budget *models.Budget) error {
	budget.ID = uuid.New()
	budget.CreatedAt = time.Now()
	budget.UpdatedAt = time.Now()

	query := `
		INSERT INTO budgets (id, user_id, category, amount, period, start_date, end_date, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.db.Exec(query, budget.ID, budget.UserID, budget.Category, budget.Amount, budget.Period, budget.StartDate, budget.EndDate, budget.CreatedAt, budget.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create budget: %w", err)
	}

	return nil
}

func (r *BudgetRepository) GetByUserID(userID uuid.UUID) ([]models.Budget, error) {
	var budgets []models.Budget
	query := `SELECT id, user_id, category, amount, period, start_date, end_date, created_at, updated_at FROM budgets WHERE user_id = $1 ORDER BY created_at DESC`
	err := r.db.Select(&budgets, query, userID)
	if err != nil {
		return nil, err
	}
	return budgets, nil
}

func (r *BudgetRepository) GetByID(id uuid.UUID) (*models.Budget, error) {
	var budget models.Budget
	query := `SELECT id, user_id, category, amount, period, start_date, end_date, created_at, updated_at FROM budgets WHERE id = $1`
	err := r.db.Get(&budget, query, id)
	if err != nil {
		return nil, err
	}
	return &budget, nil
}

func (r *BudgetRepository) Update(budget *models.Budget) error {
	budget.UpdatedAt = time.Now()
	query := `UPDATE budgets SET category = $1, amount = $2, period = $3, start_date = $4, end_date = $5, updated_at = $6 WHERE id = $7`
	_, err := r.db.Exec(query, budget.Category, budget.Amount, budget.Period, budget.StartDate, budget.EndDate, budget.UpdatedAt, budget.ID)
	return err
}

func (r *BudgetRepository) Delete(id uuid.UUID) error {
	query := `DELETE FROM budgets WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}
