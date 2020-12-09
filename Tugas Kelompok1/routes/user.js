const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

const User = require('../public/js/account')

router.get("/login", (req, res) => res.render("pages/login"));

router.get("/register", (req, res) => res.render("pages/register"));

router.get("/input", (req, res) => res.render("pages/input"));

router.get("/admin", (req, res) => res.render("pages/admin"));

//login handle
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/user/login",
      failureFlash: true,
    })(req, res, next);
  });

  // login admin handle
  router.post("/admin", (req, res, next) => {
    const nama_admin = req.body.nama_admin;
    const pass = req.body.pass;

    let errors_admin = []

    if (nama_admin == "admin" && pass == "admin"){
      res.redirect('/user/input');
    }
    else {
      errors_admin.push({ msg: "Admin anda salah !!" });
    }

    if (errors_admin > 0){[
      res.render("pages/admin", {
        errors_admin,
        nama_admin,
        pass
      })
    ]}

  });

router.post('/register', async (req, res) => {
    const email = req.body.email;
    const nama = req.body.nama;
    const password1 = req.body.password1;
    const password2 = req.body.password2;

    let errors = []

    if (!nama || !email || !password1 || !password2) {
        errors.push({ msg: "Harap isi semua data yang di minta" });
    }

    if (password1 !== password2) {
        errors.push({ msg: "Password tidak sama" });
    }

    if (errors.length > 0) {
        res.render("pages/register", {
          errors,
          nama,
          email,
          password1,
          password2,
        });
    } 
    else {
        //validasi oke lanjut database
        User.findOne({ email: email }).then((user) => {
          if (user) {
            //usernya ada
            errors.push({ msg: "Email sudah terdaftar" });
            res.render("pages/register", {
              errors,
              nama,
              email,
              password1,
              password2,
            });
          } 
          else {
            //hash password
            bcrypt.genSalt(10, (err, salt) =>
              bcrypt.hash(password1, salt, (err, hash) => {
                if (err) throw err;
                //set password jadi hash
                const newUser = new User({
                  nama,
                  email,
                  password : hash,
                });
                //newUser.password = hash;
    
                //simpan user
                newUser
                  .save()
                  .then((user) => {
                    req.flash(
                      "success_msg",
                      "Anda berhasil registrasi, Silahkan Login"
                    );
                    res.redirect("/user/login");
                  })
                  .catch((err) => console.log(err));
              })
            );
          }
        });
  }
});

module.exports = router;