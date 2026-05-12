const express = require('express');
const Todo = require('../models/Todo');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 }).lean();
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '할 일 목록을 불러오지 못했습니다.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { content } = req.body;
    if (content === undefined || content === null || String(content).trim() === '') {
      return res.status(400).json({ message: 'content는 필수입니다.' });
    }

    const todo = await Todo.create({ content: String(content).trim() });
    res.status(201).json(todo);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: '할 일을 저장하지 못했습니다.' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (content === undefined || content === null || String(content).trim() === '') {
      return res.status(400).json({ message: 'content는 필수입니다.' });
    }

    const todo = await Todo.findByIdAndUpdate(
      id,
      { content: String(content).trim() },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ message: '할 일을 찾을 수 없습니다.' });
    }

    res.json(todo);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: '잘못된 할 일 ID입니다.' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: '할 일을 수정하지 못했습니다.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findByIdAndDelete(id).lean();

    if (!todo) {
      return res.status(404).json({ message: '할 일을 찾을 수 없습니다.' });
    }

    res.json({ message: '삭제되었습니다.', todo });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: '잘못된 할 일 ID입니다.' });
    }
    console.error(err);
    res.status(500).json({ message: '할 일을 삭제하지 못했습니다.' });
  }
});

module.exports = router;
