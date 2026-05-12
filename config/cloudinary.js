const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: 'dlnsugldj',
    api_key: '258431419649653',
    api_secret: '4KGgyrYYfXmjpp2E4LMwMwFQ9rc'
});

module.exports = { cloudinary }