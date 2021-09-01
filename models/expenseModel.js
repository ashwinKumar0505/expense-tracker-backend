import mongoose from "mongoose";

const expenseGroupSchema = mongoose.Schema({
  groupName: String,
  groupMembers: [String],
  expensesByPerson: {},
  expensesHistory: [
    {
      person: String,
      description: String,
      amount: Number,
    },
  ],
  totalAmountInvested: Number,
});

export const ExpenseGroupModal = mongoose.model(
  "ExpenseGroup",
  expenseGroupSchema
);
