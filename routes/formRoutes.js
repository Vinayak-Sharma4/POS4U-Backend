// import express from "express";

// import upload from "../middleware/upload.js";

// import { createForm } from "../controllers/formController.js";

// const router = express.Router();

// router.post(
//     "/",
//     upload.single("document"),
//     createForm
// );

// export default router;




import express from "express";

import upload from "../middleware/upload.js";

import {
    createForm,
    getForms
} from "../controllers/formController.js";

const router = express.Router();


/* ============================
   CREATE APPLICATION
============================ */

router.post(
    "/",
    upload.single("document"),
    createForm
);


/* ============================
   GET ALL APPLICATIONS
============================ */

router.get(
    "/",
    getForms
);


export default router;