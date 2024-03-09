const mongoose = require("mongoose");
const { Schema } = mongoose;
const slugify = require('slugify');

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true
    }
}, 
{
    timestamps: true
})

CategorySchema.pre('validate', function(next) {
    if(this.name) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true
        });
    }

    next();
})


module.exports = mongoose.model('Category', CategorySchema);

