package repository

import (
	"fmt"
	"time"

	"github.com/financial-tracker/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type PocketRepository struct {
	db *sqlx.DB
}

func NewPocketRepository(db *sqlx.DB) *PocketRepository {
	return &PocketRepository{db: db}
}

func (r *PocketRepository) Create(pocket *models.Pocket) error {
	pocket.ID = uuid.New()
	pocket.CreatedAt = time.Now()
	pocket.UpdatedAt = time.Now()

	query := `
		INSERT INTO pockets (id, user_id, account_id, name, balance, percentage_allocation, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.Exec(query, pocket.ID, pocket.UserID, pocket.AccountID, pocket.Name, pocket.Balance, pocket.PercentageAllocation, pocket.CreatedAt, pocket.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create pocket: %w", err)
	}

	return nil
}

func (r *PocketRepository) GetByUserID(userID uuid.UUID) ([]models.Pocket, error) {
	var pockets []models.Pocket
	query := `SELECT id, user_id, account_id, name, balance, percentage_allocation, created_at, updated_at FROM pockets WHERE user_id = $1 ORDER BY created_at DESC`
	err := r.db.Select(&pockets, query, userID)
	if err != nil {
		return nil, err
	}
	return pockets, nil
}

func (r *PocketRepository) GetByID(id uuid.UUID) (*models.Pocket, error) {
	var pocket models.Pocket
	query := `SELECT id, user_id, account_id, name, balance, percentage_allocation, created_at, updated_at FROM pockets WHERE id = $1`
	err := r.db.Get(&pocket, query, id)
	if err != nil {
		return nil, err
	}
	return &pocket, nil
}

func (r *PocketRepository) Update(pocket *models.Pocket) error {
	pocket.UpdatedAt = time.Now()
	query := `UPDATE pockets SET name = $1, balance = $2, percentage_allocation = $3, updated_at = $4 WHERE id = $5`
	_, err := r.db.Exec(query, pocket.Name, pocket.Balance, pocket.PercentageAllocation, pocket.UpdatedAt, pocket.ID)
	return err
}

func (r *PocketRepository) Delete(id uuid.UUID) error {
	query := `DELETE FROM pockets WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}
