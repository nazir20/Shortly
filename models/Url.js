const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    userId : {
        type : String,
        required : true,
    },
    original_url : {
        type : String, 
        required : true,
    },
    url_id:{
        type: String,
        required: true
    },
    shortened_url: {
        type: String,
        required: true
    },
    is_favorite:{
        type:Boolean,
        default: false
    },
    created_at: {
        type:Date,
        default: Date.now
    },
    valid_until: {
        type: Date,
        required: false
    },
    click_count: {
        type: Number,
        default: 0
    }
});

const Url = mongoose.model('Url', urlSchema);
module.exports = Url;