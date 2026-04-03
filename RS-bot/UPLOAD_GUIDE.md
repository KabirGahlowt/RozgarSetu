# Dataset Upload Guide

## How to Upload Your Workers Dataset

The RozgarSetu chatbot now supports uploading your own workers dataset! Here's how:

### Step 1: Prepare Your CSV File

Your CSV file should contain worker information. The system is flexible and will automatically map common column names.

#### Required Columns (with flexible naming):

| Standard Column | Alternative Names Accepted |
|----------------|---------------------------|
| `name` | worker_name, full_name |
| `skills` | skill, skill_set |
| `location` | loc, city, area |
| `experience_years` | experience, exp, years_experience |
| `rating` | worker_rating, score |
| `phone` | phone_number, contact, mobile |
| `available` | is_available, status |

#### Optional Columns:
- `worker_id` - If not provided, will be auto-generated (1, 2, 3, ...)

### Step 2: CSV Format Example

```csv
name,skills,location,experience_years,rating,phone,available
Ritu Patil,"cleaning,cooking,laundry",Wakad,3,4.2,9876543210,True
Sunil Kumar,driving,Shivajinagar,5,4.5,9876543211,True
Meera Desai,"cleaning,cooking",Hinjewadi,2,4.0,9876543212,True
```

**Important Notes:**
- **Skills**: Can be comma-separated (e.g., "cleaning,cooking,laundry")
- **Available**: Can be `True`/`False`, `1`/`0`, `Yes`/`No`, or `Available`/`Unavailable`
- **Rating**: Should be a number (typically 0-5)
- **Experience**: Number of years (integer)

### Step 3: Upload in the App

1. Open the Streamlit app
2. Look for the **"📤 Upload Dataset"** section in the sidebar
3. Click "Browse files" under "Upload Workers CSV"
4. Select your CSV file
5. The system will:
   - Automatically detect and map columns
   - Show a preview of your data
   - Load the dataset
   - Make it available for recommendations

### Step 4: (Optional) Upload Jobs Dataset

You can also upload a jobs CSV file with the following columns:

| Standard Column | Alternative Names |
|----------------|-------------------|
| `title` | job_title, position |
| `required_skills` | skills, skill_required |
| `location` | loc, city, area |
| `required_experience_years` | required_experience, experience_required, min_experience |
| `work_type` | type, employment_type |
| `wage_min` | min_wage, salary_min |
| `wage_max` | max_wage, salary_max |
| `status` | job_status |

If you don't upload jobs, the system will use the default jobs dataset.

### Column Mapping Examples

The system is smart about column names. Here are some examples:

**Your CSV might have:**
```csv
worker_name,city,skill_set,years_experience,worker_rating,contact,is_available
```

**System will automatically map to:**
```csv
name,location,skills,experience_years,rating,phone,available
```

### Troubleshooting

**Error: "No workers data available"**
- Make sure your CSV has at least a `name` column
- Check that the file is a valid CSV format

**Error: "Column not found"**
- The system will create default values for missing columns
- Make sure at least `name` and `skills` are present

**Skills not showing correctly**
- Make sure skills are comma-separated: `"cleaning,cooking"`
- Or provide as a single skill: `cleaning`

**Data not loading**
- Check CSV encoding (should be UTF-8)
- Ensure no special characters break the CSV format
- Try opening the CSV in Excel/LibreOffice to verify format

### Sample Template

Download `data/workers_template.csv` for a complete example template.

### Features

✅ **Automatic column mapping** - Recognizes common column name variations  
✅ **Flexible data types** - Handles strings, numbers, booleans  
✅ **Data preview** - See your data before using it  
✅ **Error handling** - Clear error messages if something goes wrong  
✅ **Default values** - Missing columns get sensible defaults  

### After Upload

Once uploaded:
1. Your dataset replaces the default dataset
2. You can select workers from the dropdown
3. Query for job recommendations
4. All recommendations use your uploaded data

The system will automatically:
- Generate worker IDs if missing
- Normalize column names
- Handle missing values
- Validate data types

---

**Need help?** Check the main README.md or open an issue with your CSV format.
