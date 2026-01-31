package models

import (
	"time"

	"github.com/google/uuid"
)

type Pocket struct {
	ID                   uuid.UUID `db:"id" json:"id"`
	UserID               uuid.UUID `db:"user_id" json:"user_id"`
	AccountID            uuid.UUID `db:"account_id" json:"account_id"`
	Name                 string    `db:"name" json:"name"`
	Balance              float64   `db:"balance" json:"balance"`
	PercentageAllocation float64   `db:"percentage_allocation" json:"percentage_allocation"`
	CreatedAt            time.Time `db:"created_at" json:"created_at"`
	UpdatedAt            time.Time `db:"updated_at" json:"updated_at"`
}

type Budget struct {
	ID        uuid.UUID `db:"id" json:"id"`
	UserID    uuid.UUID `db:"user_id" json:"user_id"`
	Category  string    `db:"category" json:"category"`
	Amount    float64   `db:"amount" json:"amount"`
	Period    string    `db:"period" json:"period"`
	StartDate time.Time `db:"start_date" json:"start_date"`
	EndDate   time.Time `db:"end_date" json:"end_date"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

type CreditCard struct {
	ID              uuid.UUID `db:"id" json:"id"`
	UserID          uuid.UUID `db:"user_id" json:"user_id"`
	CardName        string    `db:"card_name" json:"card_name"`
	LastFourDigits  string    `db:"last_four_digits" json:"last_four_digits"`
	CreditLimit     float64   `db:"credit_limit" json:"credit_limit"`
	CurrentBalance  float64   `db:"current_balance" json:"current_balance"`
	BillingDate     int       `db:"billing_date" json:"billing_date"`
	PaymentDueDate  int       `db:"payment_due_date" json:"payment_due_date"`
	CreatedAt       time.Time `db:"created_at" json:"created_at"`
	UpdatedAt       time.Time `db:"updated_at" json:"updated_at"`
}

type Investment struct {
	ID             uuid.UUID `db:"id" json:"id"`
	UserID         uuid.UUID `db:"user_id" json:"user_id"`
	InvestmentType string    `db:"investment_type" json:"investment_type"`
	Name           string    `db:"name" json:"name"`
	PurchaseValue  float64   `db:"purchase_value" json:"purchase_value"`
	CurrentValue   float64   `db:"current_value" json:"current_value"`
	Quantity       float64   `db:"quantity" json:"quantity"`
	PurchaseDate   time.Time `db:"purchase_date" json:"purchase_date"`
	CreatedAt      time.Time `db:"created_at" json:"created_at"`
	UpdatedAt      time.Time `db:"updated_at" json:"updated_at"`
}
