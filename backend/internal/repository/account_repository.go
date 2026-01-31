package repository

import (
	"fmt"
	"time"

	"github.com/financial-tracker/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type AccountRepository struct {
	db *sqlx.DB
}

func NewAccountRepository(db *sqlx.DB) *AccountRepository {
	return &AccountRepository{db: db}
}

func (r *AccountRepository) Create(account *models.Account) error {
	account.ID = uuid.New()
	account.CreatedAt = time.Now()
	account.UpdatedAt = time.Now()

	query := `
		INSERT INTO accounts (id, user_id, name, type, balance, currency, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.Exec(query, account.ID, account.UserID, account.Name, account.Type, account.Balance, account.Currency, account.CreatedAt, account.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create account: %w", err)
	}

	return nil
}

func (r *AccountRepository) GetByUserID(userID uuid.UUID) ([]models.Account, error) {
	var accounts []models.Account
	query := `SELECT id, user_id, name, type, balance, currency, created_at, updated_at FROM accounts WHERE user_id = $1 ORDER BY created_at DESC`
	err := r.db.Select(&accounts, query, userID)
	if err != nil {
		return nil, err
	}
	return accounts, nil
}

func (r *AccountRepository) GetByID(id uuid.UUID) (*models.Account, error) {
	var account models.Account
	query := `SELECT id, user_id, name, type, balance, currency, created_at, updated_at FROM accounts WHERE id = $1`
	err := r.db.Get(&account, query, id)
	if err != nil {
		return nil, err
	}
	return &account, nil
}

func (r *AccountRepository) Update(account *models.Account) error {
	account.UpdatedAt = time.Now()
	query := `UPDATE accounts SET name = $1, balance = $2, updated_at = $3 WHERE id = $4`
	_, err := r.db.Exec(query, account.Name, account.Balance, account.UpdatedAt, account.ID)
	return err
}

func (r *AccountRepository) Delete(id uuid.UUID) error {
	query := `DELETE FROM accounts WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}
