// This file is the single place that combines all API route files.
// Filename pattern: <Area>API.js (e.g. AuthAPI.js, PatientAPI.js).
//
// Why this file exists:
// - Each area (auth, patients, doctors, ...) gets its own router file.
// - We mount every area router here so the main app only needs to load
//   this one file. Less coupling between areas.

import { Router } from 'express';

import AuthAPI from './AuthAPI.js';
import PatientAPI from './PatientAPI.js';
import DoctorAPI from './DoctorAPI.js';
import AppointmentAPI from './AppointmentAPI.js';
import ClinicalAPI from './ClinicalAPI.js';
import AdminAPI from './AdminAPI.js';
import UploadAPI from './UploadAPI.js';
import NotificationAPI from './NotificationAPI.js';
import SearchAPI from './SearchAPI.js';
import QueueAPI from './QueueAPI.js';
import PrintableAPI from './PrintableAPI.js';

const apiRouter = Router();

// Order matters only when a path could match multiple routers.
// We mount the more specific ones first, then the catch-all ClinicalAPI at '/'.
apiRouter.use('/auth', AuthAPI);
apiRouter.use('/patients', PatientAPI);
apiRouter.use('/doctors', DoctorAPI);
apiRouter.use('/appointments', AppointmentAPI);
apiRouter.use('/uploads', UploadAPI);
apiRouter.use('/notifications', NotificationAPI);
apiRouter.use('/search', SearchAPI);
apiRouter.use('/queue', QueueAPI);
apiRouter.use('/printable', PrintableAPI);
apiRouter.use('/', ClinicalAPI);   // /timeline, /notes, /prescriptions, /lab, /invoices
apiRouter.use('/admin', AdminAPI);

export default apiRouter;
