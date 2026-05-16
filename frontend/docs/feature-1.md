# Feature 1 - Authentication & Core App Shell

## Scope
Feature 1 covers the core frontend authentication flow and base application structure.

## Main Pages
- Home / Landing page
- Register page
- Login page
- Protected Dashboard page
- 404 page

## Core Frontend Architecture
- React + Vite
- React Router for navigation and protected routes
- AuthContext for global auth state
- Axios service layer with centralized API base URL
- Interceptors for token attachment and 401 handling

## Auth Flow (JWT-ready)
- Register and login requests to backend API
- Token is stored in localStorage after successful auth
- User object is stored in localStorage when available
- Protected routes require authentication
- Logout clears local session and calls backend logout endpoint when available
- On app load, if token exists, frontend fetches current user from /api/me

## Validation & UX
- Required field validation
- Email format validation
- Password minimum length validation
- Confirm password validation
- Field-level errors and API error handling
- Loading states during auth requests

## Data / Backend Dependency
- Main entity involved: users
- Expected Laravel endpoints:
  - POST /api/register
  - POST /api/login
  - POST /api/logout
  - GET /api/me
