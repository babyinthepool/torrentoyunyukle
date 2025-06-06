const express=require("express")
const router=express.Router()

const Game = require("../models/game.js")



router.get('/',async (req,res)=>{
    const page = parseInt(req.query.sehife) || 1
    const limit = 12
    const totalGames = await Game.countDocuments()
    const totalPages = Math.ceil(totalGames/limit)

    
    

    Game.find()
    .sort({ _id: -1 })
    .skip((page-1)*limit)
    .limit(limit)
    .lean()
    .then(games=>{
       

        res.render("index/index",{
            games,
            currentPage:page,
            totalPages,
            hasNextPage: page<totalPages,
            hasPrevPage: page>1,
            nextPage: page+1,
            prevPage: page-1
        })
        
    })
    .catch(err =>{
        res.send("index")
        console.log(err);
    })
    
})

router.get("/axtar",async (req,res)=>{


    const search = req.query.oyun

    const page = parseInt(req.query.sehife) || 1
    const limit = 12
    const totalGames = await Game.find({$text: { $search: search }}).countDocuments()
    const totalPages = Math.ceil(totalGames/limit)

    Game.find({
        $text: { $search: search }, 
          
      })
      .skip((page-1)*limit)
      .limit(limit)
      .lean()
    .then(games=>{
        res.render("index",{
            games,
            currentPage:page,
            totalPages,
            hasNextPage: page<totalPages,
            hasPrevPage: page>1,
            nextPage: page+1,
            prevPage: page-1
        })
    })
    .catch(err=>{
        res.send("404")
        console.log(err)
    })
})

router.get("/kateqoriya/:category", (req,res)=>{
    const category = req.params.category

    Game.find({
        category: { $regex: new RegExp(category, 'i') }

    })
    .limit(10)
    .lean()
    .then(games=>{
        res.render("index/index",{games,category})
    })
})



module.exports=router