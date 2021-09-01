import mongoose from "mongoose";

import { ExpenseGroupModal } from "../models/expenseModel.js";
import { convertToKey } from "../utils/utils.js";

export const getExpensesHistory = async (req, res) => {
  const { groupId } = req.query;
  try {
    const currentGroup = await ExpenseGroupModal.findById(groupId);

    res.status(200).json(currentGroup.expensesHistory);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getExpensesByPerson = async (req, res) => {
  const { groupId } = req.query;
  try {
    const currentGroup = await ExpenseGroupModal.findById(groupId);

    res.status(200).json(currentGroup.expensesByPerson);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getGroupMembers = async (req, res) => {
  const { groupId } = req.query;
  try {
    const currentGroup = await ExpenseGroupModal.findById(groupId);

    res.status(200).json(currentGroup.groupMembers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createGroup = async (req, res) => {
  const { groupName, groupMembers } = req.body;

  const expensesByPerson = {};

  groupMembers.forEach((member) => {
    const memberKey = convertToKey(member);
    expensesByPerson[memberKey] = {
      person: member,
      amount: 0,
    };
  });

  const updatedExpenseGroup = new ExpenseGroupModal({
    groupName,
    groupMembers,
    expensesByPerson: { ...expensesByPerson },
    expensesHistory: [],
    totalAmountInvested: 0,
  });

  try {
    await updatedExpenseGroup.save();
    res.status(201).json(updatedExpenseGroup);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  const { groupId } = req.body;
  try {
    const deletedExpenseGroup = await ExpenseGroupModal.deleteOne({
      _id: groupId,
    });
    res.status(200).json(deletedExpenseGroup);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getGroupDetails = async (req, res) => {
  const { groupId } = req.query;
  try {
    const group = await ExpenseGroupModal.findById(groupId);
    res.status(200).json(group);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const addExpense = async (req, res) => {
  const { personName, amount, description, groupId } = req.body;

  const personKey = convertToKey(personName);

  if (!mongoose.Types.ObjectId.isValid(groupId))
    return res.status(404).send(`No Group with id: ${groupId}`);

  try {
    const expenseGroup = await ExpenseGroupModal.findById(groupId);

    let updatedExpensesByPerson = { ...expenseGroup.expensesByPerson };

    if (updatedExpensesByPerson[personKey]) {
      updatedExpensesByPerson[personKey].amount =
        updatedExpensesByPerson[personKey].amount + parseInt(amount);
    } else {
      updatedExpensesByPerson = {
        ...updatedExpensesByPerson,
        [personKey]: {
          person: personName,
          amount: parseInt(amount),
        },
      };
    }

    const updatedExpenseGroup = await ExpenseGroupModal.findByIdAndUpdate(
      groupId,
      {
        expensesByPerson: updatedExpensesByPerson,
        expensesHistory: [
          {
            person: personName,
            amount,
            description,
          },
          ...expenseGroup.expensesHistory,
        ],
        totalAmountInvested: expenseGroup.totalAmountInvested + amount,
      },
      { new: true }
    );

    res.status(200).json(updatedExpenseGroup);
  } catch (error) {
    res.status(404).json(error.message);
  }
};

export const deleteExpense = async (req, res) => {
  const { groupId, expenseId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(groupId))
    return res.status(404).send(`No Group with id: ${groupId}`);

  try {
    const expenseGroup = await ExpenseGroupModal.findById(groupId);

    const selectedExpenseIndex = expenseGroup.expensesHistory.findIndex(
      (entry) => entry._id.toString() === expenseId
    );

    const { person, amount } =
      expenseGroup.expensesHistory[selectedExpenseIndex];
    const updatedExpensesByPerson = { ...expenseGroup.expensesByPerson };

    const personKey = convertToKey(person);

    updatedExpensesByPerson[personKey].amount =
      updatedExpensesByPerson[personKey].amount - amount;

    const updatedExpenseGroup = await ExpenseGroupModal.findByIdAndUpdate(
      groupId,
      {
        expensesByPerson: updatedExpensesByPerson,
        expensesHistory: [
          ...expenseGroup.expensesHistory.slice(0, selectedExpenseIndex),
          ...expenseGroup.expensesHistory.slice(selectedExpenseIndex + 1),
        ],
        totalAmountInvested: expenseGroup.totalAmountInvested - amount,
      },
      { new: true }
    );
    res.status(200).json(updatedExpenseGroup);
  } catch (error) {
    res.status(404).json(error.message);
  }
};

export const editExpense = async (req, res) => {
  const { personName, description, amount, groupId, expenseId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(groupId))
    return res.status(404).send(`No Group with id: ${groupId}`);

  try {
    const expenseGroup = await ExpenseGroupModal.findById(groupId);

    const selectedExpenseIndex = expenseGroup.expensesHistory.findIndex(
      (entry) => entry._id.toString() === expenseId
    );

    const updatedExpensesHistory = [...expenseGroup.expensesHistory];
    const updatedExpensesByPerson = { ...expenseGroup.expensesByPerson };

    const oldExpense = expenseGroup.expensesHistory[selectedExpenseIndex];
    const oldExpensePersonName = oldExpense.person;

    const oldPersonKey = convertToKey(oldExpensePersonName);
    const updatedPersonKey = convertToKey(personName);

    // This amount updation can not be done in a single line because the person can also be changed
    updatedExpensesByPerson[oldPersonKey] = {
      ...updatedExpensesByPerson[oldPersonKey],
      amount: updatedExpensesByPerson[oldPersonKey].amount - oldExpense.amount,
    };
    updatedExpensesByPerson[updatedPersonKey] = {
      ...updatedExpensesByPerson[updatedPersonKey],
      amount: updatedExpensesByPerson[updatedPersonKey].amount + amount,
    };

    updatedExpensesHistory[selectedExpenseIndex] = {
      _id: expenseId,
      person: personName,
      description,
      amount,
    };

    const updatedExpenseGroup = await ExpenseGroupModal.findByIdAndUpdate(
      groupId,
      {
        expensesByPerson: updatedExpensesByPerson,
        expensesHistory: updatedExpensesHistory,
        totalAmountInvested:
          expenseGroup.totalAmountInvested - oldExpense.amount + amount,
      },
      { new: true }
    );

    res.status(200).json(updatedExpenseGroup);
  } catch (error) {
    res.status(404).json(error.message);
  }
};

export const getExpense = async (req, res) => {
  const { id, groupId } = req.query;
  try {
    const expenseGroup = await ExpenseGroupModal.findById(groupId);
    const expense = expenseGroup.expensesHistory.find(
      (entry) => entry._id.toString() === id
    );

    res.status(200).json(expense);
  } catch (error) {
    res.status(404).json(error.message);
  }
};
