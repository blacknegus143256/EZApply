# FranchiseRegister Form Save Issue Fixes

## Critical Issues to Fix

### 1. Backend Validation (CompanyController.php)
- [x] Add complete validation rules to update() method (copy from store() but make documents optional)
- [x] Fix unsafe property access using optional() for documents paths
- [x] Load documents relationship in edit() method

### 2. Frontend Edit Mode (CompanyEdit.tsx)
- [x] Add missing PSGC address fields to initialData (region_code, region_name, province_code, province_name, citymun_code, citymun_name, barangay_code, barangay_name, postal_code)

### 3. Transform Function (FranchiseRegister.tsx)
- [x] Fix transform pattern to ensure data transformations are applied before sending request

### 4. Testing
- [ ] Test form save for both create and edit modes
- [ ] Verify error handling and validation messages
