# Invoicing API

A backend invoicing system built with Spring Boot, PostgreSQL, and a small vanilla JS frontend — built as a portfolio project to learn backend Java development.

## What it does

Manage clients and products, then issue invoices that combine them into line items with quantities. Prices are captured at the moment an invoice is created (not read live from the product), so past invoices stay accurate even if a product's price changes later. Invoices track a status (`PENDING`, `PAID`, `OVERDUE`) that can be updated independently of the rest of the invoice.

## Tech stack

- **Java 21 / Spring Boot** — REST API, layered architecture (Controller → Service → Repository)
- **Spring Data JPA / Hibernate** — persistence, entity relationships (`@ManyToOne`, `@OneToMany`)
- **PostgreSQL**, run via **Docker Compose**
- **Bean Validation** (`@NotBlank`, `@Min`, etc.) on both entities and request DTOs
- **Centralized error handling** via `@ControllerAdvice` — invalid input and missing resources return clean, meaningful HTTP responses (400 / 404) instead of raw stack traces
- Plain **HTML/CSS/JS** frontend (no framework), served as static files, talking to the API via `fetch`

## Architecture notes

- **DTOs vs. entities** — requests that create or modify data (`CreateInvoiceRequest`, `InvoiceStatusRequest`, etc.) are separate classes from the JPA entities. A client creating an invoice sends a `clientId` and a list of `{ productId, quantity }`, not full nested objects — the server looks up the real records and builds the invoice from there.
- **Cascading saves** — `Invoice` → `InvoiceLine` is saved with `CascadeType.ALL`, so creating an invoice persists its lines in the same transaction.
- **Bidirectional relationship handling** — `InvoiceLine` holds a back-reference to its parent `Invoice` (useful internally), but `@JsonManagedReference` / `@JsonBackReference` prevent that from causing infinite recursion when serializing to JSON.

## Getting started

1. Start the database:
   ```bash
   docker compose up -d
   ```
2. Run the Spring Boot application (from your IDE, or `./mvnw spring-boot:run`).
3. Open the frontend at [http://localhost:8080/index.html](http://localhost:8080/index.html), or call the API directly (see below).

## API overview

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

- Response DTOs, so an invoice response doesn't expose the full nested `Client` object
- Unit tests (JUnit/Mockito) on the service layer
- Spring Security / JWT authentication
