import express from "express";
import {
  addExpense,
  getExpensesHistory,
  createGroup,
  deleteExpense,
  editExpense,
  deleteGroup,
  getExpensesByPerson,
  getGroupMembers,
  getGroupDetails,
  getExpense,
  getGroupNames,
} from "../controllers/expenses.js";
import { signIn, signUp } from "../controllers/users.js";

import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

// Groups urls
router.get("/groups/group-members", getGroupMembers);
router.get("/groups/expenses-history", getExpensesHistory);
router.get("/groups/expenses-by-person", getExpensesByPerson);
router.get("/groups/group-details", getGroupDetails);
router.get("/groups/get-expense", getExpense);
router.get("/groups/all-groups", auth, getGroupNames);

router.post("/groups/create-group", auth, createGroup);
router.post("/groups/add-expense", addExpense);

router.put("/groups/edit-expense", editExpense);

router.delete("/groups/delete-expense", deleteExpense);
router.delete("/groups/delete-group", deleteGroup);

// Auth urls

router.post("/users/sign-in", signIn);
router.post("/users/sign-up", signUp);

export default router;
