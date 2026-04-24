import express from "express";
import {createContactMessage,
  getAllContacts,
  deleteContact,
  updateContactStatus,
} from "../controllers/contactController.js";

const contactRouter = express.Router();

contactRouter.post("/create", createContactMessage);
contactRouter.get("/list", getAllContacts);
contactRouter.delete("/delete/:id", deleteContact);
contactRouter.patch("/status/:id", updateContactStatus);

export default contactRouter;