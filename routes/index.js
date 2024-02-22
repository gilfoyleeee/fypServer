const router = require("express").Router(); //creating express router

const authRoute = require("./auth");
const userRoute = require("./user");

router.use("/auth", authRoute);
router.use("/user", userRoute);

module.exports = router;