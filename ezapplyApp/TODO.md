# Company Edit File Upload Fixes

## Issues to Address:
- Existing logo/document paths aren't displayed in edit mode
- File inputs are marked as required even during edits
- Frontend validation requires documents in edit mode
- No visual feedback for existing uploaded files
- File upload handling with PUT requests may have issues

## Tasks:

### 1. Update CompanyEdit.tsx
- [ ] Modify initialData to pass existing logo_path from company.marketing.logo_path
- [ ] Pass existing document paths from company.documents (dti_sbc_path, bir_2303_path, ipo_registration_path)

### 2. Update FranchiseRegister.tsx Interface and Types
- [ ] Add existing file path fields to CompanyForm interface (existing_logo, existing_dti_sbc, existing_bir_2303, existing_ipo_registration)
- [ ] Update hydrateAddressData function to handle existing file paths

### 3. Add Visual Feedback for Existing Files
- [ ] In Marketing step (step 4): Display existing logo with filename/link if exists
- [ ] In Documents step (step 5): Display existing documents with filenames/links for each document type

### 4. Make File Inputs Optional in Edit Mode
- [ ] Remove 'required' attribute from document file inputs when companyId exists (edit mode)
- [ ] Update validateStep function to skip document validation when in edit mode

### 5. Update Form Submission Logic
- [ ] Ensure existing files are preserved when no new files are uploaded
- [ ] Handle file state properly in edit mode

## Testing:
- [ ] Test edit mode displays existing files correctly
- [ ] Test file uploads work in create mode (required)
- [ ] Test file updates work in edit mode (optional)
- [ ] Test PUT request handling for file updates
