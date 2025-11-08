# Program API Endpoints

Base URL: `http://localhost:4000/api/v1`

## Table of Contents
- [Create Program](#create-program)
- [Get All Programs](#get-all-programs)
- [Get Program by ID](#get-program-by-id)
- [Get Programs by Country](#get-programs-by-country)
- [Get Programs by University](#get-programs-by-university)
- [Get Programs by Level](#get-programs-by-level)
- [Update Program](#update-program)
- [Delete Program](#delete-program)
- [Get Program Statistics](#get-program-statistics)

---

## Create Program

**POST** `/programs`

Create a new program.

### Request Body (Required Fields)
```json
{
  "country": "USA",
  "universityName": "Adelphi University",
  "location": "Garden City, New York, USA",
  "programName": "Bachelor of Science in Nursing",
  "majors": "Nursing",
  "programLevel": "Undergraduate Program",
  "duration": "4 years full-time",
  "intake": "Fall, Spring"
}
```

### Request Body (Optional Fields)
```json
{
  "languageRequirement": {
    "ielts": "6.5",
    "toefl": "80+",
    "pte": "58+",
    "duolingo": "105+"
  },
  "programMode": "On-campus",
  "scholarship": "Available (merit-based)",
  "applicationFee": "USD 50",
  "tuitionFee": "Approximately USD 43040 per year",
  "source": "Undergraduate Tuition and Fees – Adelphi University"
}
```

### Program Level Options
- `Undergraduate Program`
- `Graduate Program`
- `Postgraduate Program`
- `Diploma`
- `Certificate`
- `Doctoral Program`

### Program Mode Options
- `On-campus`
- `Online`
- `Hybrid`
- `Distance Learning`

### Response (201 Created)
```json
{
  "success": true,
  "message": "Program created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "country": "USA",
    "universityName": "Adelphi University",
    "location": "Garden City, New York, USA",
    "programName": "Bachelor of Science in Nursing",
    "majors": "Nursing",
    "programLevel": "Undergraduate Program",
    "duration": "4 years full-time",
    "intake": "Fall, Spring",
    "languageRequirement": {
      "ielts": "6.5",
      "toefl": "80+"
    },
    "programMode": "On-campus",
    "scholarship": "Available (merit-based)",
    "applicationFee": "USD 50",
    "tuitionFee": "Approximately USD 43040 per year",
    "source": "Undergraduate Tuition and Fees – Adelphi University",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Get All Programs

**GET** `/programs`

Get all programs with optional filters and pagination.

### Query Parameters (All Optional)
- `country` - Filter by country (case-insensitive, partial match)
- `universityName` - Filter by university name (case-insensitive, partial match)
- `programLevel` - Filter by exact program level
- `majors` - Filter by majors (case-insensitive, partial match)
- `search` - Search across program name, majors, university, and country
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Examples

**Get all programs (paginated)**
```
GET /programs?page=1&limit=10
```

**Filter by country**
```
GET /programs?country=USA&limit=20
```

**Filter by university**
```
GET /programs?universityName=Adelphi&limit=20
```

**Filter by program level**
```
GET /programs?programLevel=Undergraduate Program&limit=20
```

**Search programs**
```
GET /programs?search=nursing&limit=20
```

**Combine filters**
```
GET /programs?country=USA&programLevel=Graduate Program&limit=20
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Programs retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "country": "USA",
      "universityName": "Adelphi University",
      "programName": "Bachelor of Science in Nursing",
      "majors": "Nursing",
      "programLevel": "Undergraduate Program",
      "duration": "4 years full-time",
      "intake": "Fall, Spring",
      "tuitionFee": "Approximately USD 43040 per year"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

---

## Get Program by ID

**GET** `/programs/:id`

Get a single program by its MongoDB ID.

### Example
```
GET /programs/507f1f77bcf86cd799439011
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "country": "USA",
    "universityName": "Adelphi University",
    "location": "Garden City, New York, USA",
    "programName": "Bachelor of Science in Nursing",
    "majors": "Nursing",
    "programLevel": "Undergraduate Program",
    "duration": "4 years full-time",
    "intake": "Fall, Spring",
    "languageRequirement": {
      "ielts": "6.5",
      "toefl": "80+"
    },
    "programMode": "On-campus",
    "scholarship": "Available (merit-based)",
    "applicationFee": "USD 50",
    "tuitionFee": "Approximately USD 43040 per year"
  }
}
```

### Response (404 Not Found)
```json
{
  "success": false,
  "message": "Program not found with id: 507f1f77bcf86cd799439011"
}
```

---

## Get Programs by Country

**GET** `/programs/country/:country`

Get all programs from a specific country.

### Examples
```
GET /programs/country/USA
GET /programs/country/United Kingdom
GET /programs/country/Canada
GET /programs/country/Australia
```

**Country Name Variations Supported:**
- USA, United States, US
- UK, United Kingdom
- UAE, United Arab Emirates
- New Zealand, newzealand
- South Korea, southkorea

### Response (200 OK)
```json
{
  "success": true,
  "message": "Found 45 programs in USA",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "country": "USA",
      "universityName": "Adelphi University",
      "programName": "Bachelor of Science in Nursing",
      "majors": "Nursing",
      "programLevel": "Undergraduate Program"
    }
  ],
  "count": 45
}
```

---

## Get Programs by University

**GET** `/programs/university/:universityName`

Get all programs offered by a specific university.

### Examples
```
GET /programs/university/Adelphi University
GET /programs/university/Harvard
GET /programs/university/MIT
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Found 28 programs for Adelphi University",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "universityName": "Adelphi University",
      "programName": "Bachelor of Science in Nursing",
      "programLevel": "Undergraduate Program",
      "majors": "Nursing",
      "duration": "4 years full-time"
    }
  ],
  "count": 28
}
```

---

## Get Programs by Level

**GET** `/programs/level/:level`

Get all programs of a specific level.

### Examples
```
GET /programs/level/Undergraduate Program
GET /programs/level/Graduate Program
GET /programs/level/Doctoral Program
```

### Valid Levels
- `Undergraduate Program`
- `Graduate Program`
- `Postgraduate Program`
- `Diploma`
- `Certificate`
- `Doctoral Program`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Found 120 Undergraduate Program programs",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "programLevel": "Undergraduate Program",
      "programName": "Bachelor of Science in Nursing",
      "universityName": "Adelphi University",
      "country": "USA"
    }
  ],
  "count": 120
}
```

---

## Update Program

**PUT** `/programs/:id`

Update a program by its ID.

### Example
```
PUT /programs/507f1f77bcf86cd799439011
```

### Request Body (Any fields to update)
```json
{
  "tuitionFee": "Approximately USD 45000 per year",
  "scholarship": "Available (merit-based and need-based)",
  "intake": "Fall, Spring, Summer"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Program updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "country": "USA",
    "universityName": "Adelphi University",
    "programName": "Bachelor of Science in Nursing",
    "tuitionFee": "Approximately USD 45000 per year",
    "scholarship": "Available (merit-based and need-based)",
    "intake": "Fall, Spring, Summer",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
}
```

### Response (404 Not Found)
```json
{
  "success": false,
  "message": "Program not found with id: 507f1f77bcf86cd799439011"
}
```

---

## Delete Program

**DELETE** `/programs/:id`

Delete a program by its ID.

### Example
```
DELETE /programs/507f1f77bcf86cd799439011
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Program deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "programName": "Bachelor of Science in Nursing",
    "universityName": "Adelphi University"
  }
}
```

### Response (404 Not Found)
```json
{
  "success": false,
  "message": "Program not found with id: 507f1f77bcf86cd799439011"
}
```

---

## Get Program Statistics

**GET** `/programs/stats`

Get overall statistics about programs.

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "totalPrograms": 450,
    "programsByCountry": [
      { "_id": "USA", "count": 150 },
      { "_id": "UK", "count": 80 },
      { "_id": "Canada", "count": 70 },
      { "_id": "Australia", "count": 60 }
    ],
    "programsByLevel": [
      { "_id": "Undergraduate Program", "count": 180 },
      { "_id": "Graduate Program", "count": 150 },
      { "_id": "Doctoral Program", "count": 60 },
      { "_id": "Certificate", "count": 40 }
    ],
    "topUniversities": [
      { "_id": "Adelphi University", "count": 35 },
      { "_id": "Harvard University", "count": 32 },
      { "_id": "MIT", "count": 28 }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "country, universityName, location, programName, majors, programLevel, duration, and intake are required fields"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Program not found with id: 507f1f77bcf86cd799439011"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create/update/delete program",
  "error": "Detailed error message"
}
```

---

## Notes

1. **Required Fields**: Only 8 fields are required when creating a program:
   - country
   - universityName
   - location
   - programName
   - majors
   - programLevel
   - duration
   - intake

2. **Optional Fields**: All other fields (source, languageRequirement, programMode, scholarship, applicationFee, tuitionFee) are optional

3. **Search Functionality**: The search query parameter searches across:
   - Program name
   - Majors
   - University name
   - Country

4. **Country Matching**: The country filter uses intelligent matching to handle variations (USA/United States/US, UK/United Kingdom, etc.)

5. **Pagination**: Default pagination is 10 items per page, starting at page 1

6. **Sorting**:
   - Default: By creation date (newest first)
   - By country: Alphabetical by program name
   - By university: Alphabetical by program name
   - By level: Alphabetical by university and program name

7. **Indexes**: The model has indexes on country, universityName, programLevel, majors, and text search for better performance
