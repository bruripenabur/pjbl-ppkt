# Implementation Plan - PjBL Coastal-Gov AI Assistant

## Overview
A web-based interactive AI Assistant and Project Manager for the course **"Pengelolaan Sumber Daya Kelautan dan Pulau-Pulau Kecil"** (Prodi Ilmu Pemerintahan, Semester 3, TA 2026/2027), taught by Dr. Bruri Melky Laimeheriwa, S.Pi., M.Si.

The application implements all 6 operational modules from the curriculum:
1. **Module 1: Timeline & Milestone Monitoring** (7-week PjBL schedule tracking 39.375 JP).
2. **Module 2: Regulatory & Maritime Diplomacy Validator** (Perpres 78/2005, Kepres 6/2017, UNGEGN 16.671, Gazetir Nasional 16.771 in 2020 & 17.024 in 2022, Sipadan/Ligitan/Yako/Kambing *effective occupation*, 42 populated vs 69 unpopulated PPKT).
3. **Module 3: Cross-Group Synergy Detector** (linking Chapter 4 problems with Chapter 5/6 solutions and Chapter 2/3 data).
4. **Module 4: Assessment Engine & Auto-Rubric** (Cognitive 30%, Creativity & Communication 30%, Collaboration & NKRI Solution 40%).
5. **Module 5: Storage Vault & Repository Indexing** (`[STORAGE VAULT] -> Kelompok: X | Minggu Ke: Y | Bab Target: Z | Status: Approved/Revision Required`).
6. **Module 6: Exhibition Drill Simulator & Special Commands** (`/rekap_dosen`, `/template_bab [bab]`, `/uji_presentasi` with critical Q&A).

## User Roles & Views
- **Lecturer View (Dosen / Dr. Bruri)**: Access to `/rekap_dosen` dashboard, overall student progress across all 4 groups, grading breakdown, milestone approvals, and policy brief inspector.
- **Student Group Views (Kelompok 1 - 4)**: Dedicated workspaces for submitting drafts, viewing chapter templates, getting real-time AI feedback and rubric evaluation, checking cross-group synergies, and testing presentation drills.
- **AI Assistant Chat & Command Hub**: Interactive chatbot supporting special commands (`/rekap_dosen`, `/template_bab`, `/uji_presentasi`) and contextual AI guidance backed by Gemini API or smart local assessment rules.

## Proposed Code Structure
- `/src/types.ts`: TypeScript interfaces for submissions, groups, rubrics, timeline weeks, and evaluation logs.
- `/src/data/curriculumData.ts`: Course details, 7-week timeline, 6 book chapters, group definitions, regulatory references (Perpres 78/2005, Kepres 6/2017, Gazetir 2020/2022, UNGEGN), and pre-loaded sample drafts for all 4 groups.
- `/src/components/Navbar.tsx`: Header navigation, role switcher (Lecturer vs Groups 1-4), active week indicator, and status badges.
- `/src/components/LecturerDashboard.tsx`: Interactive `/rekap_dosen` table, global rubric statistics, masterbook compilation status, and export options.
- `/src/components/StudentWorkspace.tsx`: Group submission portal, milestone tracker, draft upload form with automated AI validator & rubric scoring.
- `/src/components/ChapterTemplateViewer.tsx`: Interactive `/template_bab` viewer for Chapters 1-6 with outline details and writing guidelines.
- `/src/components/PresentationDrillSimulator.tsx`: Interactive `/uji_presentasi` mode with simulated harsh examiner questions (geopolitics, gazetteer data, sovereignty, action plans) and scoring.
- `/src/components/AIChatAssistant.tsx`: Floating or embedded AI assistant handling chat, markdown responses, storage vault tagging (`[STORAGE VAULT]`), and command parsing (`/rekap_dosen`, `/template_bab`, `/uji_presentasi`).
- `/src/App.tsx`: Main container managing role state, active tabs, submissions store, and simulation triggers.

## Verification Plan
1. Compile app with `compile_applet` and check for any TypeScript or build errors.
2. Verify all special commands (`/rekap_dosen`, `/template_bab`, `/uji_presentasi`) work correctly in the AI assistant.
3. Test storage vault indexing and rubric calculations.
