const express=require("express")
const router=express.Router()

const Game = require("../models/game.js")


const TimeAgo = require("javascript-time-ago")
const timeAgo = new TimeAgo('en-US')

router.get('/:urlTitle',async (req,res)=>{
    const urlTitle = req.params.urlTitle
    Game.findOne({urlTitle}).lean()
    .then(async (game)=>{
       if(req.cookies.viewed != urlTitle){
        res.cookie("viewed", urlTitle, {maxAge: 30 * 24 * 3600 * 1000,value: urlTitle})
        const views = await game.views +1
        var gameUp = await Game.findOneAndUpdate({urlTitle:urlTitle},{views:game.views+1},{new:true})
        
       }
       game.uploadDate = timeAgo.format(game.uploadDate)
        res.render("game/game",{game})

    })
    .catch(err=>{
        res.send('404')
      console.log(err)
    })
})


module.exports=router