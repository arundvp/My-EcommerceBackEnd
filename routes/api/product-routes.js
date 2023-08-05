const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', (req, res) => {
  Product.findAll({
    include: [Category, Tag], // Include associated Category and Tag data
  })
    .then((products) => {
      res.json(products);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    });
});

// get one product
router.get('/:id', (req, res) => {
  Product.findByPk(req.params.id, {
    include: [Category, Tag], // Include associated Category and Tag data
  })
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    });
});


// create new product
router.post('/', (req, res) => {
  Product.create(req.body)
    .then((product) => {
      // if there are product tags, create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr).then(() => {
          res.status(200).json(product);
        });
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});


// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {

        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

// delete one product by its `id` value
router.delete('/:id', (req, res) => {
  Product.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((deletedProduct) => {
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      // If the product was deleted successfully, check if there are associated tags
      // and delete the associations from the ProductTag model as well
      if (deletedProduct) {
        ProductTag.destroy({
          where: {
            product_id: req.params.id,
          },
        }).then(() => {
          res.json({ message: 'Product deleted successfully' });
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    });
});

module.exports = router;
