const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

// get all tags
router.get('/', (req, res) => {
  Tag.findAll({
    include: [Product], // Include associated Product data
  })
    .then((tags) => {
      res.json(tags);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    });
});

// get a single tag by its `id`
router.get('/:id', (req, res) => {
  Tag.findByPk(req.params.id, {
    include: [Product], // Include associated Product data
  })
    .then((tag) => {
      if (!tag) {
        return res.status(404).json({ message: 'Tag not found' });
      }
      res.json(tag);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    });
});

// create a new tag
router.post('/', (req, res) => {
  Tag.create(req.body)
    .then((tag) => {
      res.status(201).json(tag);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json(err);
    });
});

// update a tag's name by its `id` value
router.put('/:id', (req, res) => {
  // Update a tag by its `id` value
  Promise.all([
    Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    }),
    Tag.findByPk(req.params.id),
  ])
    .then(([updatedRows, updatedTag]) => {
      if (updatedRows[0] === 0 || !updatedTag) {
        // Handle the case when no tag is updated or tag not found
        return res.status(404).json({ message: 'Tag not found' });
      }
      res.json({ message: 'Tag updated successfully' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    });
});


// delete a tag by its `id` value
router.delete('/:id', (req, res) => {
  Tag.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((deletedTag) => {
      if (!deletedTag) {
        return res.status(404).json({ message: 'Tag not found' });
      }
      res.json({ message: 'Tag deleted successfully' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    });
});

module.exports = router;
