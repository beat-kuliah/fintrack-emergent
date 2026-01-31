package models

import (
	"time"

	"github.com/google/uuid"
)

type AccountType string

const (
	AccountTypeBank       AccountType = "bank"
	AccountTypeWallet     AccountType = "wallet"
	AccountTypeInvestment AccountType = "investment"
	AccountTypeCreditCard AccountType = "credit_card"
)

type Account struct {
	ID        uuid.UUID   `db:"id" json:"id"`
	UserID    uuid.UUID   `db:"user_id" json:"user_id"`
	Name      string      `db:"name" json:"name"`
	Type      AccountType `db:"type" json:"type"`
	Balance   float64     `db:"balance" json:"balance"`
	Currency  string      `db:"currency" json:"currency"`
	CreatedAt time.Time   `db:"created_at" json:"created_at"`
	UpdatedAt time.Time   `db:"updated_at" json:"updated_at"`
}

type CreateAccountRequest struct {
	Name     string      `json:"name" binding:"required"`
	Type     AccountType `json:"type" binding:"required"`
	Balance  float64     `json:"balance"`
	Currency string      `json:"currency"`
}
