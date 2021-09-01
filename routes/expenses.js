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
} from "../controllers/expenses.js";

const router = express.Router();

router.get("/group-members", getGroupMembers);
router.get("/expenses-history", getExpensesHistory);
router.get("/expenses-by-person", getExpensesByPerson);
router.get("/group-details", getGroupDetails);
router.get("/get-expense", getExpense);

router.post("/create-group", createGroup);
router.post("/add-expense", addExpense);

router.put("/edit-expense", editExpense);

router.delete("/delete-expense", deleteExpense);
router.delete("/delete-group", deleteGroup);

export default router;
