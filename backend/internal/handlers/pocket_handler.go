package handlers

import (
	"net/http"

	"github.com/financial-tracker/backend/internal/models"
	"github.com/financial-tracker/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PocketHandler struct {
	pocketRepo *repository.PocketRepository
}

func NewPocketHandler(pocketRepo *repository.PocketRepository) *PocketHandler {
	return &PocketHandler{pocketRepo: pocketRepo}
}

func (h *PocketHandler) Create(c *gin.Context) {
	var pocket models.Pocket
	if err := c.ShouldBindJSON(&pocket); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")
	pocket.UserID = userID.(uuid.UUID)

	if err := h.pocketRepo.Create(&pocket); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create pocket"})
		return
	}

	c.JSON(http.StatusCreated, pocket)
}

func (h *PocketHandler) GetAll(c *gin.Context) {
	userID, _ := c.Get("user_id")
	pockets, err := h.pocketRepo.GetByUserID(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get pockets"})
		return
	}

	c.JSON(http.StatusOK, pockets)
}

func (h *PocketHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pocket ID"})
		return
	}

	pocket, err := h.pocketRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pocket not found"})
		return
	}

	userID, _ := c.Get("user_id")
	if pocket.UserID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, pocket)
}

func (h *PocketHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pocket ID"})
		return
	}

	pocket, err := h.pocketRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pocket not found"})
		return
	}

	userID, _ := c.Get("user_id")
	if pocket.UserID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if err := h.pocketRepo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete pocket"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pocket deleted successfully"})
}
