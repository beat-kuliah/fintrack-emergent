package main

import (
	"fmt"
	"log"
	"os"

	"github.com/financial-tracker/backend/config"
	"github.com/financial-tracker/backend/internal/handlers"
	"github.com/financial-tracker/backend/internal/middleware"
	"github.com/financial-tracker/backend/internal/repository"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// Connect to database
	db, err := config.NewDatabase()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	accountRepo := repository.NewAccountRepository(db)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userRepo)
	accountHandler := handlers.NewAccountHandler(accountRepo)

	// Setup Gin router
	router := gin.Default()

	// CORS configuration
	corsOrigins := os.Getenv("CORS_ORIGINS")
	if corsOrigins == "" {
		corsOrigins = "http://localhost:3000"
	}

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{corsOrigins},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "message": "Financial Tracker API is running"})
	})

	// API routes
	api := router.Group("/api")
	{
		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.GET("/me", middleware.AuthMiddleware(), authHandler.GetMe)
		}

		// Protected routes
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// Accounts routes
			accounts := protected.Group("/accounts")
			{
				accounts.POST("", accountHandler.Create)
				accounts.GET("", accountHandler.GetAll)
				accounts.GET("/:id", accountHandler.GetByID)
				accounts.DELETE("/:id", accountHandler.Delete)
			}
		}
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8001"
	}

	fmt.Printf("\n🚀 Server starting on port %s\n", port)
	fmt.Println("📊 API Documentation:")
	fmt.Println("   POST   /api/auth/register")
	fmt.Println("   POST   /api/auth/login")
	fmt.Println("   GET    /api/auth/me")
	fmt.Println("   POST   /api/accounts")
	fmt.Println("   GET    /api/accounts")
	fmt.Println("   GET    /api/accounts/:id")
	fmt.Println("   DELETE /api/accounts/:id")
	fmt.Println()

	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
