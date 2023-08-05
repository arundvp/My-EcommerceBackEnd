const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

// Get all categories and include their associated Products
router.get('/', (req, res) => {
  Category.findAll({
    include: [Product], // Include associated Products
  })
    .then((categories) => {
      res.json(categories);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    });
});

// Get one category by its `id` value and include its associated Products
router.get('/:id', (req, res) => {
  Category.findByPk(req.params.id, {
    include: [Product], // Include associated Products
  })
    .then((category) => {
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json(category);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    });
});

// Create a new category
router.post('/', (req, res) => {
  Category.create(req.body)
    .then((category) => {
      res.status(201).json(category);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json({ message: 'Bad Request' });
    });
});

// Update a category by its `id` value
router.put('/:id', (req, res) => {
  Category.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((updatedCategory) => {
      if (updatedCategory[0] === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json({ message: 'Category updated successfully' });
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json({ message: 'Bad Request' });
    });
});

// Delete a category by its `id` value
router.delete('/:id', (req, res) => {
  Category.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((deletedCategory) => {
      if (!deletedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
      // If the category was deleted successfully, also delete its associated Products
      if (deletedCategory) {
        Product.destroy({
          where: {
            category_id: req.params.id,
          },
        }).then(() => {
          res.json({ message: 'Category and associated Products deleted successfully' });
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    });
});

module.exports = router;
