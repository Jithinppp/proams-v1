# RSC (React Server Components) Leverage Points

RSC can directly query Supabase with RLS - data is filtered by user role automatically.

## Routes Best Suited for RSC

| Route               | Tables to Query                             | Why RSC                          |
| ------------------- | ------------------------------------------- | -------------------------------- |
| `/admin`            | profiles, activity_log                      | User management, audit logs      |
| `/pm/projects`      | projects, project_equipment, venues         | List with filters, date ranges   |
| `/pm/projects/[id]` | projects, project_equipment, assets, models | Detail view with joins           |
| `/pm/venues`        | venues                                      | Read-heavy catalog               |
| `/pm/reports`       | projects, project_equipment                 | Generate PDF from server         |
| `/inv/assets`       | assets, models, categories, subcategories   | Heavy queries, filtering, search |
| `/inv/assets/[id]`  | assets, models, maintenance_logs            | Detail + history                 |
| `/inv/consumables`  | consumables, models                         | Stock levels, aggregations       |
| `/inv/locations`    | storage_locations, assets                   | Hierarchy + counts               |
| `/inv/catalog/*`    | categories, subcategories, models           | Read-heavy taxonomy              |
| `/tech/assignments` | projects, project_equipment, assets         | Pick-lists                       |
| `/tech/maintenance` | assets, maintenance_logs                    | Service queue                    |

## Client-Side Only (Forms & Interactivity)

- All `/create` routes (forms)
- All `/edit` routes (forms)
- `/tech/scan` (camera access, real-time)
- Profile editing

---

## App Routes

/ // (Auth) Public sign-in page
/admin/\* // 👑 ADMIN DASHBOARD
/admin/users // Manage DB profiles & assign roles

/pm/\* // 📅 PROJECT MANAGER DASHBOARD
/pm/projects // List all projects
/pm/projects/add // Add a new project (missing from original)
/pm/projects/[id] // Detail view (Timeline, equipment selection)
/pm/projects/[id]/edit // Edit overarching project details
/pm/venues // Browse and create Venues
/pm/reports // Generate pull-sheets/itineraries (PDF)

/inv/\* // 📦 INVENTORY MANAGER DASHBOARD
/inv/assets // High-value serialized list
/inv/assets/add // Add new asset / bulk add
/inv/assets/[id] // Detail & edit metadata
/inv/consumables // Gaffer tape, batteries (Quantity-based)
/inv/locations // The visual Zone/Rack/Bin hierarchy
/inv/catalog // Catalog Portal & How-to
/inv/catalog/categories // Manage Taxonomy Groups
/inv/catalog/subcategories // Manage Types
/inv/catalog/models // Manage Product SKU specs

/tech/\* // 🛠️ TECHNICIAN / CREW DASHBOARD
/tech/assignments // "My Gigs" (Pick-lists for load-in/out)
/tech/assignments/[id] // The actual checklist interface
/tech/scan // Global QR/Barcode scanner page
/tech/maintenance // Dedicated queue of broken gear to fix
