# ⛽ Fuel QR Registration System
**Complete Full-Stack University Assignment**

This is a complete, modern, and professional web-based Fuel QR Registration System built using **Node.js, Express.js, MongoDB (Mongoose), Bootstrap 5, and jQuery**. 

It handles vehicle registration, fuel quota management, QR code generation, and provides a fully responsive UI.

---

## 🛠️ Step-by-Step Setup Instructions

1. **Prerequisites**
   - Node.js installed (v16+)
   - MongoDB connection string (Atlas or Local)

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   *Note: The `.env` file is already configured with your MongoDB Atlas connection string and port 5000.*

3. **Run the Backend**
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5000`.*

4. **Frontend Setup**
   - No installation needed for the frontend!
   - Simply open `frontend/index.html` in your web browser.
   - For the best experience, you can use the VS Code "Live Server" extension.

---

## 👨‍🏫 Explanation Notes: How to Add a New API / Service

If your examiner asks you **"How would you add a new feature to search vehicles by vehicle model?"**, here is exactly how you explain and do it, step by step:

### Step 1: Update the Controller (`backend/controllers/vehicleController.js`)
First, we create the business logic. We write a function that queries the database.
```javascript
// Add this new function
const getVehicleByModel = async (req, res) => {
    try {
        const modelName = req.params.model;
        // Search the database using regex for partial matching
        const vehicles = await Vehicle.find({
            VehicleModel: { $regex: new RegExp(modelName, 'i') }
        });

        if (vehicles.length === 0) {
            return res.status(404).json({ success: false, message: 'No vehicles found' });
        }
        return res.status(200).json({ success: true, data: vehicles });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Don't forget to export it at the bottom!
module.exports = {
    // ... existing exports
    getVehicleByModel
};
```

### Step 2: Create the Route (`backend/routes/vehicleRoutes.js`)
Next, we map an HTTP endpoint to our new controller function.
```javascript
// Import your new function at the top
const { getVehicleByModel } = require('../controllers/vehicleController');

// Define the route
// GET /api/vehicles/model/:model
router.get('/model/:model', getVehicleByModel);
```

### Step 3: Test the Endpoint (Postman)
Before touching the frontend, test the backend to make sure it works.
Since we have Postman documentation, you can use Postman to test:
`GET http://localhost:5000/api/vehicles/model/Toyota`

### Step 4: Connect the Frontend with AJAX (`frontend/js/app.js`)
Now, we write the jQuery AJAX call to communicate with the backend.
```javascript
function searchByModel(modelName) {
    $.ajax({
        url: 'http://localhost:5000/api/vehicles/model/' + encodeURIComponent(modelName),
        type: 'GET',
        success: function(response) {
            console.log("Vehicles found:", response.data);
            // Here you would use jQuery DOM manipulation to display the results
            // e.g., $('#resultsDiv').html(...)
        },
        error: function(xhr) {
            alert("Search failed: " + xhr.responseJSON.message);
        }
    });
}
```

### Step 5: Update the UI (`frontend/search.html`)
Finally, add the HTML input and button so the user can actually use it.
```html
<input type="text" id="modelInput" placeholder="Enter Vehicle Model">
<button id="searchModelBtn">Search by Model</button>

<script>
// Attach the jQuery click handler
$('#searchModelBtn').on('click', function() {
    const model = $('#modelInput').val();
    searchByModel(model);
});
</script>
```

---

## 🧪 Sample API Test Examples

Here are some endpoints you can easily test from your browser or via the provided Postman Collection:

**1. View All Vehicles:**
`GET http://localhost:5000/api/vehicles`

**2. View Dashboard Stats:**
`GET http://localhost:5000/api/vehicles/stats`

**3. Search by Registration Number:**
`GET http://localhost:5000/api/vehicles/regno/ABC-1234`

**4. Search by Fuel Type:**
`GET http://localhost:5000/api/vehicles/fueltype/Petrol`

**5. Register a Vehicle (POST)**
*URL:* `http://localhost:5000/api/vehicles`
*Body (JSON):*
```json
{
  "RegNo": "XYZ-9999",
  "FirstName": "Test",
  "LastName": "User",
  "Email": "test@gmail.com",
  "NearestStation": "Kandy",
  "FuelType": "Diesel",
  "OwnerNIC": "998877665V",
  "VehicleModel": "Honda Fit"
}
```

---

## 📝 Summary of Mandatory Requirements Implemented

✅ **Frontend Requirements:** HTML5, Bootstrap 5 UI (Cards, Alerts, Modals, Forms), Responsive Layout.
✅ **jQuery Usages:**
   1. AJAX Calls
   2. DOM Manipulation (building table rows, setting html/text)
   3. Event Handling (clicks, form submits, keyups)
   4. Animations (fadeIn, slideDown, custom css transitions)
   5. Form Validation (real-time keyup validation)
   6. Dynamic Table Updates
   7. Show/Hide UI Sections based on state
   8. Live real-time Search filtering
   9. Custom Toast Notifications
   10. Button Loading states
✅ **Backend Requirements:** Node.js, Express.js, MongoDB + Mongoose, MVC Architecture.
✅ **API Endpoints:** All required 12 REST API endpoints + 1 extra (Stats).
✅ **Data format:** Strict JSON communication only.
✅ **Bonus Features Included:** Postman API Documentation, Base64 QR Code Generation, Analytics Dashboard, Loading Spinners.
