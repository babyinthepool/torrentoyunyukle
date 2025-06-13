const express=require("express")
const router=express.Router()

const Game = require("../models/game.js")


const TimeAgo = require("javascript-time-ago")
const az = require("javascript-time-ago/locale/az")
TimeAgo.addLocale(az)
TimeAgo.setDefaultLocale('az')
const timeAgo = new TimeAgo('az-AZ')
// momnent.js
const moment = require('moment')
moment.locale('az')
moment().format('LLL');
//how to use moment.js
router.get('/:urlTitle',async (req,res)=>{
    const urlTitle = req.params.urlTitle
    Game.findOne({urlTitle}).lean()
    .then(async (game)=>{
       if(req.cookies.viewed != urlTitle){
        res.cookie("viewed", urlTitle, {maxAge: 30 * 24 * 3600 * 1000,value: urlTitle})
        var gameUp = await Game.findOneAndUpdate({urlTitle:urlTitle},{views:game.views+1},{new:true})
       }
      game.gameOutDate = moment(game.gameOutDate).format('ll');

       game.uploadDate = timeAgo.format(game.uploadDate)
        res.render("game/game",{game})

    })
    .catch(err=>{
        res.send('404')
      console.log(err)
    })
})


module.exports=router