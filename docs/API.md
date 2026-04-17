# API Reference

Base URL: `http://localhost:3000/api`

All responses are JSON. Protected endpoints require the `Authorization` header:

```
Authorization: Bearer <your-token>
```

---

## Auth

### Register

```
POST /api/auth/register
```

```json
// Request
{
  "username": "mike",
  "password": "mypassword",
  "company": "Mike's Stucco LLC"
}

// Response 201
{
  "token": "eyJhbG...",
  "user": { "id": 1, "username": "mike", "company": "Mike's Stucco LLC" }
}
```

### Login

```
POST /api/auth/login
```

```json
// Request
{
  "username": "mike",
  "password": "mypassword"
}

// Response 200
{
  "token": "eyJhbG...",
  "user": { "id": 1, "username": "mike", "company": "Mike's Stucco LLC" }
}
```

### Get Current User

```
GET /api/auth/me
Authorization: Bearer <token>
```

```json
// Response 200
{
  "id": 1,
  "username": "mike",
  "company": "Mike's Stucco LLC"
}
```

---

## Suppliers

### List All

```
GET /api/suppliers
```

```json
// Response 200
[
  {
    "id": 1,
    "name": "ABC Supply",
    "phone": "555-1234",
    "notes": "Local branch on Main St"
  }
]
```

### Create

```
POST /api/suppliers
```

```json
// Request
{ "name": "ABC Supply", "phone": "555-1234", "notes": "Local branch on Main St" }

// Response 201
{ "id": 1, "name": "ABC Supply", "phone": "555-1234", "notes": "Local branch on Main St" }
```

### Update

```
PUT /api/suppliers/:id
```

```json
// Request
{ "name": "ABC Supply Co", "phone": "555-1234", "notes": "Updated contact" }

// Response 200
{ "id": 1, "name": "ABC Supply Co", "phone": "555-1234", "notes": "Updated contact" }
```

### Delete

```
DELETE /api/suppliers/:id

// Response 200
{ "message": "Supplier deleted" }
```

---

## Categories

### List All

```
GET /api/categories
```

```json
// Response 200
[
  { "id": 1, "name": "Lath", "sortOrder": 1 },
  { "id": 2, "name": "Gray Coat", "sortOrder": 2 }
]
```

### Create

```
POST /api/categories
```

```json
// Request
{ "name": "Lath", "sortOrder": 1 }

// Response 201
{ "id": 1, "name": "Lath", "sortOrder": 1 }
```

### Update

```
PUT /api/categories/:id
```

```json
// Request
{ "name": "Lath & Prep", "sortOrder": 1 }

// Response 200
{ "id": 1, "name": "Lath & Prep", "sortOrder": 1 }
```

### Delete

```
DELETE /api/categories/:id

// Response 200
{ "message": "Category deleted" }
```

---

## Materials

### List All (with optional filters)

```
GET /api/materials
GET /api/materials?category=1
GET /api/materials?supplier=2
```

```json
// Response 200
[
  {
    "id": 1,
    "name": "2.5 lb Diamond Lath",
    "categoryId": 1,
    "unit": "sheet",
    "coveragePerUnit": 2.5,
    "coverageUnit": "sqyd",
    "notes": "Standard expanded metal lath"
  }
]
```

### Create

```
POST /api/materials
```

```json
// Request
{
  "name": "2.5 lb Diamond Lath",
  "categoryId": 1,
  "unit": "sheet",
  "coveragePerUnit": 2.5,
  "coverageUnit": "sqyd",
  "notes": "Standard expanded metal lath"
}

// Response 201
{ "id": 1, "name": "2.5 lb Diamond Lath", ... }
```

### Update

```
PUT /api/materials/:id
```

### Delete

```
DELETE /api/materials/:id
```

### Reorder

```
PUT /api/materials/reorder
```

```json
// Request
{ "orderedIds": [3, 1, 2] }

// Response 200
{ "message": "Order updated" }
```

### Duplicate

```
POST /api/materials/:id/duplicate

// Response 201
{ "id": 4, "name": "2.5 lb Diamond Lath (copy)", ... }
```

---

## Jobs

### List All

```
GET /api/jobs
```

```json
// Response 200
[
  {
    "id": 1,
    "name": "Smith Residence",
    "sqft": 2400,
    "phases": ["Lath", "Gray Coat", "Color Coat"],
    "supplierId": 1,
    "margin": 20,
    "createdAt": "2026-03-15T10:30:00Z"
  }
]
```

### Create

```
POST /api/jobs
```

```json
// Request
{
  "name": "Smith Residence",
  "sqft": 2400,
  "phases": ["Lath", "Gray Coat", "Color Coat"],
  "supplierId": 1,
  "margin": 20,
  "notes": "Two-story, mostly flat walls"
}

// Response 201
{ "id": 1, "name": "Smith Residence", ... }
```

### Get One (with calculated totals)

```
GET /api/jobs/:id
```

```json
// Response 200
{
  "id": 1,
  "name": "Smith Residence",
  "sqft": 2400,
  "phases": ["Lath", "Gray Coat", "Color Coat"],
  "materialCost": 3200.5,
  "totalWithMargin": 3840.6,
  "margin": 20,
  "lineItems": [
    {
      "material": "2.5 lb Diamond Lath",
      "qty": 107,
      "unit": "sheet",
      "unitCost": 4.5,
      "lineTotal": 481.5
    }
  ]
}
```

### Update

```
PUT /api/jobs/:id
```

### Delete

```
DELETE /api/jobs/:id
```

---

## Pricing

### Get Prices for a Supplier

```
GET /api/pricing?supplier=1
```

```json
// Response 200
[{ "materialId": 1, "supplierId": 1, "price": 4.5, "updatedAt": "2026-03-01" }]
```

### Import Prices from CSV

```
POST /api/pricing/import
Content-Type: multipart/form-data

// Form field: file (CSV), supplierId
// CSV columns: material_name, price

// Response 200
{ "imported": 45, "skipped": 2, "errors": ["Row 12: unknown material 'XYZ Tape'"] }
```
