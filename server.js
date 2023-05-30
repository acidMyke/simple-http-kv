//@ts-check
/* Create a simple key value http server
 * that responds to GET, POST, PUT, DELETE requests
 * and stores the data in a file
 * cache it in memory for faster access
 */

import express from 'express';
import fs from 'fs/promises';

const app = express();
const port = 2712;

const dataFile = 'data.json';
let data = new Map();

// load data from file
const loadData = async () => {
  try {
    const file = await fs.readFile(dataFile, 'utf8');
    if (!file) return;
    const arr = JSON.parse(file);
    if (!Array.isArray(arr)) return;
    if (arr.length === 0) return;
    data = new Map(arr);
  } catch (err) {
    console.error(err);
  }
};

// save data to file
const saveData = async () => {
  try {
    await fs.writeFile(dataFile, JSON.stringify([...data]));
  } catch (err) {
    console.error(err);
  }
};

// load data from file
loadData().catch(err => {
  // Create file if it doesn't exist
  if (err.code === 'ENOENT') {
    saveData();
  } else console.error(err);
});

// parse json body
app.use(express.json());

// GET /key
app.get('/:key', (req, res) => {
  const key = req.params.key;
  const value = data.get(key);
  if (value) {
    res.send(value);
  } else {
    res.status(404).send('Not found');
  }
});

// POST /key
app.post('/:key', (req, res) => {
  const key = req.params.key;
  const value = req.body;
  data.set(key, value);
  saveData();
  res.send('OK');
});

// POST without key
app.post('/', (req, res) => {
  const key = Math.random().toString(36).substring(7);
  const value = req.body;
  data.set(key, value);
  saveData();
  res.send(key);
});

// DELETE /key
app.delete('/:key', (req, res) => {
  const key = req.params.key;
  data.delete(key);
  saveData();
  res.send('OK');
});

// start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// handle errors
app.on('error', err => {
  console.error(err);
});

// handle exit
process.on('SIGINT', () => {
  console.log('Exiting...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Exiting...');
  process.exit(0);
});
