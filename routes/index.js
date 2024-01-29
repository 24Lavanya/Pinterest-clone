var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const upload=require('./multer');
const passport = require('passport');
const localStrategy = require('passport-local')

passport.use(new localStrategy(userModel.authenticate()))

router.get('/', function(req, res, next) {
  res.render('index', { nav:false });
});
router.get('/register', function(req, res, next) {
  res.render('register',{ nav:false });
});


router.post('/upload', isLoggedIn ,upload.single("image"), async function(req, res, next) {
  const user= await userModel.findOne({ username: req.session.passport.user })   //req.session.passport.user:this will have username if we are logged in
  user.profileimage = req.file.filename;             //the image name by uuid gets saved
  await user.save();
  res.redirect('/profile')
});

//feed
router.get('/feed', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })  //searches for people logged in
  const posts=await postModel.find().populate("user")
  res.render('../views/feed.ejs',{user,posts,nav:true});
});

//view post


router.get('/viewpost/:id', isLoggedIn, async function (req, res, next) {
  const id = req.params.id;
  const user = await userModel.findOne({ username: req.session.passport.user })
  const posts=await postModel.findById(id).populate("user")
  console.log(user)
  res.render("../views/viewpost.ejs",{nav:true,user,posts })
  
})

router.get('/profile', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user, }).populate("posts")  //searches for people logged in
  console.log(user)
  res.render('../views/profile.ejs',{user,nav:true});
});


//profile by id
router.get('/profile/:id', isLoggedIn, async function (req, res, next) {
  const id = req.params.id;
  const user = await userModel.findById(id) 
  res.render('../views/profile.ejs', { user, nav: true });
});

//showposts

router.get('/show', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts")  //searches for people logged in
  console.log(user)
  res.render('../views/show.ejs',{user,nav:true});
});

//add
router.get('/add', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render("../views/add.ejs",{nav:true})
})

//create post

router.post('/createpost', isLoggedIn,upload.single("postimage"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    desc: req.body.desc,
    tags:req.body.tags,
    image:req.file.filename
  })
  user.posts.push(post._id)
  await user.save();
  res.redirect('/profile')
})


router.post('/register', function(req, res) {
  const user = new userModel({
    username: req.body.username,
    fullname:req.body.fullname,
    email: req.body.email,
    contact: req.body.contact,
  })

  userModel.register(user,req.body.password).then(() => {
    passport.authenticate("local")(req, res, () => {
      res.redirect("/profile")
    })
  })
});

router.post('/', passport.authenticate("local", {
  failureRedirect: '/',
  successRedirect:'/profile'
}),function(req, res, next) {
  
});

router.get('/logout', (req, res,next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) { return next() }
  res.redirect('/')
}
module.exports = router;
