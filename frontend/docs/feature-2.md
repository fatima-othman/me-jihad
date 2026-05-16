# Feature 2 - Credits, Pricing, and Transaction History

## Scope
Feature 2 covers the credits/payment frontend module connected to the authenticated dashboard area.

## Main Pages
- Credits Overview
- Pricing Plans
- Transaction / Credit History

## Included UI Modules
- Credits balance card
- Credit usage progress bar
- Recent credit activity table
- Pricing cards (Free, Starter, Growth, Pro)
- Purchase modal UI (frontend flow)
- Payment history table
- Credit activity table
- Empty states for missing data

## Interactions
- Plan selection with highlighted best-value package
- Purchase confirmation loading state and success feedback
- Hover and motion effects for cards and sections
- Protected navigation under dashboard routes

## Data / Backend Dependency
- Main entities involved:
  - credit_packages
  - transactions
- Optional integration with reports for credit deduction behavior

## Expected Laravel Endpoints (suggested)
- GET /api/credits/overview
- GET /api/credits/history
- GET /api/pricing/packages
- POST /api/pricing/purchase

## Notes
- Current frontend is ready for API wiring
- Real payment processing will be completed in backend integration phase
