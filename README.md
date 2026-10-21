# Invoicing API

A backend invoicing system built with Spring Boot, PostgreSQL, and a small vanilla JS frontend — built as a portfolio project to learn backend Java development.

**Live demo:** [invoicing-b5s5.onrender.com](https://invoicing-b5s5.onrender.com/index.html)

> The demo runs on free hosting: if nobody has visited for a while, the first load can take a minute or two while the service wakes up.
> Viewing is open to everyone. Creating, editing, or deleting data requires an access code (provided with my CV), which the interface asks for on the first write action.

## What it does

Manage clients and products, then issue invoices that combine them into line items with quantities. Prices are captured at the moment an invoice is created (not read live from the product), so past invoices stay accurate even if a product's price changes later. Invoices track a status (`PENDING`, `PAID`, `OVERDUE`) that can be updated independently of the rest of the invoice.

## Tech stack

- **Java 21 / Spring Boot** — REST API, layered architecture (Controller → Service → Repository)
- **Spring Data JPA / Hibernate** — persistence, entity relationships (`@ManyToOne`, `@OneToMany`)
- **PostgreSQL** — Docker Compose locally, Supabase in production
- **Bean Validation** (`@NotBlank`, `@DecimalMin`, etc.) on both entities and request DTOs
- **Centralized error handling** via `@ControllerAdvice` — validation errors (400), missing resources (404), and database conflicts (409) return clean JSON messages instead of raw stack traces
- **Servlet filter** (`OncePerRequestFilter`) protecting write operations with an access code
- **Docker** + **Render** for deployment
- Plain **HTML/CSS/JS** frontend (no framework), served as static files, talking to the API via `fetch`

## Architecture notes

- **DTOs vs. entities** — requests that create or modify data (`CreateInvoiceRequest`, `InvoiceStatusRequest`, etc.) are separate classes from the JPA entities. A client creating an invoice sends a `clientId` and a list of `{ productId, quantity }`, not full nested objects — the server looks up the real records and builds the invoice from there.
- **Cascading saves** — `Invoice` → `InvoiceLine` is saved with `CascadeType.ALL`, so creating an invoice persists its lines in the same transaction.
- **Bidirectional relationship handling** — `InvoiceLine` holds a back-reference to its parent `Invoice`, but `@JsonManagedReference` / `@JsonBackReference` prevent infinite recursion when serializing to JSON.
- **Access control** — a filter runs before the controllers: `GET` requests pass freely, while `POST`, `PUT`, `PATCH`, and `DELETE` must carry the correct code in an `X-Access-Code` header, otherwise the response is `403`. The code is read from an environment variable, so it never appears in the repository, and an unset code blocks all writes (secure by default).
- **Referential integrity** — a client or product that is already used in an invoice cannot be deleted; the API answers with `409 Conflict` and a clear message.

## Getting started (local)

1. Start the database:
```bash
   docker compose up -d
```
2. Run the Spring Boot application (from your IDE, or `./mvnw spring-boot:run`) with an access code set, for example `ACCESS_CODE=test123`. Without it, write requests are rejected.
3. Open the frontend at [http://localhost:8080/index.html](http://localhost:8080/index.html), or call the API directly (see below).

## Deployment

The app is built from the included `Dockerfile` and deployed on Render, with PostgreSQL hosted on Supabase. Configuration is read from environment variables:

| Variable | Purpose |
|---|---|
| `DB_URL` | JDBC connection string |
| `DB_USERNAME` / `DB_PASSWORD` | Database credentials |
| `ACCESS_CODE` | Code required for write operations |
| `PORT` | Provided by the hosting platform |

Local defaults exist for the database settings, so nothing needs to be configured to run against the Docker Compose database.

## API overview

Write operations (`POST`, `PUT`, `PATCH`, `DELETE`) require the header `X-Access-Code`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/clients` | List all clients |
| POST | `/api/clients` | Create a client |
| PUT | `/api/clients/{id}` | Update a client |
| DELETE | `/api/clients/{id}` | Delete a client |
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |
| GET | `/api/invoices` | List all invoices |
| GET | `/api/invoices/{id}` | Get a single invoice |
| POST | `/api/invoices` | Create an invoice (client + line items) |
| PATCH | `/api/invoices/{id}/status` | Update just the invoice status |

### Example: creating an invoice

```json
POST /api/invoices
X-Access-Code: <your code>

{
  "clientId": 1,
  "invoiceLineRequestList": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

The server resolves the client and products, calculates each line's price from the product's current unit price, and returns the fully created invoice.

## Possible next steps

- Soft delete (archiving) for clients and products, so they can be retired without breaking existing invoices
- Response DTOs, so an invoice response doesn't expose the full nested `Client` object
- Unit tests (JUnit/Mockito) on the service layer
- Replace the shared access code with Spring Security and per-user authentication (JWT)
