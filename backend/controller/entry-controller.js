import {
   selectAllEntries,
   selectEntryById,
   selectEntriesByUserId,
   insertEntry,
   updateEntry,
   deleteEntry,
 } from '../models/entry-model.js';

 const getEntries = async (req, res) => {
   try {
     const entries = await selectEntriesByUserId(req.user.user_id);
     res.json(entries);
   } catch (error) {
     res.status(500).json({message: error.message});
   }
 };

 const getEntryById = async (req, res) => {
   try {
     const entry = await selectEntryById(req.params.id);

     if (!entry) {
       return res.status(404).json({message: 'Entry not found'});
     }

     if (entry.user_id !== req.user.user_id) {
       return res.status(403).json({message: 'Not authorized'});
     }

     res.json(entry);
   } catch (error) {
     res.status(500).json({message: error.message});
   }
 };

 const postEntry = async (req, res) => {
   try {
     const {entry_date, mood, weight, sleep_hours, notes} = req.body;

     if (!entry_date) {
       return res.status(400).json({message: 'Entry date is required'});
     }

     const newEntry = {
       user_id: req.user.user_id,
       entry_date,
       mood,
       weight,
       sleep_hours,
       notes,
     };

     const result = await insertEntry(newEntry);
     res.status(201).json({
       message: 'Entry created successfully',
       entry_id: result,
     });
   } catch (error) {
     res.status(500).json({message: error.message});
   }
 };

 const updateEntryById = async (req, res) => {
   try {
     const existingEntry = await selectEntryById(req.params.id);

     if (!existingEntry) {
       return res.status(404).json({message: 'Entry not found'});
     }

     if (existingEntry.user_id !== req.user.user_id) {
       return res.status(403).json({message: 'Not authorized'});
     }

     const result = await updateEntry(req.params.id, req.body);

     if (result) {
       res.json({message: 'Entry updated successfully'});
     } else {
       res.status(404).json({message: 'Entry not found'});
     }
   } catch (error) {
     res.status(500).json({message: error.message});
   }
 };

 const deleteEntryById = async (req, res) => {
   try {
     const existingEntry = await selectEntryById(req.params.id);

     if (!existingEntry) {
       return res.status(404).json({message: 'Entry not found'});
     }

     if (existingEntry.user_id !== req.user.user_id) {
       return res.status(403).json({message: 'Not authorized'});
     }

     const result = await deleteEntry(req.params.id);

     if (result) {
       res.json({message: 'Entry deleted successfully'});
     } else {
       res.status(404).json({message: 'Entry not found'});
     }
   } catch (error) {
     res.status(500).json({message: error.message});
   }
 };

 export {getEntries, getEntryById, postEntry, updateEntryById, deleteEntryById};
