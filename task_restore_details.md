# Task: Restore Missing Package Details (Smart Features)

The goal is to restore the "Smart Features" and "Balance Details" (Safety, Eco, Crowd, Accessibility, Emergency, Festivals) that are missing for most travel packages, ensuring 70+ destinations have rich data.

## Steps:
1. [ ] **Update Database Seeding**:
    - Modify `server/database.js` to include all "Smart Features" columns in the seeding process.
    - Populate the 70+ packages with varied and rich data for all columns (mood tags, safety scores, etc.).
2. [ ] **Update Backend API**:
    - Update `server/routes/packages.js` to handle the additional columns in `POST` and `PUT` requests.
3. [ ] **Enhance Frontend Display**:
    - Ensure `src/pages/DestinationDetails.jsx` and `src/pages/PackageDetails.jsx` correctly fetch and display all the rich metadata.
    - Verify that the "Smart Metrics" (Safety, Eco, Crowd) are visually consistent and accurate.
4. [ ] **Verify Flow**:
    - Select a few destinations on the website to confirm that all "balance details" (rich info) are showing up correctly.
