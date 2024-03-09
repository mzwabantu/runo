const mongoose = require('mongoose');
const slugify = require('slugify');
const marked = require('marked');
const createDomPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const dompurify = createDomPurify(new JSDOM().window)

const { Schema } = mongoose;


const articleSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    excerpt: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: false
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }],
    slug: {
        type: String,
        required: true,
        unique: true
    },
    sanitizedHtml: {
        type: String,
        required: true
    }
}, 
{
    timestamps: true
});


articleSchema.pre('validate', function(next) {
    if(this.title) {
        this.slug = slugify(this.title, {
            lower: true,
            strict: true
        });
    }

    if(this.body) {
        this.sanitizedHtml = dompurify.sanitize( marked.parse( this.body ))
    }

    next();
})


module.exports = mongoose.model('Article', articleSchema);
module.exports.dompurify = dompurify;



