# Fix Company Applicants Page Refresh Issue

## Tasks
- [x] Modify `CompanyController@companyApplicants` to add Cache-Control headers to prevent caching
- [x] Update `CompanyApplicants.tsx` to reload data after status update
- [x] Check `Application` model and related models for any cached relationships
- [ ] Test the changes by updating an applicant status and verifying data refresh

## Notes
- Backend changes: Added versioning in HandleInertiaRequests middleware to force fresh data for company-applicants route
- Frontend changes: After `router.put` in `handleStatusChange`, added `router.reload({ only: ['applicants'] })`
- No Cache::remember or similar found in model queries
