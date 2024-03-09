const Article = require('../models/Article');

module.exports = async (req, res, next) => {
    if( req.session.userId ) {

        try {
            const article = await Article.findById(req.params.id).populate('userId').exec()
            if(req.session.userId === article.userId.id) {
                return next();
            }
        } catch (err) {
            return res.redirect('/');
        }        
    } 

    return res.redirect('/');
}