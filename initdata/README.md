# University Data Initialization

This folder contains scripts to populate the database with university data.

## Files

- **universities.js** - Contains 346 universities data
- **initUniversity.js** - Script to upload universities to MongoDB

## Usage

### Option 1: Run directly with Node

```bash
cd server/initdata
node initUniversity.js
```

### Option 2: Add to package.json scripts

Add this to your `server/package.json` scripts:

```json
"scripts": {
  "init:universities": "node initdata/initUniversity.js"
}
```

Then run:
```bash
npm run init:universities
```

## What the script does

1. ✅ Connects to MongoDB
2. 🗑️ Deletes existing universities (optional)
3. ✨ Inserts all 346 universities from `universities.js`
4. 📊 Shows sample of inserted data
5. 🔌 Closes connection

## Important Notes

⚠️ **WARNING**: The script will DELETE all existing universities before inserting new ones. If you want to keep existing data, comment out this line in `initUniversity.js`:

```javascript
// const deleteResult = await University.deleteMany({});
```

## Expected Output

```
✅ Connected to DB
🗑️  Deleted 0 existing universities
✅ Successfully inserted 346 universities

📊 Sample of inserted universities:
   1. William Blue College of Hospitality Management (australia)
   2. University Name 2 (country)
   3. University Name 3 (country)
   ...

✨ Total universities in database: 346
🔌 Connection closed
```

## Error Handling

If you see a duplicate key error:
- Some universities may already exist in the database
- The script will skip duplicates
- You can delete all universities first by keeping the `deleteMany()` line

## Database Structure

Required fields in University model:
- `universitycode` (unique)
- `universityName`
- `country`

All other fields are optional.
