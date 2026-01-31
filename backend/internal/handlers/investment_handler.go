package handlers

import (
	"net/http"
	"time"

	"github.com/financial-tracker/backend/internal/models"
	"github.com/financial-tracker/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type InvestmentHandler struct {
	investmentRepo *repository.InvestmentRepository
}

func NewInvestmentHandler(investmentRepo *repository.InvestmentRepository) *InvestmentHandler {
	return &InvestmentHandler{investmentRepo: investmentRepo}
}

type CreateInvestmentRequest struct {
	InvestmentType string  `json:"investment_type" binding:"required"`
	Name           string  `json:"name" binding:"required"`
	PurchaseValue  float64 `json:"purchase_value" binding:"required,gt=0"`
	CurrentValue   float64 `json:"current_value" binding:"required,gt=0"`
	Quantity       float64 `json:"quantity" binding:"required,gt=0"`
	PurchaseDate   string  `json:"purchase_date" binding:"required"`
}

func (h *InvestmentHandler) Create(c *gin.Context) {
	var req CreateInvestmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")

	purchaseDate, err := time.Parse("2006-01-02", req.PurchaseDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid purchase date format"})
		return
	}

	investment := &models.Investment{
		UserID:         userID.(uuid.UUID),
		InvestmentType: req.InvestmentType,
		Name:           req.Name,
		PurchaseValue:  req.PurchaseValue,
		CurrentValue:   req.CurrentValue,
		Quantity:       req.Quantity,
		PurchaseDate:   purchaseDate,
	}

	if err := h.investmentRepo.Create(investment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create investment"})
		return
	}

	c.JSON(http.StatusCreated, investment)
}

func (h *InvestmentHandler) GetAll(c *gin.Context) {
	userID, _ := c.Get("user_id")
	investments, err := h.investmentRepo.GetByUserID(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get investments"})
		return
	}

	c.JSON(http.StatusOK, investments)
}

func (h *InvestmentHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid investment ID"})
		return
	}

	investment, err := h.investmentRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Investment not found"})
		return
	}

	userID, _ := c.Get("user_id")
	if investment.UserID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, investment)
}

func (h *InvestmentHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid investment ID"})
		return
	}

	investment, err := h.investmentRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Investment not found"})
		return
	}

	userID, _ := c.Get("user_id")
	if investment.UserID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if err := h.investmentRepo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete investment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Investment deleted successfully"})
}
