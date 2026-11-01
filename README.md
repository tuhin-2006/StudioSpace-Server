# StudioSpace Server — Peer-to-Peer Creative Workspace Platform Backend

High-performance Express.js and TypeScript REST API powered by MongoDB for the **StudioSpace** peer-to-peer creative workspace & production studio sharing platform.

## 🌟 Features & Implemented Challenges
- **Robust Security with HTTPOnly Cookies (Challenge 1)**: All state-changing mutations (`POST /api/studios`, `DELETE /api/studios/:id`, `PATCH /api/studios/:id`, `POST /api/bookings`) are protected using JSON Web Tokens (JWT) stored in HTTPOnly cookies to thwart XSS attacks, with 401 Unauthorized rejection for untrusted requests.
- **Double-Booking Collision Prevention (Challenge 2)**: Advanced time-window collision detection algorithm (`newStart < existingEnd && newEnd > existingStart`) verifying incoming reservations against existing `Confirmed` bookings in MongoDB before committing slots.
- **Complete Studio Workspace CRUD**: Full support for listing, category querying, text search, sorting, limit queries (e.g. `limit(6)` for featured home spaces), detail retrieval, owner updates, and cascade deletions.
- **Booking & Reservation Lifecycle**: Handles booking statuses (`Pending`, `Confirmed`, `Completed`, `Cancelled`) with pending cancellation endpoints.
- **Wishlist & Saved Workspaces (Optional Differentiator)**: Dedicated endpoints for creators to save and toggle workspaces.
- **Auto-Seeding Utility**: Quick seed endpoint (`/api/seed`) populating 8 high-res studios and examiner credentials.

---

## 🛠 Tech Stack
- **Runtime**: Node.js & Express.js (App Framework)
- **Language**: TypeScript (Strict typing & interfaces)
- **Database**: MongoDB (via Mongoose ORM & native driver compatibility)
- **Authentication**: JWT with HTTPOnly cookies & bcryptjs password hashing
- **Development Tooling**: ts-node-dev, dotenv, cors, cookie-parser

---

## 🔑 Examiner Test Credentials
The database comes pre-seeded with an examiner account:
- **Email**: `examiner@studiospace.io`
- **Password**: `Test1234` *(meets validation: >= 6 chars, uppercase, lowercase)*
- **Role**: `host` / `creator`

---

## 🚀 Local Setup & Installation

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Provide your MongoDB URI (or keep default local MongoDB `mongodb://127.0.0.1:27017/studiospace`).

4. **Seed the Database with realistic studios**:
   ```bash
   npm run seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```
   The API will be live at `http://localhost:5000`.

---

## 📡 API Endpoints Overview

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register new creator/host account | Public |
| POST | `/api/auth/login` | Login with email & password | Public |
| POST | `/api/auth/google` | Google Social Authentication | Public |
| POST | `/api/auth/logout` | Clear HTTPOnly cookie | Public |
| GET | `/api/auth/me` | Fetch active user profile | Private (JWT) |

### Creative Workspaces (`/api/studios`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/studios` | List studios (filter by category, search, limit, sort) | Public |
| GET | `/api/studios/:id` | Get single studio details | Public |
| GET | `/api/studios/user/my-listings` | Get user-owned studio listings | Private (JWT) |
| POST | `/api/studios` | Create a new studio workspace | Private (JWT) |
| PATCH | `/api/studios/:id` | Update studio workspace | Private (Owner) |
| DELETE | `/api/studios/:id` | Delete studio workspace | Private (Owner) |

### Bookings & Reservations (`/api/bookings`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/bookings` | Create new reservation (Double-booking protected) | Private (JWT) |
| GET | `/api/bookings/my-bookings` | List authenticated user's reservations | Private (JWT) |
| PATCH | `/api/bookings/:id/cancel` | Cancel a pending reservation | Private (Owner) |
| PATCH | `/api/bookings/:id/status` | Update reservation status (Pending/Confirmed/etc.) | Private (Host/Admin) |

### Wishlist (`/api/wishlist`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/wishlist` | Get user's saved wishlist studios | Private (JWT) |
| POST | `/api/wishlist/toggle` | Add/remove workspace from wishlist | Private (JWT) |

### Database Seeding (`/api/seed`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| ALL | `/api/seed` | Seed database with initial studios and test users | Public |
