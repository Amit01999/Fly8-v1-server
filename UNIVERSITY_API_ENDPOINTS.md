# University API Endpoints

## Base URL
All endpoints are prefixed with: `/api/v1`

---

## Endpoints

### 1. CREATE - Add New University
**POST** `/api/v1/universities`

**Required Fields:**
- `universitycode` (String) - Unique identifier
- `universityName` (String) - University name
- `country` (String) - Country name

**Optional Fields:** All other fields from the model

**Request Body Example:**
```json
{
  "universitycode": "williambluecollege",
  "universityName": "William Blue College of Hospitality Management",
  "country": "australia",
  "location": "Sydney, New South Wales, Australia",
  "imageUrl": "https://example.com/image.jpg",
  "tagline": "Launching Global Hospitality Careers"
}
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "message": "University created successfully",
  "data": { /* university object */ }
}
```

---

### 2. READ - Get All Universities
**GET** `/api/v1/universities`

**Query Parameters:**
- `country` (optional) - Filter by country
- `search` (optional) - Search in name, code, or location
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page

**Examples:**
- Get all: `/api/v1/universities`
- Filter by country: `/api/v1/universities?country=australia`
- Search: `/api/v1/universities?search=hospitality`
- Paginate: `/api/v1/universities?page=2&limit=20`

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Universities retrieved successfully",
  "data": [/* array of universities */],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

### 3. READ - Get Single University by ID
**GET** `/api/v1/universities/:id`

**Example:** `/api/v1/universities/6745f2c8a1b2c3d4e5f6a7b8`

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* university object */ }
}
```

---

### 4. READ - Get Single University by Code
**GET** `/api/v1/universities/code/:universitycode`

**Example:** `/api/v1/universities/code/williambluecollege`

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* university object */ }
}
```

---

### 5. READ - Get Universities by Country
**GET** `/api/v1/universities/country/:country`

**Example:** `/api/v1/universities/country/australia`

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Found 15 universities in australia",
  "data": [/* array of universities */],
  "count": 15
}
```

---

### 6. READ - Get University Statistics
**GET** `/api/v1/universities/stats`

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalUniversities": 150,
    "universitiesByCountry": [
      { "_id": "australia", "count": 25 },
      { "_id": "usa", "count": 50 }
    ]
  }
}
```

---

### 7. UPDATE - Update University by ID
**PUT** `/api/v1/universities/:id`

**Request Body Example:**
```json
{
  "tagline": "New tagline",
  "location": "Updated location"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "University updated successfully",
  "data": { /* updated university object */ }
}
```

---

### 8. UPDATE - Update University by Code
**PUT** `/api/v1/universities/code/:universitycode`

**Example:** `/api/v1/universities/code/williambluecollege`

**Request Body Example:**
```json
{
  "applicationFee": 100,
  "financialRequirement": 30000
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "University updated successfully",
  "data": { /* updated university object */ }
}
```

---

### 9. DELETE - Delete University by ID
**DELETE** `/api/v1/universities/:id`

**Example:** `/api/v1/universities/6745f2c8a1b2c3d4e5f6a7b8`

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "University deleted successfully",
  "data": { /* deleted university object */ }
}
```

---

### 10. DELETE - Delete University by Code
**DELETE** `/api/v1/universities/code/:universitycode`

**Example:** `/api/v1/universities/code/williambluecollege`

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "University deleted successfully",
  "data": { /* deleted university object */ }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Error message here"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "University not found with id: xxx"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to perform operation",
  "error": "Detailed error message"
}
```

---

## Files Created

1. **Model:** `server/models/universities.js`
2. **Controller:** `server/controllers/University.js`
3. **Routes:** `server/routes/university.js`
4. **Server Config:** Updated `server/index.js`

---

## Testing with curl

```bash
# Create a university
curl -X POST http://localhost:4000/api/v1/universities \
  -H "Content-Type: application/json" \
  -d '{
    "universitycode": "testuni",
    "universityName": "Test University",
    "country": "usa"
  }'

# Get all universities
curl http://localhost:4000/api/v1/universities

# Get university by code
curl http://localhost:4000/api/v1/universities/code/testuni

# Update university
curl -X PUT http://localhost:4000/api/v1/universities/code/testuni \
  -H "Content-Type: application/json" \
  -d '{"tagline": "Excellence in Education"}'

# Delete university
curl -X DELETE http://localhost:4000/api/v1/universities/code/testuni
```
